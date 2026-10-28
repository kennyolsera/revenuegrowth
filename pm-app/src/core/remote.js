/* ---------- shared workspace sync (Supabase via /api/pm-workspace) ----------
   boot.js fetches { doc, version, me, members, legacy } and leaves it on window.__PM before the
   app modules load. The whole workspace is one JSON document; saves send the version they were
   based on, and the server refuses a save if a teammate saved in between (409). */
import { seed } from '../data/seed.js';

const API = '/api/pm-workspace';
const PCOLOR_KEYS = ['blue', 'teal', 'violet', 'amber', 'rose', 'green', 'indigo', 'slate'];
const STAGE = { backlog: 'backlog', todo: 'todo', in_progress: 'progress', review: 'review', done: 'done' };
const PRIO = ['urgent', 'high', 'medium', 'low'];

export const R = { version: 0, lastSent: '', timer: null, inflight: false, conflict: false, dirty: false };

/* Members always come from User Management (active profiles), never from the saved document. */
function applyIdentity(d) {
  const pm = window.__PM || {};
  if (pm.members?.length) d.members = pm.members;
  if (pm.me?.id) d.me = pm.me.id;
  return d;
}

/* An empty workspace with the template's structure, plus any projects and tasks from the old
   Project Timeline tables (imported once, the first time anyone opens the new one). */
function emptyWorkspace() {
  const d = {
    ...seed(),
    teams: [{ id: 'rg', name: 'Revenue Growth', icon: 'target', c: '#1468B3', desc: 'VAS Revenue Growth' }],
  };
  applyIdentity(d);
  importLegacy(d, window.__PM?.legacy);
  return d;
}

function keyFor(name, used) {
  const base =
    (name || 'PRJ')
      .replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || 'PRJ';
  let k =
    base.length < 2
      ? (name || 'PRJ')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 3) || 'PRJ'
      : base;
  let n = 2;
  while (used.has(k)) k = base + n++;
  used.add(k);
  return k;
}

function importLegacy(d, legacy) {
  if (!legacy) return;
  const all = d.members.map(m => m.id);
  const byName = n => {
    const q = (n || '').trim().toLowerCase();
    if (!q) return null;
    const m = d.members.find(x => x.name.toLowerCase() === q || x.email.toLowerCase() === q || x.name.toLowerCase().split(' ')[0] === q);
    return m ? m.id : null;
  };
  const used = new Set();
  const pid = {};
  (legacy.projects || []).forEach((p, i) => {
    const id = 'p' + p.id.slice(0, 8);
    pid[p.id] = id;
    d.projects.push({
      id,
      key: keyFor(p.name, used),
      name: p.name || 'Untitled project',
      icon: 'folder',
      color: PCOLOR_KEYS[i % PCOLOR_KEYS.length],
      status: p.status === 'done' || p.status === 'completed' ? 'complete' : p.status === 'on_hold' ? 'hold' : 'active',
      team: 'rg',
      lead: byName(p.owner) || d.me,
      start: p.start_date || null,
      due: p.end_date || null,
      fav: false,
      members: all,
      desc: p.description || '',
      milestones: [],
      last: 0,
    });
    d.projOrder.push(id);
  });
  const tasks = legacy.tasks || [];
  if (tasks.some(t => !t.project_id || !pid[t.project_id])) {
    d.projects.push({
      id: 'pgeneral',
      key: keyFor('General', used),
      name: 'General',
      icon: 'folder',
      color: 'slate',
      status: 'active',
      team: 'rg',
      lead: d.me,
      start: null,
      due: null,
      fav: false,
      members: all,
      desc: 'Tasks that were not in a project.',
      milestones: [],
      last: 0,
    });
    d.projOrder.push('pgeneral');
  }
  const count = {};
  tasks.forEach((t, i) => {
    const p = d.projects.find(x => x.id === (pid[t.project_id] || 'pgeneral'));
    count[p.id] = (count[p.id] || 0) + 1;
    const created = t.created_at ? Date.parse(t.created_at) : Date.now();
    d.tasks.push({
      id: 't' + t.id.slice(0, 8),
      key: p.key + '-' + (100 + count[p.id]),
      project: p.id,
      title: t.title || 'Untitled',
      status: STAGE[t.stage] || 'todo',
      assignee: byName(t.assignee),
      priority: PRIO.includes(t.priority) ? t.priority : 'none',
      due: t.due_date || null,
      start: t.started_at ? t.started_at.slice(0, 10) : null,
      labels: [],
      subtasks: (Array.isArray(t.checklist) ? t.checklist : []).map((c, j) => ({
        id: 's' + i + '_' + j,
        title: String(c?.text ?? c?.title ?? c?.label ?? c ?? ''),
        done: !!(c?.done ?? c?.checked),
      })),
      attachments: [],
      deps: [],
      desc: [t.description, t.merchant_partner ? 'Merchant / partner: ' + t.merchant_partner : ''].filter(Boolean).join('\n\n'),
      estimate: null,
      created,
      updated: t.updated_at ? Date.parse(t.updated_at) : created,
      order: i + 1,
      fav: false,
      recur: null,
      ...(t.completed_at ? { completedAt: Date.parse(t.completed_at) } : {}),
    });
  });
}

export function initialData() {
  const pm = window.__PM || {};
  R.version = pm.version || 0;
  if (pm.doc && pm.doc.tasks) {
    const d = applyIdentity(pm.doc);
    R.lastSent = JSON.stringify(d);
    return d;
  }
  // New shared workspace: mark it dirty so the first save creates it on the server.
  return emptyWorkspace();
}

/* Replace the workspace with a newer server copy (a teammate saved). */
export function adoptRemote(doc, version) {
  const d = applyIdentity(doc);
  R.version = version;
  R.lastSent = JSON.stringify(d);
  return d;
}

function banner(msg) {
  let b = document.getElementById('pm-sync-banner');
  if (!b) {
    b = document.createElement('div');
    b.id = 'pm-sync-banner';
    b.setAttribute('role', 'alert');
    b.style.cssText =
      'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;display:flex;gap:12px;align-items:center;padding:10px 12px 10px 14px;border-radius:8px;background:#1d1c1a;color:#fff;font:500 13px/1.4 Geist,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 32px)';
    document.body.appendChild(b);
  }
  b.innerHTML = '';
  const t = document.createElement('span');
  t.textContent = msg;
  const r = document.createElement('button');
  r.textContent = 'Reload';
  r.style.cssText = 'flex-shrink:0;height:28px;padding:0 12px;border-radius:6px;border:0;background:#1468b3;color:#fff;font:inherit;cursor:pointer';
  r.addEventListener('click', () => location.reload());
  b.append(t, r);
}

async function send() {
  if (R.inflight || R.conflict) return;
  const body = JSON.stringify({ version: R.version, doc: R.pending });
  const snapshot = R.pendingStr;
  R.inflight = true;
  try {
    const res = await fetch(API, { method: 'PUT', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body });
    if (res.status === 409) {
      R.conflict = true;
      banner('A teammate saved changes just before you. Your last edit was not saved. Reload to get the latest version.');
      return;
    }
    if (res.status === 401) {
      R.conflict = true;
      banner('Your session has ended. Reload and sign in again.');
      return;
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json();
    R.version = j.version;
    R.lastSent = snapshot;
    R.dirty = R.pendingStr !== snapshot;
    document.getElementById('pm-sync-banner')?.remove();
  } catch {
    banner('Could not save to the server. Check your connection; changes will retry.');
    R.timer = setTimeout(send, 5000);
  } finally {
    R.inflight = false;
  }
  if (R.dirty && !R.conflict) {
    clearTimeout(R.timer);
    R.timer = setTimeout(send, 300);
  }
}

/* Called from store.save() after every change. Sends only when the shared data actually changed. */
export function pushRemote(data) {
  const str = JSON.stringify(data);
  if (str === R.lastSent && !R.dirty) return;
  R.pending = data;
  R.pendingStr = str;
  R.dirty = true;
  clearTimeout(R.timer);
  R.timer = setTimeout(send, 700);
}

/* Fetch the latest copy if a teammate saved. Returns { doc, version } or null. */
export async function pullRemote() {
  if (R.dirty || R.inflight || R.conflict) return null;
  const res = await fetch(API + '?since=' + R.version, { credentials: 'same-origin', cache: 'no-store' });
  if (res.status !== 200) return null;
  const j = await res.json();
  if (!j.doc || j.version <= R.version || R.dirty) return null;
  return j;
}
