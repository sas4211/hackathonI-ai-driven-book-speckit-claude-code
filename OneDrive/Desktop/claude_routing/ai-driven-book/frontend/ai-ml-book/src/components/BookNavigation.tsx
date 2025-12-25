import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  BarChart3,
  Brain,
  Code,
  Database,
  TrendingUp,
  PlayCircle,
  Download,
  Bookmark,
  FileText,
  Lightbulb,
  CheckSquare,
  X
} from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface Chapter {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  sections: Section[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  completed: boolean;
  isNew?: boolean;
  hasCodePen?: boolean;
}

interface Section {
  id: string;
  title: string;
  path: string;
  completed: boolean;
  isInteractive?: boolean;
  hasAssessment?: boolean;
}

const BookNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, completedSections, updateProgress } = useBookStore();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState<string>('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const chapters: Chapter[] = [
    {
      id: 'introduction',
      title: 'Introduction to ML',
      path: '/introduction',
      icon: <BookOpen className="w-5 h-5" />,
      difficulty: 'beginner',
      estimatedTime: 30,
      completed: completedSections.has('introduction'),
      isNew: true,
      hasCodePen: false,
      sections: [
        { id: 'what-is-ml', title: 'What is Machine Learning?', path: '/introduction/what-is-ml', completed: completedSections.has('what-is-ml'), isInteractive: true, hasAssessment: true },
        { id: 'ml-vs-ai', title: 'ML vs AI vs DL', path: '/introduction/ml-vs-ai', completed: completedSections.has('ml-vs-ai') },
        { id: 'python-setup', title: 'Python Environment Setup', path: '/introduction/python-setup', completed: completedSections.has('python-setup'), isInteractive: true },
        { id: 'first-model', title: 'Your First ML Model', path: '/introduction/first-model', completed: completedSections.has('first-model'), isInteractive: true, hasAssessment: true },
      ],
    },
    {
      id: 'basics',
      title: 'Mathematical Foundations',
      path: '/basics',
      icon: <BarChart3 className="w-5 h-5" />,
      difficulty: 'beginner',
      estimatedTime: 45,
      completed: completedSections.has('basics'),
      hasCodePen: true,
      sections: [
        { id: 'statistics-fundamentals', title: 'Statistics Fundamentals', path: '/basics/statistics', completed: completedSections.has('statistics-fundamentals'), isInteractive: true },
        { id: 'linear-algebra', title: 'Linear Algebra for ML', path: '/basics/linear-algebra', completed: completedSections.has('linear-algebra'), hasAssessment: true },
        { id: 'probability-distributions', title: 'Probability & Distributions', path: '/basics/probability', completed: completedSections.has('probability-distributions') },
        { id: 'numpy-pandas', title: 'NumPy & Pandas', path: '/basics/numpy-pandas', completed: completedSections.has('numpy-pandas'), isInteractive: true, hasAssessment: true },
      ],
    },
    {
      id: 'supervised-learning',
      title: 'Supervised Learning',
      path: '/supervised-learning',
      icon: <Brain className="w-5 h-5" />,
      difficulty: 'intermediate',
      estimatedTime: 60,
      completed: completedSections.has('supervised-learning'),
      hasCodePen: true,
      sections: [
        { id: 'linear-regression', title: 'Linear Regression', path: '/supervised-learning/linear-regression', completed: completedSections.has('linear-regression'), isInteractive: true, hasAssessment: true },
        { id: 'logistic-regression', title: 'Logistic Regression', path: '/supervised-learning/logistic-regression', completed: completedSections.has('logistic-regression'), hasAssessment: true },
        { id: 'decision-trees', title: 'Decision Trees', path: '/supervised-learning/decision-trees', completed: completedSections.has('decision-trees'), isInteractive: true },
        { id: 'random-forests', title: 'Random Forests', path: '/supervised-learning/random-forests', completed: completedSections.has('random-forests') },
        { id: 'svm', title: 'Support Vector Machines', path: '/supervised-learning/svm', completed: completedSections.has('svm'), hasAssessment: true },
      ],
    },
    {
      id: 'unsupervised-learning',
      title: 'Unsupervised Learning',
      path: '/unsupervised-learning',
      icon: <Database className="w-5 h-5" />,
      difficulty: 'intermediate',
      estimatedTime: 50,
      completed: completedSections.has('unsupervised-learning'),
      hasCodePen: true,
      sections: [
        { id: 'clustering-kmeans', title: 'K-Means Clustering', path: '/unsupervised-learning/kmeans-clustering', completed: completedSections.has('clustering-kmeans'), isInteractive: true },
        { id: 'hierarchical-clustering', title: 'Hierarchical Clustering', path: '/unsupervised-learning/hierarchical-clustering', completed: completedSections.has('hierarchical-clustering') },
        { id: 'pca', title: 'Principal Component Analysis', path: '/unsupervised-learning/pca', completed: completedSections.has('pca'), hasAssessment: true },
        { id: 'anomaly-detection', title: 'Anomaly Detection', path: '/unsupervised-learning/anomaly-detection', completed: completedSections.has('anomaly-detection'), isInteractive: true },
      ],
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      path: '/deep-learning',
      icon: <Code className="w-5 h-5" />,
      difficulty: 'advanced',
      estimatedTime: 75,
      completed: completedSections.has('deep-learning'),
      hasCodePen: true,
      sections: [
        { id: 'neural-networks', title: 'Neural Networks Basics', path: '/deep-learning/neural-networks', completed: completedSections.has('neural-networks'), isInteractive: true, hasAssessment: true },
        { id: 'backpropagation', title: 'Backpropagation', path: '/deep-learning/backpropagation', completed: completedSections.has('backpropagation'), isInteractive: true },
        { id: 'cnn', title: 'CNNs for Images', path: '/deep-learning/cnn', completed: completedSections.has('cnn'), hasAssessment: true },
        { id: 'rnn-lstm', title: 'RNNs & LSTMs', path: '/deep-learning/rnn-lstm', completed: completedSections.has('rnn-lstm') },
        { id: 'transformers', title: 'Transformers', path: '/deep-learning/transformers', completed: completedSections.has('transformers'), isNew: true },
      ],
    },
    {
      id: 'data-streams',
      title: 'Data Streams & Deployment',
      path: '/data-streams',
      icon: <TrendingUp className="w-5 h-5" />,
      difficulty: 'advanced',
      estimatedTime: 65,
      completed: completedSections.has('data-streams'),
      hasCodePen: true,
      sections: [
        { id: 'stream-processing', title: 'Stream Processing', path: '/data-streams/stream-processing', completed: completedSections.has('stream-processing') },
        { id: 'online-learning', title: 'Online Learning', path: '/data-streams/online-learning', completed: completedSections.has('online-learning'), isInteractive: true, hasAssessment: true },
        { id: 'model-deployment', title: 'Model Deployment', path: '/data-streams/model-deployment', completed: completedSections.has('model-deployment'), isInteractive: true },
        { id: 'monitoring', title: 'Model Monitoring', path: '/data-streams/monitoring', completed: completedSections.has('monitoring') },
      ],
    },
  ];

    useEffect(() => {
    // Auto-expand current chapter
    const currentChapter = chapters.find(chapter =>
      location.pathname.startsWith(chapter.path)
    );
    if (currentChapter) {
      setExpandedChapters(prev => new Set([...prev, currentChapter.id]));
    }

    // Set current section based on URL
    const currentPath = location.pathname;
    const sectionId = currentPath.split('/').pop() || '';
    setCurrentSection(sectionId);
  }, [location.pathname, chapters]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const navigateToSection = (path: string) => {
    navigate(path);
    updateProgress();
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.sections.filter(section =>
      completedSections.has(section.id)
    ).length;
    return (completed / chapter.sections.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-700 bg-green-100';
      case 'intermediate': return 'text-yellow-700 bg-yellow-100';
      case 'advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const trackProgress = (chapterId: string, sectionId: string) => {
    const progress = JSON.parse(localStorage.getItem('ml-book-progress') || '{}');
    progress[sectionId] = true;
    localStorage.setItem('ml-book-progress', JSON.stringify(progress));
  };

  const getProgressStats = () => {
    const allSections = chapters.flatMap(ch => ch.sections);
    const completedSections = allSections.filter(s => s.isCompleted).length;
    const totalSections = allSections.length;
    const percentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    return {
      completed: completedSections,
      total: totalSections,
      percentage: Math.round(percentage),
    };
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden p-2 m-2 rounded bg-gray-100 text-gray-600"
      >
        <FileText className="w-4 h-4" />
      </button>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">AI/ML Interactive Book</h2>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Overall Progress</span>
                <span className="font-medium">{progress.overall}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.overall}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="text-center">
                <div className="font-bold text-gray-900">{chapters.filter(c => c.difficulty === 'beginner').length}</div>
                <div>Beginner</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{chapters.filter(c => c.difficulty === 'intermediate').length}</div>
                <div>Intermediate</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{chapters.filter(c => c.difficulty === 'advanced').length}</div>
                <div>Advanced</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2 space-y-1">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-2">
              <button
                className={`w-full flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  location.pathname.startsWith(chapter.path)
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex-shrink-0 w-5 h-5">
                  {chapter.icon}
                </div>

                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{chapter.title}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${getChapterProgress(chapter)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {chapter.sections.length} lessons • {chapter.estimatedTime}min
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {chapter.isNew && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  {expandedChapters.has(chapter.id) ?
                    <ChevronDown className="w-4 h-4" /> :
                    <ChevronRight className="w-4 h-4" />
                  }
                </div>
              </button>

              {expandedChapters.has(chapter.id) && (
                <div className="ml-8 mt-1 space-y-1">
                  {chapter.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`group flex items-center p-2 rounded cursor-pointer transition-colors ${
                        location.pathname === section.path
                          ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => navigateToSection(section.path)}
                    >
                      <div className="flex-shrink-0 w-4 h-4 mr-2">
                        {section.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <span className="flex-1 text-sm pr-2">{section.title}</span>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {section.isInteractive && <Circle className="w-3 h-3 text-blue-500" />}
                        {section.hasAssessment && <CheckSquare className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-2 text-sm rounded hover:bg-gray-100 text-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-2 p-2 text-sm rounded hover:bg-gray-100 text-gray-700 transition-colors">
            <Bookmark className="w-4 h-4" />
            <span>Bookmark</span>
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('ml-book-progress');
            window.location.reload();
          }}
          className="w-full p-2 text-sm rounded border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
};

export default BookNavigation;