/* =====================================================================
   BOOT: load the shared workspace before any app module runs (store.js reads it
   synchronously), then start the app and keep it in step with teammates' saves.
   ===================================================================== */
const API = '/api/pm-workspace';

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

(async function boot() {
  try {
    const res = await fetch(API, { credentials: 'same-origin', cache: 'no-store' });
    if (res.status === 401 || (res.redirected && new URL(res.url).pathname === '/login')) {
      (window.top || window).location.href = '/login';
      return;
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    window.__PM = await res.json();
  } catch {
    fail('Could not load Project Timeline.');
    return;
  }

  await import('./main.js');
  const [{ S }, { R, adoptRemote, pullRemote, pushRemote }, { render }] = await Promise.all([
    import('./core/store.js'),
    import('./core/remote.js'),
    import('./shell/render.js'),
  ]);

  // First open ever: store the new shared workspace (with the imported old projects) right away.
  if (!R.version) pushRemote(S.data);

  // Pick up teammates' saves. Skipped while you are typing or have a dialog open, so nothing
  // jumps under your cursor; it catches up on the next tick.
  const busy = () => {
    const a = document.activeElement;
    return (
      (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) ||
      S.ui.modals.length ||
      S.ui.composer ||
      S.ui.editCell ||
      S.ui.pop
    );
  };
  async function tick() {
    if (document.visibilityState !== 'visible' || busy()) return;
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
