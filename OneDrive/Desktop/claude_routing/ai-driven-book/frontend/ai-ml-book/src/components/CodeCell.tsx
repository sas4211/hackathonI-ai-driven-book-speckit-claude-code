import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Clock, Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface CodeCellProps {
  id: string;
  initialCode?: string;
  language?: string;
  title?: string;
  height?: string;
  runButton?: boolean;
  resetButton?: boolean;
  onChange?: (code: string) => void;
  onRun?: (code: string, output: any) => void;
}

interface Output {
  type: 'text' | 'image' | 'error' | 'html';
  content: string;
  timestamp: number;
}

const CodeCell: React.FC<CodeCellProps> = ({
  id,
  initialCode = '',
  language = 'python',
  title = 'Interactive Code Cell',
  height = '300px',
  runButton = true,
  resetButton = true,
  onChange,
  onRun,
}) => {
  interface CodeExecutorProps {
    code: string;
    onOutput: (output: Output) => void;
  }

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<Output[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const { addCodeSnippet, getCodeOutput, saveExecution } = useBookStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Load saved code from book store
  useEffect(() => {
    const savedCode = addCodeSnippet(id, code);
    setCode(savedCode || initialCode);
  }, [id]);

  const executeCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    const startTime = Date.now();

    try {
      // Simulate code execution for demonstration
      // In real implementation, this would connect to Python runtime via WebAssembly or backend
      const mockResults = simulateCodeExecution(code);

      const newOutput: Output[] = [
        {
          type: 'text',
          content: `\nRunning code...\n${mockResults}`,
          timestamp: Date.now()
        }
      ];

      if (code.includes('plt.') || code.includes('matplotlib')) {
        newOutput.push({
          type: 'image',
          content: generateMockPlot(),
          timestamp: Date.now()
        });
      }

      setOutput(prev => [...prev, ...newOutput].slice(-10)); // Keep last 10 outputs

      const execTime = Date.now() - startTime;
      setExecutionTime(execTime);

      saveExecution(id, { code, output: newOutput, executionTime: execTime });
      onRun?.(code, newOutput);

    } catch (error) {
      const errorOutput: Output = {
        type: 'error',
        content: `Error:\n${error}`,
        timestamp: Date.now()
      };
      setOutput(prev => [...prev, errorOutput].slice(-10));
    }

    setIsRunning(false);
  };

  const simulateCodeExecution = (code: string): string => {
    // Simulate Python code execution
    const results = [`Python 3.9.0\n>>>`];

    // Simple pattern matching for mock results
    if (code.includes('import')) results.push("Libraries imported successfully");
    if (code.includes('sum(')) results.push("Sum calculated");
    if (code.includes('len(')) results.push("Length determined");
    if (code.includes('mean(')) results.push("Mean calculated");
    if (code.includes('std(')) results.push("Standard deviation calculated");
    if (code.includes('predict(')) results.push("Prediction made");
    if (code.includes('fit(')) results.push("Model trained");

    // For ML-specific code
    if (code.includes('LinearRegression')) results.push("Linear regression model created");
    if (code.includes('DecisionTree')) results.push("Decision tree model created");
    if (code.includes('RandomForest')) results.push("Random forest model created");
    if (code.includes('accuracy_score')) results.push("Accuracy: 0.85");
    if (code.includes('confusion_matrix')) results.push("Confusion matrix displayed");

    return results.join('\n');
  };

  const generateMockPlot = (): string => {
    // Generate a simple SVG plot for demonstration
    return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:rgb(16,185,129);stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="white" stroke="#e5e7eb" stroke-width="1"/>
      <circle cx="80" cy="240" r="3" fill="#3b82f6"/>
      <circle cx="120" cy="180" r="3" fill="#3b82f6"/>
      <circle cx="160" cy="200" r="3" fill="#3b82f6"/>
      <circle cx="200" cy="150" r="3" fill="#3b82f6"/>
      <circle cx="240" cy="100" r="3" fill="#3b82f6"/>
      <circle cx="280" cy="120" r="3" fill="#3b82f6"/>
      <circle cx="320" cy="80" r="3" fill="#3b82f6"/>
      <path d="M 80 240 L 320 80" stroke="#6b7280" stroke-width="2" fill="none"/>
      <text x="200" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#374151">ML Plot</text>
    </svg>`;
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml-book-${id}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput([]);
    setExecutionTime(0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    addCodeSnippet(id, newCode);
    onChange?.(newCode);
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm my-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium text-sm text-gray-700">{title}</span>
          </div>
          <span className="text-xs text-gray-500 capitalize">{language}</span>
        </div>

        <div className="flex items-center space-x-2">
          {executionTime > 0 && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {executionTime}ms
            </span>
          )}

          <div className="flex items-center space-x-1">
            <button
              onClick={copyCode}
              className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-600"
              title="Copy code"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={downloadCode}
              className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-600"
              title="Download code"
            >
              <Download className="w-4 h-4" />
            </button>

            {resetButton && (
              <button
                onClick={resetCode}
                disabled={code === initialCode}
                className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
                title="Reset code"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col">
          {/* Code Editor */}
          <div className="flex border-b border-gray-200">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              style={{ height }}
              className="w-full p-4 font-mono text-sm bg-gray-50 text-gray-800 resize-none focus:outline-none"
              placeholder={`Enter ${language} code here...`}
            />
          </div>

          {/* Output Panel */}
          {output.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Output</h4>
              </div>
              <div
                ref={outputRef}
                className="p-4 bg-gray-50 max-h-96 overflow-y-auto font-mono text-sm"
              >
                {output.map((item, index) => (
                  <div key={index} className="mb-2">
                    {item.type === 'text' && (
                      <pre className="text-green-600 whitespace-pre-wrap">
                        {item.content}
                      </pre>
                    )}
                    {item.type === 'error' && (
                      <pre className="text-red-600 whitespace-pre-wrap">
                        {item.content}
                      </pre>
                    )}
                    {item.type === 'image' && (
                      <div
                        className="border border-gray-300 rounded p-2 bg-white"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    )}
                    {item.type === 'html' && (
                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          {(runButton || resetButton) && (
            <div className="flex justify-between items-center p-3 bg-gray-50">
              <div className="text-xs text-gray-500">
                Code saved automatically
              </div>
              <div className="flex space-x-2">
                {runButton && (
                  <button
                    onClick={executeCode}
                    disabled={isRunning || !code.trim()}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isRunning ? 'Running...' : 'Run'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeCell;