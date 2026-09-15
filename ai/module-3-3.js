/**
 * Module 3.3: Transformer Architecture
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
// Data Flow Visualization
// ============================================

class DataFlowLab {
    constructor() {
        this.canvas = document.getElementById('flow-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.architecture = 'decoder';
        this.numLayers = 3;
        this.hoveredComponent = null;
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        document.getElementById('arch-select')?.addEventListener('change', (e) => {
            this.architecture = e.target.value;
            this.draw();
        });
        
        document.getElementById('num-layers')?.addEventListener('input', (e) => {
            this.numLayers = parseInt(e.target.value);
            document.getElementById('layers-value').textContent = this.numLayers;
            this.draw();
        });
        
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        this.canvas.addEventListener('mouseout', () => {
            this.hoveredComponent = null;
            this.draw();
        });
    }
    
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Check which component is hovered
        const components = this.getComponentRects();
        let found = null;
        
        for (const [name, rect] of Object.entries(components)) {
            if (mx >= rect.x && mx <= rect.x + rect.w &&
                my >= rect.y && my <= rect.y + rect.h) {
                found = name;
                break;
            }
        }
        
        if (found !== this.hoveredComponent) {
            this.hoveredComponent = found;
            this.draw();
            this.updateExplanation();
        }
    }
    
    getComponentRects() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const blockW = 200;
        const blockH = 60;
        const layerH = 100;
        
        const rects = {};
        
        // Input embedding
        rects['input'] = { x: centerX - 60, y: 20, w: 120, h: 40 };
        rects['pos_enc'] = { x: centerX - 60, y: 70, w: 120, h: 30 };
        
        // Layers
        const startY = 120;
        for (let i = 0; i < this.numLayers; i++) {
            const y = startY + i * layerH;
            rects[`attn_${i}`] = { x: centerX - blockW/2, y: y, w: blockW, h: 35 };
            rects[`ffn_${i}`] = { x: centerX - blockW/2, y: y + 45, w: blockW, h: 35 };
        }
        
        // Output
        rects['output'] = { x: centerX - 60, y: h - 50, w: 120, h: 40 };
        
        return rects;
    }
    
    updateExplanation() {
        const el = document.getElementById('flow-explanation');
        if (!el) return;
        
        const explanations = {
            'input': '<strong>Input Embedding:</strong> Converts token IDs to dense vectors (d_model dimensions). This is a learned lookup table.',
            'pos_enc': '<strong>Positional Encoding:</strong> Adds position information to embeddings so the model knows token order.',
            'attn': '<strong>Multi-Head Self-Attention:</strong> Each token attends to all tokens (or previous tokens in decoder). Mixes information across positions.',
            'ffn': '<strong>Feed-Forward Network:</strong> Two linear layers with GELU activation. Applied independently to each position. Expands to 4×d_model then projects back.',
            'output': '<strong>Output:</strong> Final representations used for prediction (next token in decoder, classification in encoder).'
        };
        
        let key = this.hoveredComponent;
        if (key && key.startsWith('attn')) key = 'attn';
        if (key && key.startsWith('ffn')) key = 'ffn';
        
        el.innerHTML = explanations[key] || 'Hover over components to learn more.';
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const blockW = 200;
        const layerH = 100;
        
        // Helper functions
        const drawBox = (x, y, width, height, text, color, isHovered) => {
            this.ctx.fillStyle = isHovered ? 'rgba(212, 168, 85, 0.3)' : 'rgba(45, 51, 61, 0.8)';
            this.ctx.fillRect(x, y, width, height);
            this.ctx.strokeStyle = isHovered ? '#d4a855' : color;
            this.ctx.lineWidth = isHovered ? 2 : 1;
            this.ctx.strokeRect(x, y, width, height);
            
            this.ctx.fillStyle = isHovered ? '#d4a855' : '#e5e7eb';
            this.ctx.font = '12px "DM Sans"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(text, x + width/2, y + height/2 + 4);
        };
        
        const drawArrow = (fromY, toY) => {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, fromY);
            this.ctx.lineTo(centerX, toY);
            this.ctx.strokeStyle = '#4b5563';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Arrow head
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 5, toY - 8);
            this.ctx.lineTo(centerX, toY);
            this.ctx.lineTo(centerX + 5, toY - 8);
            this.ctx.stroke();
        };
        
        // Input embedding
        drawBox(centerX - 60, 20, 120, 40, 'Input Embedding', '#5b9bd5', this.hoveredComponent === 'input');
        
        // Positional encoding (shown as addition)
        drawArrow(60, 70);
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '10px "DM Sans"';
        this.ctx.fillText('+ Positional Encoding', centerX, 88);
        
        // Arrow to first layer
        drawArrow(95, 120);
        
        // Draw transformer layers
        const startY = 120;
        for (let i = 0; i < this.numLayers; i++) {
            const y = startY + i * layerH;
            
            // Layer label
            this.ctx.fillStyle = '#6b7280';
            this.ctx.font = '10px "DM Sans"';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Layer ${i + 1}`, 30, y + 40);
            
            // Multi-Head Attention
            const attnText = this.architecture === 'decoder' ? 'Masked Multi-Head Attention' : 'Multi-Head Self-Attention';
            drawBox(centerX - blockW/2, y, blockW, 35, attnText, '#50b892', this.hoveredComponent === `attn_${i}`);
            
            // Residual + Layer Norm
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.font = '9px "JetBrains Mono"';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('+ residual → LayerNorm', centerX + blockW/2 - 5, y + 43);
            
            // Arrow
            drawArrow(y + 35, y + 45);
            
            // Feed-Forward Network
            drawBox(centerX - blockW/2, y + 45, blockW, 35, 'Feed-Forward Network', '#d4a855', this.hoveredComponent === `ffn_${i}`);
            
            // Residual + Layer Norm
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.fillText('+ residual → LayerNorm', centerX + blockW/2 - 5, y + 88);
            
            // Arrow to next layer
            if (i < this.numLayers - 1) {
                drawArrow(y + 80, y + 100);
            }
        }
        
        // Arrow to output
        const lastY = startY + (this.numLayers - 1) * layerH + 80;
        drawArrow(lastY, h - 55);
        
        // Output
        const outputText = this.architecture === 'decoder' ? 'Output (Next Token)' : 'Output (Representations)';
        drawBox(centerX - 70, h - 55, 140, 40, outputText, '#e07a5f', this.hoveredComponent === 'output');
        
        // Architecture label
        this.ctx.fillStyle = '#d4a855';
        this.ctx.font = 'bold 14px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.architecture === 'decoder' ? 'GPT-style Decoder' : 'BERT-style Encoder',
            centerX, h - 70
        );
    }
}

// ============================================
// Positional Encoding Visualization
// ============================================

class PositionalEncodingLab {
    constructor() {
        this.canvas = document.getElementById('positions-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.draw();
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 60;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const positions = 50;
        const dimensions = 64;
        const d_model = 512;
        
        const cellW = (w - 2 * padding) / dimensions;
        const cellH = (h - 2 * padding) / positions;
        
        // Draw positional encoding heatmap
        for (let pos = 0; pos < positions; pos++) {
            for (let i = 0; i < dimensions; i++) {
                let value;
                if (i % 2 === 0) {
                    value = Math.sin(pos / Math.pow(10000, (i) / d_model));
                } else {
                    value = Math.cos(pos / Math.pow(10000, (i - 1) / d_model));
                }
                
                // Map value (-1, 1) to color
                const r = value > 0 ? Math.floor(value * 180 + 40) : 40;
                const b = value < 0 ? Math.floor(-value * 180 + 40) : 40;
                const g = 40;
                
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                this.ctx.fillRect(padding + i * cellW, padding + pos * cellH, cellW, cellH);
            }
        }
        
        // Labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Dimension', w / 2, h - 10);
        
        this.ctx.save();
        this.ctx.translate(15, h / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Position', 0, 0);
        this.ctx.restore();
        
        // Color legend
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '10px "DM Sans"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Value: -1', w - 80, 20);
        this.ctx.fillText('→ +1', w - 40, 20);
        
        // Title
        this.ctx.fillStyle = '#d4a855';
        this.ctx.font = '12px "DM Sans"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Sinusoidal Positional Encoding', w / 2, 20);
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
            1: { correct: 'b', explanation: 'Self-attention treats input as a set with no inherent order. Positional encoding injects position information so the model can distinguish "cat sat" from "sat cat".' },
            2: { correct: 'b', explanation: 'The FFN operates on each position independently, performing nonlinear transformation. It typically expands dimensionality (4× d_model) then projects back.' },
            3: { correct: 'b', explanation: 'GPT uses causal (masked) attention—each position can only attend to previous positions. BERT uses bidirectional attention—all positions attend to all positions.' },
            4: { correct: 'b', explanation: 'Residual connections (x + f(x)) provide direct gradient paths through the network. Without them, gradients would vanish in deep networks, making training impossible.' },
            5: { correct: 'b', explanation: 'The causal mask sets future positions to -∞ before softmax, ensuring each position can only attend to previous positions—essential for autoregressive generation.' }
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
            score === 5 ? 'Excellent! You understand the transformer architecture.' :
            score >= 3 ? 'Good progress. Review the component purposes.' :
            'Consider re-reading about positional encoding and attention types.';
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
    .transformer-block-viz {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-xl);
        background: var(--surface-1);
        border-radius: var(--radius-lg);
        margin: var(--space-xl) 0;
    }
    
    .block-component { text-align: center; }
    .block-flow { color: var(--accent-gold); font-size: 1.5rem; }
    
    .comp-label {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-bottom: var(--space-xs);
    }
    
    .comp-box {
        background: var(--surface-2);
        border: 1px solid var(--surface-3);
        padding: var(--space-sm) var(--space-lg);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        color: var(--text-primary);
    }
    
    .main-box {
        background: var(--accent-gold-glow);
        border-color: var(--accent-gold);
    }
    
    .norm-box {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-top: var(--space-xs);
    }
    
    .residual-wrapper {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }
    
    .residual-arrow {
        color: var(--accent-gold);
        font-weight: bold;
    }
    
    .component-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .detail-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .detail-card h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-sm);
    }
    
    .detail-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
    }
    
    .detail-formula {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--accent-gold);
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        border-radius: var(--radius-sm);
    }
    
    .architecture-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .arch-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .arch-card.encoder { border-top: 3px solid #5b9bd5; }
    .arch-card.decoder { border-top: 3px solid #d4a855; }
    .arch-card.enc-dec { border-top: 3px solid #50b892; }
    
    .arch-title {
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .arch-example {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--text-tertiary);
        margin-bottom: var(--space-lg);
    }
    
    .arch-diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs);
        margin-bottom: var(--space-lg);
        padding: var(--space-md);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
    }
    
    .arch-block {
        background: var(--surface-2);
        padding: var(--space-xs) var(--space-md);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .arch-block.small { padding: var(--space-xs) var(--space-sm); font-size: 0.7rem; }
    .arch-section { display: flex; gap: var(--space-xs); }
    .arch-cross { color: var(--accent-gold); font-size: 0.8rem; }
    .arch-arrow { color: var(--text-tertiary); font-size: 0.85rem; }
    
    .arch-card p {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
    }
    
    .mask-visualization {
        margin: var(--space-xl) 0;
        text-align: center;
    }
    
    .mask-matrix {
        display: inline-block;
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .mask-header, .mask-row {
        display: flex;
        gap: var(--space-sm);
    }
    
    .mask-header span, .mask-row span {
        width: 50px;
        padding: var(--space-xs);
        text-align: center;
        font-size: 0.85rem;
    }
    
    .mask-header span {
        color: var(--text-tertiary);
        font-weight: 500;
    }
    
    .mask-label {
        color: var(--text-secondary) !important;
        font-weight: 500;
    }
    
    .mask-cell {
        border-radius: var(--radius-sm);
    }
    
    .mask-cell.allowed {
        background: rgba(80, 184, 146, 0.2);
        color: #50b892;
    }
    
    .mask-cell.blocked {
        background: rgba(224, 122, 95, 0.2);
        color: #e07a5f;
    }
    
    .mask-caption {
        color: var(--text-tertiary);
        font-size: 0.85rem;
        margin-top: var(--space-md);
    }
    
    .flow-lab, .positions-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .flow-controls {
        display: flex;
        gap: var(--space-lg);
        align-items: flex-end;
    }
    
    .flow-visualization, .positions-viz {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .flow-explanation {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        max-width: 500px;
        text-align: center;
    }
    
    .positions-info {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-size: 0.9rem;
        max-width: 500px;
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
    new DataFlowLab();
    new PositionalEncodingLab();
    new ModuleQuiz('quiz-container');
});

