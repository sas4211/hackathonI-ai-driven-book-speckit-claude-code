import React, { useEffect, useState } from 'react';
import { useProgress } from './ProgressProvider';
import styles from './ProgressTracker.module.css';
import { useLocation } from '@docusaurus/router';

const ProgressTracker: React.FC = () => {
  const { progress, updateTimeSpent, setCurrentChapter, getCompletionPercentage } = useProgress();
  const location = useLocation();
  const [timeOnPage, setTimeOnPage] = useState(0);

  // Extract chapter from URL
  const getCurrentChapter = (pathname: string): string => {
    const pathParts = pathname.split('/').filter(part => part);
    if (pathParts.length >= 2 && pathParts[0] === 'docs') {
      return pathParts[1];
    }
    return '';
  };

  useEffect(() => {
    const currentChapter = getCurrentChapter(location.pathname);
    if (currentChapter) {
      setCurrentChapter(currentChapter);
    }

    // Reset timer when page changes
    setTimeOnPage(0);
  }, [location.pathname]);

  useEffect(() => {
    // Track time on page
    const interval = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Save time spent every 30 seconds
    if (timeOnPage > 0 && timeOnPage % 30 === 0) {
      const currentChapter = getCurrentChapter(location.pathname);
      if (currentChapter) {
        updateTimeSpent(currentChapter, 30);
      }
    }
  }, [timeOnPage]);

  const completionPercentage = getCompletionPercentage();

  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressHeader}>
        <h3>📚 Your Progress</h3>
        <span className={styles.completionBadge}>
          {completionPercentage}%
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className={styles.progressDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Chapters Completed:</span>
          <span className={styles.detailValue}>
            {progress.completedChapters.length} / 12
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Current Chapter:</span>
          <span className={styles.detailValue}>
            {progress.currentChapter || 'Getting started...'}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Time Spent:</span>
          <span className={styles.detailValue}>
            {Math.floor(timeOnPage / 60)}m {timeOnPage % 60}s
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Last Activity:</span>
          <span className={styles.detailValue}>
            {new Date(progress.lastActivity).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className={styles.progressActions}>
        <button
          className={styles.resetButton}
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) {
              // Trigger a custom event to notify the user
              window.dispatchEvent(new CustomEvent('progress-reset'));
            }
          }}
        >
          🔄 Reset Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressTracker;