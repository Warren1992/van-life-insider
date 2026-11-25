(() => {
  'use strict';
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // The website and manual installation instructions still work.
    });
  }

  const button = document.querySelector('[data-vli-install]');
  if (!button) return;

  const standalone = window.matchMedia('(display-mode: standalone)');
  const card = document.getElementById('install-app');
  const help = document.getElementById('install-help');
  let deferredInstall = null;

  const render = () => {
    const installed = standalone.matches || navigator.standalone === true;
    card.hidden = installed;
    button.hidden = installed || !deferredInstall;
  };
  render();
  standalone.addEventListener?.('change', render);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstall = event;
    render();
  });
  window.addEventListener('appinstalled', () => {
    deferredInstall = null;
    card.hidden = true;
  });
  button.addEventListener('click', async () => {
    if (!deferredInstall) return;
    const prompt = deferredInstall;
    deferredInstall = null;
    button.disabled = true;
    try {
      await prompt.prompt();
    } catch {
      help.open = true;
      help.querySelector('summary').focus();
    } finally {
      button.disabled = false;
      render();
    }
  });
})();
