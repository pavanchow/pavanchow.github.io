/**
 * Module 2.1: Decision Boundaries
 * Interactive Labs and Quiz JavaScript
 */

// ============================================
// Lab Tab System
// ============================================

class LabTabs {
    constructor() {
        this.tabs = document.querySelectorAll('.lab-tab');
        this.panels = document.querySelectorAll('.lab-panel');
        this.bindEvents();
    }
    
    bindEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab + '-panel';
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.panels.forEach(p => p.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
    }
}

// ============================================
// Data Generation
// ============================================

class DataGenerator {
    static generateLinear(n = 100, noise = 0.1) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const label = (x + y + (Math.random() - 0.5) * noise * 2 > 0) ? 1 : 0;
            points.push({ x, y, label });
        }
        return points;
    }
    
    static generateCircles(n = 100, noise = 0.1) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const isInner = Math.random() < 0.5;
            const baseR = isInner ? 0.3 : 0.7;
            const r = baseR + (Math.random() - 0.5) * noise;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            points.push({ x, y, label: isInner ? 0 : 1 });
        }
        return points;
    }
    
    static generateMoons(n = 100, noise = 0.1) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const isMoon1 = Math.random() < 0.5;
            const angle = Math.random() * Math.PI;
            if (isMoon1) {
                const x = Math.cos(angle) + (Math.random() - 0.5) * noise - 0.5;
                const y = Math.sin(angle) + (Math.random() - 0.5) * noise - 0.25;
                points.push({ x: x * 0.7, y: y * 0.7, label: 0 });
            } else {
                const x = 1 - Math.cos(angle) + (Math.random() - 0.5) * noise - 0.5;
                const y = 1 - Math.sin(angle) + (Math.random() - 0.5) * noise - 0.75;
                points.push({ x: x * 0.7, y: y * 0.7, label: 1 });
            }
        }
        return points;
    }
    
    static generateXOR(n = 100, noise = 0.1) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const quadrant = Math.floor(Math.random() * 4);
            const baseX = (quadrant % 2 === 0) ? -0.5 : 0.5;
            const baseY = (quadrant < 2) ? 0.5 : -0.5;
            const x = baseX + (Math.random() - 0.5) * 0.5 + (Math.random() - 0.5) * noise;
            const y = baseY + (Math.random() - 0.5) * 0.5 + (Math.random() - 0.5) * noise;
            const label = (quadrant === 0 || quadrant === 3) ? 1 : 0;
            points.push({ x, y, label });
        }
        return points;
    }
    
    static generateSpiral(n = 100, noise = 0.1) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const isClass0 = Math.random() < 0.5;
            const t = Math.random() * 2;
            const r = t * 0.4;
            const angle = t * Math.PI * 2 + (isClass0 ? 0 : Math.PI);
            const x = r * Math.cos(angle) + (Math.random() - 0.5) * noise * 0.3;
            const y = r * Math.sin(angle) + (Math.random() - 0.5) * noise * 0.3;
            points.push({ x, y, label: isClass0 ? 0 : 1 });
        }
        return points;
    }
}

// ============================================
// Simple Classifiers
// ============================================

class LogisticClassifier {
    constructor() {
        this.w = [Math.random() - 0.5, Math.random() - 0.5];
        this.b = 0;
    }
    
    predict(x, y) {
        const z = this.w[0] * x + this.w[1] * y + this.b;
        return 1 / (1 + Math.exp(-z));
    }
    
    train(points, iterations = 1000, lr = 0.5) {
        for (let iter = 0; iter < iterations; iter++) {
            let dw = [0, 0];
            let db = 0;
            
            for (const p of points) {
                const pred = this.predict(p.x, p.y);
                const error = pred - p.label;
                dw[0] += error * p.x;
                dw[1] += error * p.y;
                db += error;
            }
            
            this.w[0] -= lr * dw[0] / points.length;
            this.w[1] -= lr * dw[1] / points.length;
            this.b -= lr * db / points.length;
        }
    }
    
    accuracy(points) {
        let correct = 0;
        for (const p of points) {
            const pred = this.predict(p.x, p.y) > 0.5 ? 1 : 0;
            if (pred === p.label) correct++;
        }
        return correct / points.length;
    }
}

class DecisionTreeClassifier {
    constructor(maxDepth = 5) {
        this.maxDepth = maxDepth;
        this.tree = null;
    }
    
    train(points) {
        this.tree = this.buildTree(points, 0);
    }
    
    buildTree(points, depth) {
        if (depth >= this.maxDepth || points.length < 4) {
            const sum = points.reduce((s, p) => s + p.label, 0);
            return { isLeaf: true, label: sum / points.length > 0.5 ? 1 : 0 };
        }
        
        const label0 = points.filter(p => p.label === 0).length;
        const label1 = points.length - label0;
        if (label0 === 0 || label1 === 0) {
            return { isLeaf: true, label: label0 === 0 ? 1 : 0 };
        }
        
        // Find best split
        let bestGain = -Infinity;
        let bestSplit = null;
        
        for (const feature of ['x', 'y']) {
            const values = points.map(p => p[feature]).sort((a, b) => a - b);
            for (let i = 0; i < values.length - 1; i += Math.max(1, Math.floor(values.length / 10))) {
                const threshold = (values[i] + values[i + 1]) / 2;
                const left = points.filter(p => p[feature] <= threshold);
                const right = points.filter(p => p[feature] > threshold);
                
                if (left.length === 0 || right.length === 0) continue;
                
                const gain = this.infoGain(points, left, right);
                if (gain > bestGain) {
                    bestGain = gain;
                    bestSplit = { feature, threshold, left, right };
                }
            }
        }
        
        if (!bestSplit) {
            const sum = points.reduce((s, p) => s + p.label, 0);
            return { isLeaf: true, label: sum / points.length > 0.5 ? 1 : 0 };
        }
        
        return {
            isLeaf: false,
            feature: bestSplit.feature,
            threshold: bestSplit.threshold,
            left: this.buildTree(bestSplit.left, depth + 1),
            right: this.buildTree(bestSplit.right, depth + 1)
        };
    }
    
    infoGain(parent, left, right) {
        const entropyParent = this.entropy(parent);
        const entropyLeft = this.entropy(left);
        const entropyRight = this.entropy(right);
        const wLeft = left.length / parent.length;
        const wRight = right.length / parent.length;
        return entropyParent - (wLeft * entropyLeft + wRight * entropyRight);
    }
    
    entropy(points) {
        if (points.length === 0) return 0;
        const p = points.filter(p => p.label === 1).length / points.length;
        if (p === 0 || p === 1) return 0;
        return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
    }
    
    predict(x, y) {
        return this.predictNode(this.tree, x, y);
    }
    
    predictNode(node, x, y) {
        if (node.isLeaf) return node.label;
        const value = node.feature === 'x' ? x : y;
        if (value <= node.threshold) {
            return this.predictNode(node.left, x, y);
        } else {
            return this.predictNode(node.right, x, y);
        }
    }
    
    accuracy(points) {
        let correct = 0;
        for (const p of points) {
            if (this.predict(p.x, p.y) === p.label) correct++;
        }
        return correct / points.length;
    }
}

class KNNClassifier {
    constructor(k = 5) {
        this.k = k;
        this.points = [];
    }
    
    train(points) {
        this.points = points;
    }
    
    predict(x, y) {
        const distances = this.points.map(p => ({
            dist: Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2),
            label: p.label
        }));
        distances.sort((a, b) => a.dist - b.dist);
        const kNearest = distances.slice(0, this.k);
        const sum = kNearest.reduce((s, p) => s + p.label, 0);
        return sum / this.k;
    }
    
    accuracy(points) {
        let correct = 0;
        for (const p of points) {
            const pred = this.predict(p.x, p.y) > 0.5 ? 1 : 0;
            if (pred === p.label) correct++;
        }
        return correct / points.length;
    }
}

class SimpleNeuralNetwork {
    constructor(hiddenSize = 8) {
        this.hiddenSize = hiddenSize;
        this.w1 = this.randomMatrix(2, hiddenSize);
        this.b1 = new Array(hiddenSize).fill(0);
        this.w2 = this.randomMatrix(hiddenSize, 1);
        this.b2 = [0];
    }
    
    randomMatrix(rows, cols) {
        const result = [];
        for (let i = 0; i < rows; i++) {
            result.push(new Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2));
        }
        return result;
    }
    
    relu(x) { return Math.max(0, x); }
    sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
    
    forward(x, y) {
        // Hidden layer
        const hidden = [];
        for (let j = 0; j < this.hiddenSize; j++) {
            hidden.push(this.relu(this.w1[0][j] * x + this.w1[1][j] * y + this.b1[j]));
        }
        // Output
        let out = this.b2[0];
        for (let j = 0; j < this.hiddenSize; j++) {
            out += this.w2[j][0] * hidden[j];
        }
        return this.sigmoid(out);
    }
    
    predict(x, y) {
        return this.forward(x, y);
    }
    
    train(points, iterations = 500, lr = 0.5) {
        for (let iter = 0; iter < iterations; iter++) {
            for (const p of points) {
                // Forward
                const hidden = [];
                for (let j = 0; j < this.hiddenSize; j++) {
                    hidden.push(this.relu(this.w1[0][j] * p.x + this.w1[1][j] * p.y + this.b1[j]));
                }
                let out = this.b2[0];
                for (let j = 0; j < this.hiddenSize; j++) {
                    out += this.w2[j][0] * hidden[j];
                }
                const pred = this.sigmoid(out);
                
                // Backward
                const dOut = pred - p.label;
                
                // Gradients for output layer
                for (let j = 0; j < this.hiddenSize; j++) {
                    this.w2[j][0] -= lr * dOut * hidden[j];
                }
                this.b2[0] -= lr * dOut;
                
                // Gradients for hidden layer
                for (let j = 0; j < this.hiddenSize; j++) {
                    const z = this.w1[0][j] * p.x + this.w1[1][j] * p.y + this.b1[j];
                    const dRelu = z > 0 ? 1 : 0;
                    const dHidden = dOut * this.w2[j][0] * dRelu;
                    this.w1[0][j] -= lr * dHidden * p.x;
                    this.w1[1][j] -= lr * dHidden * p.y;
                    this.b1[j] -= lr * dHidden;
                }
            }
        }
    }
    
    accuracy(points) {
        let correct = 0;
        for (const p of points) {
            const pred = this.predict(p.x, p.y) > 0.5 ? 1 : 0;
            if (pred === p.label) correct++;
        }
        return correct / points.length;
    }
}

// ============================================
// Model Comparison Lab
// ============================================

class ModelComparisonLab {
    constructor() {
        this.points = [];
        this.models = {};
        this.canvases = {};
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        document.querySelectorAll('.model-viz').forEach(viz => {
            const model = viz.dataset.model;
            const canvas = viz.querySelector('.boundary-canvas');
            if (canvas) {
                this.canvases[model] = {
                    canvas,
                    ctx: canvas.getContext('2d'),
                    accEl: viz.querySelector('.acc-value')
                };
            }
        });
    }
    
    bindEvents() {
        const generateBtn = document.getElementById('generate-data');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }
        
        const noiseSlider = document.getElementById('noise-slider');
        if (noiseSlider) {
            noiseSlider.addEventListener('input', (e) => {
                document.getElementById('noise-value').textContent = e.target.value + '%';
            });
        }
    }
    
    generate() {
        const datasetType = document.getElementById('dataset-select').value;
        const noise = parseInt(document.getElementById('noise-slider').value) / 100;
        
        switch (datasetType) {
            case 'linear': this.points = DataGenerator.generateLinear(100, noise); break;
            case 'circles': this.points = DataGenerator.generateCircles(100, noise); break;
            case 'moons': this.points = DataGenerator.generateMoons(100, noise); break;
            case 'xor': this.points = DataGenerator.generateXOR(100, noise); break;
            case 'spiral': this.points = DataGenerator.generateSpiral(150, noise); break;
        }
        
        this.trainAndVisualize();
    }
    
    trainAndVisualize() {
        if (this.points.length === 0) return;
        
        // Train models
        const logistic = new LogisticClassifier();
        logistic.train(this.points);
        
        const tree = new DecisionTreeClassifier(6);
        tree.train(this.points);
        
        const knn = new KNNClassifier(5);
        knn.train(this.points);
        
        const neural = new SimpleNeuralNetwork(12);
        neural.train(this.points, 800, 0.3);
        
        this.models = { logistic, tree, knn, neural };
        
        // Visualize each
        this.visualize('logistic', logistic);
        this.visualize('tree', tree);
        this.visualize('knn', knn);
        this.visualize('neural', neural);
    }
    
    visualize(modelName, model) {
        const { canvas, ctx, accEl } = this.canvases[modelName];
        if (!canvas) return;
        
        const w = canvas.width;
        const h = canvas.height;
        
        // Draw decision boundary
        const resolution = 4;
        for (let px = 0; px < w; px += resolution) {
            for (let py = 0; py < h; py += resolution) {
                const x = (px / w) * 2 - 1;
                const y = (py / h) * 2 - 1;
                const pred = model.predict(x, y);
                
                const r = Math.floor(224 + (pred - 0.5) * -80);
                const g = Math.floor(122 + (pred - 0.5) * 50);
                const b = Math.floor(95 + (pred - 0.5) * 160);
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                ctx.fillRect(px, py, resolution, resolution);
            }
        }
        
        // Draw points
        for (const p of this.points) {
            const px = (p.x + 1) / 2 * w;
            const py = (p.y + 1) / 2 * h;
            
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = p.label === 0 ? '#e07a5f' : '#5b9bd5';
            ctx.fill();
            ctx.strokeStyle = '#0d0f12';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Update accuracy
        if (accEl) {
            accEl.textContent = (model.accuracy(this.points) * 100).toFixed(1) + '%';
        }
    }
}

// ============================================
// Overfitting Demo
// ============================================

class OverfittingDemo {
    constructor() {
        this.canvas = document.getElementById('overfit-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.trainPoints = [];
        this.testPoints = [];
        this.complexity = 1;
        this.weights = [];
        
        this.bindEvents();
        this.generateData();
    }
    
    bindEvents() {
        const complexitySlider = document.getElementById('complexity-slider');
        if (complexitySlider) {
            complexitySlider.addEventListener('input', (e) => {
                this.complexity = parseInt(e.target.value);
                document.getElementById('complexity-value').textContent = this.complexity;
            });
        }
        
        const fitBtn = document.getElementById('fit-model');
        if (fitBtn) {
            fitBtn.addEventListener('click', () => this.fit());
        }
        
        const resetBtn = document.getElementById('reset-overfit');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.generateData());
        }
    }
    
    generateData() {
        // Generate training data with a true quadratic boundary
        this.trainPoints = [];
        this.testPoints = [];
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const trueBoundary = 0.5 * x * x - 0.3;
            const label = y > trueBoundary + (Math.random() - 0.5) * 0.3 ? 1 : 0;
            this.trainPoints.push({ x, y, label });
        }
        
        // Generate test data
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const trueBoundary = 0.5 * x * x - 0.3;
            const label = y > trueBoundary + (Math.random() - 0.5) * 0.3 ? 1 : 0;
            this.testPoints.push({ x, y, label });
        }
        
        this.weights = [];
        this.draw();
        this.updateMetrics();
    }
    
    expandFeatures(x, y) {
        const features = [1];
        for (let d = 1; d <= this.complexity; d++) {
            for (let i = 0; i <= d; i++) {
                features.push(Math.pow(x, d - i) * Math.pow(y, i));
            }
        }
        return features;
    }
    
    fit() {
        const numFeatures = this.expandFeatures(0, 0).length;
        this.weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
        
        // Train with gradient descent
        const lr = 0.1;
        for (let iter = 0; iter < 1000; iter++) {
            const gradients = new Array(numFeatures).fill(0);
            
            for (const p of this.trainPoints) {
                const features = this.expandFeatures(p.x, p.y);
                let z = 0;
                for (let i = 0; i < features.length; i++) {
                    z += this.weights[i] * features[i];
                }
                const pred = 1 / (1 + Math.exp(-z));
                const error = pred - p.label;
                
                for (let i = 0; i < features.length; i++) {
                    gradients[i] += error * features[i];
                }
            }
            
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i] -= lr * gradients[i] / this.trainPoints.length;
            }
        }
        
        this.draw();
        this.updateMetrics();
    }
    
    predict(x, y) {
        if (this.weights.length === 0) return 0.5;
        const features = this.expandFeatures(x, y);
        let z = 0;
        for (let i = 0; i < features.length; i++) {
            z += this.weights[i] * features[i];
        }
        return 1 / (1 + Math.exp(-z));
    }
    
    accuracy(points) {
        if (this.weights.length === 0) return 0;
        let correct = 0;
        for (const p of points) {
            const pred = this.predict(p.x, p.y) > 0.5 ? 1 : 0;
            if (pred === p.label) correct++;
        }
        return correct / points.length;
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw decision boundary
        if (this.weights.length > 0) {
            const resolution = 4;
            for (let px = 0; px < w; px += resolution) {
                for (let py = 0; py < h; py += resolution) {
                    const x = (px / w) * 2 - 1;
                    const y = (py / h) * 2 - 1;
                    const pred = this.predict(x, y);
                    
                    const alpha = Math.abs(pred - 0.5) * 0.6;
                    const color = pred > 0.5 ? [91, 155, 213] : [224, 122, 95];
                    
                    this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                    this.ctx.fillRect(px, py, resolution, resolution);
                }
            }
        }
        
        // Draw training points
        for (const p of this.trainPoints) {
            const px = (p.x + 1) / 2 * w;
            const py = (p.y + 1) / 2 * h;
            
            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = p.label === 0 ? '#e07a5f' : '#5b9bd5';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        }
        
        // Draw test points (smaller, different marker)
        for (const p of this.testPoints) {
            const px = (p.x + 1) / 2 * w;
            const py = (p.y + 1) / 2 * h;
            
            this.ctx.beginPath();
            this.ctx.rect(px - 3, py - 3, 6, 6);
            this.ctx.fillStyle = p.label === 0 ? '#e07a5f' : '#5b9bd5';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Legend
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.fillText('● Train', 10, 20);
        this.ctx.fillText('■ Test', 10, 35);
    }
    
    updateMetrics() {
        const trainAcc = this.accuracy(this.trainPoints);
        const testAcc = this.accuracy(this.testPoints);
        
        document.getElementById('train-acc').textContent = 
            this.weights.length > 0 ? (trainAcc * 100).toFixed(1) + '%' : '—';
        document.getElementById('test-acc').textContent = 
            this.weights.length > 0 ? (testAcc * 100).toFixed(1) + '%' : '—';
        document.getElementById('complexity-metric').textContent = 
            'Degree ' + this.complexity;
        
        const interpEl = document.getElementById('overfit-interpretation');
        if (interpEl && this.weights.length > 0) {
            const gap = trainAcc - testAcc;
            if (this.complexity <= 2 && trainAcc < 0.8) {
                interpEl.textContent = 'Underfitting: The model is too simple to capture the pattern. Both accuracies are low.';
                interpEl.style.color = '#e07a5f';
            } else if (gap > 0.15) {
                interpEl.textContent = 'Overfitting: Training accuracy is much higher than test accuracy. The boundary is too complex.';
                interpEl.style.color = '#e07a5f';
            } else if (gap < 0.1 && trainAcc > 0.75) {
                interpEl.textContent = 'Good fit: Training and test accuracies are similar. The model generalizes well.';
                interpEl.style.color = '#50b892';
            } else {
                interpEl.textContent = 'Moderate fit: Some gap between train and test accuracy.';
                interpEl.style.color = '#d4a855';
            }
        }
    }
}

// ============================================
// Quiz System
// ============================================

class ModuleQuiz {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.questions = {
            1: { correct: 'b', explanation: 'Logistic regression is a linear classifier—it can only produce linear decision boundaries (straight lines in 2D, hyperplanes in higher dimensions).' },
            2: { correct: 'b', explanation: 'The XOR problem has two classes that are not linearly separable—no single straight line can divide the 1s from the 0s. This requires a non-linear boundary.' },
            3: { correct: 'b', explanation: 'Overfitting boundaries are characterized by high complexity—they make unnecessary turns and curves to fit individual training points, including noise.' },
            4: { correct: 'b', explanation: 'Neural networks create complex boundaries by stacking layers. Each layer applies a linear transformation followed by a non-linear activation, and the composition of many such operations can produce arbitrary shapes.' },
            5: { correct: 'b', explanation: 'Linear separability means a hyperplane exists that can perfectly divide the classes. In 2D, this means a straight line can separate all points of one class from the other.' }
        };
        
        this.answers = {};
        this.bindEvents();
    }
    
    bindEvents() {
        this.container.querySelectorAll('.option input').forEach(input => {
            input.addEventListener('change', (e) => {
                const questionNum = e.target.name.replace('q', '');
                this.answers[questionNum] = e.target.value;
            });
        });
        
        document.getElementById('submit-quiz')?.addEventListener('click', () => this.submit());
        document.getElementById('reset-quiz')?.addEventListener('click', () => this.reset());
    }
    
    submit() {
        if (Object.keys(this.answers).length < 5) {
            alert('Please answer all questions.');
            return;
        }
        
        let score = 0;
        for (const [qNum, answer] of Object.entries(this.answers)) {
            const q = this.questions[qNum];
            const qEl = this.container.querySelector(`[data-question="${qNum}"]`);
            const selected = qEl.querySelector(`input[value="${answer}"]`).closest('.option');
            const correct = qEl.querySelector(`input[value="${q.correct}"]`).closest('.option');
            const feedback = qEl.querySelector('.question-feedback');
            
            if (answer === q.correct) {
                score++;
                selected.classList.add('correct');
                feedback.classList.add('correct', 'show');
                feedback.textContent = '✓ Correct. ' + q.explanation;
            } else {
                selected.classList.add('incorrect');
                correct.classList.add('correct');
                feedback.classList.add('incorrect', 'show');
                feedback.textContent = '✗ Incorrect. ' + q.explanation;
            }
            qEl.querySelectorAll('input').forEach(i => i.disabled = true);
        }
        
        document.getElementById('score-value').textContent = score;
        document.getElementById('quiz-results').classList.add('show');
        document.getElementById('results-message').textContent = 
            score === 5 ? 'Excellent! You understand decision boundaries well.' :
            score >= 3 ? 'Good progress. Review the model comparison lab.' :
            'Consider re-reading about linear vs non-linear boundaries.';
    }
    
    reset() {
        this.answers = {};
        this.container.querySelectorAll('.option').forEach(o => o.classList.remove('correct', 'incorrect'));
        this.container.querySelectorAll('.question-feedback').forEach(f => {
            f.classList.remove('correct', 'incorrect', 'show');
            f.textContent = '';
        });
        this.container.querySelectorAll('input').forEach(i => { i.checked = false; i.disabled = false; });
        document.getElementById('quiz-results').classList.remove('show');
    }
}

// ============================================
// Additional Styles
// ============================================

const styles = `
    .boundary-lab-controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        align-items: flex-end;
        margin-bottom: var(--space-xl);
    }
    
    .model-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-lg);
    }
    
    .model-viz {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        text-align: center;
    }
    
    .model-viz h4 {
        font-size: 0.9rem;
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .boundary-canvas {
        display: block;
        border-radius: var(--radius-sm);
        margin: 0 auto var(--space-sm);
    }
    
    .model-stats {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .model-stats .acc-value {
        color: var(--accent-gold);
    }
    
    .boundary-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .boundary-card.linear { border-top: 3px solid var(--accent-blue); }
    .boundary-card.nonlinear { border-top: 3px solid var(--accent-gold); }
    
    .model-comparison {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--space-md);
        margin: var(--space-xl) 0;
    }
    
    .model-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .model-icon {
        font-size: 1.5rem;
        color: var(--accent-gold);
        margin-bottom: var(--space-sm);
    }
    
    .model-card h3 {
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .model-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
    }
    
    .boundary-shape {
        font-size: 0.75rem;
        color: var(--accent-gold-dim);
        font-family: var(--font-mono);
    }
    
    .xor-demo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin: var(--space-lg) 0;
    }
    
    .xor-step {
        background: var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        text-align: center;
        min-width: 150px;
    }
    
    .step-label {
        font-size: 0.7rem;
        color: var(--text-tertiary);
        text-transform: uppercase;
        margin-bottom: var(--space-xs);
    }
    
    .step-content {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .step-note {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .xor-arrow {
        font-size: 1.5rem;
        color: var(--accent-gold);
    }
    
    .overfit-viz {
        display: flex;
        justify-content: center;
        margin-bottom: var(--space-lg);
    }
    
    #overfit-canvas {
        border-radius: var(--radius-md);
    }
    
    .overfit-metrics {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
        margin-bottom: var(--space-lg);
    }
    
    .metric-card {
        text-align: center;
        background: var(--surface-1);
        padding: var(--space-md) var(--space-xl);
        border-radius: var(--radius-md);
    }
    
    .metric-label {
        display: block;
        font-size: 0.7rem;
        color: var(--text-tertiary);
        text-transform: uppercase;
        margin-bottom: var(--space-xs);
    }
    
    .metric-value {
        font-family: var(--font-mono);
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--accent-gold);
    }
    
    .overfit-interpretation {
        text-align: center;
        padding: var(--space-md);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new LabTabs();
    new ModelComparisonLab();
    new OverfittingDemo();
    new ModuleQuiz('quiz-container');
});

