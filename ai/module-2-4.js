/**
 * Module 2.4: Generalization & Regularization
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
    static generateMoons(n, noise) {
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
    
    static generateCircles(n, noise) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const isInner = Math.random() < 0.5;
            const baseR = isInner ? 0.3 : 0.7;
            const r = baseR + (Math.random() - 0.5) * noise;
            points.push({
                x: r * Math.cos(angle),
                y: r * Math.sin(angle),
                label: isInner ? 0 : 1
            });
        }
        return points;
    }
    
    static generateSpiral(n, noise) {
        const points = [];
        for (let i = 0; i < n; i++) {
            const isClass0 = Math.random() < 0.5;
            const t = Math.random() * 2;
            const r = t * 0.4;
            const angle = t * Math.PI * 2 + (isClass0 ? 0 : Math.PI);
            points.push({
                x: r * Math.cos(angle) + (Math.random() - 0.5) * noise * 0.3,
                y: r * Math.sin(angle) + (Math.random() - 0.5) * noise * 0.3,
                label: isClass0 ? 0 : 1
            });
        }
        return points;
    }
}

// ============================================
// Neural Network with Regularization
// ============================================

class RegularizedNetwork {
    constructor(hiddenSize = 12, l2 = 0, dropout = 0) {
        this.hiddenSize = hiddenSize;
        this.l2 = l2;
        this.dropout = dropout;
        this.reset();
    }
    
    reset() {
        this.w1 = this.randomMatrix(2, this.hiddenSize);
        this.b1 = new Array(this.hiddenSize).fill(0);
        this.w2 = this.randomMatrix(this.hiddenSize, 1);
        this.b2 = [0];
    }
    
    randomMatrix(rows, cols) {
        const result = [];
        for (let i = 0; i < rows; i++) {
            result.push(new Array(cols).fill(0).map(() => (Math.random() - 0.5) * Math.sqrt(2 / rows)));
        }
        return result;
    }
    
    relu(x) { return Math.max(0, x); }
    sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
    
    forward(x, y, training = false) {
        const hidden = [];
        const dropoutMask = [];
        
        for (let j = 0; j < this.hiddenSize; j++) {
            let h = this.relu(this.w1[0][j] * x + this.w1[1][j] * y + this.b1[j]);
            
            // Apply dropout during training
            if (training && this.dropout > 0) {
                if (Math.random() < this.dropout) {
                    h = 0;
                    dropoutMask.push(0);
                } else {
                    h /= (1 - this.dropout); // Inverted dropout
                    dropoutMask.push(1);
                }
            } else {
                dropoutMask.push(1);
            }
            
            hidden.push(h);
        }
        
        let out = this.b2[0];
        for (let j = 0; j < this.hiddenSize; j++) {
            out += this.w2[j][0] * hidden[j];
        }
        
        return { hidden, output: this.sigmoid(out), dropoutMask };
    }
    
    train(points, iterations = 500, lr = 0.5) {
        for (let iter = 0; iter < iterations; iter++) {
            for (const p of points) {
                const { hidden, output, dropoutMask } = this.forward(p.x, p.y, true);
                const error = output - p.label;
                
                // Output layer gradients
                for (let j = 0; j < this.hiddenSize; j++) {
                    const grad = error * hidden[j] + this.l2 * this.w2[j][0];
                    this.w2[j][0] -= lr * grad;
                }
                this.b2[0] -= lr * error;
                
                // Hidden layer gradients
                for (let j = 0; j < this.hiddenSize; j++) {
                    if (dropoutMask[j] === 0) continue; // Skip dropped neurons
                    
                    const z = this.w1[0][j] * p.x + this.w1[1][j] * p.y + this.b1[j];
                    const dRelu = z > 0 ? 1 : 0;
                    const dHidden = error * this.w2[j][0] * dRelu;
                    
                    this.w1[0][j] -= lr * (dHidden * p.x + this.l2 * this.w1[0][j]);
                    this.w1[1][j] -= lr * (dHidden * p.y + this.l2 * this.w1[1][j]);
                    this.b1[j] -= lr * dHidden;
                }
            }
        }
    }
    
    accuracy(points) {
        let correct = 0;
        for (const p of points) {
            const { output } = this.forward(p.x, p.y, false);
            if ((output > 0.5 ? 1 : 0) === p.label) correct++;
        }
        return correct / points.length;
    }
}

// ============================================
// Regularization Lab
// ============================================

class RegularizationLab {
    constructor() {
        this.trainCanvas = document.getElementById('reg-train-canvas');
        this.testCanvas = document.getElementById('reg-test-canvas');
        if (!this.trainCanvas || !this.testCanvas) return;
        
        this.trainCtx = this.trainCanvas.getContext('2d');
        this.testCtx = this.testCanvas.getContext('2d');
        
        this.trainData = [];
        this.testData = [];
        this.network = null;
        
        this.bindEvents();
        this.generateData();
    }
    
    bindEvents() {
        document.getElementById('reg-noise')?.addEventListener('input', (e) => {
            document.getElementById('reg-noise-value').textContent = e.target.value + '%';
        });
        
        document.getElementById('reg-l2')?.addEventListener('input', (e) => {
            document.getElementById('reg-l2-value').textContent = (e.target.value / 100).toFixed(2);
        });
        
        document.getElementById('reg-dropout')?.addEventListener('input', (e) => {
            document.getElementById('reg-dropout-value').textContent = e.target.value + '%';
        });
        
        document.getElementById('train-reg')?.addEventListener('click', () => this.train());
        document.getElementById('reset-reg')?.addEventListener('click', () => this.reset());
        document.getElementById('reg-dataset')?.addEventListener('change', () => this.generateData());
    }
    
    generateData() {
        const dataset = document.getElementById('reg-dataset')?.value || 'moons';
        const noise = (parseInt(document.getElementById('reg-noise')?.value || 20)) / 100;
        
        let generator;
        switch (dataset) {
            case 'circles': generator = DataGenerator.generateCircles; break;
            case 'spiral': generator = DataGenerator.generateSpiral; break;
            default: generator = DataGenerator.generateMoons;
        }
        
        this.trainData = generator(80, noise);
        this.testData = generator(40, noise);
        
        this.network = null;
        this.draw();
        this.updateMetrics();
    }
    
    train() {
        const l2 = parseInt(document.getElementById('reg-l2')?.value || 0) / 100;
        const dropout = parseInt(document.getElementById('reg-dropout')?.value || 0) / 100;
        
        this.network = new RegularizedNetwork(16, l2, dropout);
        this.network.train(this.trainData, 800, 0.3);
        
        this.draw();
        this.updateMetrics();
    }
    
    reset() {
        this.generateData();
    }
    
    updateMetrics() {
        const trainAcc = this.network ? this.network.accuracy(this.trainData) : 0;
        const testAcc = this.network ? this.network.accuracy(this.testData) : 0;
        const gap = trainAcc - testAcc;
        
        document.getElementById('reg-train-acc').textContent = this.network ? (trainAcc * 100).toFixed(1) + '%' : '—';
        document.getElementById('reg-test-acc').textContent = this.network ? (testAcc * 100).toFixed(1) + '%' : '—';
        
        const gapEl = document.getElementById('reg-gap');
        if (gapEl) {
            gapEl.textContent = this.network ? (gap * 100).toFixed(1) + '%' : '—';
            gapEl.style.color = gap > 0.15 ? '#e07a5f' : gap > 0.08 ? '#d4a855' : '#50b892';
        }
    }
    
    draw() {
        this.drawCanvas(this.trainCtx, this.trainCanvas, this.trainData);
        this.drawCanvas(this.testCtx, this.testCanvas, this.testData);
    }
    
    drawCanvas(ctx, canvas, points) {
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.fillStyle = '#0d0f12';
        ctx.fillRect(0, 0, w, h);
        
        // Draw decision boundary if network exists
        if (this.network) {
            const resolution = 4;
            for (let px = 0; px < w; px += resolution) {
                for (let py = 0; py < h; py += resolution) {
                    const x = (px / w) * 2 - 1;
                    const y = (py / h) * 2 - 1;
                    const { output } = this.network.forward(x, y, false);
                    
                    const alpha = 0.35;
                    const color = output > 0.5 ? [91, 155, 213] : [224, 122, 95];
                    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                    ctx.fillRect(px, py, resolution, resolution);
                }
            }
        }
        
        // Draw points
        for (const p of points) {
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
    }
}

// ============================================
// Learning Curves Lab
// ============================================

class LearningCurvesLab {
    constructor() {
        this.canvas = document.getElementById('curves-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.bindEvents();
        this.draw([]);
    }
    
    bindEvents() {
        document.getElementById('run-curves')?.addEventListener('click', () => this.runExperiment());
    }
    
    runExperiment() {
        const complexity = document.getElementById('curves-complexity')?.value || 'medium';
        
        let hiddenSize, l2;
        switch (complexity) {
            case 'low': hiddenSize = 2; l2 = 0.1; break;
            case 'high': hiddenSize = 32; l2 = 0; break;
            default: hiddenSize = 8; l2 = 0.01;
        }
        
        // Generate data
        const allData = DataGenerator.generateMoons(150, 0.2);
        const trainData = allData.slice(0, 100);
        const valData = allData.slice(100);
        
        const trainHistory = [];
        const valHistory = [];
        
        const network = new RegularizedNetwork(hiddenSize, l2, 0);
        
        // Train incrementally and record history
        for (let epoch = 0; epoch < 100; epoch++) {
            // Train for a few iterations
            for (let i = 0; i < 5; i++) {
                for (const p of trainData) {
                    const { hidden, output } = network.forward(p.x, p.y, true);
                    const error = output - p.label;
                    
                    for (let j = 0; j < hiddenSize; j++) {
                        network.w2[j][0] -= 0.3 * (error * hidden[j] + l2 * network.w2[j][0]);
                    }
                    network.b2[0] -= 0.3 * error;
                    
                    for (let j = 0; j < hiddenSize; j++) {
                        const z = network.w1[0][j] * p.x + network.w1[1][j] * p.y + network.b1[j];
                        const dRelu = z > 0 ? 1 : 0;
                        const dHidden = error * network.w2[j][0] * dRelu;
                        
                        network.w1[0][j] -= 0.3 * (dHidden * p.x + l2 * network.w1[0][j]);
                        network.w1[1][j] -= 0.3 * (dHidden * p.y + l2 * network.w1[1][j]);
                        network.b1[j] -= 0.3 * dHidden;
                    }
                }
            }
            
            trainHistory.push(1 - network.accuracy(trainData));
            valHistory.push(1 - network.accuracy(valData));
        }
        
        this.draw({ trainHistory, valHistory, complexity });
        this.updateInterpretation(complexity, trainHistory, valHistory);
    }
    
    updateInterpretation(complexity, trainHistory, valHistory) {
        const el = document.getElementById('curves-interpretation');
        if (!el) return;
        
        const finalTrain = trainHistory[trainHistory.length - 1];
        const finalVal = valHistory[valHistory.length - 1];
        const gap = finalVal - finalTrain;
        
        let message = '';
        switch (complexity) {
            case 'low':
                message = `<strong>High Bias (Underfitting):</strong> Both training (${(finalTrain * 100).toFixed(1)}%) and validation (${(finalVal * 100).toFixed(1)}%) errors are high. The model is too simple to capture the pattern. Solution: increase model complexity.`;
                break;
            case 'high':
                message = `<strong>High Variance (Overfitting):</strong> Training error (${(finalTrain * 100).toFixed(1)}%) is much lower than validation error (${(finalVal * 100).toFixed(1)}%). Gap: ${(gap * 100).toFixed(1)}%. The model memorizes training data but doesn't generalize. Solution: add regularization or get more data.`;
                break;
            default:
                message = `<strong>Good Fit:</strong> Training (${(finalTrain * 100).toFixed(1)}%) and validation (${(finalVal * 100).toFixed(1)}%) errors are both low with small gap (${(gap * 100).toFixed(1)}%). The model generalizes well.`;
        }
        
        el.innerHTML = message;
    }
    
    draw(data) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 50;
        
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        // Axes
        this.ctx.strokeStyle = '#2d333d';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, h - padding);
        this.ctx.lineTo(w - padding, h - padding);
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, h - padding);
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Epoch', w / 2, h - 10);
        this.ctx.save();
        this.ctx.translate(15, h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Error', 0, 0);
        this.ctx.restore();
        
        if (!data.trainHistory) return;
        
        const { trainHistory, valHistory } = data;
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        const maxError = Math.max(...trainHistory, ...valHistory, 0.5);
        
        // Draw training error
        this.ctx.beginPath();
        for (let i = 0; i < trainHistory.length; i++) {
            const x = padding + (i / trainHistory.length) * plotW;
            const y = h - padding - (trainHistory[i] / maxError) * plotH;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = '#5b9bd5';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw validation error
        this.ctx.beginPath();
        for (let i = 0; i < valHistory.length; i++) {
            const x = padding + (i / valHistory.length) * plotW;
            const y = h - padding - (valHistory[i] / maxError) * plotH;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = '#e07a5f';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Legend
        this.ctx.fillStyle = '#5b9bd5';
        this.ctx.fillRect(w - 120, 20, 15, 3);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Train Error', w - 100, 24);
        
        this.ctx.fillStyle = '#e07a5f';
        this.ctx.fillRect(w - 120, 35, 15, 3);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillText('Val Error', w - 100, 39);
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
            1: { correct: 'b', explanation: 'Regularization constrains model complexity to prevent overfitting—learning patterns that generalize rather than memorizing training data.' },
            2: { correct: 'b', explanation: 'High bias (underfitting) means the model is too simple—it can\'t even fit the training data well, so both training and test errors are high.' },
            3: { correct: 'b', explanation: 'L1 regularization can drive weights exactly to zero because its gradient is constant regardless of weight magnitude. L2 only shrinks weights proportionally.' },
            4: { correct: 'b', explanation: 'Dropout randomly zeros neurons during training (with probability p), forcing the network to not rely on any single feature and learn more robust representations.' },
            5: { correct: 'c', explanation: 'Increasing validation error while training error decreases is the classic sign of overfitting. Early stopping or adding regularization prevents further overfitting.' }
        };
        
        this.answers = {};
        this.bindEvents();
    }
    
    bindEvents() {
        this.container.querySelectorAll('.option input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.answers[e.target.name.replace('q', '')] = e.target.value;
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
            score === 5 ? 'Excellent! You understand generalization and regularization.' :
            score >= 3 ? 'Good progress. Review the bias-variance tradeoff.' :
            'Consider re-reading about overfitting and regularization techniques.';
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
    .bias-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .bias-card.high-bias { border-top: 3px solid var(--accent-blue); }
    .bias-card.high-variance { border-top: 3px solid var(--accent-coral); }
    
    .regularization-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .reg-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .reg-card h4 {
        color: var(--text-primary);
        font-size: 1rem;
        margin-bottom: var(--space-sm);
    }
    
    .reg-formula {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent-gold);
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-md);
    }
    
    .reg-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
    }
    
    .reg-effect {
        padding-top: var(--space-sm);
        border-top: 1px solid var(--surface-2);
    }
    
    .reg-lab {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .reg-controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        align-items: flex-end;
    }
    
    .reg-visualization {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
        flex-wrap: wrap;
    }
    
    .reg-canvas-container {
        text-align: center;
    }
    
    .reg-canvas-container h4 {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
    }
    
    .reg-metrics {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
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
    
    .curves-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .curves-controls {
        display: flex;
        gap: var(--space-lg);
        align-items: flex-end;
    }
    
    .curves-visualization {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .curves-interpretation {
        padding: var(--space-lg);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        color: var(--text-secondary);
        max-width: 600px;
        text-align: center;
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
    new RegularizationLab();
    new LearningCurvesLab();
    new ModuleQuiz('quiz-container');
});

