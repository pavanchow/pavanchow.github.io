/**
 * Module 3.1: Embeddings & Vector Spaces
 * Interactive Labs and Quiz JavaScript
 */

// ============================================
// Simulated Word Embeddings (2D for visualization)
// ============================================

const EMBEDDINGS = {
    // Animals
    cat: { x: -0.6, y: 0.7, category: 'animals' },
    dog: { x: -0.55, y: 0.65, category: 'animals' },
    lion: { x: -0.5, y: 0.8, category: 'animals' },
    tiger: { x: -0.45, y: 0.75, category: 'animals' },
    elephant: { x: -0.7, y: 0.6, category: 'animals' },
    
    // Countries
    france: { x: 0.6, y: 0.3, category: 'countries' },
    germany: { x: 0.65, y: 0.35, category: 'countries' },
    japan: { x: 0.7, y: 0.25, category: 'countries' },
    china: { x: 0.75, y: 0.3, category: 'countries' },
    italy: { x: 0.55, y: 0.4, category: 'countries' },
    
    // Cities (capitals offset from countries)
    paris: { x: 0.6, y: 0.5, category: 'cities' },
    berlin: { x: 0.65, y: 0.55, category: 'cities' },
    tokyo: { x: 0.7, y: 0.45, category: 'cities' },
    beijing: { x: 0.75, y: 0.5, category: 'cities' },
    rome: { x: 0.55, y: 0.6, category: 'cities' },
    
    // Royalty
    king: { x: -0.3, y: -0.5, category: 'royalty' },
    queen: { x: -0.1, y: -0.5, category: 'royalty' },
    prince: { x: -0.25, y: -0.4, category: 'royalty' },
    princess: { x: -0.05, y: -0.4, category: 'royalty' },
    
    // Gender
    man: { x: -0.4, y: -0.3, category: 'people' },
    woman: { x: -0.2, y: -0.3, category: 'people' },
    boy: { x: -0.35, y: -0.2, category: 'people' },
    girl: { x: -0.15, y: -0.2, category: 'people' },
    
    // Verbs
    walk: { x: 0.2, y: -0.6, category: 'verbs' },
    walking: { x: 0.3, y: -0.5, category: 'verbs' },
    run: { x: 0.25, y: -0.65, category: 'verbs' },
    running: { x: 0.35, y: -0.55, category: 'verbs' },
    swim: { x: 0.15, y: -0.7, category: 'verbs' },
    swimming: { x: 0.25, y: -0.6, category: 'verbs' },
    
    // Adjectives
    happy: { x: 0.4, y: 0.7, category: 'adjectives' },
    sad: { x: 0.3, y: 0.65, category: 'adjectives' },
    big: { x: 0.5, y: 0.75, category: 'adjectives' },
    small: { x: 0.45, y: 0.8, category: 'adjectives' },
    
    // Tech
    computer: { x: -0.8, y: -0.6, category: 'tech' },
    software: { x: -0.75, y: -0.55, category: 'tech' },
    program: { x: -0.7, y: -0.5, category: 'tech' },
    algorithm: { x: -0.85, y: -0.65, category: 'tech' }
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
// Embedding Space Visualization
// ============================================

class EmbeddingSpaceLab {
    constructor() {
        this.canvas = document.getElementById('embedding-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.rotation = 0;
        this.scale = 1;
        this.highlightCategory = 'all';
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        document.getElementById('highlight-category')?.addEventListener('change', (e) => {
            this.highlightCategory = e.target.value;
            this.draw();
        });
        
        document.getElementById('randomize-view')?.addEventListener('click', () => {
            this.rotation = Math.random() * Math.PI * 2;
            this.draw();
        });
        
        // Hover interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
    }
    
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Check if near any word
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 60;
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        
        for (const [word, data] of Object.entries(EMBEDDINGS)) {
            const px = padding + (data.x + 1) / 2 * plotW;
            const py = padding + (1 - (data.y + 1) / 2) * plotH;
            
            if (Math.abs(mx - px) < 20 && Math.abs(my - py) < 20) {
                this.canvas.style.cursor = 'pointer';
                this.hoveredWord = word;
                this.draw();
                return;
            }
        }
        
        if (this.hoveredWord) {
            this.hoveredWord = null;
            this.canvas.style.cursor = 'default';
            this.draw();
        }
    }
    
    getCategoryColor(category) {
        const colors = {
            animals: '#e07a5f',
            countries: '#5b9bd5',
            cities: '#50b892',
            royalty: '#d4a855',
            people: '#a78bfa',
            verbs: '#f472b6',
            adjectives: '#38bdf8',
            tech: '#94a3b8'
        };
        return colors[category] || '#6b7280';
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 60;
        
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        
        // Grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i / 4) * plotW;
            const y = padding + (i / 4) * plotH;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, h - padding);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(w - padding, y);
            this.ctx.stroke();
        }
        
        // Draw connections for similar words
        this.ctx.strokeStyle = 'rgba(212, 168, 85, 0.15)';
        this.ctx.lineWidth = 1;
        
        if (this.highlightCategory !== 'all') {
            const categoryWords = Object.entries(EMBEDDINGS)
                .filter(([_, data]) => data.category === this.highlightCategory);
            
            for (let i = 0; i < categoryWords.length; i++) {
                for (let j = i + 1; j < categoryWords.length; j++) {
                    const [w1, d1] = categoryWords[i];
                    const [w2, d2] = categoryWords[j];
                    
                    const x1 = padding + (d1.x + 1) / 2 * plotW;
                    const y1 = padding + (1 - (d1.y + 1) / 2) * plotH;
                    const x2 = padding + (d2.x + 1) / 2 * plotW;
                    const y2 = padding + (1 - (d2.y + 1) / 2) * plotH;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw words
        for (const [word, data] of Object.entries(EMBEDDINGS)) {
            const px = padding + (data.x + 1) / 2 * plotW;
            const py = padding + (1 - (data.y + 1) / 2) * plotH;
            
            const isHighlighted = this.highlightCategory === 'all' || 
                                  data.category === this.highlightCategory;
            const isHovered = word === this.hoveredWord;
            
            // Point
            this.ctx.beginPath();
            this.ctx.arc(px, py, isHovered ? 8 : 5, 0, Math.PI * 2);
            
            if (isHighlighted) {
                this.ctx.fillStyle = this.getCategoryColor(data.category);
                this.ctx.globalAlpha = isHovered ? 1 : 0.9;
            } else {
                this.ctx.fillStyle = '#6b7280';
                this.ctx.globalAlpha = 0.3;
            }
            
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            
            // Label
            if (isHighlighted || isHovered) {
                this.ctx.fillStyle = isHighlighted ? '#fff' : '#888';
                this.ctx.font = isHovered ? 'bold 12px "DM Sans"' : '11px "DM Sans"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(word, px, py - 12);
            }
        }
        
        // Legend
        const categories = ['animals', 'countries', 'cities', 'royalty', 'people', 'verbs'];
        let legendY = 20;
        
        this.ctx.font = '10px "DM Sans"';
        this.ctx.textAlign = 'left';
        
        for (const cat of categories) {
            this.ctx.fillStyle = this.getCategoryColor(cat);
            this.ctx.beginPath();
            this.ctx.arc(15, legendY, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#6b7280';
            this.ctx.fillText(cat, 25, legendY + 4);
            legendY += 18;
        }
    }
}

// ============================================
// Vector Arithmetic Lab
// ============================================

class ArithmeticLab {
    constructor() {
        this.canvas = document.getElementById('arithmetic-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('compute-analogy')?.addEventListener('click', () => this.compute());
    }
    
    compute() {
        const termA = document.getElementById('term-a').value;
        const termB = document.getElementById('term-b').value;
        const termC = document.getElementById('term-c').value;
        
        const a = EMBEDDINGS[termA];
        const b = EMBEDDINGS[termB];
        const c = EMBEDDINGS[termC];
        
        if (!a || !b || !c) return;
        
        // Compute a - b + c
        const resultX = a.x - b.x + c.x;
        const resultY = a.y - b.y + c.y;
        
        // Find nearest word to result
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const [word, data] of Object.entries(EMBEDDINGS)) {
            if (word === termA || word === termB || word === termC) continue;
            
            const dist = Math.sqrt(Math.pow(data.x - resultX, 2) + Math.pow(data.y - resultY, 2));
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = word;
            }
        }
        
        document.getElementById('arithmetic-result').textContent = nearest || '?';
        
        this.draw({ a, b, c, result: { x: resultX, y: resultY }, nearest, termA, termB, termC });
    }
    
    draw(data) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const padding = 50;
        
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, w, h);
        
        if (!data) return;
        
        const plotW = w - 2 * padding;
        const plotH = h - 2 * padding;
        
        const toCanvas = (point) => ({
            x: padding + (point.x + 1) / 2 * plotW,
            y: padding + (1 - (point.y + 1) / 2) * plotH
        });
        
        const aPos = toCanvas(data.a);
        const bPos = toCanvas(data.b);
        const cPos = toCanvas(data.c);
        const resultPos = toCanvas(data.result);
        
        // Draw vector from b to a (what we're capturing)
        this.ctx.strokeStyle = 'rgba(224, 122, 95, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(bPos.x, bPos.y);
        this.ctx.lineTo(aPos.x, aPos.y);
        this.ctx.stroke();
        
        // Draw vector from c to result (applying the relationship)
        this.ctx.strokeStyle = 'rgba(80, 184, 146, 0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(cPos.x, cPos.y);
        this.ctx.lineTo(resultPos.x, resultPos.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw points
        const drawPoint = (pos, label, color, size = 8) => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px "DM Sans"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, pos.x, pos.y - 15);
        };
        
        drawPoint(aPos, data.termA, '#e07a5f');
        drawPoint(bPos, data.termB, '#5b9bd5');
        drawPoint(cPos, data.termC, '#50b892');
        
        // Result point
        this.ctx.beginPath();
        this.ctx.arc(resultPos.x, resultPos.y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = '#d4a855';
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px "DM Sans"';
        this.ctx.fillText(data.nearest || '?', resultPos.x, resultPos.y - 18);
        
        // Labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "DM Sans"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${data.termA} - ${data.termB} captures a relationship`, 10, h - 30);
        this.ctx.fillText(`Adding to ${data.termC} → ${data.nearest}`, 10, h - 15);
    }
}

// ============================================
// Similarity Search Lab
// ============================================

class SimilarityLab {
    constructor() {
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('find-similar')?.addEventListener('click', () => this.findSimilar());
    }
    
    cosineSimilarity(a, b) {
        const dot = a.x * b.x + a.y * b.y;
        const normA = Math.sqrt(a.x * a.x + a.y * a.y);
        const normB = Math.sqrt(b.x * b.x + b.y * b.y);
        return dot / (normA * normB);
    }
    
    findSimilar() {
        const targetWord = document.getElementById('similarity-word').value;
        const target = EMBEDDINGS[targetWord];
        
        if (!target) return;
        
        const similarities = [];
        
        for (const [word, data] of Object.entries(EMBEDDINGS)) {
            if (word === targetWord) continue;
            
            const sim = this.cosineSimilarity(target, data);
            similarities.push({ word, similarity: sim, category: data.category });
        }
        
        similarities.sort((a, b) => b.similarity - a.similarity);
        const top5 = similarities.slice(0, 5);
        
        const resultsEl = document.getElementById('similarity-results');
        if (resultsEl) {
            resultsEl.innerHTML = `
                <h4>Most similar to "${targetWord}":</h4>
                <div class="similarity-list">
                    ${top5.map((item, i) => `
                        <div class="similarity-item">
                            <span class="similarity-rank">${i + 1}</span>
                            <span class="similarity-word">${item.word}</span>
                            <span class="similarity-score">${(item.similarity * 100).toFixed(1)}%</span>
                            <span class="similarity-category">${item.category}</span>
                        </div>
                    `).join('')}
                </div>
            `;
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
            1: { correct: 'b', explanation: 'Embeddings place similar items near each other in vector space, encoding semantic relationships. One-hot vectors treat all pairs as equally dissimilar.' },
            2: { correct: 'b', explanation: 'Word2Vec learns by predicting context words from center words (Skip-gram) or center words from context (CBOW). No manual labels are needed.' },
            3: { correct: 'b', explanation: 'The vector from "man" to "king" captures "royalty". Since "woman" to "queen" involves the same relationship, they form parallel vectors in the space.' },
            4: { correct: 'b', explanation: 'BERT and similar transformers compute contextual embeddings where the same word gets different vectors depending on surrounding context. Word2Vec assigns fixed vectors.' },
            5: { correct: 'b', explanation: 'Cosine similarity measures the angle between vectors, ignoring magnitude. This focuses on direction, which captures semantic meaning better than raw distance for normalized embeddings.' }
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
            score === 5 ? 'Excellent! You understand embeddings and vector spaces.' :
            score >= 3 ? 'Good progress. Review vector arithmetic concepts.' :
            'Consider re-reading about how embeddings capture semantic similarity.';
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
    .encoding-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .encoding-card.onehot { border-top: 3px solid var(--accent-coral); }
    .encoding-card.embedding { border-top: 3px solid var(--accent-gold); }
    
    .encoding-example {
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        margin: var(--space-md) 0;
    }
    
    .word-vector {
        display: flex;
        justify-content: space-between;
        padding: var(--space-xs) 0;
        font-family: var(--font-mono);
        font-size: 0.8rem;
    }
    
    .word { color: var(--accent-gold); }
    .vector { color: var(--text-tertiary); }
    
    .encoding-props {
        list-style: none;
        font-size: 0.85rem;
        color: var(--text-secondary);
    }
    
    .encoding-props li {
        padding: var(--space-xs) 0;
        border-bottom: 1px solid var(--surface-2);
    }
    
    .arithmetic-examples {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .analogy-example {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .analogy-equation {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        margin-bottom: var(--space-md);
    }
    
    .analogy-term {
        background: var(--surface-2);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        color: var(--text-primary);
    }
    
    .analogy-op {
        color: var(--accent-gold);
        font-size: 1.2rem;
    }
    
    .analogy-result {
        background: var(--accent-gold);
        color: var(--bg-primary);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-weight: 600;
    }
    
    .analogy-explanation {
        color: var(--text-secondary);
        font-size: 0.9rem;
        text-align: center;
    }
    
    .timeline {
        position: relative;
        margin: var(--space-xl) 0;
        padding-left: var(--space-xl);
    }
    
    .timeline::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--surface-2);
    }
    
    .timeline-item {
        position: relative;
        padding-bottom: var(--space-xl);
    }
    
    .timeline-marker {
        position: absolute;
        left: calc(-1 * var(--space-xl) - 6px);
        top: 0;
        background: var(--accent-gold);
        color: var(--bg-primary);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .timeline-content h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .timeline-content p {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .space-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .space-canvas-container {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .space-controls {
        display: flex;
        gap: var(--space-lg);
        align-items: flex-end;
    }
    
    .space-info {
        background: var(--surface-1);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        color: var(--text-secondary);
    }
    
    .arithmetic-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .arithmetic-input {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .term-select {
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-2);
        border: 1px solid var(--surface-3);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-mono);
    }
    
    .op {
        color: var(--accent-gold);
        font-size: 1.2rem;
        font-weight: 600;
    }
    
    .result {
        background: var(--accent-gold);
        color: var(--bg-primary);
        padding: var(--space-sm) var(--space-lg);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-weight: 600;
        min-width: 80px;
        text-align: center;
    }
    
    .arithmetic-viz {
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        padding: var(--space-md);
    }
    
    .similarity-lab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
    }
    
    .similarity-search {
        display: flex;
        gap: var(--space-md);
        align-items: center;
    }
    
    .similarity-results {
        background: var(--surface-1);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
        min-width: 400px;
    }
    
    .similarity-results h4 {
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .similarity-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }
    
    .similarity-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm);
        background: var(--surface-2);
        border-radius: var(--radius-sm);
    }
    
    .similarity-rank {
        width: 24px;
        height: 24px;
        background: var(--accent-gold);
        color: var(--bg-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .similarity-word {
        flex: 1;
        font-family: var(--font-mono);
        color: var(--text-primary);
    }
    
    .similarity-score {
        font-family: var(--font-mono);
        color: var(--accent-gold);
        font-size: 0.85rem;
    }
    
    .similarity-category {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        background: var(--surface-3);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
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
    new EmbeddingSpaceLab();
    new ArithmeticLab();
    new SimilarityLab();
    new ModuleQuiz('quiz-container');
});

