/**
 * Module 3.4: Large Language Models
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
// Tokenization Lab
// ============================================

class TokenizationLab {
    constructor() {
        this.bindEvents();
        this.tokenize(); // Initial tokenization
    }
    
    // Simple BPE-like tokenization simulation
    getTokens(text) {
        // Common tokens (simplified simulation of GPT tokenization)
        const commonTokens = {
            'Hello': ['Hello'],
            'hello': ['hello'],
            'How': ['How'],
            'how': ['how'],
            'are': ['are'],
            'you': ['you'],
            'doing': ['do', 'ing'],
            'today': ['today'],
            'The': ['The'],
            'the': ['the'],
            'quick': ['quick'],
            'brown': ['brown'],
            'fox': ['fox'],
            'jumps': ['jump', 's'],
            'over': ['over'],
            'lazy': ['laz', 'y'],
            'dog': ['dog'],
            'ChatGPT': ['Chat', 'G', 'PT'],
            'artificial': ['art', 'ificial'],
            'intelligence': ['intell', 'igence'],
            'machine': ['machine'],
            'learning': ['learn', 'ing'],
            'neural': ['neur', 'al'],
            'network': ['network'],
            'transformer': ['transform', 'er'],
            'attention': ['attention'],
            ' ': [' '],
            ',': [','],
            '.': ['.'],
            '?': ['?'],
            '!': ['!'],
            "'": ["'"],
            '"': ['"']
        };
        
        const tokens = [];
        let remaining = text;
        
        while (remaining.length > 0) {
            let found = false;
            
            // Try to match longest known token first
            for (let len = Math.min(remaining.length, 15); len > 0; len--) {
                const substr = remaining.substring(0, len);
                if (commonTokens[substr]) {
                    tokens.push(...commonTokens[substr]);
                    remaining = remaining.substring(len);
                    found = true;
                    break;
                }
            }
            
            // If no match, take single character
            if (!found) {
                tokens.push(remaining[0]);
                remaining = remaining.substring(1);
            }
        }
        
        return tokens;
    }
    
    bindEvents() {
        document.getElementById('tokenize-btn')?.addEventListener('click', () => this.tokenize());
        document.getElementById('token-text')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.tokenize();
        });
    }
    
    tokenize() {
        const text = document.getElementById('token-text')?.value || 'Hello, how are you?';
        const tokens = this.getTokens(text);
        
        const outputEl = document.getElementById('token-output');
        if (!outputEl) return;
        
        const colors = ['#e07a5f', '#5b9bd5', '#50b892', '#d4a855', '#a78bfa', '#f472b6'];
        
        outputEl.innerHTML = `
            <div class="token-count">${tokens.length} tokens</div>
            <div class="token-list">
                ${tokens.map((t, i) => `
                    <span class="token" style="background-color: ${colors[i % colors.length]}20; border-color: ${colors[i % colors.length]}">
                        ${t === ' ' ? '␣' : t}
                    </span>
                `).join('')}
            </div>
        `;
    }
}

// ============================================
// Sampling Lab
// ============================================

class SamplingLab {
    constructor() {
        this.canvas = document.getElementById('sampling-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.temperature = 1.0;
        
        // Simulated logits for next token
        this.tokens = ['the', 'a', 'an', 'this', 'that', 'one', 'some', 'any'];
        this.logits = [2.5, 1.8, 0.5, 0.3, 0.2, -0.1, -0.5, -1.0];
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        document.getElementById('temperature')?.addEventListener('input', (e) => {
            this.temperature = parseInt(e.target.value) / 100;
            document.getElementById('temp-value').textContent = this.temperature.toFixed(2);
            this.draw();
            this.updateExplanation();
        });
    }
    
    softmax(logits, temp) {
        const scaled = logits.map(l => l / Math.max(temp, 0.01));
        const maxVal = Math.max(...scaled);
        const exps = scaled.map(s => Math.exp(s - maxVal));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sum);
    }
    
    updateExplanation() {
        const el = document.getElementById('sampling-explanation');
        if (!el) return;
        
        if (this.temperature < 0.3) {
            el.textContent = 'Very low temperature: Almost deterministic. Always picks the most likely token. Good for factual tasks.';
        } else if (this.temperature < 0.8) {
            el.textContent = 'Low temperature: Mostly picks likely tokens with some variation. Good for focused, coherent text.';
        } else if (this.temperature < 1.2) {
            el.textContent = 'Normal temperature (≈1.0): Balanced between likely tokens and creativity. Standard setting.';
        } else if (this.temperature < 1.7) {
            el.textContent = 'High temperature: More random selection. Good for creative tasks but may be less coherent.';
        } else {
            el.textContent = 'Very high temperature: Nearly uniform distribution. Very random and potentially incoherent.';
        }
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 60;
        
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const probs = this.softmax(this.logits, this.temperature);
        const barW = (w - 2 * padding) / this.tokens.length - 10;
        const maxH = h - 2 * padding;
        
        // Draw bars
        for (let i = 0; i < this.tokens.length; i++) {
            const x = padding + i * (barW + 10) + 5;
            const barH = probs[i] * maxH * 0.95;
            const y = h - padding - barH;
            
            // Color based on probability
            const intensity = Math.min(probs[i] * 2, 1);
            this.ctx.fillStyle = `rgba(212, 168, 85, ${0.3 + intensity * 0.7})`;
            this.ctx.fillRect(x, y, barW, barH);
            
            // Border
            this.ctx.strokeStyle = '#d4a855';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, barW, barH);
            
            // Probability label
            this.ctx.fillStyle = '#e5e7eb';
            this.ctx.font = '11px "JetBrains Mono"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((probs[i] * 100).toFixed(1) + '%', x + barW / 2, y - 5);
            
            // Token label
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.font = '12px "DM Sans"';
            this.ctx.fillText(this.tokens[i], x + barW / 2, h - padding + 20);
        }
        
        // Y axis label
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.save();
        this.ctx.translate(15, h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Probability', 0, 0);
        this.ctx.restore();
        
        // Title
        this.ctx.fillStyle = '#d4a855';
        this.ctx.font = '12px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Temperature = ${this.temperature.toFixed(2)}`, w / 2, 20);
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
            1: { correct: 'b', explanation: 'LLMs are pre-trained on next-token prediction: given a sequence of tokens, predict the next one. This simple objective, at scale, produces remarkably capable models.' },
            2: { correct: 'b', explanation: 'RLHF (Reinforcement Learning from Human Feedback) is used after pre-training to align the model with human preferences—making it more helpful, honest, and harmless.' },
            3: { correct: 'b', explanation: 'LLMs are trained to produce plausible text, not necessarily true text. They have no mechanism to verify facts, so they can confidently generate false information.' },
            4: { correct: 'b', explanation: 'Higher temperature flattens the probability distribution, making less likely tokens more likely to be selected. This increases randomness and creativity but can reduce coherence.' },
            5: { correct: 'b', explanation: 'Emergent abilities are capabilities that appear suddenly at certain scales—they\'re absent in smaller models but present in larger ones, often without gradual improvement in between.' }
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
            score === 5 ? 'Excellent! You understand LLM fundamentals.' :
            score >= 3 ? 'Good progress. Review the training pipeline.' :
            'Consider re-reading about pre-training and alignment.';
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
    .scale-comparison {
        display: grid;
        gap: var(--space-sm);
        margin: var(--space-lg) 0;
    }
    
    .scale-item {
        display: flex;
        justify-content: space-between;
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-2);
        border-radius: var(--radius-sm);
    }
    
    .scale-name {
        color: var(--text-secondary);
    }
    
    .scale-value {
        font-family: var(--font-mono);
        color: var(--accent-gold);
    }
    
    .pipeline-stages {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .pipeline-stage {
        display: flex;
        gap: var(--space-lg);
        padding: var(--space-xl);
        background: var(--surface-1);
        border-radius: var(--radius-lg);
        border-left: 4px solid var(--accent-gold);
    }
    
    .stage-number {
        width: 40px;
        height: 40px;
        background: var(--accent-gold);
        color: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .stage-content h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .stage-objective {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--accent-gold);
        margin-bottom: var(--space-md);
    }
    
    .stage-content p {
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
    }
    
    .stage-data, .stage-cost {
        font-size: 0.85rem;
        color: var(--text-tertiary);
    }
    
    .scaling-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .scaling-card ul {
        list-style: none;
        margin: var(--space-md) 0;
    }
    
    .scaling-card li {
        padding: var(--space-xs) 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .alignment-methods {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .method-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .method-card h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-lg);
    }
    
    .method-steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin-bottom: var(--space-lg);
    }
    
    .method-step {
        display: flex;
        gap: var(--space-md);
        align-items: flex-start;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .method-step .step-num {
        width: 20px;
        height: 20px;
        background: var(--accent-gold-dim);
        color: var(--accent-gold);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        flex-shrink: 0;
    }
    
    .method-note {
        font-size: 0.8rem;
        color: var(--text-tertiary);
        font-style: italic;
    }
    
    .limitations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .limitation-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .limitation-card h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .limitation-card p {
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin-bottom: var(--space-sm);
    }
    
    .limitation-severity {
        font-size: 0.8rem;
        color: var(--text-tertiary);
        font-style: italic;
    }
    
    .token-lab, .sampling-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .token-input {
        display: flex;
        gap: var(--space-md);
        align-items: center;
        flex-wrap: wrap;
    }
    
    .token-input input {
        width: 300px;
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-2);
        border: 1px solid var(--surface-3);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-mono);
    }
    
    .token-output {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        min-width: 400px;
    }
    
    .token-count {
        color: var(--accent-gold);
        font-family: var(--font-mono);
        margin-bottom: var(--space-md);
    }
    
    .token-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
    }
    
    .token {
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid;
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--text-primary);
    }
    
    .token-info {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        max-width: 500px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .sampling-controls {
        display: flex;
        gap: var(--space-lg);
        align-items: flex-end;
    }
    
    .sampling-viz {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .sampling-explanation {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        max-width: 500px;
        color: var(--text-secondary);
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
    new TokenizationLab();
    new SamplingLab();
    new ModuleQuiz('quiz-container');
});

