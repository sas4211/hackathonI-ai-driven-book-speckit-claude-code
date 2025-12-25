import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface ProgressData {
  completedChapters: string[];
  completedSections: string[];
  currentChapter: string;
  timeSpent: Record<string, number>;
  quizScores: Record<string, number>;
  lastActivity: string;
}

interface ProgressContextType {
  progress: ProgressData;
  markSectionCompleted: (sectionId: string) => void;
  markChapterCompleted: (chapterId: string) => void;
  setCurrentChapter: (chapterId: string) => void;
  updateTimeSpent: (chapterId: string, time: number) => void;
  setQuizScore: (quizId: string, score: number) => void;
  resetProgress: () => void;
  getCompletionPercentage: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const PROGRESS_STORAGE_KEY = 'ai_ml_book_progress';

const defaultProgress: ProgressData = {
  completedChapters: [],
  completedSections: [],
  currentChapter: '',
  timeSpent: {},
  quizScores: {},
  lastActivity: new Date().toISOString(),
};

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultProgress;
    }
    return defaultProgress;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const markSectionCompleted = (sectionId: string) => {
    setProgress(prev => {
      if (!prev.completedSections.includes(sectionId)) {
        return {
          ...prev,
          completedSections: [...prev.completedSections, sectionId],
          lastActivity: new Date().toISOString(),
        };
      }
      return prev;
    });
  };

  const markChapterCompleted = (chapterId: string) => {
    setProgress(prev => {
      if (!prev.completedChapters.includes(chapterId)) {
        return {
          ...prev,
          completedChapters: [...prev.completedChapters, chapterId],
          lastActivity: new Date().toISOString(),
        };
      }
      return prev;
    });
  };

  const setCurrentChapter = (chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      currentChapter: chapterId,
      lastActivity: new Date().toISOString(),
    }));
  };

  const updateTimeSpent = (chapterId: string, time: number) => {
    setProgress(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [chapterId]: (prev.timeSpent[chapterId] || 0) + time,
      },
      lastActivity: new Date().toISOString(),
    }));
  };

  const setQuizScore = (quizId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: score,
      },
      lastActivity: new Date().toISOString(),
    }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
  };

  const getCompletionPercentage = () => {
    // This is a simplified calculation
    // In a real implementation, you'd want to define what constitutes completion
    const totalChapters = 12; // Adjust based on your book structure
    const completed = progress.completedChapters.length;
    return Math.round((completed / totalChapters) * 100);
  };

  const value: ProgressContextType = {
    progress,
    markSectionCompleted,
    markChapterCompleted,
    setCurrentChapter,
    updateTimeSpent,
    setQuizScore,
    resetProgress,
    getCompletionPercentage,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};