/**
 * Module 2.3: Backpropagation & Learning
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
// Gradient Flow Visualizer
// ============================================

class GradientFlowLab {
    constructor() {
        this.container = document.getElementById('flow-network');
        this.explanation = document.getElementById('flow-explanation');
        if (!this.container) return;
        
        this.state = 'initial';
        this.network = this.initNetwork();
        this.target = 1;
        this.input = 0.5;
        
        this.render();
        this.bindEvents();
    }
    
    initNetwork() {
        return {
            w1: 0.5,
            b1: 0.1,
            w2: 0.8,
            b2: -0.2,
            // Computed values
            z1: 0, h1: 0, z2: 0, y: 0, loss: 0,
            // Gradients
            dL_dy: 0, dL_dz2: 0, dL_dw2: 0, dL_db2: 0,
            dL_dh1: 0, dL_dz1: 0, dL_dw1: 0, dL_db1: 0
        };
    }
    
    sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
    sigmoidDeriv(s) { return s * (1 - s); }
    
    forward() {
        const n = this.network;
        n.z1 = n.w1 * this.input + n.b1;
        n.h1 = this.sigmoid(n.z1);
        n.z2 = n.w2 * n.h1 + n.b2;
        n.y = this.sigmoid(n.z2);
        n.loss = Math.pow(n.y - this.target, 2);
    }
    
    backward() {
        const n = this.network;
        // Output layer
        n.dL_dy = 2 * (n.y - this.target);
        n.dL_dz2 = n.dL_dy * this.sigmoidDeriv(n.y);
        n.dL_dw2 = n.dL_dz2 * n.h1;
        n.dL_db2 = n.dL_dz2;
        
        // Hidden layer
        n.dL_dh1 = n.dL_dz2 * n.w2;
        n.dL_dz1 = n.dL_dh1 * this.sigmoidDeriv(n.h1);
        n.dL_dw1 = n.dL_dz1 * this.input;
        n.dL_db1 = n.dL_dz1;
    }
    
    update() {
        const lr = 0.5;
        const n = this.network;
        n.w1 -= lr * n.dL_dw1;
        n.b1 -= lr * n.dL_db1;
        n.w2 -= lr * n.dL_dw2;
        n.b2 -= lr * n.dL_db2;
    }
    
    bindEvents() {
        document.getElementById('forward-step')?.addEventListener('click', () => {
            this.forward();
            this.state = 'forward';
            this.render();
            this.explanation.innerHTML = `
                <strong>Forward Pass Complete</strong><br>
                Input x = ${this.input.toFixed(3)}<br>
                z₁ = w₁·x + b₁ = ${this.network.z1.toFixed(3)}<br>
                h₁ = σ(z₁) = ${this.network.h1.toFixed(3)}<br>
                z₂ = w₂·h₁ + b₂ = ${this.network.z2.toFixed(3)}<br>
                ŷ = σ(z₂) = ${this.network.y.toFixed(3)}<br>
                Loss = (ŷ - target)² = ${this.network.loss.toFixed(4)}
            `;
        });
        
        document.getElementById('backward-step')?.addEventListener('click', () => {
            if (this.state !== 'forward' && this.state !== 'backward') {
                alert('Run forward pass first');
                return;
            }
            this.backward();
            this.state = 'backward';
            this.render();
            this.explanation.innerHTML = `
                <strong>Backward Pass Complete (Chain Rule)</strong><br>
                ∂L/∂ŷ = 2(ŷ - target) = ${this.network.dL_dy.toFixed(4)}<br>
                ∂L/∂z₂ = ∂L/∂ŷ · σ'(z₂) = ${this.network.dL_dz2.toFixed(4)}<br>
                ∂L/∂w₂ = ∂L/∂z₂ · h₁ = ${this.network.dL_dw2.toFixed(4)}<br>
                ∂L/∂h₁ = ∂L/∂z₂ · w₂ = ${this.network.dL_dh1.toFixed(4)}<br>
                ∂L/∂w₁ = ∂L/∂z₁ · x = ${this.network.dL_dw1.toFixed(4)}
            `;
        });
        
        document.getElementById('update-step')?.addEventListener('click', () => {
            if (this.state !== 'backward') {
                alert('Run backward pass first');
                return;
            }
            const oldW1 = this.network.w1;
            const oldW2 = this.network.w2;
            this.update();
            this.state = 'updated';
            this.render();
            this.explanation.innerHTML = `
                <strong>Weights Updated (η = 0.5)</strong><br>
                w₁: ${oldW1.toFixed(4)} → ${this.network.w1.toFixed(4)}<br>
                w₂: ${oldW2.toFixed(4)} → ${this.network.w2.toFixed(4)}<br>
                <em>Click Forward Pass to see the new prediction!</em>
            `;
        });
        
        document.getElementById('reset-flow')?.addEventListener('click', () => {
            this.network = this.initNetwork();
            this.state = 'initial';
            this.render();
            this.explanation.textContent = 'Click "Forward Pass" to begin.';
        });
    }
    
    render() {
        const n = this.network;
        const showGrad = this.state === 'backward' || this.state === 'updated';
        
        this.container.innerHTML = `
            <div class="flow-diagram">
                <div class="flow-node-group">
                    <div class="flow-node input-node">
                        <div class="node-label">Input</div>
                        <div class="node-value">x = ${this.input.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="flow-connection">
                    <div class="connection-label">w₁ = ${n.w1.toFixed(3)}</div>
                    ${showGrad ? `<div class="connection-grad">∇ = ${n.dL_dw1.toFixed(4)}</div>` : ''}
                </div>
                
                <div class="flow-node-group">
                    <div class="flow-node hidden-node">
                        <div class="node-label">Hidden</div>
                        <div class="node-value">h₁ = ${n.h1.toFixed(3)}</div>
                        ${showGrad ? `<div class="node-grad">∂L/∂h₁ = ${n.dL_dh1.toFixed(4)}</div>` : ''}
                    </div>
                </div>
                
                <div class="flow-connection">
                    <div class="connection-label">w₂ = ${n.w2.toFixed(3)}</div>
                    ${showGrad ? `<div class="connection-grad">∇ = ${n.dL_dw2.toFixed(4)}</div>` : ''}
                </div>
                
                <div class="flow-node-group">
                    <div class="flow-node output-node">
                        <div class="node-label">Output</div>
                        <div class="node-value">ŷ = ${n.y.toFixed(3)}</div>
                        ${showGrad ? `<div class="node-grad">∂L/∂ŷ = ${n.dL_dy.toFixed(4)}</div>` : ''}
                    </div>
                </div>
                
                <div class="flow-connection loss-connection">
                    <div class="connection-arrow">→</div>
                </div>
                
                <div class="flow-node-group">
                    <div class="flow-node loss-node">
                        <div class="node-label">Loss</div>
                        <div class="node-value">L = ${n.loss.toFixed(4)}</div>
                        <div class="node-target">target = ${this.target}</div>
                    </div>
                </div>
            </div>
            
            ${showGrad ? `
                <div class="gradient-flow-indicator">
                    <div class="gfi-arrow">← Gradients Flow Backward ←</div>
                </div>
            ` : ''}
        `;
    }
}

// ============================================
// Training Dynamics Lab
// ============================================

class TrainingDynamicsLab {
    constructor() {
        this.canvas = document.getElementById('training-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.isTraining = false;
        this.epoch = 0;
        this.lossHistory = [];
        this.accHistory = [];
        
        this.data = this.generateData();
        this.network = this.initNetwork();
        
        this.bindEvents();
        this.draw();
    }
    
    generateData() {
        const data = [];
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const label = (x * x + y * y < 0.5) ? 1 : 0;
            data.push({ x, y, label });
        }
        return data;
    }
    
    initNetwork() {
        return {
            w1: Array(8).fill(0).map(() => [(Math.random() - 0.5), (Math.random() - 0.5)]),
            b1: Array(8).fill(0).map(() => Math.random() - 0.5),
            w2: Array(8).fill(0).map(() => (Math.random() - 0.5)),
            b2: 0
        };
    }
    
    forward(x, y) {
        const hidden = [];
        for (let i = 0; i < 8; i++) {
            const z = this.network.w1[i][0] * x + this.network.w1[i][1] * y + this.network.b1[i];
            hidden.push(Math.max(0, z)); // ReLU
        }
        let z2 = this.network.b2;
        for (let i = 0; i < 8; i++) {
            z2 += this.network.w2[i] * hidden[i];
        }
        return { hidden, output: 1 / (1 + Math.exp(-z2)) };
    }
    
    trainStep() {
        const lr = parseInt(document.getElementById('bp-lr')?.value || 30) / 100;
        
        for (const p of this.data) {
            // Forward
            const { hidden, output } = this.forward(p.x, p.y);
            const error = output - p.label;
            
            // Backward
            for (let i = 0; i < 8; i++) {
                const z = this.network.w1[i][0] * p.x + this.network.w1[i][1] * p.y + this.network.b1[i];
                const dRelu = z > 0 ? 1 : 0;
                const dHidden = error * this.network.w2[i] * dRelu;
                
                this.network.w2[i] -= lr * error * hidden[i];
                this.network.w1[i][0] -= lr * dHidden * p.x;
                this.network.w1[i][1] -= lr * dHidden * p.y;
                this.network.b1[i] -= lr * dHidden;
            }
            this.network.b2 -= lr * error;
        }
        
        this.epoch++;
        this.computeMetrics();
    }
    
    computeMetrics() {
        let totalLoss = 0;
        let correct = 0;
        
        for (const p of this.data) {
            const { output } = this.forward(p.x, p.y);
            totalLoss += Math.pow(output - p.label, 2);
            if ((output > 0.5 ? 1 : 0) === p.label) correct++;
        }
        
        const loss = totalLoss / this.data.length;
        const acc = correct / this.data.length;
        
        this.lossHistory.push(loss);
        this.accHistory.push(acc);
        
        document.getElementById('train-epoch').textContent = this.epoch;
        document.getElementById('train-loss').textContent = loss.toFixed(4);
        document.getElementById('train-acc').textContent = (acc * 100).toFixed(1) + '%';
    }
    
    bindEvents() {
        document.getElementById('bp-lr')?.addEventListener('input', (e) => {
            document.getElementById('bp-lr-value').textContent = (e.target.value / 100).toFixed(2);
        });
        
        document.getElementById('start-training')?.addEventListener('click', () => {
            if (this.isTraining) return;
            this.isTraining = true;
            this.train();
        });
        
        document.getElementById('stop-training')?.addEventListener('click', () => {
            this.isTraining = false;
        });
        
        document.getElementById('reset-training')?.addEventListener('click', () => {
            this.isTraining = false;
            this.epoch = 0;
            this.lossHistory = [];
            this.accHistory = [];
            this.network = this.initNetwork();
            this.data = this.generateData();
            document.getElementById('train-epoch').textContent = '0';
            document.getElementById('train-loss').textContent = '—';
            document.getElementById('train-acc').textContent = '—';
            this.draw();
        });
    }
    
    train() {
        if (!this.isTraining) return;
        
        for (let i = 0; i < 10; i++) {
            this.trainStep();
        }
        
        this.draw();
        
        if (this.epoch < 500) {
            requestAnimationFrame(() => this.train());
        } else {
            this.isTraining = false;
        }
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 40;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw boundary
        const plotSize = h - 2 * padding;
        const resolution = 4;
        
        for (let px = 0; px <= plotSize; px += resolution) {
            for (let py = 0; py <= plotSize; py += resolution) {
                const x = (px / plotSize) * 2 - 1;
                const y = (py / plotSize) * 2 - 1;
                const { output } = this.forward(x, y);
                
                const alpha = 0.3;
                const color = output > 0.5 ? [91, 155, 213] : [224, 122, 95];
                this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                this.ctx.fillRect(padding + px, padding + py, resolution, resolution);
            }
        }
        
        // Draw data points
        for (const p of this.data) {
            const px = padding + ((p.x + 1) / 2) * plotSize;
            const py = padding + ((p.y + 1) / 2) * plotSize;
            
            this.ctx.beginPath();
            this.ctx.arc(px, py, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = p.label === 1 ? '#5b9bd5' : '#e07a5f';
            this.ctx.fill();
        }
        
        // Draw loss curve
        const lossW = w - 2 * padding - plotSize - 40;
        const lossH = (h - 2 * padding) / 2 - 20;
        const lossX = padding + plotSize + 40;
        
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '10px "DM Sans"';
        this.ctx.fillText('Loss', lossX, padding);
        
        if (this.lossHistory.length > 1) {
            const maxLoss = Math.max(...this.lossHistory.slice(0, 50)) || 1;
            this.ctx.beginPath();
            for (let i = 0; i < this.lossHistory.length; i++) {
                const x = lossX + (i / this.lossHistory.length) * lossW;
                const y = padding + 10 + (1 - this.lossHistory[i] / maxLoss) * lossH;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.strokeStyle = '#e07a5f';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Draw accuracy curve
        this.ctx.fillText('Accuracy', lossX, padding + lossH + 40);
        
        if (this.accHistory.length > 1) {
            this.ctx.beginPath();
            for (let i = 0; i < this.accHistory.length; i++) {
                const x = lossX + (i / this.accHistory.length) * lossW;
                const y = padding + lossH + 50 + (1 - this.accHistory[i]) * lossH;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.strokeStyle = '#50b892';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
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
            1: { correct: 'b', explanation: 'Backpropagation uses the chain rule to efficiently compute gradients by decomposing the derivative of the loss into products of local derivatives.' },
            2: { correct: 'b', explanation: 'Vanishing gradients occur when gradients shrink multiplicatively through many layers, often because activations like sigmoid saturate at extremes where their derivatives are near zero.' },
            3: { correct: 'c', explanation: 'After computing gradients in the backward pass, the next step is to update parameters using those gradients (e.g., θ = θ - η∇L).' },
            4: { correct: 'b', explanation: 'Residual connections add the input directly to the output of a block, creating a direct gradient path that bypasses intervening layers, preventing gradients from vanishing.' },
            5: { correct: 'b', explanation: 'Gradient clipping caps the magnitude of gradients to prevent exploding gradients that can cause training instability or NaN values.' }
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
            score === 5 ? 'Excellent! You understand backpropagation well.' :
            score >= 3 ? 'Good progress. Review gradient flow concepts.' :
            'Consider re-reading about the chain rule and gradient problems.';
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
    .backprop-diagram {
        margin: var(--space-xl) 0;
        background: var(--surface-1);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .bp-step {
        margin-bottom: var(--space-lg);
    }
    
    .bp-step h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .bp-step p {
        font-size: 0.85rem;
        color: var(--text-tertiary);
        margin-top: var(--space-sm);
    }
    
    .bp-flow {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
        padding: var(--space-md);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
    }
    
    .bp-flow.reverse { background: rgba(212, 168, 85, 0.1); }
    
    .bp-node {
        padding: var(--space-xs) var(--space-sm);
        background: var(--surface-2);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .bp-node.loss {
        background: var(--accent-coral);
        color: white;
    }
    
    .bp-arrow {
        color: var(--text-tertiary);
    }
    
    .training-loop {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin: var(--space-xl) 0;
    }
    
    .loop-step {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--accent-gold-dim);
    }
    
    .loop-number {
        width: 28px;
        height: 28px;
        background: var(--accent-gold);
        color: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.85rem;
        flex-shrink: 0;
    }
    
    .loop-content h4 {
        color: var(--text-primary);
        font-size: 0.95rem;
        margin-bottom: var(--space-xs);
    }
    
    .loop-content p {
        color: var(--text-secondary);
        font-size: 0.85rem;
    }
    
    .gradient-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .gradient-card.vanishing { border-top: 3px solid var(--accent-blue); }
    .gradient-card.exploding { border-top: 3px solid var(--accent-coral); }
    
    .flow-lab {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .flow-diagram {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
        padding: var(--space-lg);
    }
    
    .flow-node-group {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .flow-node {
        background: var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        min-width: 100px;
        text-align: center;
    }
    
    .flow-node.input-node { border: 2px solid var(--accent-blue); }
    .flow-node.hidden-node { border: 2px solid var(--accent-gold-dim); }
    .flow-node.output-node { border: 2px solid var(--accent-gold); }
    .flow-node.loss-node { border: 2px solid var(--accent-coral); background: rgba(224, 122, 95, 0.1); }
    
    .node-label {
        font-size: 0.7rem;
        color: var(--text-tertiary);
        text-transform: uppercase;
    }
    
    .node-value {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--text-primary);
        margin-top: var(--space-xs);
    }
    
    .node-grad {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--accent-gold);
        margin-top: var(--space-xs);
    }
    
    .node-target {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-top: var(--space-xs);
    }
    
    .flow-connection {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
    }
    
    .connection-label {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .connection-grad {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--accent-gold);
    }
    
    .connection-arrow {
        font-size: 1.5rem;
        color: var(--text-tertiary);
    }
    
    .gradient-flow-indicator {
        text-align: center;
        padding: var(--space-sm);
        background: rgba(212, 168, 85, 0.1);
        border-radius: var(--radius-md);
    }
    
    .gfi-arrow {
        color: var(--accent-gold);
        font-weight: 600;
    }
    
    .flow-controls {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
    }
    
    .flow-explanation {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.8;
    }
    
    .training-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    #training-canvas {
        border-radius: var(--radius-md);
    }
    
    .training-controls {
        display: flex;
        gap: var(--space-xl);
        align-items: flex-end;
        flex-wrap: wrap;
    }
    
    .training-stats {
        display: flex;
        gap: var(--space-xl);
    }
    
    .stat-item {
        text-align: center;
    }
    
    .stat-label {
        display: block;
        font-size: 0.7rem;
        color: var(--text-tertiary);
        text-transform: uppercase;
    }
    
    .stat-value {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        color: var(--accent-gold);
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
    new GradientFlowLab();
    new TrainingDynamicsLab();
    new ModuleQuiz('quiz-container');
});

