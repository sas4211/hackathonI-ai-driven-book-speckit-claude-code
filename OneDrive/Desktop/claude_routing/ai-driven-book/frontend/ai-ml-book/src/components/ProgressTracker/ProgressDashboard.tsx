import React, { useRef, useState } from 'react';
import { useProgress } from './useProgress';
import Bookmarks from './Bookmarks';
import DeviceTest from './DeviceTest';
import styles from './ProgressDashboard.module.css';

const ProgressDashboard: React.FC = () => {
  const {
    progress,
    isSaving,
    error,
    resetProgress,
    exportProgress,
    importProgress,
    getProgressStats,
    clearError,
  } = useProgress();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = getProgressStats();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const chaptersData = [
    { id: 'intro', name: 'Introduction', completed: progress.completedChapters.includes('intro') },
    { id: 'chapter-1', name: 'Chapter 1: Foundations of AI', completed: progress.completedChapters.includes('chapter-1') },
    { id: 'chapter-2', name: 'Chapter 2: Mathematical Foundations', completed: progress.completedChapters.includes('chapter-2') },
    { id: 'chapter-3', name: 'Chapter 3: Linear Regression', completed: progress.completedChapters.includes('chapter-3') },
    { id: 'chapter-4', name: 'Chapter 4: Classification', completed: progress.completedChapters.includes('chapter-4') },
    { id: 'chapter-5', name: 'Chapter 5: Unsupervised Learning', completed: progress.completedChapters.includes('chapter-5') },
    { id: 'chapter-6', name: 'Chapter 6: Neural Networks', completed: progress.completedChapters.includes('chapter-6') },
    { id: 'chapter-7', name: 'Chapter 7: Deep Learning', completed: progress.completedChapters.includes('chapter-7') },
    { id: 'chapter-8', name: 'Chapter 8: NLP', completed: progress.completedChapters.includes('chapter-8') },
    { id: 'chapter-9', name: 'Chapter 9: Computer Vision', completed: progress.completedChapters.includes('chapter-9') },
    { id: 'chapter-10', name: 'Chapter 10: Reinforcement Learning', completed: progress.completedChapters.includes('chapter-10') },
    { id: 'chapter-11', name: 'Chapter 11: Model Deployment', completed: progress.completedChapters.includes('chapter-11') },
    { id: 'chapter-12', name: 'Chapter 12: Ethics & Future', completed: progress.completedChapters.includes('chapter-12') },
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importProgress(file);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.progressDashboard}>
      {/* Error Message Display */}
      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>
          <button onClick={clearError} className={styles.closeError}>×</button>
        </div>
      )}

      <div className={styles.dashboardHeader}>
        <h2>📊 Learning Progress Dashboard</h2>
        <p>Track your journey through the AI & ML Interactive Book</p>
        {isSaving && <div className={styles.savingIndicator}>Saving progress...</div>}
      </div>

      <div className={styles.overviewCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📚</div>
          <div className={styles.cardContent}>
            <h3>{stats.chaptersCompleted} / {stats.chaptersTotal}</h3>
            <p>Chapters Completed</p>
            <div className={styles.progressRing}>
              <div
                className={styles.progressFill}
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>⏱️</div>
          <div className={styles.cardContent}>
            <h3>{formatTime(stats.totalStudyTime)}</h3>
            <p>Total Reading Time</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <div className={styles.cardContent}>
            <h3>{stats.averageQuizScore.toFixed(1)}%</h3>
            <p>Average Quiz Score</p>
            <div className={styles.progressRing}>
              <div
                className={styles.progressFill}
                style={{ width: `${stats.averageQuizScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🔄</div>
          <div className={styles.cardContent}>
            <h3>{stats.sectionsCompleted}</h3>
            <p>Sections Mastered</p>
          </div>
        </div>
      </div>

      <div className={styles.chapterProgress}>
        <h3>Chapter Progress</h3>
        <div className={styles.chapterList}>
          {chaptersData.map((chapter) => (
            <div
              key={chapter.id}
              className={`${styles.chapterItem} ${chapter.completed ? styles.completed : ''}`}
            >
              <div className={styles.chapterInfo}>
                <span className={styles.chapterName}>{chapter.name}</span>
                <span className={styles.chapterStatus}>
                  {chapter.completed ? '✅ Completed' : '⏳ In Progress'}
                </span>
              </div>
              <div className={styles.chapterProgress}>
                <div
                  className={`${styles.progressFill} ${chapter.completed ? styles.completed : ''}`}
                  style={{
                    width: chapter.completed ? '100%' : '0%',
                  }}
                />
              </div>
              <div className={styles.chapterTime}>
                Time spent: {formatTime(progress.timeSpent[chapter.id] || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.quizProgress}>
        <h3>Quiz Performance</h3>
        <div className={styles.quizGrid}>
          {Object.entries(progress.quizScores).length === 0 ? (
            <p className={styles.noData}>No quiz scores yet. Complete quizzes to track your progress!</p>
          ) : (
            Object.entries(progress.quizScores).map(([quizId, score]) => (
              <div key={quizId} className={styles.quizCard}>
                <h4>Quiz: {quizId}</h4>
                <div className={styles.quizScore}>
                  <span className={styles.scoreValue}>{score}%</span>
                  <div className={styles.quizProgress}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bookmarks and Notes Section */}
      <Bookmarks />

      {/* Device Testing Section */}
      <DeviceTest />

      <div className={styles.dashboardActions}>
        <button
          className={styles.exportButton}
          onClick={exportProgress}
          disabled={isSaving}
        >
          📤 Export Progress
        </button>

        <button
          className={styles.importButton}
          onClick={handleImportClick}
          disabled={isSaving}
        >
          📥 Import Progress
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          className={styles.shareButton}
          onClick={() => {
            const shareData = {
              title: 'My AI & ML Learning Progress',
              text: `I've completed ${stats.chaptersCompleted}/${stats.chaptersTotal} chapters with ${stats.averageQuizScore.toFixed(1)}% average score!`,
              url: window.location.href,
            };
            if (navigator.share) {
              navigator.share(shareData);
            } else {
              navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
              alert('Progress shared to clipboard!');
            }
          }}
        >
          📤 Share Progress
        </button>

        <button
          className={styles.resetButton}
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
              resetProgress();
            }
          }}
        >
          🔄 Reset All Progress
        </button>
      </div>

      <div className={styles.lastActivity}>
        <p>Last activity: {stats.lastActivity.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProgressDashboard;