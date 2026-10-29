/* =====================================================================
   BOOT: load the shared workspace before any app module runs (store.js reads it
   synchronously), then start the app and keep it in step with teammates' saves.
   ===================================================================== */
const API = '/api/pm-workspace';

/* Tell the ESMM page that embeds us how far loading has got (it shows the progress bar). */
function tell(type, progress) {
  try {
    if (window.parent !== window)
      window.parent.postMessage(type === 'nav' ? { source: 'pm', type, nav: progress } : { source: 'pm', type, progress }, location.origin);
  } catch {
    /* not embedded */
  }
}

function fail(msg) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const box = document.createElement('div');
  box.style.cssText = 'display:grid;place-items:center;height:100vh;font:500 14px/1.5 Geist,system-ui,sans-serif;color:#555;text-align:center;padding:24px';
  const inner = document.createElement('div');
  const p = document.createElement('p');
  p.textContent = msg;
  const b = document.createElement('button');
  b.textContent = 'Try again';
  b.style.cssText = 'margin-top:12px;height:32px;padding:0 14px;border-radius:6px;border:0;background:#1468b3;color:#fff;font:inherit;cursor:pointer';
  b.addEventListener('click', () => location.reload());
  inner.append(p, b);
  box.append(inner);
  app.append(box);
}

/* The dashboard's theme is the only theme switch (ADR-011). */
function hostTheme() {
  try {
    if (window.parent !== window) {
      const t = window.parent.document.documentElement.dataset.theme;
      return t === 'dark' || (t === 'system' && window.parent.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
  } catch {
    /* different origin: keep this browser's setting */
  }
  return null;
}

(async function boot() {
  tell('progress', 35);
  try {
    const res = await fetch(API, { credentials: 'same-origin', cache: 'no-store' });
    if (res.status === 401 || (res.redirected && new URL(res.url).pathname === '/login')) {
      (window.top || window).location.href = '/login';
      return;
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    window.__PM = await res.json();
    window.__PM.theme = hostTheme();
    tell('progress', 75);
  } catch {
    tell('error');
    fail('Could not load Project Timeline.');
    return;
  }

  await import('./main.js');
  const [{ S, allTasks, visibleProjects, pColor }, { R, adoptRemote, pullRemote, pushRemote }, { render, go, ROUTE_NAMES }] = await Promise.all([
    import('./core/store.js'),
    import('./core/remote.js'),
    import('./shell/render.js'),
  ]);

  const { applyPrefs } = await import('./core/theme.js');
  const { save, D, mem, task, proj } = await import('./core/store.js');
  const { myNotifs, notifPrefsOf, setMyNotifPref } = await import('./core/notify.js');
  const { A } = await import('./actions/actions.js');
  let hidden = false;
  let lastHiddenPoll = 0; // the dashboard keeps this frame alive but hidden when you leave Project Timeline
  const TABS = ['overview', 'board', 'list', 'table', 'calendar', 'timeline', 'files', 'activity'];
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.data?.source !== 'esmm') return;
    const m = e.data;
    if (m.type === 'theme') {
      if (m.theme !== 'dark' && m.theme !== 'light') return;
      S.prefs.theme = m.theme;
      applyPrefs();
      render();
    } else if (m.type === 'visible') {
      hidden = !m.visible;
      if (!hidden) tick();
    } else if (m.type === 'notif-open') {
      const n = myNotifs().find(x => x.id === m.id);
      if (n) A.openNotif({ dataset: { id: n.id } });
    } else if (m.type === 'notif-read-all') {
      myNotifs().forEach(x => (x.read = true));
      save();
      render();
    } else if (m.type === 'set-pref') {
      // Project Timeline settings now live on the dashboard Settings page (allowlisted keys only).
      const P = {
        weekStart: ['1', '0', '6'],
        dateFmt: ['MMM d', 'd/M', 'M/d', 'yyyy-MM-dd'],
        timeFmt: ['12', '24'],
        home: ['home', 'mytasks', 'inbox'],
        openTasks: ['drawer', 'full'],
      };
      const B = ['confirmDel', 'showDoneBoard'];
      if (P[m.k] && P[m.k].includes(String(m.v))) S.prefs[m.k] = m.k === 'weekStart' ? +m.v : String(m.v);
      else if (B.includes(m.k)) S.prefs[m.k] = !!m.v;
      else return;
      save();
      render();
    } else if (m.type === 'set-notif-pref') {
      setMyNotifPref(m.k, m.v);
      save();
      render();
    } else if (m.type === 'set-ws-name') {
      const name = String(m.name || '')
        .trim()
        .slice(0, 60);
      if (!name) return;
      D().ws.name = name;
      save();
      render();
    } else if (m.type === 'go') {
      // Navigation from the dashboard sidebar. Only known routes and existing projects.
      if (m.route === 'project') {
        if (!visibleProjects().some(p => p.id === m.id)) return;
        go('project', { id: m.id, tab: TABS.includes(m.tab) ? m.tab : 'board' });
      } else if (typeof m.route === 'string' && ROUTE_NAMES[m.route] && !['system', 'states', 'member', 'team', 'project'].includes(m.route)) {
        go(m.route);
      }
    }
  });

  // Tell the dashboard sidebar where we are and which projects to list (after every render, only when it changed).
  let lastNav = '';
  const postNav = () => {
    const d = S.data;
    const nav = {
      route: S.ui.route,
      id: S.ui.params?.id || null,
      projects: visibleProjects()
        .filter(p => p.status !== 'complete')
        .map(p => ({ id: String(p.id), name: String(p.name), color: pColor(p) })),
      unread: myNotifs().filter(n => !n.read).length,
      notifs: myNotifs()
        .slice()
        .sort((a, b) => b.at - a.at)
        .slice(0, 12)
        .map(n => {
          const t = n.task ? task(n.task) : null;
          return {
            id: n.id,
            type: n.type,
            by: (n.by && mem(n.by)?.name) || '',
            text: String(n.text || ''),
            title: t ? t.title : n.project ? proj(n.project)?.name || '' : '',
            snippet: String(n.snippet || '').slice(0, 160),
            at: n.at,
            read: !!n.read,
          };
        }),
      settings: {
        wsName: D().ws.name,
        prefs: {
          weekStart: String(S.prefs.weekStart ?? 1),
          dateFmt: S.prefs.dateFmt || 'MMM d',
          timeFmt: S.prefs.timeFmt || '12',
          home: S.prefs.home || 'home',
          openTasks: S.prefs.openTasks || 'drawer',
          confirmDel: S.prefs.confirmDel !== false,
          showDoneBoard: S.prefs.showDoneBoard !== false,
        },
        notif: notifPrefsOf(D().me),
      },
      counts: {
        inbox: myNotifs().filter(n => !n.read && n.type !== 'update').length,
        mytasks: allTasks().filter(t => t.assignee === d.me && t.status !== 'done').length,
      },
    };
    // Settings moved to the dashboard: if anything inside opens the old settings page, hand over.
    if (S.ui.route === 'settings' && window.parent !== window) {
      tell('open-settings');
      const back = S.ui.history.length ? S.ui.history[S.ui.history.length - 1] : { route: 'home', params: {} };
      go(back.route === 'settings' ? 'home' : back.route, back.params || {}, { back: true });
      return;
    }
    const sig = JSON.stringify(nav);
    if (sig === lastNav) return;
    lastNav = sig;
    tell('nav', nav);
  };
  window.addEventListener('pm:rendered', postNav);
  postNav();

  requestAnimationFrame(() => tell('ready', 100));

  // First open ever: store the new shared workspace (with the imported old projects) right away.
  if (!R.version) pushRemote(S.data);

  // Pick up teammates' saves. Skipped while you are typing or have a dialog open, so nothing
  // jumps under your cursor; it catches up on the next tick.
  const busy = () => {
    const a = document.activeElement;
    return (
      (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) || S.ui.modals.length || S.ui.composer || S.ui.editCell || S.ui.pop
    );
  };
  async function tick() {
    if (document.visibilityState !== 'visible' || busy()) return;
    if (hidden && Date.now() - lastHiddenPoll < 60000) return; // hidden: check once a minute for the bell
    if (hidden) lastHiddenPoll = Date.now();
    try {
      const j = await pullRemote();
      if (j && !busy()) {
        S.data = adoptRemote(j.doc, j.version);
        render();
      }
    } catch {
      /* offline: try again next tick */
    }
  }
  setInterval(tick, 15000);
  document.addEventListener('visibilitychange', tick);
})();
