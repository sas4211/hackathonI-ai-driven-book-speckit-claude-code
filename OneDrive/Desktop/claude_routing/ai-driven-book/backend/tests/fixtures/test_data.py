"""
Test data fixtures for RAG service testing

This module contains sample data for testing the RAG service,
including book content, queries, and expected responses.
"""

# Sample book content for testing
BOOK_CONTENTS = {
    "chapter_1": {
        "title": "Introduction to Machine Learning",
        "content": """
        Machine learning is a subset of artificial intelligence that focuses on algorithms
        that can learn from data without being explicitly programmed. These algorithms
        build models based on sample data, known as training data, to make predictions
        or decisions without being explicitly programmed to do so.

        There are three main types of machine learning: supervised learning, unsupervised
        learning, and reinforcement learning. Supervised learning uses labeled training
        data, unsupervised learning finds patterns in unlabeled data, and reinforcement
        learning uses rewards and penalties to train agents.

        Key concepts in machine learning include features, labels, training, testing,
        and evaluation. Features are the input variables, labels are the output variables
        in supervised learning, training is the process of building the model, testing
        evaluates the model's performance, and evaluation measures how well the model
        generalizes to new data.
        """,
        "metadata": {
            "chapter": "1",
            "section": "1.1",
            "title": "Introduction to Machine Learning",
            "tags": ["ml", "introduction", "basics"]
        }
    },

    "chapter_2": {
        "title": "Supervised Learning",
        "content": """
        Supervised learning is a type of machine learning where the model is trained
        on labeled data. The training dataset consists of input-output pairs, where
        the input is the feature vector and the output is the corresponding label.

        Common supervised learning algorithms include linear regression, logistic
        regression, support vector machines, decision trees, random forests, and
        neural networks. These algorithms can be used for both regression tasks
        (predicting continuous values) and classification tasks (predicting discrete labels).

        The process of supervised learning involves splitting the data into training
        and testing sets, training the model on the training set, and evaluating its
        performance on the testing set. Common evaluation metrics include accuracy,
        precision, recall, F1-score, and mean squared error.
        """,
        "metadata": {
            "chapter": "2",
            "section": "2.1",
            "title": "Supervised Learning",
            "tags": ["supervised", "classification", "regression"]
        }
    },

    "chapter_3": {
        "title": "Linear Regression",
        "content": """
        Linear regression is a fundamental supervised learning algorithm used for
        predicting continuous numerical values. It assumes a linear relationship
        between the input features and the output variable.

        The mathematical formulation of linear regression is: y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
        where y is the predicted output, β₀ is the intercept, β₁...βₙ are the coefficients
        for each feature, x₁...xₙ are the input features, and ε is the error term.

        Linear regression can be solved using various methods including ordinary least
        squares, gradient descent, and normal equation. It's important to check
        assumptions like linearity, independence, homoscedasticity, and normality
        of residuals for valid inference.
        """,
        "metadata": {
            "chapter": "3",
            "section": "3.1",
            "title": "Linear Regression",
            "tags": ["regression", "linear", "statistics"]
        }
    },

    "chapter_4": {
        "title": "Gradient Descent",
        "content": """
        Gradient descent is an optimization algorithm used to minimize the cost function
        in machine learning models. It works by iteratively moving in the direction of
        steepest descent as defined by the negative of the gradient.

        There are three main variants of gradient descent: batch gradient descent,
        stochastic gradient descent, and mini-batch gradient descent. Batch gradient
        descent uses the entire training dataset to compute the gradient, stochastic
        gradient descent uses one training example at a time, and mini-batch gradient
        descent uses a small batch of training examples.

        Key parameters in gradient descent include the learning rate, which controls
        the step size, and the number of iterations. Choosing the right learning rate
        is crucial - too high may cause divergence, too low may result in slow convergence.
        """,
        "metadata": {
            "chapter": "4",
            "section": "4.1",
            "title": "Gradient Descent",
            "tags": ["optimization", "gradient", "descent"]
        }
    },

    "chapter_5": {
        "title": "Neural Networks",
        "content": """
        Neural networks are a class of machine learning models inspired by the human brain.
        They consist of layers of interconnected nodes, or neurons, that process information
        through weighted connections.

        A basic neural network consists of an input layer, one or more hidden layers,
        and an output layer. Each neuron applies an activation function to the weighted
        sum of its inputs. Common activation functions include sigmoid, tanh, ReLU, and softmax.

        Training neural networks involves backpropagation, which computes gradients of
        the loss function with respect to each weight, and gradient descent to update
        the weights. Deep learning refers to neural networks with many hidden layers.
        """,
        "metadata": {
            "chapter": "5",
            "section": "5.1",
            "title": "Neural Networks",
            "tags": ["neural", "networks", "deep", "learning"]
        }
    }
}

# Sample queries and expected responses for testing
TEST_QUERIES = [
    {
        "query": "What is machine learning?",
        "expected_keywords": ["subset", "artificial intelligence", "algorithms", "learn", "data"],
        "difficulty": "easy"
    },
    {
        "query": "Explain supervised learning",
        "expected_keywords": ["labeled", "training", "data", "input", "output", "pairs"],
        "difficulty": "medium"
    },
    {
        "query": "How does linear regression work?",
        "expected_keywords": ["linear", "relationship", "features", "output", "β", "coefficients"],
        "difficulty": "medium"
    },
    {
        "query": "What is gradient descent?",
        "expected_keywords": ["optimization", "algorithm", "cost", "function", "gradient", "descent"],
        "difficulty": "medium"
    },
    {
        "query": "Explain neural networks",
        "expected_keywords": ["layers", "neurons", "interconnected", "activation", "function"],
        "difficulty": "hard"
    },
    {
        "query": "What are the types of machine learning?",
        "expected_keywords": ["supervised", "unsupervised", "reinforcement", "learning"],
        "difficulty": "easy"
    },
    {
        "query": "How do you evaluate a machine learning model?",
        "expected_keywords": ["accuracy", "precision", "recall", "f1", "score", "mse"],
        "difficulty": "medium"
    },
    {
        "query": "What is the difference between regression and classification?",
        "expected_keywords": ["continuous", "discrete", "numerical", "labels", "predict"],
        "difficulty": "medium"
    }
]

# Sample code examples for testing
CODE_EXAMPLES = [
    {
        "title": "Linear Regression Implementation",
        "code": """
def linear_regression(X, y):
    # Add bias term
    X_with_bias = np.column_stack([np.ones(X.shape[0]), X])

    # Normal equation: theta = (X^T * X)^(-1) * X^T * y
    theta = np.linalg.inv(X_with_bias.T @ X_with_bias) @ X_with_bias.T @ y

    return theta
        """,
        "explanation_query": "How does this linear regression implementation work?",
        "expected_explanation_keywords": ["normal", "equation", "theta", "bias", "matrix"]
    },
    {
        "title": "Gradient Descent Implementation",
        "code": """
def gradient_descent(X, y, learning_rate=0.01, iterations=1000):
    m, n = X.shape
    theta = np.zeros(n)
    cost_history = []

    for i in range(iterations):
        predictions = X @ theta
        errors = predictions - y
        gradient = (2/m) * X.T @ errors
        theta = theta - learning_rate * gradient

        cost = np.mean(errors**2)
        cost_history.append(cost)

    return theta, cost_history
        """,
        "explanation_query": "Explain this gradient descent implementation",
        "expected_explanation_keywords": ["gradient", "descent", "learning", "rate", "cost", "function"]
    },
    {
        "title": "Simple Neural Network",
        "code": """
class SimpleNeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.W1 = np.random.randn(input_size, hidden_size)
        self.b1 = np.zeros(hidden_size)
        self.W2 = np.random.randn(hidden_size, output_size)
        self.b2 = np.zeros(output_size)

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def forward(self, X):
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2

    def backward(self, X, y, output):
        m = X.shape[0]
        dz2 = output - y
        dW2 = (1/m) * self.a1.T @ dz2
        db2 = (1/m) * np.sum(dz2, axis=0)

        da1 = dz2 @ self.W2.T
        dz1 = da1 * self.a1 * (1 - self.a1)
        dW1 = (1/m) * X.T @ dz1
        db1 = (1/m) * np.sum(dz1, axis=0)

        return dW1, db1, dW2, db2
        """,
        "explanation_query": "How does this neural network work?",
        "expected_explanation_keywords": ["forward", "backward", "propagation", "sigmoid", "weights", "layers"]
    }
]

# Sample recommendations for testing
RECOMMENDATION_DATA = {
    "positive_topics": ["machine learning", "supervised learning", "neural networks"],
    "queries": [
        "I want to learn more about deep learning",
        "What are the best resources for understanding neural networks?",
        "How can I improve my machine learning skills?"
    ],
    "expected_recommendations": [
        "Chapter 5: Neural Networks",
        "Chapter 3: Linear Regression",
        "Chapter 4: Gradient Descent"
    ]
}

# Test scenarios for accuracy validation
ACCURACY_TEST_SCENARIOS = [
    {
        "name": "exact_content_match",
        "query": "What is machine learning?",
        "relevant_chapters": ["1"],
        "expected_confidence_threshold": 0.8,
        "expected_keywords": ["subset", "artificial intelligence", "algorithms"]
    },
    {
        "name": "partial_content_match",
        "query": "How do you implement gradient descent in Python?",
        "relevant_chapters": ["4"],
        "expected_confidence_threshold": 0.6,
        "expected_keywords": ["gradient", "descent", "implementation", "python"]
    },
    {
        "name": "code_explanation",
        "query": "What does this code do?",
        "code_content": CODE_EXAMPLES[0]["code"],
        "relevant_chapters": ["3"],
        "expected_confidence_threshold": 0.7,
        "expected_keywords": ["linear", "regression", "implementation", "normal equation"]
    },
    {
        "name": "no_relevant_content",
        "query": "What is quantum machine learning?",
        "relevant_chapters": [],
        "expected_confidence_threshold": 0.3,
        "expected_keywords": ["don't", "information", "content"]
    },
    {
        "name": "multi_chapter_query",
        "query": "Explain the complete machine learning pipeline from data to deployment",
        "relevant_chapters": ["1", "2", "3", "4", "5"],
        "expected_confidence_threshold": 0.5,
        "expected_keywords": ["pipeline", "data", "training", "evaluation", "deployment"]
    }
]

# Performance test data
PERFORMANCE_TEST_DATA = {
    "concurrent_users": 10,
    "requests_per_user": 5,
    "test_duration": 30,
    "queries": [
        "What is machine learning?",
        "Explain supervised learning",
        "How does linear regression work?",
        "What is gradient descent?",
        "Explain neural networks"
    ] * 10,  # Repeat for concurrent users
    "expected_response_time": 2.0,  # seconds
    "expected_success_rate": 0.95  # 95%
}