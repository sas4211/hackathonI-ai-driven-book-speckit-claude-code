import React, { useEffect, useState } from 'react';

export default function OfflineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
      {online ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}
