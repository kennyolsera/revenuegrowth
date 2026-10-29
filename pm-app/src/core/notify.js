/* ---------- per-person notifications in the shared workspace ----------
   Each notification has a recipient (`to`); you only ever see your own, and read/unread is yours alone.
   Created in the author's browser when they comment, @mention or assign, and delivered to the
   recipient on their next sync. Recipients' own choices (D().notifPrefsBy[memberId]) are respected. */
import { D, mem } from './store.js';
import { uid } from './utils.js';

const MAX = 800; // keep the shared document small: oldest read ones go first
export const NOTIF_KINDS = ['mention', 'assign', 'comment'];

export const myNotifs = () => (D().notifs || []).filter(n => n.to && n.to === D().me);
export const myUnread = () => myNotifs().filter(n => !n.read).length;

export function notifPrefsOf(id) {
  const p = (D().notifPrefsBy || {})[id] || {};
  return { mention: p.mention !== false, assign: p.assign !== false, comment: p.comment !== false };
}
export function setMyNotifPref(kind, on) {
  if (!NOTIF_KINDS.includes(kind)) return;
  const d = D();
  d.notifPrefsBy ||= {};
  d.notifPrefsBy[d.me] = { ...notifPrefsOf(d.me), [kind]: !!on };
}

function push(n) {
  const d = D();
  if (!n.to || n.to === d.me || !mem(n.to)) return;
  if (!notifPrefsOf(n.to)[n.type]) return;
  d.notifs ||= [];
  d.notifs.unshift({ id: uid('n'), at: Date.now(), read: false, by: d.me, ...n });
  if (d.notifs.length > MAX) {
    const readIdx = d.notifs.map((x, i) => (x.read ? i : -1)).filter(i => i >= 0);
    while (d.notifs.length > MAX && readIdx.length) d.notifs.splice(readIdx.pop(), 1);
    d.notifs.length = Math.min(d.notifs.length, MAX);
  }
}

/** Members @mentioned in text: full names (what the picker inserts), or a typed first name when only one
    member has it. Longest tags first so "Rudi Hartono" is matched before "Rudi". */
export function mentionedIds(text) {
  const low = ` ${String(text || '').toLowerCase()}`;
  const ms = D().members;
  const first = m => m.name.trim().split(/\s+/)[0].toLowerCase();
  const tags = [];
  ms.forEach(m => {
    tags.push([m.name.toLowerCase(), m.id]);
    if (ms.filter(x => first(x) === first(m)).length === 1) tags.push([first(m), m.id]);
  });
  tags.sort((a, b) => b[0].length - a[0].length);
  const hit = new Set();
  for (const [name, id] of tags) {
    const tag = '@' + name;
    let i = low.indexOf(tag);
    while (i >= 0) {
      const after = low[i + tag.length];
      if (!after || !/[a-z0-9]/.test(after)) {
        hit.add(id);
        break;
      }
      i = low.indexOf(tag, i + 1);
    }
  }
  return [...hit];
}

/** New comment on task t: @mentions, the assignee, and earlier commenters on the task. */
export function notifyComment(t, text) {
  if (!t) return;
  const snippet = String(text).slice(0, 160);
  const done = new Set([D().me]);
  for (const id of mentionedIds(text)) {
    if (done.has(id)) continue;
    done.add(id);
    push({ to: id, type: 'mention', text: 'mentioned you on', task: t.id, project: t.project, snippet });
  }
  const others = [t.assignee, ...(D().comments || []).filter(c => c.task === t.id).map(c => c.by)];
  for (const id of others) {
    if (!id || done.has(id)) continue;
    done.add(id);
    push({ to: id, type: 'comment', text: 'commented on', task: t.id, project: t.project, snippet });
  }
}

export function notifyAssign(t, to) {
  if (!t || !to) return;
  push({ to, type: 'assign', text: 'assigned you', task: t.id, project: t.project, snippet: t.title });
}
