/**
 * Module 3.2: Attention Mechanisms
 * Interactive Labs and Quiz JavaScript
 */

// ============================================
// Sample Attention Data
// ============================================

const SENTENCES = {
    cat: {
        tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
        attention: {
            0: [0.5, 0.2, 0.1, 0.1, 0.05, 0.05],  // The
            1: [0.1, 0.4, 0.25, 0.1, 0.05, 0.1],  // cat
            2: [0.05, 0.45, 0.3, 0.1, 0.02, 0.08], // sat
            3: [0.05, 0.15, 0.3, 0.2, 0.1, 0.2],  // on
            4: [0.1, 0.1, 0.1, 0.2, 0.3, 0.2],    // the
            5: [0.02, 0.15, 0.2, 0.25, 0.15, 0.23] // mat
        }
    },
    bank: {
        tokens: ['I', 'went', 'to', 'the', 'bank', 'to', 'deposit', 'money'],
        attention: {
            0: [0.6, 0.15, 0.05, 0.05, 0.05, 0.03, 0.04, 0.03],
            1: [0.2, 0.4, 0.15, 0.05, 0.1, 0.03, 0.04, 0.03],
            2: [0.1, 0.2, 0.3, 0.15, 0.15, 0.03, 0.04, 0.03],
            3: [0.05, 0.1, 0.15, 0.3, 0.25, 0.05, 0.05, 0.05],
            4: [0.03, 0.1, 0.05, 0.15, 0.3, 0.07, 0.15, 0.15], // bank attends to money/deposit
            5: [0.05, 0.1, 0.1, 0.1, 0.2, 0.2, 0.15, 0.1],
            6: [0.02, 0.05, 0.03, 0.05, 0.25, 0.1, 0.3, 0.2], // deposit attends to bank/money
            7: [0.02, 0.03, 0.02, 0.03, 0.3, 0.05, 0.25, 0.3]  // money attends to bank/deposit
        }
    },
    pronoun: {
        tokens: ['John', 'gave', 'Mary', 'the', 'book', 'because', 'she', 'asked'],
        attention: {
            0: [0.5, 0.2, 0.1, 0.05, 0.05, 0.03, 0.04, 0.03],
            1: [0.25, 0.35, 0.15, 0.05, 0.1, 0.03, 0.04, 0.03],
            2: [0.15, 0.2, 0.35, 0.05, 0.1, 0.05, 0.05, 0.05],
            3: [0.05, 0.1, 0.1, 0.25, 0.35, 0.05, 0.05, 0.05],
            4: [0.05, 0.15, 0.1, 0.2, 0.35, 0.05, 0.05, 0.05],
            5: [0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.1, 0.1],
            6: [0.1, 0.05, 0.55, 0.02, 0.03, 0.05, 0.15, 0.05], // she attends strongly to Mary
            7: [0.05, 0.1, 0.2, 0.03, 0.07, 0.1, 0.2, 0.25]
        }
    }
};

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
// Attention Weights Visualizer
// ============================================

class AttentionWeightsLab {
    constructor() {
        this.canvas = document.getElementById('attention-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.currentSentence = 'cat';
        this.queryPosition = 2; // default to "sat"
        
        this.bindEvents();
        this.updatePositionSelect();
        this.draw();
    }
    
    bindEvents() {
        document.getElementById('example-sentence')?.addEventListener('change', (e) => {
            this.currentSentence = e.target.value;
            this.queryPosition = 0;
            this.updatePositionSelect();
            this.draw();
        });
        
        document.getElementById('query-position')?.addEventListener('change', (e) => {
            this.queryPosition = parseInt(e.target.value);
            this.draw();
            this.updateExplanation();
        });
    }
    
    updatePositionSelect() {
        const select = document.getElementById('query-position');
        if (!select) return;
        
        const data = SENTENCES[this.currentSentence];
        select.innerHTML = data.tokens.map((token, i) => 
            `<option value="${i}"${i === this.queryPosition ? ' selected' : ''}>${i}: "${token}"</option>`
        ).join('');
    }
    
    updateExplanation() {
        const el = document.getElementById('attention-explanation');
        if (!el) return;
        
        const data = SENTENCES[this.currentSentence];
        const queryToken = data.tokens[this.queryPosition];
        const weights = data.attention[this.queryPosition];
        
        // Find top 2 attended positions
        const sorted = weights.map((w, i) => ({ w, i, token: data.tokens[i] }))
            .sort((a, b) => b.w - a.w)
            .slice(0, 3);
        
        el.innerHTML = `
            <strong>"${queryToken}"</strong> (position ${this.queryPosition}) attends most strongly to:<br>
            ${sorted.map(s => `• "${s.token}" (${(s.w * 100).toFixed(0)}%)`).join('<br>')}
        `;
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 80;
        
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const data = SENTENCES[this.currentSentence];
        const tokens = data.tokens;
        const n = tokens.length;
        
        const cellW = (w - 2 * padding) / n;
        const cellH = (h - 2 * padding) / n;
        
        // Draw attention matrix
        for (let q = 0; q < n; q++) {
            for (let k = 0; k < n; k++) {
                const weight = data.attention[q][k];
                const x = padding + k * cellW;
                const y = padding + q * cellH;
                
                // Color intensity based on weight
                const intensity = weight;
                const isQueryRow = q === this.queryPosition;
                
                if (isQueryRow) {
                    this.ctx.fillStyle = `rgba(212, 168, 85, ${intensity})`;
                } else {
                    this.ctx.fillStyle = `rgba(91, 155, 213, ${intensity * 0.5})`;
                }
                
                this.ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
                
                // Weight text for query row
                if (isQueryRow && weight > 0.08) {
                    this.ctx.fillStyle = weight > 0.3 ? '#0d0f12' : '#fff';
                    this.ctx.font = '10px "JetBrains Mono"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        (weight * 100).toFixed(0) + '%',
                        x + cellW / 2,
                        y + cellH / 2 + 4
                    );
                }
            }
        }
        
        // Draw key labels (top)
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < n; i++) {
            const x = padding + i * cellW + cellW / 2;
            this.ctx.fillText(tokens[i], x, padding - 10);
        }
        
        // Draw query labels (left)
        this.ctx.textAlign = 'right';
        for (let i = 0; i < n; i++) {
            const y = padding + i * cellH + cellH / 2 + 4;
            this.ctx.fillStyle = i === this.queryPosition ? '#d4a855' : '#6b7280';
            this.ctx.fillText(tokens[i], padding - 10, y);
        }
        
        // Labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '10px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Keys (what to attend to)', w / 2, 20);
        
        this.ctx.save();
        this.ctx.translate(15, h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Queries', 0, 0);
        this.ctx.restore();
        
        // Highlight current query row
        this.ctx.strokeStyle = '#d4a855';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            padding,
            padding + this.queryPosition * cellH,
            w - 2 * padding,
            cellH
        );
        
        this.updateExplanation();
    }
}

// ============================================
// Step-by-Step Computation Lab
// ============================================

class ComputationLab {
    constructor() {
        this.container = document.getElementById('compute-viz');
        this.explanation = document.getElementById('compute-explanation');
        if (!this.container) return;
        
        this.step = 0;
        this.maxSteps = 5;
        
        // Simple 3-token example
        this.data = {
            tokens: ['cat', 'sat', 'mat'],
            X: [[0.5, 0.3], [0.2, 0.8], [0.7, 0.1]],
            W_Q: [[0.4, 0.2], [0.1, 0.6]],
            W_K: [[0.3, 0.5], [0.2, 0.4]],
            W_V: [[0.5, 0.1], [0.3, 0.7]]
        };
        
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        document.getElementById('compute-step')?.addEventListener('click', () => {
            this.step = Math.min(this.step + 1, this.maxSteps);
            this.render();
        });
        
        document.getElementById('reset-compute')?.addEventListener('click', () => {
            this.step = 0;
            this.render();
        });
    }
    
    matmul(A, B) {
        const result = [];
        for (let i = 0; i < A.length; i++) {
            result[i] = [];
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < B.length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    
    transpose(A) {
        return A[0].map((_, i) => A.map(row => row[i]));
    }
    
    softmax(row) {
        const max = Math.max(...row);
        const exps = row.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sum);
    }
    
    renderMatrix(matrix, label, highlight = false) {
        const formatted = matrix.map(row => 
            row.map(v => v.toFixed(2)).join(', ')
        ).join(']\n[');
        
        return `
            <div class="matrix-container ${highlight ? 'highlight' : ''}">
                <div class="matrix-label">${label}</div>
                <div class="matrix-values">[${formatted}]</div>
            </div>
        `;
    }
    
    render() {
        const { X, W_Q, W_K, W_V, tokens } = this.data;
        const d_k = Math.sqrt(W_Q[0].length);
        
        // Compute values up to current step
        let Q, K, V, scores, scaledScores, weights, output;
        
        if (this.step >= 1) {
            Q = this.matmul(X, W_Q);
            K = this.matmul(X, W_K);
            V = this.matmul(X, W_V);
        }
        if (this.step >= 2) {
            scores = this.matmul(Q, this.transpose(K));
        }
        if (this.step >= 3) {
            scaledScores = scores.map(row => row.map(v => v / d_k));
        }
        if (this.step >= 4) {
            weights = scaledScores.map(row => this.softmax(row));
        }
        if (this.step >= 5) {
            output = this.matmul(weights, V);
        }
        
        let html = '<div class="compute-steps">';
        
        // Step 0: Input
        html += `
            <div class="compute-step ${this.step === 0 ? 'active' : ''}">
                <div class="step-title">Input Embeddings (X)</div>
                ${this.renderMatrix(X, `[${tokens.join(', ')}]`, this.step === 0)}
            </div>
        `;
        
        // Step 1: Q, K, V
        if (this.step >= 1) {
            html += `
                <div class="compute-step ${this.step === 1 ? 'active' : ''}">
                    <div class="step-title">Step 1: Compute Q, K, V</div>
                    <div class="matrix-row">
                        ${this.renderMatrix(Q, 'Q = X·W_Q', this.step === 1)}
                        ${this.renderMatrix(K, 'K = X·W_K', this.step === 1)}
                        ${this.renderMatrix(V, 'V = X·W_V', this.step === 1)}
                    </div>
                </div>
            `;
        }
        
        // Step 2: Scores
        if (this.step >= 2) {
            html += `
                <div class="compute-step ${this.step === 2 ? 'active' : ''}">
                    <div class="step-title">Step 2: Compute Attention Scores</div>
                    ${this.renderMatrix(scores, 'scores = Q·K^T', this.step === 2)}
                </div>
            `;
        }
        
        // Step 3: Scale
        if (this.step >= 3) {
            html += `
                <div class="compute-step ${this.step === 3 ? 'active' : ''}">
                    <div class="step-title">Step 3: Scale by √d_k</div>
                    ${this.renderMatrix(scaledScores, `scaled = scores / √${d_k.toFixed(1)}`, this.step === 3)}
                </div>
            `;
        }
        
        // Step 4: Softmax
        if (this.step >= 4) {
            html += `
                <div class="compute-step ${this.step === 4 ? 'active' : ''}">
                    <div class="step-title">Step 4: Softmax (per row)</div>
                    ${this.renderMatrix(weights, 'weights = softmax(scaled)', this.step === 4)}
                    <div class="step-note">Each row sums to 1.0</div>
                </div>
            `;
        }
        
        // Step 5: Output
        if (this.step >= 5) {
            html += `
                <div class="compute-step ${this.step === 5 ? 'active' : ''}">
                    <div class="step-title">Step 5: Weighted Sum of Values</div>
                    ${this.renderMatrix(output, 'output = weights · V', this.step === 5)}
                    <div class="step-note">Final attention output for each position</div>
                </div>
            `;
        }
        
        html += '</div>';
        this.container.innerHTML = html;
        
        // Update explanation
        const explanations = [
            'Start with input embeddings X for 3 tokens.',
            'Project X through W_Q, W_K, W_V to get Query, Key, Value matrices.',
            'Compute attention scores: how well each query matches each key.',
            'Scale scores by √d_k to prevent extreme values.',
            'Apply softmax to get attention weights (probability distribution).',
            'Weighted sum of values gives the final attention output!'
        ];
        
        if (this.explanation) {
            this.explanation.textContent = explanations[this.step];
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
            1: { correct: 'b', explanation: 'Query is what the current position is looking for, Key is what each position offers for matching, and Value is the content to retrieve based on attention weights.' },
            2: { correct: 'b', explanation: 'Without scaling, large d_k causes dot products to have large magnitude, pushing softmax into regions with very small gradients. Scaling by √d_k normalizes this.' },
            3: { correct: 'b', explanation: 'In self-attention, Q, K, and V are all derived from the same input sequence, allowing each position to attend to all other positions in the same sequence.' },
            4: { correct: 'b', explanation: 'Multiple heads allow the model to learn different types of attention patterns simultaneously—one head might capture syntax, another semantics, etc.' },
            5: { correct: 'b', explanation: 'Softmax converts raw attention scores into a probability distribution where all weights sum to 1, determining how much each position contributes to the output.' }
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
            score === 5 ? 'Excellent! You understand attention mechanisms.' :
            score >= 3 ? 'Good progress. Review the QKV framework.' :
            'Consider re-reading about scaled dot-product attention.';
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
    .qkv-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .qkv-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .qkv-card.query { border-top: 3px solid #e07a5f; }
    .qkv-card.key { border-top: 3px solid #5b9bd5; }
    .qkv-card.value { border-top: 3px solid #50b892; }
    
    .qkv-card h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .qkv-subtitle {
        font-size: 0.85rem;
        color: var(--text-tertiary);
        font-style: italic;
        margin-bottom: var(--space-md);
    }
    
    .qkv-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
    }
    
    .qkv-formula {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent-gold);
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        border-radius: var(--radius-sm);
        text-align: center;
    }
    
    .attention-steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin: var(--space-xl) 0;
    }
    
    .attention-step {
        display: flex;
        gap: var(--space-lg);
        padding: var(--space-lg);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--accent-gold-dim);
    }
    
    .step-formula {
        font-family: var(--font-mono);
        color: var(--accent-gold);
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        border-radius: var(--radius-sm);
        margin: var(--space-sm) 0;
    }
    
    .step-note {
        font-size: 0.8rem;
        color: var(--text-tertiary);
    }
    
    .multihead-diagram {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin: var(--space-xl) 0;
        padding: var(--space-xl);
        background: var(--surface-1);
        border-radius: var(--radius-lg);
    }
    
    .mh-label { color: var(--text-secondary); font-size: 0.9rem; }
    .mh-box {
        background: var(--surface-2);
        border: 2px solid var(--accent-gold-dim);
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        color: var(--text-primary);
    }
    .mh-box.small { padding: var(--space-sm) var(--space-md); }
    .mh-heads { display: flex; flex-direction: column; gap: var(--space-sm); }
    .mh-head-label { font-size: 0.75rem; color: var(--text-tertiary); text-align: center; }
    .mh-arrow { color: var(--accent-gold); font-size: 1.2rem; }
    .mh-split, .mh-concat, .mh-output { display: flex; align-items: center; gap: var(--space-sm); }
    
    .weights-lab {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .sentence-input {
        display: flex;
        gap: var(--space-md);
        align-items: center;
    }
    
    .attention-viz {
        display: flex;
        justify-content: center;
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .attention-controls {
        display: flex;
        justify-content: center;
    }
    
    .attention-explanation {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        line-height: 1.8;
    }
    
    .compute-lab {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .compute-steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .compute-step {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        opacity: 0.6;
        transition: opacity var(--transition-fast);
    }
    
    .compute-step.active {
        opacity: 1;
        border-left: 3px solid var(--accent-gold);
    }
    
    .step-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .matrix-row {
        display: flex;
        gap: var(--space-lg);
        flex-wrap: wrap;
    }
    
    .matrix-container {
        background: var(--bg-tertiary);
        padding: var(--space-md);
        border-radius: var(--radius-sm);
    }
    
    .matrix-container.highlight {
        border: 2px solid var(--accent-gold);
    }
    
    .matrix-label {
        font-size: 0.8rem;
        color: var(--accent-gold);
        margin-bottom: var(--space-xs);
        font-family: var(--font-mono);
    }
    
    .matrix-values {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-primary);
        white-space: pre;
    }
    
    .compute-controls {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
    }
    
    .compute-explanation {
        text-align: center;
        background: var(--surface-1);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
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
    new AttentionWeightsLab();
    new ComputationLab();
    new ModuleQuiz('quiz-container');
});

