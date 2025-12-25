import React, { useState, useEffect } from 'react';
import styles from './InstallPWA.module.css';

const InstallPWA: React.FC = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We no longer need the prompt. Clear it up.
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) {
    return null;
  }

  return (
    <div className={styles.installBanner}>
      <div className={styles.installContent}>
        <div className={styles.installInfo}>
          <span className={styles.installIcon}>📱</span>
          <div className={styles.installText}>
            <strong>Install App</strong>
            <span>Get the best experience with our PWA</span>
          </div>
        </div>
        <div className={styles.installActions}>
          <button className={styles.installButton} onClick={handleInstallClick}>
            Install Now
          </button>
          <button
            className={styles.dismissButton}
            onClick={() => setShowInstall(false)}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;