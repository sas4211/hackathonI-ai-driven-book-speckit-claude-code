import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, X, Lightbulb, RotateCcw, ArrowRight, Target } from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface ExerciseOption {
  text: string;
  value: string;
  isCorrect?: boolean;
}

interface ExerciseStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  expectedOutput?: string;
  hint?: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'multiple-choice' | 'code-input' | 'drag-drop' | 'interactive' | 'fill-in-blank';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'classification' | 'regression' | 'clustering' | 'neural-networks' | 'validation';
  points: number;
  timeLimit?: number;
  options?: ExerciseOption[];
  steps?: ExerciseStep[];
  expectedAnswer?: string | string[];
  variables?: Record<string, any>;
}

interface ExerciseAttempt {
  exerciseId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  score: number;
  maxScore: number;
  timestamp: number;
}

interface MLExerciseProps {
  exercise: Exercise;
  onComplete: (attempt: ExerciseAttempt) => void;
  instructor?: boolean;
}

const MLExercise: React.FC<MLExerciseProps> = ({
  exercise,
  onComplete,
  instructor = false,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempt, setAttempt] = useState<Partial<ExerciseAttempt>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime] = useState(Date.now());

  const { saveAssessment, showHints } = useBookStore();

  useEffect(() => {
    setAttempt({
      exerciseId: exercise.id,
      hintsUsed: 0,
      score: 0,
      maxScore: exercise.points,
      timestamp: Date.now(),
    });
  }, [exercise]);

  const handleMultipleChoiceSelect = (value: string) => {
    setSelectedAnswers([value]);
  };

  const handleCodeSubmit = (code: string) => {
    setCodeInput(code);
    // In real implementation, this would validate against expected output
    const isCorrect = simulateCodeValidation(code, exercise.expectedAnswer);
    submitAnswer(code, isCorrect);
  };

  const handleFillInBlankSubmit = (values: Record<string, string>) => {
    const isCorrect = validateFillInBlank(values, exercise.expectedAnswer as Record<string, string>);
    submitAnswer(JSON.stringify(values), isCorrect);
  };

  const submitAnswer = (userAnswer: string | string[], isCorrect: boolean) => {
    const timeSpent = Date.now() - startTime;
    const finalAttempt: ExerciseAttempt = {
      ...attempt as ExerciseAttempt,
      userAnswer,
      isCorrect,
      timeSpent,
      score: isCorrect ? exercise.points : 0,
    };

    setAttempt(finalAttempt);
    setIsCompleted(true);

    saveAssessment({
      section: exercise.id,
      score: Math.round(isCorrect ? 100 : 0),
      maxScore: 100,
      answers: { answer: userAnswer },
      timestamp: Date.now(),
    });

    onComplete(finalAttempt);
  };

  const simulateCodeValidation = (code: string, expected: string | string[] | undefined): boolean => {
    // Simple validation for demonstration
    if (!expected) return true;

    const expectedValue = Array.isArray(expected) ? expected[0] : expected;

    // Remove whitespace for comparison
    const normalizedCode = code.trim().toLowerCase();
    const normalizedExpected = expectedValue.toString().toLowerCase();

    // More sophisticated validation would be implemented
    return normalizedCode.includes(normalizedExpected);
  };

  const validateFillInBlank = (userValues: Record<string, string>, expected: Record<string, string>): boolean => {
    return Object.keys(userValues).every(key =>
      userValues[key].trim().toLowerCase() === expected[key].toLowerCase()
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-green-700 bg-green-100',
      intermediate: 'text-yellow-700 bg-yellow-100',
      advanced: 'text-red-700 bg-red-100',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      classification: '📊',
      regression: '📈',
      clustering: '🎯',
      'neural-networks': '🧠',
      validation: '✅',
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const progressInExercise = () => {
    if (exercise.type === 'code-input' || exercise.type === 'fill-in-blank') {
      return codeInput.length > 0 ? 25 : 0;
    }
    if (exercise.type === 'multiple-choice') {
      return selectedAnswers.length > 0 ? 50 : 0;
    }
    return 0;
  };

  if (isCompleted) {
    return (
      <div className={`p-6 rounded-lg border-2 ${
        attempt.isCorrect
          ? 'border-green-500 bg-green-50'
          : 'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-center space-x-2 mb-4">
          {attempt.isCorrect ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <X className="w-6 h-6 text-red-600" />
          )}
          <span className={`font-bold text-lg ${
            attempt.isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {attempt.isCorrect ? 'Correct!' : 'Try Again'}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600">
            Time spent: {Math.round(attempt.timeSpent / 1000)}s
            {showHint && <span> • Hints used: {attempt.hintsUsed}</span>}
          </div>
          <div className="text-sm text-gray-600">
            Score: {attempt.score}/{attempt.maxScore}
          </div>
        </div>

        <button
          onClick={() => {
            setIsCompleted(false);
            setSelectedAnswers([]);
            setCodeInput('');
            setShowSolution(false);
            setShowHint(false);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-bold">{exercise.title}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
              {exercise.difficulty}
            </span>
            <span className="text-gray-600">{getCategoryIcon(exercise.category)}</span>
          </div>

          <p className="text-gray-700 mb-3">{exercise.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Points: {exercise.points}</span>
            {exercise.timeLimit && <span>Time: {exercise.timeLimit}min</span>}
          </div>
        </div>

        <div className="w-24 h-2 bg-gray-200 rounded">
          <div
            className="h-full bg-blue-600 rounded"
            style={{ width: `${progressInExercise()}%` }}
          />
        </div>
      </div>

      {/* Exercise Content */}
      <div className="space-y-4">
        {exercise.type === 'multiple-choice' && (
          <MultipleChoiceExercise
            exercise={exercise}
            selectedAnswers={selectedAnswers}
            onSelect={handleMultipleChoiceSelect}
          />
        )}

        {exercise.type === 'code-input' && (
          <CodeInputExercise
            exercise={exercise}
            code={codeInput}
            onCodeChange={setCodeInput}
            onSubmit={handleCodeSubmit}
          />
        )}

        {exercise.type === 'fill-in-blank' && (
          <FillInBlankExercise
            exercise={exercise}
            onSubmit={handleFillInBlankSubmit}
          />
        )}

        {exercise.steps && (
          <InteractiveExercise
            steps={exercise.steps}
            onComplete={(values) => submitAnswer(JSON.stringify(values), true)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showHint ? 'Hide Hint' : 'Get Hint'}</span>
            </button>
          )}

          {instructor && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Show Solution
            </button>
          )}
        </div>

        <button
          onClick={() => {
            if (exercise.type === 'multiple-choice' && selectedAnswers.length > 0) {
              const isCorrect = exercise.options?.find(o => o.value === selectedAnswers[0])?.isCorrect || false;
              submitAnswer(selectedAnswers[0], isCorrect);
            } else if (exercise.type === 'code-input') {
              handleCodeSubmit(codeInput);
            }
          }}
          disabled={
            (exercise.type === 'multiple-choice' && selectedAnswers.length === 0) ||
            (exercise.type === 'code-input' && codeInput.trim().length === 0)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span>Submit Answer</span>
        </button>
      </div>

      {/* Hint Display */}
      {showHint && exercise.hint && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{exercise.hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Solution Display */}
      {showSolution && exercise.expectedAnswer && (
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Expected Answer:</p>
              <p className="mt-2 text-sm text-green-700">
                {typeof exercise.expectedAnswer === 'string'
                  ? exercise.expectedAnswer
                  : JSON.stringify(exercise.expectedAnswer)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for different exercise types
const MultipleChoiceExercise: React.FC<{
  exercise: Exercise;
  selectedAnswers: string[];
  onSelect: (value: string) => void;
}> = ({ exercise, selectedAnswers, onSelect }) => {
  return (
    <div className="space-y-2">
      {exercise.options?.map((option, index) => (
        <label
          key={index}
          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedAnswers.includes(option.value)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300'
          }`}
        >
          <input
            type="radio"
            name={`exercise-${exercise.id}`}
            value={option.value}
            checked={selectedAnswers.includes(option.value)}
            onChange={() => onSelect(option.value)}
            className="mr-3"
          />
          <span className="text-gray-700">{option.text}</span>
        </label>
      ))}
    </div>
  );
};

const CodeInputExercise: React.FC<{
  exercise: Exercise;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (code: string) => void;
}> = ({ exercise, code, onCodeChange, onSubmit }) => {
  const [runOutput, setRunOutput] = useState('');

  const handleRunCode = () => {
    // Simulate code execution
    setRunOutput(`Running code...\nOutput: ${simulateCodeExecution(code)}`);
  };

  const simulateCodeExecution = (code: string): string => {
    // This would be replaced with actual code execution
    if (code.includes('len(')) return '5'; // Mock result
    if (code.includes('mean(')) return '42.5'; // Mock result
    if (code.includes('predict(')) return 'Class A: 0.85 probability'; // Mock result
    return 'Code executed successfully';
  };

  return (
    <div className="space-y-4">
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Enter your Python code here..."
        className="w-full h-32 p-3 border rounded-lg font-mono text-sm focus:border-blue-500"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleRunCode}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Run Code
        </button>
        <button
          onClick={() => onSubmit(code)}
          disabled={!code.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Submit Answer
        </button>
      </div>

      {runOutput && (
        <div className="p-3 bg-gray-50 border rounded-lg font-mono text-sm">
          <pre>{runOutput}</pre>
        </div>
      )}
    </div>
  );
};

const FillInBlankExercise: React.FC<{
  exercise: Exercise;
  onSubmit: (values: Record<string, string>) => void;
}> = ({ exercise, onSubmit }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Object.entries(exercise.expectedAnswer || {}).map(([key, expected]) => (
          <div key={key} className="flex items-center space-x-2">
            <input
              type="text"
              value={values[key] || ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              placeholder={`Enter ${key}`}
              className="flex-1 p-2 border rounded"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onSubmit(values)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </div>
  );
};

const InteractiveExercise: React.FC<{
  steps: ExerciseStep[];
  onComplete: (values: Record<string, string>) => void;
}> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepValues, setStepValues] = useState<Record<string, string>>({});

  const handleStepComplete = (stepId: string, value: string) => {
    const newValues = { ...stepValues, [stepId]: value };
    setStepValues(newValues);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < currentStep || stepValues[step.id]
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep || stepValues[step.id] ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">
          Step {currentStep + 1}: {steps[currentStep]?.title}
        </h4>
        <p className="text-gray-700 mb-3">{steps[currentStep]?.description}</p>
        <button
          onClick={() => handleStepComplete(steps[currentStep]?.id || '', 'completed')}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Complete Step</span>
        </button>
      </div>
    </div>
  );
};

// Exercise library
export const exerciseLibrary = {
  /**
   * Beginner exercises
   */
  'intro-ml-basics': {
    id: 'intro-ml-basics',
    title: 'Machine Learning Basics Quiz',
    description: 'Test your understanding of fundamental ML concepts',
    type: 'multiple-choice',
    difficulty: 'beginner',
    category: 'classification',
    points: 10,
    options: [
      { text: 'A system that improves performance through experience',
        value: 'correct', isCorrect: true },
      { text: 'A pre-programmed rule-based system', value: 'rules', isCorrect: false },
      { text: 'A database query system', value: 'database', isCorrect: false },
      { text: 'A statistical calculator', value: 'calculator', isCorrect: false },
    ],
  },

  'python-import-statements': {
    id: 'python-import-statements',
    title: 'Import ML Libraries',
    description: 'Write the correct import statements for essential ML libraries',
    type: 'code-input',
    difficulty: 'beginner',
    category: 'validation',
    points: 15,
    expectedAnswer: 'import numpy, sklearn, pandas',
  },

  'linear-regression-coefficient': {
    id: 'linear-regression-coefficient',
    title: 'Linear Regression Parameters',
    description: 'Fill in the missing values for a simple linear regression model',
    type: 'fill-in-blank',
    difficulty: 'beginner',
    category: 'regression',
    points: 20,
    expectedAnswer: {
      slope: '0.5',
      intercept: '2.0',
      r_squared: '0.85',
    },
  },

  /**
   * Intermediate exercises
   */
  'k-means-clustering': {
    id: 'k-means-clustering',
    title: 'K-Means Clustering Implementation',
    description: 'Implement the K-means clustering algorithm step by step',
    type: 'interactive',
    difficulty: 'intermediate',
    category: 'clustering',
    points: 30,
    steps: [
      {
        id: 'select-k',
        title: 'Select K value',
        description: 'Choose a suitable number of clusters (k=3)',
      },
      {
        id: 'init-centroids',
        title: 'Initialize centroids',
        description: 'Randomly select k initial centroids',
      },
      {
        id: 'assign-points',
        title: 'Assign points to clusters',
        description: 'Assign each data point to the nearest centroid',
      },
      {
        id: 'update-centroids',
        title: 'Update centroids',
        description: 'Calculate new centroids as the mean of assigned points',
      },
    ],
  },

  'neural-network-architecture': {
    id: 'neural-network-architecture',
    title: 'Neural Network Architecture',
    description: 'Design the architecture for a neural network to classify images',
    type: 'multiple-choice',
    difficulty: 'intermediate',
    category: 'neural-networks',
    points: 25,
    options: [
      { text: 'Input layer: 784 nodes, Hidden layer: 128 nodes, Output: 10 nodes',
        value: 'correct', isCorrect: true },
      { text: 'Input layer: 280 nodes, Hidden layer: 64 nodes, Output: 1 node',
        value: 'incorrect', isCorrect: false },
      { text: 'Input layer: 1000 nodes, Hidden layer: 500 nodes, Output: 100 nodes',
        value: 'incorrect', isCorrect: false },
    ],
  },

  /**
   * Advanced exercises
   */
  'model-validation': {
    id: 'model-validation',
    title: 'Model Validation Strategy',
    description: 'Choose the best validation strategy for evaluating a machine learning model',
    type: 'multiple-choice',
    difficulty: 'advanced',
    category: 'validation',
    points: 35,
    options: [
      { text: 'Test set validation only', value: 'test-only', isCorrect: false },
      { text: 'Cross-validation with stratified K-fold', value: 'stratified-cv', isCorrect: true },
      { text: 'Leave-one-out cross-validation', value: 'loocv', isCorrect: false },
      { text: 'Bootstrap validation', value: 'bootstrap', isCorrect: false },
    ],
  },
};

export default MLExercise;