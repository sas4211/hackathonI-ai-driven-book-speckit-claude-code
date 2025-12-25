import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ai_ml_book_progress';

interface ProgressData {
  completedChapters: string[];
  timeSpent: Record<string, number>;
  quizScores: Record<string, number>;
  completedSections: string[];
  lastActivity: number;
  exportTimestamp?: number;
  bookmarks: Bookmark[];
  notes: Record<string, string>;
}

interface Bookmark {
  id: string;
  chapter: string;
  section: string;
  title: string;
  content: string;
  timestamp: number;
  tags: string[];
  isPublic: boolean;
}

interface Note {
  id: string;
  path: string;
  content: string;
  timestamp: number;
  isHighlighted: boolean;
}

const defaultProgress: ProgressData = {
  completedChapters: [],
  timeSpent: {},
  quizScores: {},
  completedSections: [],
  lastActivity: Date.now(),
  bookmarks: [],
  notes: {},
};

// Enhanced progress validation
const validateProgressData = (data: any): ProgressData => {
  if (!data || typeof data !== 'object') {
    return defaultProgress;
  }

  const validated: ProgressData = {
    completedChapters: Array.isArray(data.completedChapters) ? data.completedChapters : [],
    timeSpent: typeof data.timeSpent === 'object' ? data.timeSpent : {},
    quizScores: typeof data.quizScores === 'object' ? data.quizScores : {},
    completedSections: Array.isArray(data.completedSections) ? data.completedSections : [],
    lastActivity: typeof data.lastActivity === 'number' ? data.lastActivity : Date.now(),
    exportTimestamp: data.exportTimestamp || undefined,
    bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
    notes: typeof data.notes === 'object' ? data.notes : {},
  };

  // Validate array contents
  validated.completedChapters = validated.completedChapters.filter(ch => typeof ch === 'string');
  validated.completedSections = validated.completedSections.filter(sec => typeof sec === 'string');

  // Validate bookmarks
  validated.bookmarks = validated.bookmarks.filter(bookmark => {
    return bookmark && typeof bookmark.id === 'string' &&
           typeof bookmark.chapter === 'string' &&
           typeof bookmark.title === 'string';
  });

  // Validate timeSpent and quizScores objects
  Object.keys(validated.timeSpent).forEach(key => {
    if (typeof validated.timeSpent[key] !== 'number') {
      delete validated.timeSpent[key];
    }
  });

  Object.keys(validated.quizScores).forEach(key => {
    if (typeof validated.quizScores[key] !== 'number') {
      delete validated.quizScores[key];
    }
  });

  return validated;
};

// Load progress from localStorage with enhanced error handling
const loadProgress = (): ProgressData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;

    const parsed = JSON.parse(stored);
    const validated = validateProgressData(parsed);

    // Migrate old data format if needed
    if (parsed && (!parsed.lastActivity || !parsed.completedSections)) {
      console.log('Migrating old progress data format...');
      return {
        ...defaultProgress,
        ...validated,
        lastActivity: parsed.lastActivity || Date.now(),
      };
    }

    return validated;
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.error('Could not clear corrupted progress data:', clearError);
    }
    return defaultProgress;
  }
};

// Enhanced save progress with validation
const saveProgress = (progress: ProgressData): boolean => {
  try {
    const validated = validateProgressData(progress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    return true;
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
    return false;
  }
};

// Export progress data with metadata
export const exportProgressData = (): string | null => {
  try {
    const progress = loadProgress();
    const exportData = {
      ...progress,
      exportTimestamp: Date.now(),
      version: '1.0',
      metadata: {
        totalChapters: 13,
        totalSections: Object.keys(progress.timeSpent).length,
        exportDate: new Date().toISOString(),
      },
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting progress data:', error);
    return null;
  }
};

// Import progress data from JSON string
export const importProgressData = (jsonString: string): boolean => {
  try {
    const importedData = JSON.parse(jsonString);

    // Validate imported data structure
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid progress data format');
    }

    // Extract core progress data, ignoring metadata
    const { exportTimestamp, version, metadata, ...progressData } = importedData;

    // Validate the progress data
    const validated = validateProgressData(progressData);

    // Save the imported data
    return saveProgress({
      ...validated,
      lastActivity: Date.now(),
    });
  } catch (error) {
    console.error('Error importing progress data:', error);
    return false;
  }
};

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressData>(loadProgress());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced save progress with error handling
  useEffect(() => {
    const save = async () => {
      setIsSaving(true);
      setError(null);

      try {
        const success = saveProgress(progress);
        if (!success) {
          throw new Error('Failed to save progress data');
        }
      } catch (err) {
        console.error('Progress save failed:', err);
        setError('Failed to save progress. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(save, 1000);
    return () => clearTimeout(timeoutId);
  }, [progress]);

  const markChapterCompleted = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      completedChapters: [...new Set([...prev.completedChapters, chapterId])],
      lastActivity: Date.now(),
    }));
  }, []);

  const addTimeSpent = useCallback((chapterId: string, duration: number) => {
    setProgress(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [chapterId]: (prev.timeSpent[chapterId] || 0) + Math.max(0, duration),
      },
      lastActivity: Date.now(),
    }));
  }, []);

  const saveQuizScore = useCallback((quizId: string, score: number) => {
    // Validate score is between 0-100
    const validatedScore = Math.max(0, Math.min(100, score));

    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: validatedScore,
      },
      lastActivity: Date.now(),
    }));
  }, []);

  const markSectionCompleted = useCallback((sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSections: [...new Set([...prev.completedSections, sectionId])],
      lastActivity: Date.now(),
    }));
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setProgress(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newBookmark],
      lastActivity: Date.now(),
    }));
  }, []);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setProgress(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== bookmarkId),
      lastActivity: Date.now(),
    }));
  }, []);

  const updateBookmark = useCallback((bookmarkId: string, updates: Partial<Bookmark>) => {
    setProgress(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b =>
        b.id === bookmarkId ? { ...b, ...updates, timestamp: Date.now() } : b
      ),
      lastActivity: Date.now(),
    }));
  }, []);

  const addNote = useCallback((path: string, content: string) => {
    const noteId = `${path}_${Date.now()}`;
    setProgress(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [noteId]: content,
      },
      lastActivity: Date.now(),
    }));
  }, []);

  const updateNote = useCallback((noteId: string, content: string) => {
    setProgress(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [noteId]: content,
      },
      lastActivity: Date.now(),
    }));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setProgress(prev => {
      const newNotes = { ...prev.notes };
      delete newNotes[noteId];
      return {
        ...prev,
        notes: newNotes,
        lastActivity: Date.now(),
      };
    });
  }, []);

  const resetProgress = useCallback(async () => {
    if (!window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      setProgress(defaultProgress);
      setError(null);
    } catch (err) {
      console.error('Error resetting progress:', err);
      setError('Failed to reset progress. Please try again.');
    }
  }, []);

  const exportProgress = useCallback(() => {
    const exportedData = exportProgressData();
    if (!exportedData) {
      setError('Failed to export progress data.');
      return false;
    }

    try {
      const dataBlob = new Blob([exportedData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-ml-progress-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Error creating export file:', err);
      setError('Failed to export progress data.');
      return false;
    }
  }, []);

  const importProgress = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const success = importProgressData(result);
        if (success) {
          setProgress(loadProgress());
          setError(null);
        } else {
          setError('Failed to import progress data. Please check the file format.');
        }
      } else {
        setError('Invalid file format for progress import.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    const totalChapters = 13;
    const totalSections = Object.keys(progress.timeSpent).length;
    const completedChapters = progress.completedChapters.length;
    const completedSections = progress.completedSections.length;

    const totalStudyTime = Object.values(progress.timeSpent).reduce((sum, time) => sum + time, 0);
    const averageQuizScore = Object.values(progress.quizScores).length > 0
      ? Object.values(progress.quizScores).reduce((sum, score) => sum + score, 0) / Object.values(progress.quizScores).length
      : 0;

    return {
      completionPercentage: Math.round((completedChapters / totalChapters) * 100),
      chaptersCompleted: completedChapters,
      chaptersTotal: totalChapters,
      sectionsCompleted: completedSections,
      sectionsTotal: totalSections,
      totalStudyTime,
      averageQuizScore,
      lastActivity: new Date(progress.lastActivity),
    };
  }, [progress]);

  return {
    progress,
    isSaving,
    error,
    markChapterCompleted,
    addTimeSpent,
    saveQuizScore,
    markSectionCompleted,
    addBookmark,
    removeBookmark,
    updateBookmark,
    addNote,
    updateNote,
    deleteNote,
    resetProgress,
    exportProgress,
    importProgress,
    getProgressStats,
    clearError: () => setError(null),
  };
};