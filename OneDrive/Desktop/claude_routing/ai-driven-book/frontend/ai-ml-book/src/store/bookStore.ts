import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

interface ProgressStats {
  overall: number;
  byChapter: Record<string, number>;
  bySection: Record<string, boolean>;
}

interface CodeExecution {
  id: string;
  code: string;
  output: any[];
  executionTime: number;
  timestamp: number;
}

interface Bookmark {
  chapter: string;
  section: string;
  title: string;
  timestamp: number;
  note?: string;
}

interface AssessmentResult {
  section: string;
  score: number;
  maxScore: number;
  answers: Record<string, any>;
  timestamp: number;
}

interface BookState {
  // Progress tracking
  progress: ProgressStats;
  completedSections: Set<string>;
  completedChapters: Set<string>;

  // Code execution
  codeHistory: Record<string, string>;
  executions: CodeExecution[];

  // Bookmarks & notes
  bookmarks: Bookmark[];
  notes: Record<string, string>;

  // Assessment results
  assessments: AssessmentResult[];

  // Settings
  showHints: boolean;
  autoplayVideos: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Actions
  updateProgress: () => void;
  markSectionComplete: (sectionId: string) => void;
  markSectionIncomplete: (sectionId: string) => void;
  completeChapter: (chapterId: string) => void;

  // Code management
  addCodeSnippet: (id: string, code: string) => string;
  getCodeSnippet: (id: string) => string | null;
  saveExecution: (id: string, execution: Partial<CodeExecution>) => void;

  // Bookmarks & notes
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
  removeBookmark: (chapter: string, section: string) => void;
  addNote: (path: string, note: string) => void;
  getNote: (path: string) => string | null;

  // Assessment management
  saveAssessment: (result: AssessmentResult) => void;
  getAssessmentProgress: (section: string) => AssessmentResult | undefined;

  // Settings
  toggleHints: () => void;
  toggleAutoplay: () => void;
  setDarkMode: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;

  // Analytics
  trackTimeSpent: (section: string, milliseconds: number) => void;
  getLearningAnalytics: () => any;
}

const initialChapters = {
  introduction: 4,
  basics: 4,
  'supervised-learning': 5,
  'unsupervised-learning': 4,
  'deep-learning': 5,
  'data-streams': 4,
};

// Define a union type for activities (adjust properties as needed for sorting/display)
type Activity = CodeExecution | AssessmentResult;

export const useBookStore = create<BookState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      progress: {
        overall: 0,
        byChapter: {},
        bySection: {},
      },
      completedSections: new Set(),
      completedChapters: new Set(),
      codeHistory: {},
      executions: [],
      bookmarks: [],
      notes: {},
      assessments: [],
      showHints: true,
      autoplayVideos: true,
      darkMode: false,
      fontSize: 'medium',

      // Progress tracking
      updateProgress: () => {
        const state = get();
        const totalSections = Object.values(initialChapters).reduce((a, b) => a + b, 0);
        const completedCount = state.completedSections.size;
        const overall = Math.round((completedCount / totalSections) * 100);

        const byChapter: Record<string, number> = {};
        Object.entries(initialChapters).forEach(([chapter, total]) => {
          const completed = Array.from(state.completedSections).filter(s =>
            s.startsWith(chapter)
          ).length;
          byChapter[chapter] = Math.round((completed / total) * 100);
        });

        set({
          progress: {
            overall,
            byChapter,
            bySection: state.progress.bySection,
          },
        });
      },

      markSectionComplete: (sectionId: string) => {
        set((state) => ({
          completedSections: new Set([...state.completedSections, sectionId]),
        }));
        get().updateProgress();
      },

      markSectionIncomplete: (sectionId: string) => {
        set((state) => {
          const newCompleted = new Set(state.completedSections);
          newCompleted.delete(sectionId);
          return { completedSections: newCompleted };
        });
        get().updateProgress();
      },

      completeChapter: (chapterId: string) => {
        set((state) => ({
          completedChapters: new Set([...state.completedChapters, chapterId]),
        }));
      },

      // Code management
      addCodeSnippet: (id: string, code: string): string => {
        set((state) => ({
          codeHistory: {
            ...state.codeHistory,
            [id]: code,
          },
        }));
        return code;
      },

      getCodeSnippet: (id: string): string | null => {
        return get().codeHistory[id] || null;
      },

      saveExecution: (id: string, execution: Partial<CodeExecution>) => {
        set((state) => ({
          executions: [
            ...state.executions,
            {
              id,
              code: '',
              output: [],
              executionTime: 0,
              timestamp: Date.now(),
              ...execution,
            },
          ].slice(-100), // Keep last 100 executions
        }));
      },

      // Bookmarks & notes
      addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => {
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            { ...bookmark, timestamp: Date.now() },
          ],
        }));
      },

      removeBookmark: (chapter: string, section: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.chapter === chapter && b.section === section)
          ),
        }));
      },

      addNote: (path: string, note: string) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [path]: note,
          },
        }));
      },

      getNote: (path: string): string | null => {
        return get().notes[path] || null;
      },

      // Assessment management
      saveAssessment: (result: AssessmentResult) => {
        set((state) => ({
          assessments: [
            ...state.assessments,
            { ...result, timestamp: Date.now() },
          ],
        }));
      },

      getAssessmentProgress: (section: string): AssessmentResult | undefined => {
        return get().assessments
          .filter((a) => a.section === section)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
      },

      // Settings
      toggleHints: () => set((state) => ({ showHints: !state.showHints })),
      toggleAutoplay: () => set((state) => ({ autoplayVideos: !state.autoplayVideos })),
      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),
      setFontSize: (size: 'small' | 'medium' | 'large') => set({ fontSize: size }),

      // Analytics
      trackTimeSpent: (section: string, milliseconds: number) => {
        // Implementation would store time spent per section
        console.log(`Spent ${milliseconds}ms on ${section}`);
      },

      getLearningAnalytics: () => {
        const state = get();
        return {
          totalTime: Math.floor(Math.random() * 1000 * 60 * 60), // Mock data
          sectionsCompleted: state.completedSections.size,
          averageScore: state.assessments.length > 0
            ? (state.assessments.reduce((sum, a) => sum + a.score, 0) / state.assessments.length) * 100
            : 0,
          learningStreak: 7, // Mock data
          revisitFrequency: 0.3, // Mock data
        };
      },
    })),
    {
      name: 'ml-book-store',
      version: 1.2,
      partialize: (state) => ({
        ...state,
        completedSections: Array.from(state.completedSections),
        completedChapters: Array.from(state.completedChapters),
      }),
    }
  )
);

// Selectors for specific data
export const selectors = {
  getProgress: (state: BookState) => state.progress,
  isSectionCompleted: (sectionId: string) => (state: BookState) =>
    state.completedSections.has(sectionId),
  getExecutionsForSection: (sectionId: string) => (state: BookState) =>
    state.executions.filter(e => e.id === sectionId),
  getRecentActivity: () => (state: BookState): Activity[] =>
    ([...state.executions, ...state.assessments] as Activity[])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10),
};

// Helper functions
export const helpers = {
  generateProgressReport: () => {
    const state = useBookStore.getState();
    return {
      overall: state.progress.overall,
      completedSections: Array.from(state.completedSections),
      totalSections: Object.values(initialChapters).reduce((a, b) => a + b, 0),
      recommendations: generateRecommendations(state),
    };
  },

  resetProgress: () => {
    useBookStore.setState({
      completedSections: new Set(),
      completedChapters: new Set(),
      codeHistory: {},
      executions: [],
      assessments: [],
      bookmarks: [],
      notes: {},
    });
  },
};

function generateRecommendations(state: BookState) {
  const recommendations: string[] = [];

  if (state.completedSections.size === 0) {
    recommendations.push('Start with "Introduction to ML" to build foundational knowledge');
  }

  if (!state.completedSections.has('what-is-ml')) {
    recommendations.push('Complete "What is Machine Learning?" to understand the basics');
  }

  const basicsCompleted = Array.from(state.completedSections).filter(s =>
    s.startsWith('basics')
  ).length;

  if (basicsCompleted < 2) {
    recommendations.push('Focus on mathematical foundations before advancing');
  }

  if (state.assessments.length < 3) {
    recommendations.push('Complete more assessments to track your understanding');
  }

  return recommendations;
}