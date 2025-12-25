---
sidebar_position: 10
---

# Code Highlighting for ML Examples

This guide demonstrates the enhanced code highlighting capabilities available for Machine Learning examples in this book.

## Supported Languages

The code highlighting system supports all major languages used in ML development:

### Core ML Languages
- **Python** - Primary language for ML examples
- **Jupyter Notebooks** - Interactive ML development
- **JSON** - Configuration and data files
- **YAML** - ML pipeline configurations

### Supporting Languages
- **Bash** - Command-line operations
- **JavaScript/TypeScript** - Web-based ML applications
- **HTML/CSS** - Documentation and interfaces
- **LaTeX** - Mathematical equations

## Python Examples with Enhanced Highlighting

### Basic Python Syntax

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Load and prepare data
data = pd.read_csv('housing_data.csv')
X = data[['size', 'bedrooms', 'bathrooms']]
y = data['price']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate
mse = mean_squared_error(y_test, predictions)
print(f"Mean Squared Error: {mse}")
```

### Highlighting Specific Lines

You can highlight important lines in your code:

```python
import tensorflow as tf
from tensorflow import keras

# Create a simple neural network
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    keras.layers.Dropout(0.2),  # highlight-next-line
    keras.layers.Dense(10, activation='softmax')  # This is the output layer
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# highlight-start
# Train the model
model.fit(X_train, y_train, epochs=5, validation_split=0.2)
# highlight-end

# attention-start
# Important: Always evaluate on test data!
test_loss, test_accuracy = model.evaluate(X_test, y_test)
# attention-end
```

### Mathematical Operations

```python
import numpy as np

# Vectorized operations
def sigmoid(x):
    """Sigmoid activation function"""
    return 1 / (1 + np.exp(-x))  # highlight-next-line

def relu(x):
    """ReLU activation function"""
    return np.maximum(0, x)

# Matrix operations
def softmax(x):
    """Softmax activation for multi-class classification"""
    exp_x = np.exp(x - np.max(x))  # Numerical stability
    return exp_x / np.sum(exp_x)  # Normalize to get probabilities

# attention-start
# Gradient descent implementation
def gradient_descent(X, y, learning_rate=0.01, epochs=1000):
    """Simple gradient descent for linear regression"""
    m, n = X.shape
    weights = np.random.randn(n)
    bias = 0

    for epoch in range(epochs):
        # Forward pass
        y_pred = X.dot(weights) + bias

        # Calculate gradients
        dw = (2/m) * X.T.dot(y_pred - y)  # Weight gradients
        db = (2/m) * np.sum(y_pred - y)   # Bias gradient

        # Update parameters
        weights -= learning_rate * dw     # Update weights
        bias -= learning_rate * db        # Update bias
    # attention-end

    return weights, bias
```

## Jupyter Notebook Examples

### Interactive ML Code

```python
# Jupyter notebook example with rich output
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier

# Generate synthetic data
X, y = make_classification(n_samples=1000, n_features=4, n_redundant=0,
                          n_informative=2, random_state=42, n_clusters_per_class=1)

# Create visualizations
plt.figure(figsize=(12, 5))

# Plot 1: Feature relationships
plt.subplot(1, 2, 1)
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='viridis', alpha=0.6)
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.title('Feature Relationship')

# Plot 2: Feature distributions
plt.subplot(1, 2, 2)
sns.boxplot(data=pd.DataFrame(X, columns=[f'Feature_{i}' for i in range(X.shape[1])]))
plt.title('Feature Distributions')
plt.xticks(rotation=45)

plt.tight_layout()
plt.show()

# Train and evaluate model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)
accuracy = model.score(X, y)
print(f"Model Accuracy: {accuracy:.3f}")
```

## Configuration Files

### YAML Configuration for ML Pipelines

```yaml
# ML Pipeline Configuration
pipeline:
  name: "image_classification_pipeline"
  version: "1.0.0"

data:
  source: "s3://my-bucket/datasets/images/"
  preprocessing:
    resize: [224, 224]
    normalization: "imagenet"
    augmentation:
      rotation_range: 20
      width_shift_range: 0.2
      height_shift_range: 0.2
      horizontal_flip: true

model:
  architecture: "resnet50"
  pretrained: true
  num_classes: 10
  optimizer: "adam"
  learning_rate: 0.001
  batch_size: 32
  epochs: 50

evaluation:
  metrics: ["accuracy", "precision", "recall", "f1_score"]
  validation_split: 0.2
  cross_validation: true
  cv_folds: 5
```

### JSON Configuration

```json
{
  "experiment": {
    "name": "hyperparameter_tuning",
    "description": "Tuning hyperparameters for random forest",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "parameters": {
    "n_estimators": [50, 100, 200],
    "max_depth": [3, 5, 7, null],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf": [1, 2, 4]
  },
  "data": {
    "train_size": 0.8,
    "validation_size": 0.1,
    "test_size": 0.1
  },
  "metrics": {
    "primary": "accuracy",
    "secondary": ["precision", "recall", "f1_score"]
  }
}
```

## Command Line Operations

### ML Environment Setup

```bash
# Create conda environment for ML
conda create -n ml-env python=3.9
conda activate ml-env

# Install core ML libraries
pip install numpy pandas scikit-learn
pip install tensorflow torch torchvision  # highlight-next-line
pip install jupyter matplotlib seaborn

# Install optional libraries
pip install opencv-python transformers
pip install streamlit gradio  # For ML app deployment

# Start Jupyter notebook
jupyter notebook  # highlight-next-line

# Or start JupyterLab
jupyter lab
```

### Model Training Commands

```bash
# Train a model
python train_model.py --data data/train.csv --epochs 100 --batch_size 32

# Evaluate model
python evaluate_model.py --model models/trained_model.pkl --test_data data/test.csv

# Make predictions
python predict.py --model models/trained_model.pkl --input data/new_samples.csv

# attention-start
# Hyperparameter tuning with GridSearch
python tune_hyperparameters.py --param_grid params.json --cv_folds 5
# attention-end
```

## Mathematical Equations (LaTeX)

### Linear Algebra

```latex
% Linear Regression Formula
$$\hat{y} = X\beta + \epsilon$$

% Where:
% - $\hat{y}$ is the predicted output
% - $X$ is the feature matrix
% - $\beta$ is the coefficient vector
% - $\epsilon$ is the error term

% Gradient Descent Update Rule
$$\theta_{j} := \theta_{j} - \alpha \frac{\partial}{\partial \theta_{j}} J(\theta)$$

% Cost Function (Mean Squared Error)
$$J(\theta) = \frac{1}{2m} \sum_{i=1}^{m} (h_{\theta}(x^{(i)}) - y^{(i)})^2$$
```

### Probability and Statistics

```latex
% Bayes' Theorem
$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

% Gaussian Distribution
$$f(x|\mu,\sigma^2) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

% Entropy
$$H(X) = -\sum_{i} P(x_i) \log P(x_i)$$

% Cross-Entropy Loss
$$H(p,q) = -\sum_{x} p(x) \log q(x)$$
```

### Neural Networks

```latex
% Sigmoid Activation
$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

% ReLU Activation
$$\text{ReLU}(x) = \max(0, x)$$

% Softmax Activation
$$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_{j} e^{x_j}}$$

% Backpropagation (Chain Rule)
$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w}$$
```

## Best Practices for ML Code

### 1. Import Organization

```python
# Standard library imports
import os
import sys
from typing import List, Dict, Tuple

# Third-party imports
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# ML-specific imports
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# Local imports
from utils import data_loader, feature_engineering
```

### 2. Code Comments and Documentation

```python
def prepare_features(data: pd.DataFrame,
                    target_col: str,
                    feature_cols: List[str]) -> Tuple[np.ndarray, np.ndarray]:
    """
    Prepare features and target for ML model training.

    Args:
        data: Input DataFrame with raw data
        target_col: Name of the target column
        feature_cols: List of feature column names

    Returns:
        X: Feature matrix
        y: Target vector

    highlight-start
    Note: This function handles missing values and feature scaling
    highlight-end
    """
    # Handle missing values
    data = data.dropna()  # Remove rows with missing values

    # attention-start
    # Feature scaling is crucial for many ML algorithms
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    # attention-end

    X = scaler.fit_transform(data[feature_cols])
    y = data[target_col].values

    return X, y
```

### 3. Error Handling

```python
def load_model(model_path: str) -> Any:
    """
    Load a trained model from file.

    highlight-next-line
    Args:
        model_path: Path to the saved model file

    Returns:
        Loaded model object

    Raises:
        FileNotFoundError: If model file doesn't exist
        ValueError: If model format is unsupported
    """
    try:
        # Check if file exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        # Load model based on file extension
        _, ext = os.path.splitext(model_path)

        if ext == '.pkl':
            import pickle
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
        elif ext == '.joblib':
            from sklearn.externals import joblib
            model = joblib.load(model_path)
        else:
            raise ValueError(f"Unsupported model format: {ext}")

        return model

    except Exception as e:
        # attention-start
        # Log the error and provide helpful message
        print(f"Error loading model: {e}")
        raise
        # attention-end
```

### 4. Performance Optimization

```python
import time
import psutil
from functools import wraps

def timing_decorator(func):
    """Decorator to measure function execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()

        # highlight-next-line
        print(f"{func.__name__} executed in {end_time - start_time:.2f} seconds")
        return result
    return wrapper

@timing_decorator
def train_large_model(X: np.ndarray, y: np.ndarray) -> Any:
    """
    Train a model on large dataset with performance monitoring.
    """
    # Monitor memory usage
    process = psutil.Process()
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB

    # Train model
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier(n_estimators=1000, n_jobs=-1)
    model.fit(X, y)

    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_used = final_memory - initial_memory

    # attention-start
    print(f"Memory used: {memory_used:.2f} MB")
    # attention-end

    return model
```

## Interactive Code Features

### Code Block Actions

All code blocks in this book support:

- **Copy to Clipboard**: Click the copy button in the top-right corner
- **Run in Browser**: Some Python examples can be executed directly
- **Line Highlighting**: Use `highlight-next-line` or `highlight-start/end`
- **Attention Points**: Use `attention-start/end` for important notes

### Magic Commands (Jupyter)

```python
# Cell magic commands for Jupyter notebooks
%matplotlib inline          # Display plots in notebook
%time                       # Time a single statement
%%time                      # Time entire cell
%load_ext autoreload        # Auto-reload modules
%autoreload 2               # Reload all modules

# Line magic commands
%pip install package_name   # Install packages
%ls                         # List files
%pwd                        # Show current directory
```

### Debugging Tips

```python
# Enable interactive debugging
import pdb

def buggy_function(x):
    result = x / 0  # This will cause an error
    return result

# Set breakpoint
pdb.set_trace()
buggy_function(5)

# Useful debugging commands:
# n - next line
# s - step into function
# c - continue execution
# p variable_name - print variable value
```

## Getting Help

If you encounter issues with code highlighting or need help with ML examples:

1. **Check the AI Assistant**: Use the chat feature for contextual help
2. **Copy Code**: Use the copy button to get clean code without formatting
3. **Run Examples**: Try the interactive examples to see expected output
4. **Report Issues**: Use the GitHub repository for bug reports

---

**Next Steps**: Explore the [Mathematical Foundations](./chapter-1/principles) chapter to see how these code examples apply to real ML concepts!