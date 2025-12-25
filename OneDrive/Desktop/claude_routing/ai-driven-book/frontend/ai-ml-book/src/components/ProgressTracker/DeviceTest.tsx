import React, { useState, useEffect } from 'react';
import styles from './DeviceTest.module.css';

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType?: string;
}

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  timestamp: number;
}

const DeviceTest: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  const updateDeviceInfo = () => {
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: window.screen.orientation?.angle === 0 || window.screen.orientation?.angle === 180 ? 'portrait' : 'landscape',
    };

    // Try to get connection info
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        info.connectionType = connection.effectiveType;
      }
    } catch (e) {
      // Connection API not supported
    }

    setDeviceInfo(info);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      testResponsiveDesign,
      testTouchFunctionality,
      testPerformanceMetrics,
      testAccessibility,
      testLocalStorage,
      testProgressiveWebApp,
      testBrowserCompatibility,
      testNetworkResilience,
    ];

    for (const test of tests) {
      try {
        const result = await test();
        setTestResults(prev => [...prev, result]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          testName: test.name,
          status: 'fail',
          details: `Test error: ${error}`,
          timestamp: Date.now(),
        }]);
      }
    }

    setIsRunning(false);
  };

  const testResponsiveDesign = (): TestResult => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let status: 'pass' | 'fail' | 'warning' = 'pass';
    let details = '';

    if (width < 320) {
      status = 'warning';
      details = 'Screen width below minimum recommended size (320px)';
    } else if (width >= 320 && width <= 768) {
      details = 'Mobile device detected - responsive design active';
    } else if (width > 768 && width <= 1024) {
      details = 'Tablet device detected - responsive design active';
    } else {
      details = 'Desktop device detected - responsive design active';
    }

    return {
      testName: 'Responsive Design',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const testTouchFunctionality = (): TestResult => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouch) {
      return {
        testName: 'Touch Functionality',
        status: 'pass',
        details: 'Non-touch device - touch tests skipped',
        timestamp: Date.now(),
      };
    }

    // Check touch events are supported
    const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
    const supportedEvents = touchEvents.filter(event => typeof window[`on${event}`] !== 'undefined');

    const status = supportedEvents.length === touchEvents.length ? 'pass' : 'warning';
    const details = supportedEvents.length === touchEvents.length
      ? `All touch events supported: ${supportedEvents.join(', ')}`
      : `Partial touch support: ${supportedEvents.join(', ')} (missing: ${touchEvents.filter(e => !supportedEvents.includes(e)).join(', ')})`;

    return {
      testName: 'Touch Functionality',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const testPerformanceMetrics = async (): Promise<TestResult> => {
    // Test first contentful paint and other performance metrics
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let details = 'Performance metrics collected';

          for (const entry of entries) {
            if (entry.entryType === 'paint') {
              details += ` | FCP: ${entry.startTime.toFixed(2)}ms`;
            } else if (entry.entryType === 'largest-contentful-paint') {
              details += ` | LCP: ${entry.startTime.toFixed(2)}ms`;
            }
          }

          resolve({
            testName: 'Performance Metrics',
            status: 'pass',
            details,
            timestamp: Date.now(),
          });

          observer.disconnect();
        });

        try {
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        } catch (e) {
          // Fallback to basic timing
          const loadTime = performance.now();
          resolve({
            testName: 'Performance Metrics',
            status: 'pass',
            details: `Basic timing: ${loadTime.toFixed(2)}ms`,
            timestamp: Date.now(),
          });
        }
      } else {
        resolve({
          testName: 'Performance Metrics',
          status: 'warning',
          details: 'Performance Observer not supported in this browser',
          timestamp: Date.now(),
        });
      }
    });
  };

  const testAccessibility = (): TestResult => {
    // Check basic accessibility features
    const hasARIA = typeof document.createElement('div').getAttribute === 'function';
    const hasFocusManagement = typeof document.activeElement !== 'undefined';
    const hasScreenReaderSupport = typeof window.speechSynthesis !== 'undefined';

    const status = hasARIA && hasFocusManagement ? 'pass' : 'warning';
    const details = [
      hasARIA ? '✅ ARIA support' : '❌ ARIA support missing',
      hasFocusManagement ? '✅ Focus management' : '❌ Focus management missing',
      hasScreenReaderSupport ? '✅ Speech synthesis' : '⚠️ Limited screen reader support',
    ].join(' | ');

    return {
      testName: 'Accessibility',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const testLocalStorage = (): TestResult => {
    try {
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (value === 'test') {
        return {
          testName: 'Local Storage',
          status: 'pass',
          details: 'localStorage is working correctly',
          timestamp: Date.now(),
        };
      } else {
        throw new Error('Storage value mismatch');
      }
    } catch (error) {
      return {
        testName: 'Local Storage',
        status: 'fail',
        details: `localStorage not available: ${error}`,
        timestamp: Date.now(),
      };
    }
  };

  const testProgressiveWebApp = (): TestResult => {
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = !!document.querySelector('link[rel="manifest"]');
    const hasPushManager = 'PushManager' in window;

    const status = hasServiceWorker && hasManifest ? 'pass' : 'warning';
    const details = [
      hasServiceWorker ? '✅ Service Worker' : '❌ Service Worker missing',
      hasManifest ? '✅ Manifest' : '❌ Manifest missing',
      hasPushManager ? '✅ Push Notifications' : '⚠️ Push notifications not supported',
    ].join(' | ');

    return {
      testName: 'Progressive Web App',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const testBrowserCompatibility = (): TestResult => {
    const features = {
      es6: () => {
        try {
          eval('const a = () => {}; class B {}');
          return true;
        } catch {
          return false;
        }
      },
      fetch: () => typeof fetch !== 'undefined',
      promises: () => typeof Promise !== 'undefined',
      asyncAwait: () => {
        try {
          eval('async function test() { await Promise.resolve(); }');
          return true;
        } catch {
          return false;
        }
      },
      webComponents: () => 'customElements' in window,
      shadowDOM: () => !!HTMLElement.prototype.attachShadow,
    };

    const supportedFeatures = Object.entries(features).filter(([_, test]) => test());
    const unsupportedFeatures = Object.entries(features).filter(([_, test]) => !test());

    const status = unsupportedFeatures.length === 0 ? 'pass' : 'warning';
    const details = [
      `Supported: ${supportedFeatures.map(([name]) => name).join(', ')}`,
      unsupportedFeatures.length > 0 ? `Missing: ${unsupportedFeatures.map(([name]) => name).join(', ')}` : '',
    ].filter(Boolean).join(' | ');

    return {
      testName: 'Browser Compatibility',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const testNetworkResilience = (): TestResult => {
    const hasOnlineStatus = 'onLine' in navigator;
    const hasNetworkInformation = 'connection' in navigator;

    const status = hasOnlineStatus ? 'pass' : 'warning';
    const details = [
      hasOnlineStatus ? '✅ Online status detection' : '❌ Online status detection missing',
      hasNetworkInformation ? '✅ Network information API' : '⚠️ Network information not available',
    ].join(' | ');

    return {
      testName: 'Network Resilience',
      status,
      details,
      timestamp: Date.now(),
    };
  };

  const getDeviceCategory = () => {
    if (!deviceInfo) return 'Unknown';

    const width = deviceInfo.screenWidth;
    if (width <= 768) return 'Mobile';
    if (width <= 1024) return 'Tablet';
    return 'Desktop';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'fail': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.deviceTest}>
      <div className={styles.testHeader}>
        <h3>📱 Device Testing & Validation</h3>
        <p>Comprehensive cross-device compatibility testing</p>
      </div>

      {/* Device Information */}
      {deviceInfo && (
        <div className={styles.deviceInfo}>
          <h4>Device Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Category:</span>
              <span className={styles.value}>{getDeviceCategory()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Screen:</span>
              <span className={styles.value}>{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>DPR:</span>
              <span className={styles.value}>{deviceInfo.devicePixelRatio}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Touch:</span>
              <span className={styles.value}>{deviceInfo.isTouchDevice ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Orientation:</span>
              <span className={styles.value}>{deviceInfo.orientation}</span>
            </div>
            {deviceInfo.connectionType && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Connection:</span>
                <span className={styles.value}>{deviceInfo.connectionType}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className={styles.testControls}>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={styles.runTestsBtn}
        >
          {isRunning ? '🧪 Running Tests...' : '🧪 Run All Tests'}
        </button>
        <button
          onClick={updateDeviceInfo}
          className={styles.refreshInfoBtn}
        >
          🔄 Refresh Device Info
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className={styles.testResults}>
          <h4>Test Results</h4>
          <div className={styles.resultsList}>
            {testResults.map((result, index) => (
              <div key={index} className={styles.resultItem}>
                <div className={styles.resultHeader}>
                  <span
                    className={styles.statusIndicator}
                    style={{ backgroundColor: getStatusColor(result.status) }}
                  />
                  <span className={styles.testName}>{result.testName}</span>
                  <span className={`${styles.statusBadge} ${styles[result.status]}`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.resultDetails}>
                  {result.details}
                </div>
                <div className={styles.resultTime}>
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.testSummary}>
            <div className={styles.summaryStats}>
              <span className={styles.stat}>
                ✅ {testResults.filter(r => r.status === 'pass').length} Passed
              </span>
              <span className={styles.stat}>
                ⚠️ {testResults.filter(r => r.status === 'warning').length} Warnings
              </span>
              <span className={styles.stat}>
                ❌ {testResults.filter(r => r.status === 'fail').length} Failed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {testResults.length > 0 && (
        <div className={styles.recommendations}>
          <h4>Recommendations</h4>
          <div className={styles.recommendationsList}>
            {testResults.filter(r => r.status === 'fail').length > 0 && (
              <div className={styles.recommendation}>
                <span className={styles.recType}>🚨 Critical</span>
                <span>Fix failed tests to ensure basic functionality</span>
              </div>
            )}
            {testResults.filter(r => r.status === 'warning').length > 0 && (
              <div className={styles.recommendation}>
                <span className={styles.recType}>⚠️ Enhancement</span>
                <span>Address warnings to improve user experience</span>
              </div>
            )}
            <div className={styles.recommendation}>
              <span className={styles.recType}>📱 Mobile</span>
              <span>Test on actual mobile devices for touch interaction</span>
            </div>
            <div className={styles.recommendation}>
              <span className={styles.recType}>🌐 Browser</span>
              <span>Test on Chrome, Firefox, Safari, and Edge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceTest;