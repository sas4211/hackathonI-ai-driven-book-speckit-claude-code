import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Info } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  color?: string;
  label?: string;
  cluster?: number;
}

interface VisualizationConfig {
  type: 'scatter' | 'line' | 'bar' | 'histogram' | 'heatmap' | 'pie' | 'boxplot';
  data: number[] | DataPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  colors?: string[];
  width?: number;
  height?: number;
  interactive?: boolean;
}

interface MLVisualizerProps {
  config: VisualizationConfig;
  onInteraction?: (data: any) => void;
}

const MLVisualizer: React.FC<MLVisualizerProps> = ({
  config,
  onInteraction,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    type,
    data,
    title,
    xLabel,
    yLabel,
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    width = 600,
    height = 400,
    interactive = true,
  } = config;

  useEffect(() => {
    if (canvasRef.current && (type === 'scatter' || type === 'line')) {
      drawCanvasVisualization();
    }
    if (svgRef.current && (type === 'bar' || type === 'pie' || type === 'histogram')) {
      drawSvgVisualization();
    }
  }, [config, selectedPoints]);

  const drawCanvasVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Set up margins
    const margin = { top: 60, right: 20, bottom: 60, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    if (type === 'scatter') {
      drawScatterPlot(ctx, margin, plotWidth, plotHeight);
    } else if (type === 'line') {
      drawLineChart(ctx, margin, plotWidth, plotHeight);
    }

    // Draw axes
    drawAxes(ctx, margin, plotWidth, plotHeight, data as DataPoint[]);
  };

  const drawScatterPlot = (ctx: any, margin: any, plotWidth: number, plotHeight: number) => {
    const points = data as DataPoint[];

    if (points.length === 0) return;

    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));

    points.forEach((point, index) => {
      const x = margin.left + ((point.x - xMin) / (xMax - xMin)) * plotWidth;
      const y = margin.top + plotHeight - ((point.y - yMin) / (yMax - yMin)) * plotHeight;

      const isSelected = selectedPoints.includes(index);
      const isHovered = hoveredPoint === point;

      ctx.beginPath();
      ctx.arc(x, y, isSelected || isHovered ? 8 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = point.color || colors[point.cluster || 0] || colors[0];
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isHovered && point.label) {
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.fillText(point.label, x + 10, y - 10);
      }
    });
  };

  const drawLineChart = (ctx: any, margin: any, plotWidth: number, plotHeight: number) => {
    const points = data as DataPoint[];

    if (points.length === 0) return;

    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));

    ctx.beginPath();
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;

    points.forEach((point, index) => {
      const x = margin.left + ((point.x - xMin) / (xMax - xMin)) * plotWidth;
      const y = margin.top + plotHeight - ((point.y - yMin) / (yMax - yMin)) * plotHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      const x = margin.left + ((point.x - xMin) / (xMax - xMin)) * plotWidth;
      const y = margin.top + plotHeight - ((point.y - yMin) / (yMax - yMin)) * plotHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = colors[0];
      ctx.fill();
    });
  };

  const drawAxes = (ctx: any, margin: any, plotWidth: number, plotHeight: number, points: DataPoint[]) => {
    // X and Y axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;

    // Y axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotHeight);
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';

    if (xLabel) {
      ctx.fillText(xLabel, margin.left + plotWidth / 2, height - 20);
    }

    if (yLabel) {
      ctx.save();
      ctx.translate(20, margin.top + plotHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
  };

  const drawSvgVisualization = () => {
    // This would render SVG-based visualizations for bar charts, pie charts, etc.
    // Implementation would vary based on visualization type
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const points = data as DataPoint[];
    points.forEach((point, index) => {
      const px = 50 + ((point.x - Math.min(...points.map(p => p.x))) / (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)))) * (width - 120);
      const py = 50 + (1 - (point.y - Math.min(...points.map(p => p.y))) / (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)))) * (height - 120);

      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (distance < 10) {
        onInteraction?.({ point, index });
        setSelectedPoints(prev =>
          prev.includes(index)
            ? prev.filter(p => p !== index)
            : [...prev, index]
        );
      }
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const points = data as DataPoint[];
    let found = false;

    points.forEach((point, index) => {
      const px = 50 + ((point.x - Math.min(...points.map(p => p.x))) / (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)))) * (width - 120);
      const py = 50 + (1 - (point.y - Math.min(...points.map(p => p.y))) / (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)))) * (height - 120);

      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (distance < 10) {
        setHoveredPoint(point);
        canvas.style.cursor = 'pointer';
        found = true;
      }
    });

    if (!found) {
      setHoveredPoint(null);
      canvas.style.cursor = 'default';
    }
  };

  const downloadVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml-visualization-${type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderVisualization = () => {
    switch (type) {
      case 'scatter':
      case 'line':
        return (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="border border-gray-300 rounded"
          />
        );
      case 'bar':
      case 'pie':
      case 'histogram':
        return <div ref={svgRef as any}>SVG visualization for {type}</div>;
      default:
        return <div>Visualization type not supported</div>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm my-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadVisualization}
            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
            title="Download visualization"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
            title="Interaction help"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {renderVisualization()}
        {interactive && (
          <div className="mt-2 text-sm text-gray-600">
            {selectedPoints.length > 0 && (
              <div>
                Selected points: {selectedPoints.length}
              </div>
            )}
            {hoveredPoint && (
              <div>
                Hover: ({hoveredPoint.x}, {hoveredPoint.y})
                {hoveredPoint.label && ` - ${hoveredPoint.label}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage components
export const MLExamples = {
  IrisDataset: () => {
    const data: DataPoint[] = [
      { x: 5.1, y: 3.5, color: '#ef4444', cluster: 0, label: 'setosa' },
      { x: 4.9, y: 3.0, color: '#ef4444', cluster: 0, label: 'setosa' },
      { x: 6.7, y: 3.1, color: '#10b981', cluster: 1, label: 'versicolor' },
      { x: 6.3, y: 2.5, color: '#10b981', cluster: 1, label: 'versicolor' },
      { x: 7.1, y: 3.0, color: '#f59e0b', cluster: 2, label: 'virginica' },
      { x: 6.7, y: 3.0, color: '#f59e0b', cluster: 2, label: 'virginica' },
    ];

    return (
      <MLVisualizer
        config={{
          type: 'scatter',
          data,
          title: 'Iris Dataset - Petal Length vs Width',
          xLabel: 'Petal Length (cm)',
          yLabel: 'Petal Width (cm)',
          interactive: true,
          colors: ['#ef4444', '#10b981', '#f59e0b']
        }}
      />
    );
  },

  LinearRegression: () => {
    const data: DataPoint[] = [
      { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 },
      { x: 4, y: 4 }, { x: 5, y: 6 }, { x: 6, y: 8 }
    ];

    return (
      <MLVisualizer
        config={{
          type: 'scatter',
          data,
          title: 'Linear Regression - Sample Data',
          xLabel: 'X',
          yLabel: 'Y',
          interactive: true
        }}
      />
    );
  }
};

export default MLVisualizer;