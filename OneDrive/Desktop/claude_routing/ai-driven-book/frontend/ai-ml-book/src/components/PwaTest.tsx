import React, { useEffect } from 'react';
import styles from './PwaTest.module.css';

export default function PwaTest() {
  useEffect(() => {
    // Service Worker
    if ('serviceWorker' in navigator) {
      const el = document.getElementById('sw-status-text');
      el!.textContent = 'Service Worker is supported';

      navigator.serviceWorker.getRegistrations().then((regs) => {
        el!.textContent = regs.length
          ? `Service Worker registered: ${regs[0].scope}`
          : 'No Service Worker registered';
      });
    }

    // Cache storage
    if ('caches' in window) {
      caches.keys().then((names) => {
        document.getElementById('cache-status-text')!.textContent =
          'Caches: ' + names.join(', ');
      });
    }

    // Network status
    const updateNetwork = () => {
      const el = document.getElementById('network-status-text');
      const online = navigator.onLine;
      el!.textContent = online ? 'Online' : 'Offline';
      el!.style.color = online ? '#10b981' : '#ef4444';
    };

    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  return (
    <>
      <div className={styles.card}>
        <h3>Service Worker Status</h3>
        <p id="sw-status-text">Checking…</p>
      </div>

      <div className={styles.card}>
        <h3>Cache Storage</h3>
        <p id="cache-status-text">Checking…</p>
      </div>

      <div className={styles.card}>
        <h3>Network Status</h3>
        <p id="network-status-text">Checking…</p>
      </div>
    </>
  );
}
