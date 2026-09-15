/**
 * Module 2.2: Neural Networks as Function Approximators
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
// Function Approximation Lab
// ============================================

class FunctionApproximationLab {
    constructor() {
        this.canvas = document.getElementById('approx-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.network = null;
        this.isTraining = false;
        this.epoch = 0;
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        document.getElementById('train-approx')?.addEventListener('click', () => this.train());
        document.getElementById('reset-approx')?.addEventListener('click', () => this.reset());
        
        document.getElementById('approx-neurons')?.addEventListener('input', (e) => {
            document.getElementById('approx-neurons-value').textContent = e.target.value;
        });
    }
    
    getTargetFunction() {
        const type = document.getElementById('target-function').value;
        switch (type) {
            case 'sine': return x => Math.sin(x * Math.PI * 2);
            case 'square': return x => Math.sign(Math.sin(x * Math.PI * 2));
            case 'gaussian': return x => Math.exp(-Math.pow((x - 0.5) * 4, 2));
            case 'step': return x => x > 0.5 ? 1 : 0;
            case 'polynomial': return x => 4 * Math.pow(x - 0.5, 3) + 0.5;
            default: return x => Math.sin(x * Math.PI * 2);
        }
    }
    
    getActivation() {
        const type = document.getElementById('approx-activation').value;
        switch (type) {
            case 'relu': return { fn: x => Math.max(0, x), deriv: x => x > 0 ? 1 : 0 };
            case 'tanh': return { fn: x => Math.tanh(x), deriv: x => 1 - Math.pow(Math.tanh(x), 2) };
            case 'sigmoid': return { fn: x => 1 / (1 + Math.exp(-x)), deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); }};
            default: return { fn: x => Math.max(0, x), deriv: x => x > 0 ? 1 : 0 };
        }
    }
    
    createNetwork(numHidden) {
        return {
            w1: Array(numHidden).fill(0).map(() => (Math.random() - 0.5) * 2),
            b1: Array(numHidden).fill(0).map(() => (Math.random() - 0.5) * 0.5),
            w2: Array(numHidden).fill(0).map(() => (Math.random() - 0.5) * 2),
            b2: (Math.random() - 0.5) * 0.5
        };
    }
    
    forward(x, network, activation) {
        const hidden = network.w1.map((w, i) => activation.fn(w * x + network.b1[i]));
        let output = network.b2;
        for (let i = 0; i < hidden.length; i++) {
            output += network.w2[i] * hidden[i];
        }
        return { hidden, output };
    }
    
    train() {
        const numHidden = parseInt(document.getElementById('approx-neurons').value);
        const activation = this.getActivation();
        const targetFn = this.getTargetFunction();
        
        this.network = this.createNetwork(numHidden);
        this.epoch = 0;
        this.isTraining = true;
        
        // Generate training data
        const trainX = Array(100).fill(0).map((_, i) => i / 99);
        const trainY = trainX.map(x => targetFn(x));
        
        const lr = 0.1;
        
        const trainStep = () => {
            if (!this.isTraining) return;
            
            // Multiple epochs per animation frame
            for (let e = 0; e < 50; e++) {
                for (let i = 0; i < trainX.length; i++) {
                    const x = trainX[i];
                    const y = trainY[i];
                    
                    // Forward
                    const { hidden, output } = this.forward(x, this.network, activation);
                    const error = output - y;
                    
                    // Backward
                    const dOutput = error;
                    
                    for (let j = 0; j < numHidden; j++) {
                        const z = this.network.w1[j] * x + this.network.b1[j];
                        const dHidden = dOutput * this.network.w2[j] * activation.deriv(z);
                        
                        this.network.w2[j] -= lr * dOutput * hidden[j] / trainX.length;
                        this.network.w1[j] -= lr * dHidden * x / trainX.length;
                        this.network.b1[j] -= lr * dHidden / trainX.length;
                    }
                    this.network.b2 -= lr * dOutput / trainX.length;
                }
                this.epoch++;
            }
            
            // Calculate loss
            let totalLoss = 0;
            for (let i = 0; i < trainX.length; i++) {
                const { output } = this.forward(trainX[i], this.network, activation);
                totalLoss += Math.pow(output - trainY[i], 2);
            }
            const loss = totalLoss / trainX.length;
            
            this.draw();
            this.updateInfo(loss, numHidden);
            
            if (this.epoch < 5000 && loss > 0.001) {
                requestAnimationFrame(trainStep);
            } else {
                this.isTraining = false;
            }
        };
        
        trainStep();
    }
    
    reset() {
        this.isTraining = false;
        this.network = null;
        this.epoch = 0;
        this.draw();
        this.updateInfo(null, null);
    }
    
    updateInfo(loss, numHidden) {
        document.getElementById('approx-loss').textContent = loss !== null ? loss.toFixed(6) : '—';
        document.getElementById('approx-epoch').textContent = this.epoch;
        document.getElementById('approx-params').textContent = numHidden !== null ? (numHidden * 3 + 1) : '—';
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw axes
        this.ctx.strokeStyle = '#2d333d';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, h - padding);
        this.ctx.lineTo(w - padding, h - padding);
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, h - padding);
        this.ctx.stroke();
        
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        
        // Draw target function
        const targetFn = this.getTargetFunction();
        this.ctx.beginPath();
        for (let px = 0; px <= plotW; px++) {
            const x = px / plotW;
            const y = targetFn(x);
            const canvasX = padding + px;
            const canvasY = h - padding - ((y + 1) / 2) * plotH;
            
            if (px === 0) this.ctx.moveTo(canvasX, canvasY);
            else this.ctx.lineTo(canvasX, canvasY);
        }
        this.ctx.strokeStyle = '#5b9bd5';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw network approximation
        if (this.network) {
            const activation = this.getActivation();
            this.ctx.beginPath();
            for (let px = 0; px <= plotW; px++) {
                const x = px / plotW;
                const { output } = this.forward(x, this.network, activation);
                const canvasX = padding + px;
                const canvasY = h - padding - ((output + 1) / 2) * plotH;
                
                if (px === 0) this.ctx.moveTo(canvasX, canvasY);
                else this.ctx.lineTo(canvasX, canvasY);
            }
            this.ctx.strokeStyle = '#d4a855';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Legend
        this.ctx.fillStyle = '#5b9bd5';
        this.ctx.fillRect(w - 120, 15, 15, 3);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.fillText('Target', w - 100, 20);
        
        if (this.network) {
            this.ctx.fillStyle = '#d4a855';
            this.ctx.fillRect(w - 120, 30, 15, 3);
            this.ctx.fillStyle = '#6b7280';
            this.ctx.fillText('Network', w - 100, 35);
        }
    }
}

// ============================================
// Forward Propagation Visualizer
// ============================================

class ForwardPropVisualizer {
    constructor() {
        this.container = document.getElementById('forward-viz');
        if (!this.container) return;
        
        // Fixed network weights for demonstration
        this.network = {
            w1: [[0.5, -0.3], [0.8, 0.2], [-0.4, 0.6]],
            b1: [0.1, -0.1, 0.2],
            w2: [[0.4, -0.5, 0.3]],
            b2: [0.1]
        };
        
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        document.getElementById('input-x1')?.addEventListener('input', (e) => {
            document.getElementById('x1-value').textContent = (e.target.value / 100).toFixed(2);
            this.render();
        });
        
        document.getElementById('input-x2')?.addEventListener('input', (e) => {
            document.getElementById('x2-value').textContent = (e.target.value / 100).toFixed(2);
            this.render();
        });
    }
    
    relu(x) { return Math.max(0, x); }
    sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
    
    render() {
        const x1 = parseInt(document.getElementById('input-x1')?.value || 50) / 100;
        const x2 = parseInt(document.getElementById('input-x2')?.value || -30) / 100;
        
        // Forward pass
        const z1 = [];
        const h1 = [];
        for (let i = 0; i < 3; i++) {
            z1[i] = this.network.w1[i][0] * x1 + this.network.w1[i][1] * x2 + this.network.b1[i];
            h1[i] = this.relu(z1[i]);
        }
        
        let z2 = this.network.b2[0];
        for (let i = 0; i < 3; i++) {
            z2 += this.network.w2[0][i] * h1[i];
        }
        const output = this.sigmoid(z2);
        
        this.container.innerHTML = `
            <div class="forward-flow">
                <div class="flow-layer">
                    <div class="layer-title">Input</div>
                    <div class="flow-neurons">
                        <div class="flow-neuron input-n">
                            <span class="neuron-label">x₁</span>
                            <span class="neuron-value">${x1.toFixed(2)}</span>
                        </div>
                        <div class="flow-neuron input-n">
                            <span class="neuron-label">x₂</span>
                            <span class="neuron-value">${x2.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flow-arrow">→</div>
                
                <div class="flow-layer">
                    <div class="layer-title">Linear + ReLU</div>
                    <div class="flow-neurons">
                        ${h1.map((h, i) => `
                            <div class="flow-neuron hidden-n ${h > 0 ? 'active' : ''}">
                                <span class="neuron-label">h${i+1}</span>
                                <span class="neuron-detail">z=${z1[i].toFixed(2)}</span>
                                <span class="neuron-value">${h.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flow-arrow">→</div>
                
                <div class="flow-layer">
                    <div class="layer-title">Linear + Sigmoid</div>
                    <div class="flow-neurons">
                        <div class="flow-neuron output-n">
                            <span class="neuron-label">y</span>
                            <span class="neuron-detail">z=${z2.toFixed(2)}</span>
                            <span class="neuron-value">${output.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="forward-interpretation">
                <strong>Interpretation:</strong> 
                ${output > 0.5 ? 
                    `Output > 0.5, so classified as <span class="class-pos">Class 1</span> with ${(output * 100).toFixed(1)}% confidence.` :
                    `Output < 0.5, so classified as <span class="class-neg">Class 0</span> with ${((1 - output) * 100).toFixed(1)}% confidence.`
                }
            </div>
        `;
    }
}

// ============================================
// Activation Explorer
// ============================================

class ActivationExplorer {
    constructor() {
        this.canvas = document.getElementById('activation-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.currentActivation = 'relu';
        
        this.activations = {
            relu: { fn: x => Math.max(0, x), name: 'ReLU', props: ['Range: [0, ∞)', 'Zero-centered: No', 'Gradient: 0 or 1', 'Issue: Dead neurons (gradient = 0 for x < 0)'] },
            sigmoid: { fn: x => 1 / (1 + Math.exp(-x)), name: 'Sigmoid', props: ['Range: (0, 1)', 'Zero-centered: No', 'Gradient: smooth, max at x=0', 'Issue: Vanishing gradients at extremes'] },
            tanh: { fn: x => Math.tanh(x), name: 'Tanh', props: ['Range: (-1, 1)', 'Zero-centered: Yes', 'Gradient: smooth, max at x=0', 'Issue: Vanishing gradients at extremes'] },
            leaky: { fn: x => x > 0 ? x : 0.01 * x, name: 'Leaky ReLU', props: ['Range: (-∞, ∞)', 'Zero-centered: No', 'Gradient: 0.01 or 1', 'Benefit: No dead neurons'] },
            elu: { fn: x => x > 0 ? x : Math.exp(x) - 1, name: 'ELU', props: ['Range: (-1, ∞)', 'Zero-centered: Approximately', 'Gradient: smooth for x < 0', 'Benefit: Smooth, no dead neurons'] }
        };
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        document.querySelectorAll('.activation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.activation-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentActivation = btn.dataset.activation;
                this.draw();
                this.updateProps();
            });
        });
    }
    
    updateProps() {
        const act = this.activations[this.currentActivation];
        const propsEl = document.getElementById('activation-props');
        if (propsEl) {
            propsEl.innerHTML = `
                <h4>${act.name} Properties</h4>
                <ul>${act.props.map(p => `<li>${p}</li>`).join('')}</ul>
            `;
        }
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;
        const act = this.activations[this.currentActivation];
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        const centerX = padding + plotW / 2;
        const centerY = padding + plotH / 2;
        
        // Draw axes
        this.ctx.strokeStyle = '#2d333d';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, centerY);
        this.ctx.lineTo(w - padding, centerY);
        this.ctx.moveTo(centerX, padding);
        this.ctx.lineTo(centerX, h - padding);
        this.ctx.stroke();
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i = -4; i <= 4; i++) {
            const x = centerX + (i / 4) * (plotW / 2);
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, h - padding);
            this.ctx.stroke();
            
            const y = centerY - (i / 4) * (plotH / 2);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(w - padding, y);
            this.ctx.stroke();
        }
        
        // Draw function
        this.ctx.beginPath();
        for (let px = 0; px <= plotW; px++) {
            const x = ((px / plotW) - 0.5) * 8; // Range: -4 to 4
            const y = act.fn(x);
            const clampedY = Math.max(-2, Math.min(2, y));
            
            const canvasX = padding + px;
            const canvasY = centerY - (clampedY / 2) * (plotH / 2);
            
            if (px === 0) this.ctx.moveTo(canvasX, canvasY);
            else this.ctx.lineTo(canvasX, canvasY);
        }
        this.ctx.strokeStyle = '#d4a855';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('-4', padding + plotW * 0.0, centerY + 20);
        this.ctx.fillText('0', centerX, centerY + 20);
        this.ctx.fillText('4', w - padding, centerY + 20);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText('2', centerX - 10, padding + 5);
        this.ctx.fillText('0', centerX - 10, centerY + 4);
        this.ctx.fillText('-2', centerX - 10, h - padding);
        
        // Title
        this.ctx.fillStyle = '#d4a855';
        this.ctx.font = '14px "DM Sans"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`f(x) = ${act.name}(x)`, padding + 10, padding + 20);
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
            1: { correct: 'b', explanation: 'The Universal Approximation Theorem guarantees that a network with enough neurons can approximate any continuous function. It says nothing about training convergence, generalization, or depth.' },
            2: { correct: 'b', explanation: 'Without non-linear activations, composing linear transformations (matrix multiplications) just yields another linear transformation. Non-linearity is essential for representing complex patterns.' },
            3: { correct: 'b', explanation: 'ReLU outputs 0 for negative inputs, which means gradients are 0. If a neuron consistently receives negative inputs, it never updates and becomes "dead."' },
            4: { correct: 'b', explanation: 'Forward propagation is the process of computing outputs from inputs by passing data through each layer, applying weights, biases, and activations sequentially.' },
            5: { correct: 'c', explanation: 'A fully-connected layer has one weight for each input-output pair (100×50=5000) plus one bias per output (50), totaling 5050 parameters.' }
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
            score === 5 ? 'Excellent! You understand neural network fundamentals.' :
            score >= 3 ? 'Good progress. Review the function approximation concepts.' :
            'Consider re-reading about activations and forward propagation.';
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
    .network-anatomy {
        margin: var(--space-xl) 0;
    }
    
    .network-diagram {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--space-xl);
        padding: var(--space-xl);
        background: var(--surface-1);
        border-radius: var(--radius-lg);
    }
    
    .layer-column {
        text-align: center;
    }
    
    .layer-label {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-bottom: var(--space-md);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .neurons {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }
    
    .neuron {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-mono);
        font-size: 0.8rem;
    }
    
    .input-neuron { background: var(--accent-blue); color: white; }
    .hidden-neuron { background: var(--surface-3); color: var(--text-secondary); border: 2px solid var(--accent-gold-dim); }
    .output-neuron { background: var(--accent-gold); color: var(--bg-primary); }
    
    .connections {
        width: 40px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }
    
    .theorem-box {
        background: linear-gradient(135deg, var(--surface-1), var(--surface-2));
        border: 1px solid var(--accent-gold-dim);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        margin: var(--space-xl) 0;
    }
    
    .theorem-label {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--accent-gold);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: var(--space-md);
    }
    
    .theorem-statement {
        font-family: var(--font-display);
        font-size: 1.05rem;
        color: var(--text-primary);
        font-style: italic;
        line-height: 1.7;
    }
    
    .activation-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .activation-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .activation-card h4 {
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .activation-formula {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent-gold);
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-md);
    }
    
    .activation-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
    }
    
    .forward-prop-steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin: var(--space-xl) 0;
    }
    
    .prop-step {
        display: flex;
        gap: var(--space-lg);
        align-items: flex-start;
        padding: var(--space-md);
        background: var(--surface-1);
        border-radius: var(--radius-md);
    }
    
    .step-number {
        width: 30px;
        height: 30px;
        background: var(--accent-gold);
        color: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
    }
    
    .step-content h4 {
        font-size: 0.95rem;
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .step-content p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-family: var(--font-mono);
    }
    
    .approx-controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        align-items: flex-end;
        margin-bottom: var(--space-xl);
    }
    
    .approx-visualization {
        display: flex;
        justify-content: center;
        margin-bottom: var(--space-lg);
    }
    
    #approx-canvas {
        border-radius: var(--radius-md);
    }
    
    .approx-info {
        display: flex;
        justify-content: center;
        gap: var(--space-2xl);
    }
    
    .forward-flow {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
        margin-bottom: var(--space-lg);
    }
    
    .flow-layer {
        text-align: center;
    }
    
    .layer-title {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-bottom: var(--space-sm);
    }
    
    .flow-neurons {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }
    
    .flow-neuron {
        background: var(--surface-2);
        border: 2px solid var(--surface-3);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        min-width: 100px;
    }
    
    .flow-neuron.input-n { border-color: var(--accent-blue); }
    .flow-neuron.hidden-n { border-color: var(--surface-3); }
    .flow-neuron.hidden-n.active { border-color: var(--accent-gold); background: var(--accent-gold-glow); }
    .flow-neuron.output-n { border-color: var(--accent-gold); }
    
    .neuron-label {
        display: block;
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-primary);
    }
    
    .neuron-detail {
        display: block;
        font-size: 0.65rem;
        color: var(--text-tertiary);
    }
    
    .neuron-value {
        display: block;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--accent-gold);
    }
    
    .flow-arrow {
        font-size: 1.5rem;
        color: var(--accent-gold-dim);
    }
    
    .forward-interpretation {
        text-align: center;
        padding: var(--space-md);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .class-pos { color: var(--accent-blue); font-weight: 600; }
    .class-neg { color: var(--accent-coral); font-weight: 600; }
    
    .activation-explorer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .activation-chart-container {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .activation-selector {
        display: flex;
        gap: var(--space-sm);
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .activation-btn {
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-2);
        border: 1px solid var(--surface-3);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .activation-btn:hover {
        background: var(--surface-3);
    }
    
    .activation-btn.active {
        background: var(--accent-gold-glow);
        border-color: var(--accent-gold);
        color: var(--accent-gold);
    }
    
    .activation-properties {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        width: 100%;
        max-width: 400px;
    }
    
    .activation-properties h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .activation-properties ul {
        list-style: none;
    }
    
    .activation-properties li {
        padding: var(--space-xs) 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        border-bottom: 1px solid var(--surface-2);
    }
    
    .activation-properties li:last-child {
        border-bottom: none;
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
    new FunctionApproximationLab();
    new ForwardPropVisualizer();
    new ActivationExplorer();
    new ModuleQuiz('quiz-container');
});

