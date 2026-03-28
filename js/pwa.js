import { snackbar } from './helpers.js';
import { navigate } from './app.js';

// ═══════════════════════════════════════════════════════════
// PWA — Service Worker, Install prompt, Offline, Deep-link
// ═══════════════════════════════════════════════════════════

let _pendingWorker = null;
let _deferredPrompt = null;
const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed-v1';

function showUpdateToast(worker) {
  _pendingWorker = worker;
  document.getElementById('pwa-update-toast').classList.add('show');
}

export function initPWA() {
  // ── Service Worker registration ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('[PWA] SW registrato:', reg.scope);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update();
        });

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(newWorker);
            }
          });
        });

        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateToast(reg.waiting);
        }

      } catch (err) {
        console.warn('[PWA] SW registration failed:', err);
      }
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }

  // ── Update toast button ──
  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    if (_pendingWorker) {
      _pendingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    document.getElementById('pwa-update-toast').classList.remove('show');
  });

  // ── Install banner ──
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    if (sessionStorage.getItem(INSTALL_DISMISSED_KEY)) return;
    setTimeout(() => {
      document.getElementById('pwa-install-banner')?.classList.add('show');
    }, 4000);
  });

  document.getElementById('pwa-install-btn').addEventListener('click', async () => {
    if (!_deferredPrompt) return;
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    console.log('[PWA] Install outcome:', outcome);
    _deferredPrompt = null;
    document.getElementById('pwa-install-banner').classList.remove('show');
    if (outcome === 'accepted') snackbar('App installata — trovala nella Home!');
  });

  document.getElementById('pwa-install-close').addEventListener('click', () => {
    document.getElementById('pwa-install-banner').classList.remove('show');
    sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  });

  window.addEventListener('appinstalled', () => {
    document.getElementById('pwa-install-banner')?.classList.remove('show');
    _deferredPrompt = null;
    console.log('[PWA] App installata con successo');
  });

  // ── Offline / Online detection ──
  const offlineBar = document.getElementById('offline-bar');
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      offlineBar?.classList.add('show');
    } else {
      offlineBar?.classList.remove('show');
    }
  }
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // ── Deep-link via URL params ──
  function handleUrlAction() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'add')   { navigate('add'); }
    if (action === 'stats') { navigate('stats'); }
  }
  setTimeout(handleUrlAction, 100);
}
