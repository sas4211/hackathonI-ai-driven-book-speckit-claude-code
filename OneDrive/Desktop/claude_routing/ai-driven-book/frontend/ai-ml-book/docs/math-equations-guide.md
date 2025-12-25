---
sidebar_position: 11
---

# Mathematical Equations with KaTeX

This guide demonstrates how to use KaTeX for rendering mathematical equations in the AI & ML Interactive Book. KaTeX provides fast, beautiful, and consistent math typesetting.

## Linear Algebra

### Vectors and Matrices

Inline math: The vector $\mathbf{v} = [1, 2, 3]$ has three components.

Block equations:

$$\mathbf{A} = \begin{bmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{bmatrix}$$

### Matrix Operations

**Matrix Multiplication:**

$$\mathbf{C} = \mathbf{A} \times \mathbf{B}$$

where $c_{ij} = \sum_{k=1}^{n} a_{ik} \cdot b_{kj}$

**Transpose:**

$$\mathbf{A}^T = \begin{bmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{bmatrix} \quad \text{where} \quad \mathbf{A} = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}$$

**Determinant:**

$$\det(\mathbf{A}) = |\mathbf{A}| = \begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$$

**Inverse Matrix:**

$$\mathbf{A}^{-1} = \frac{1}{\det(\mathbf{A})} \text{adj}(\mathbf{A})$$

### Eigenvalues and Eigenvectors

$$\mathbf{A}\mathbf{v} = \lambda\mathbf{v}$$

where $\lambda$ is an eigenvalue and $\mathbf{v}$ is the corresponding eigenvector.

**Characteristic Equation:**

$$\det(\mathbf{A} - \lambda\mathbf{I}) = 0$$

### Dot Product and Norms

**Dot Product:**

$$\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i = \|\mathbf{a}\| \|\mathbf{b}\| \cos \theta$$

**L2 Norm:**

$$\|\mathbf{x}\|_2 = \sqrt{\sum_{i=1}^{n} x_i^2}$$

**L1 Norm:**

$$\|\mathbf{x}\|_1 = \sum_{i=1}^{n} |x_i|$$

## Calculus

### Derivatives

**Basic Derivative:**

$$f'(x) = \frac{df}{dx} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

**Partial Derivatives:**

$$\frac{\partial f}{\partial x_i} = \lim_{h \to 0} \frac{f(x_1, \dots, x_i + h, \dots, x_n) - f(x_1, \dots, x_i, \dots, x_n)}{h}$$

**Gradient:**

$$\nabla f = \left[ \frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \dots, \frac{\partial f}{\partial x_n} \right]$$

### Chain Rule

$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$$

For multivariable functions:

$$\frac{\partial z}{\partial x} = \frac{\partial z}{\partial u} \cdot \frac{\partial u}{\partial x} + \frac{\partial z}{\partial v} \cdot \frac{\partial v}{\partial x}$$

### Integrals

**Definite Integral:**

$$\int_{a}^{b} f(x) \, dx$$

**Multiple Integrals:**

$$\iint\limits_D f(x,y) \, dx \, dy$$

### Optimization

**Gradient Descent Update Rule:**

$$\theta_{t+1} = \theta_t - \alpha \nabla J(\theta_t)$$

where $\alpha$ is the learning rate and $J(\theta)$ is the cost function.

**Second Derivative Test:**

$$f''(x) > 0 \implies \text{local minimum}$$
$$f''(x) < 0 \implies \text{local maximum}$$

## Probability and Statistics

### Basic Probability

**Probability Definition:**

$$P(A) = \frac{\text{Number of favorable outcomes}}{\text{Total number of outcomes}}$$

**Conditional Probability:**

$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

**Bayes' Theorem:**

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

### Common Distributions

**Normal Distribution:**

$$f(x|\mu,\sigma^2) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

**Bernoulli Distribution:**

$$P(X = k) = p^k (1-p)^{1-k}, \quad k \in \{0,1\}$$

**Binomial Distribution:**

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

### Expectation and Variance

**Expected Value:**

$$E[X] = \mu = \sum_{i} x_i P(x_i)$$

**Variance:**

$$\text{Var}(X) = E[(X - \mu)^2] = E[X^2] - (E[X])^2$$

**Covariance:**

$$\text{Cov}(X,Y) = E[(X - \mu_X)(Y - \mu_Y)]$$

### Maximum Likelihood Estimation

**Likelihood Function:**

$$\mathcal{L}(\theta) = \prod_{i=1}^{n} P(x_i|\theta)$$

**Log-Likelihood:**

$$\ell(\theta) = \log \mathcal{L}(\theta) = \sum_{i=1}^{n} \log P(x_i|\theta)$$

**MLE Estimator:**

$$\hat{\theta}_{MLE} = \arg\max_{\theta} \mathcal{L}(\theta)$$

## Machine Learning Formulas

### Linear Regression

**Hypothesis Function:**

$$h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \dots + \theta_n x_n = \theta^T x$$

**Cost Function (MSE):**

$$J(\theta) = \frac{1}{2m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)})^2$$

**Normal Equation:**

$$\theta = (X^T X)^{-1} X^T y$$

### Logistic Regression

**Sigmoid Function:**

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

**Hypothesis:**

$$h_\theta(x) = \sigma(\theta^T x)$$

**Cost Function:**

$$J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \left[ y^{(i)} \log h_\theta(x^{(i)}) + (1-y^{(i)}) \log(1-h_\theta(x^{(i)})) \right]$$

### Neural Networks

**Forward Propagation:**

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g^{[l]}(z^{[l]})$$

**Backpropagation:**

$$\frac{\partial J}{\partial z^{[l]}} = \frac{\partial J}{\partial a^{[l]}} \odot {g^{[l]}}'(z^{[l]})$$
$$\frac{\partial J}{\partial W^{[l]}} = \frac{\partial J}{\partial z^{[l]}} (a^{[l-1]})^T$$

**Activation Functions:**

ReLU: $$\text{ReLU}(x) = \max(0, x)$$

Tanh: $$\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$

Softmax: $$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum_{j} e^{x_j}}$$

### Support Vector Machines

**Primal Problem:**

$$\min_{\mathbf{w}, b} \frac{1}{2} \|\mathbf{w}\|^2$$
$$\text{subject to: } y_i(\mathbf{w} \cdot \mathbf{x}_i + b) \geq 1, \forall i$$

**Dual Problem:**

$$\max_{\alpha} \sum_{i=1}^{n} \alpha_i - \frac{1}{2} \sum_{i,j} \alpha_i \alpha_j y_i y_j \mathbf{x}_i \cdot \mathbf{x}_j$$

**Kernel Trick:**

$$K(\mathbf{x}_i, \mathbf{x}_j) = \phi(\mathbf{x}_i) \cdot \phi(\mathbf{x}_j)$$

### Decision Trees and Random Forests

**Entropy:**

$$H(S) = -\sum_{i=1}^{c} p_i \log_2 p_i$$

**Information Gain:**

$$IG(S, A) = H(S) - \sum_{v \in \text{values}(A)} \frac{|S_v|}{|S|} H(S_v)$$

**Gini Impurity:**

$$G(S) = 1 - \sum_{i=1}^{c} p_i^2$$

### Clustering

**K-Means Objective:**

$$\min_{C_1,\dots,C_k} \sum_{i=1}^{k} \sum_{\mathbf{x} \in C_i} \|\mathbf{x} - \boldsymbol{\mu}_i\|^2$$

where $\boldsymbol{\mu}_i$ is the centroid of cluster $C_i$.

### Principal Component Analysis

**Covariance Matrix:**

$$\mathbf{C} = \frac{1}{n} \mathbf{X}^T \mathbf{X}$$

**Eigenvalue Decomposition:**

$$\mathbf{C} \mathbf{v}_i = \lambda_i \mathbf{v}_i$$

**Projection:**

$$\mathbf{Z} = \mathbf{X} \mathbf{W}$$

where $\mathbf{W}$ contains the top $k$ eigenvectors.

### Reinforcement Learning

**Bellman Equation:**

$$V^\pi(s) = \sum_{a} \pi(a|s) \sum_{s'} P(s'|s,a) \left[ R(s,a,s') + \gamma V^\pi(s') \right]$$

**Q-Learning Update:**

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ r + \gamma \max_{a'} Q(s',a') - Q(s,a) \right]$$

### Information Theory

**Cross-Entropy:**

$$H(p,q) = -\sum_{x} p(x) \log q(x)$$

**Kullback-Leibler Divergence:**

$$D_{KL}(P \| Q) = \sum_{x} P(x) \log \frac{P(x)}{Q(x)}$$

**Mutual Information:**

$$I(X;Y) = \sum_{y \in Y} \sum_{x \in X} p(x,y) \log \left( \frac{p(x,y)}{p(x)p(y)} \right)$$

## Advanced Topics

### Convolutional Neural Networks

**Convolution Operation:**

$$(f * g)(t) = \int_{-\infty}^{\infty} f(\tau) g(t - \tau) \, d\tau$$

**2D Discrete Convolution:**

$$(f * g)[m,n] = \sum_{i=-\infty}^{\infty} \sum_{j=-\infty}^{\infty} f[i,j] \cdot g[m-i, n-j]$$

### Natural Language Processing

**TF-IDF:**

$$\text{tf-idf}(t,d) = \text{tf}(t,d) \times \text{idf}(t)$$
$$\text{idf}(t) = \log \frac{N}{|\{d \in D : t \in d\}|}$$

**Word Embeddings (Word2Vec):**

$$P(w_O | w_I) = \frac{\exp(\mathbf{v}_{w_O}^T \mathbf{u}_{w_I})}{\sum_{w=1}^{V} \exp(\mathbf{v}_w^T \mathbf{u}_{w_I})}$$

### Transformers

**Self-Attention:**

$$\text{Attention}(Q,K,V) = \text{softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right) V$$

**Multi-Head Attention:**

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$
$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)W^O$$

## Tips for Writing Math

### Inline vs Display Math

**Inline:** Use single dollar signs `$...$` for math within text: The parameter $\theta$ is estimated from data.

**Display:** Use double dollar signs `$$...$$` for standalone equations:

$$\sum_{i=1}^{n} x_i = x_1 + x_2 + \dots + x_n$$

### Common Symbols and Notation

**Greek Letters:**
- $\alpha, \beta, \gamma, \delta, \epsilon$
- $\theta, \lambda, \mu, \sigma, \omega$
- $\Phi, \Psi, \Omega$

**Operators:**
- $\sum, \prod, \int, \partial, \nabla$
- $\forall, \exists, \in, \subset, \subseteq$
- $\rightarrow, \leftarrow, \leftrightarrow, \Rightarrow, \Leftrightarrow$

**Functions:**
- $\sin, \cos, \tan, \log, \exp$
- $\max, \min, \lim, \det, \dim$

### Formatting Tips

1. **Use `\text{}` for text in math mode:**
   $$P(\text{spam} | \text{email}) = \frac{P(\text{email} | \text{spam}) P(\text{spam})}{P(\text{email})}$$

2. **Proper spacing with `\,`, `\;`, `\quad`, `\qquad`:**
   $$\int f(x) \, dx \quad \text{vs} \quad \int f(x) dx$$

3. **Large parentheses with `\left(` and `\right)`:**
   $$\left( \frac{a}{b} \right)^n \quad \text{vs} \quad ( \frac{a}{b} )^n$$

4. **Bold vectors and matrices:**
   - Vectors: $\mathbf{x}, \boldsymbol{\theta}$
   - Matrices: $\mathbf{A}, \mathbf{W}$

### Accessibility

KaTeX equations are accessible and can be read by screen readers. For complex equations, consider adding descriptive text:

```markdown
The gradient descent update rule:

$$\theta_{t+1} = \theta_t - \alpha \nabla J(\theta_t)$$

where $\theta_t$ is the parameter vector at iteration $t$, $\alpha$ is the learning rate, and $\nabla J(\theta_t)$ is the gradient of the cost function.
```

## Interactive Features

### Copy Math as LaTeX

All math equations can be copied as LaTeX code by right-clicking on the equation and selecting "Copy Math As → LaTeX".

### Zoom Equations

Hover over equations to see them in larger size, or right-click and select "ZoomMath".

### Math Keyboard Shortcuts

When focused on math input (in interactive examples):
- `Ctrl+Shift+L`: Toggle LaTeX mode
- `Ctrl+Shift+P`: Toggle preview mode

## Getting Help

If you encounter issues with math rendering:

1. **Check LaTeX Syntax**: Ensure all braces are balanced and commands are correct
2. **Use Online Tools**: Test equations on [Overleaf](https://www.overleaf.com/) or [Detexify](https://detexify.kirelabs.org/)
3. **Consult Documentation**: See [KaTeX documentation](https://katex.org/docs/supported.html) for supported functions
4. **Ask the AI Assistant**: Get help with LaTeX syntax and math formatting

---

**Next Steps**: Practice these mathematical notations in the [Linear Algebra](./chapter-2/linear-algebra) chapter where you'll apply these concepts to real ML problems!