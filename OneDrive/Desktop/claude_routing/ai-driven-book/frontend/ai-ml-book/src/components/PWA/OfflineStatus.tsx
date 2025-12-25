import React, { useState, useEffect } from 'react';
import styles from './OfflineStatus.module.css';

const OfflineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className={styles.offlineBanner}>
      <div className={styles.offlineContent}>
        <span className={styles.offlineIcon}>📱</span>
        <span className={styles.offlineText}>
          You're offline. Some features may not work, but you can still read cached content.
        </span>
        <span className={styles.offlineAction}>Connect to internet to access latest content</span>
      </div>
    </div>
  );
};

export default OfflineStatus;