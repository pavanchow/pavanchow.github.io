/**
 * Module 1.2: Intelligence as Pattern-Finding
 * Interactive Lab and Quiz JavaScript
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
                
                // Update tabs
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update panels
                this.panels.forEach(p => p.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
    }
}

// ============================================
// Sequence Pattern Lab
// ============================================

class SequencePatternLab {
    constructor() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Check answers button
        const checkBtn = document.getElementById('check-sequences');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswers());
        }
        
        // Reveal patterns button
        const revealBtn = document.getElementById('reveal-patterns');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => this.revealPatterns());
        }
        
        // Enter key on inputs
        document.querySelectorAll('.seq-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswers();
                }
            });
        });
    }
    
    checkAnswers() {
        document.querySelectorAll('.sequence-challenge').forEach(challenge => {
            const input = challenge.querySelector('.seq-input');
            const status = challenge.querySelector('.challenge-status');
            const explanation = challenge.querySelector('.pattern-explanation');
            
            const userAnswer = input.value.trim();
            const correctAnswer = input.dataset.answer;
            
            if (userAnswer === correctAnswer) {
                status.textContent = '✓ Correct';
                status.className = 'challenge-status correct';
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else if (userAnswer !== '') {
                status.textContent = '✗ Try again';
                status.className = 'challenge-status incorrect';
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
            
            // Show explanation for correct answers
            if (userAnswer === correctAnswer) {
                explanation.classList.remove('hidden');
            }
        });
    }
    
    revealPatterns() {
        document.querySelectorAll('.sequence-challenge').forEach(challenge => {
            const input = challenge.querySelector('.seq-input');
            const explanation = challenge.querySelector('.pattern-explanation');
            
            input.value = input.dataset.answer;
            input.classList.add('revealed');
            explanation.classList.remove('hidden');
        });
    }
}

// ============================================
// Visual Pattern Lab
// ============================================

class VisualPatternLab {
    constructor() {
        this.patterns = this.generatePatterns();
        this.currentPattern = 0;
        this.selectedOption = null;
        
        this.grid = document.getElementById('pattern-grid');
        this.options = document.getElementById('pattern-options');
        this.feedback = document.getElementById('visual-feedback');
        
        this.bindEvents();
        this.renderPattern();
    }
    
    generatePatterns() {
        return [
            {
                // Rotation pattern
                grid: [
                    { shape: 'square', rotation: 0, color: '#e07a5f' },
                    { shape: 'square', rotation: 45, color: '#e07a5f' },
                    { shape: 'square', rotation: 90, color: '#e07a5f' },
                    { shape: 'square', rotation: 135, color: '#e07a5f' },
                    { shape: 'square', rotation: 180, color: '#e07a5f' },
                    null, // missing
                ],
                answer: { shape: 'square', rotation: 225, color: '#e07a5f' },
                options: [
                    { shape: 'square', rotation: 225, color: '#e07a5f' },
                    { shape: 'square', rotation: 0, color: '#e07a5f' },
                    { shape: 'circle', rotation: 0, color: '#e07a5f' },
                    { shape: 'square', rotation: 90, color: '#5b9bd5' },
                ],
                explanation: 'Each square rotates 45° clockwise'
            },
            {
                // Size progression
                grid: [
                    { shape: 'circle', size: 20, color: '#5b9bd5' },
                    { shape: 'circle', size: 30, color: '#5b9bd5' },
                    { shape: 'circle', size: 40, color: '#5b9bd5' },
                    null,
                ],
                answer: { shape: 'circle', size: 50, color: '#5b9bd5' },
                options: [
                    { shape: 'circle', size: 50, color: '#5b9bd5' },
                    { shape: 'circle', size: 40, color: '#5b9bd5' },
                    { shape: 'circle', size: 20, color: '#5b9bd5' },
                    { shape: 'square', size: 50, color: '#5b9bd5' },
                ],
                explanation: 'Size increases by 10 units each step'
            },
            {
                // Color alternation with shape change
                grid: [
                    { shape: 'circle', color: '#e07a5f' },
                    { shape: 'square', color: '#5b9bd5' },
                    { shape: 'circle', color: '#e07a5f' },
                    { shape: 'square', color: '#5b9bd5' },
                    { shape: 'circle', color: '#e07a5f' },
                    null,
                ],
                answer: { shape: 'square', color: '#5b9bd5' },
                options: [
                    { shape: 'square', color: '#5b9bd5' },
                    { shape: 'circle', color: '#5b9bd5' },
                    { shape: 'square', color: '#e07a5f' },
                    { shape: 'circle', color: '#e07a5f' },
                ],
                explanation: 'Alternating: coral circle, blue square'
            },
            {
                // Count progression
                grid: [
                    { shape: 'dots', count: 1, color: '#50b892' },
                    { shape: 'dots', count: 2, color: '#50b892' },
                    { shape: 'dots', count: 3, color: '#50b892' },
                    { shape: 'dots', count: 4, color: '#50b892' },
                    null,
                ],
                answer: { shape: 'dots', count: 5, color: '#50b892' },
                options: [
                    { shape: 'dots', count: 5, color: '#50b892' },
                    { shape: 'dots', count: 4, color: '#50b892' },
                    { shape: 'dots', count: 6, color: '#50b892' },
                    { shape: 'dots', count: 1, color: '#50b892' },
                ],
                explanation: 'Number of dots increases by 1 each step'
            }
        ];
    }
    
    bindEvents() {
        const newPatternBtn = document.getElementById('new-visual-pattern');
        if (newPatternBtn) {
            newPatternBtn.addEventListener('click', () => this.nextPattern());
        }
    }
    
    renderPattern() {
        if (!this.grid || !this.options) return;
        
        const pattern = this.patterns[this.currentPattern];
        
        // Clear previous
        this.grid.innerHTML = '';
        this.options.innerHTML = '';
        this.feedback.textContent = '';
        this.feedback.className = 'pattern-feedback';
        this.selectedOption = null;
        
        // Render grid
        pattern.grid.forEach((cell, index) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'pattern-cell' + (cell === null ? ' missing' : '');
            
            if (cell) {
                cellEl.appendChild(this.createShape(cell));
            } else {
                cellEl.innerHTML = '<span class="missing-marker">?</span>';
            }
            
            this.grid.appendChild(cellEl);
        });
        
        // Render options (shuffled)
        const shuffledOptions = [...pattern.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach((opt, index) => {
            const optEl = document.createElement('div');
            optEl.className = 'pattern-option';
            optEl.appendChild(this.createShape(opt));
            
            optEl.addEventListener('click', () => this.selectOption(optEl, opt, pattern));
            
            this.options.appendChild(optEl);
        });
    }
    
    createShape(config) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 60 60');
        svg.setAttribute('width', '50');
        svg.setAttribute('height', '50');
        
        if (config.shape === 'circle') {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const size = config.size || 25;
            circle.setAttribute('cx', '30');
            circle.setAttribute('cy', '30');
            circle.setAttribute('r', size / 2);
            circle.setAttribute('fill', config.color);
            svg.appendChild(circle);
        } else if (config.shape === 'square') {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const size = config.size || 30;
            rect.setAttribute('x', 30 - size/2);
            rect.setAttribute('y', 30 - size/2);
            rect.setAttribute('width', size);
            rect.setAttribute('height', size);
            rect.setAttribute('fill', config.color);
            if (config.rotation) {
                rect.setAttribute('transform', `rotate(${config.rotation} 30 30)`);
            }
            svg.appendChild(rect);
        } else if (config.shape === 'triangle') {
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '30,10 50,50 10,50');
            polygon.setAttribute('fill', config.color);
            svg.appendChild(polygon);
        } else if (config.shape === 'dots') {
            const positions = [
                [30, 30],
                [20, 20], [40, 40],
                [20, 40], [40, 20],
                [30, 15], [30, 45]
            ];
            for (let i = 0; i < config.count; i++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', positions[i][0]);
                circle.setAttribute('cy', positions[i][1]);
                circle.setAttribute('r', '6');
                circle.setAttribute('fill', config.color);
                svg.appendChild(circle);
            }
        }
        
        return svg;
    }
    
    selectOption(element, option, pattern) {
        // Clear previous selection
        document.querySelectorAll('.pattern-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        element.classList.add('selected');
        this.selectedOption = option;
        
        // Check if correct
        const isCorrect = JSON.stringify(option) === JSON.stringify(pattern.answer);
        
        if (isCorrect) {
            element.classList.add('correct');
            this.feedback.textContent = '✓ Correct! ' + pattern.explanation;
            this.feedback.className = 'pattern-feedback correct';
            
            // Fill in the missing cell
            const missingCell = this.grid.querySelector('.missing');
            if (missingCell) {
                missingCell.innerHTML = '';
                missingCell.appendChild(this.createShape(option));
                missingCell.classList.remove('missing');
                missingCell.classList.add('filled');
            }
        } else {
            element.classList.add('incorrect');
            this.feedback.textContent = '✗ Not quite. Look for the pattern in how each element changes.';
            this.feedback.className = 'pattern-feedback incorrect';
        }
    }
    
    nextPattern() {
        this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
        this.renderPattern();
    }
}

// ============================================
// Analogy Lab
// ============================================

class AnalogyLab {
    constructor() {
        this.bindEvents();
    }
    
    bindEvents() {
        const checkBtn = document.getElementById('check-analogies');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswers());
        }
        
        const revealBtn = document.getElementById('reveal-analogies');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => this.revealAnswers());
        }
    }
    
    checkAnswers() {
        document.querySelectorAll('.analogy-item').forEach(item => {
            const select = item.querySelector('.analogy-select');
            const explanation = item.querySelector('.analogy-explanation');
            
            const userAnswer = select.value;
            const correctAnswer = select.dataset.answer;
            
            if (userAnswer === correctAnswer) {
                select.classList.add('correct');
                select.classList.remove('incorrect');
                explanation.classList.remove('hidden');
            } else if (userAnswer !== '') {
                select.classList.add('incorrect');
                select.classList.remove('correct');
            }
        });
    }
    
    revealAnswers() {
        document.querySelectorAll('.analogy-item').forEach(item => {
            const select = item.querySelector('.analogy-select');
            const explanation = item.querySelector('.analogy-explanation');
            
            select.value = select.dataset.answer;
            select.classList.add('revealed');
            explanation.classList.remove('hidden');
        });
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
            1: { 
                correct: 'b', 
                explanation: 'Patterns are distinguished by having compact descriptions (compression) and predictive power on unseen data. Random noise has neither property.' 
            },
            2: { 
                correct: 'b', 
                explanation: 'This is classic overfitting: the model learned patterns specific to the training data (including noise) that don\'t generalize to new data.' 
            },
            3: { 
                correct: 'a', 
                explanation: 'Before deep learning, features had to be hand-engineered. Deep learning\'s breakthrough was learning useful representations automatically through optimization.' 
            },
            4: { 
                correct: 'b', 
                explanation: 'Invariance means the model\'s output remains stable despite transformations (rotation, translation, scale) that don\'t change the underlying concept.' 
            },
            5: { 
                correct: 'b', 
                explanation: 'This is a famous real example of spurious correlation. The model found a predictive pattern that doesn\'t reflect medical causation—portable machines are used for sicker patients, creating a correlation without causation.' 
            }
        };
        
        this.answers = {};
        this.bindEvents();
    }
    
    bindEvents() {
        // Option selection
        this.container.querySelectorAll('.option input').forEach(input => {
            input.addEventListener('change', (e) => {
                const questionNum = e.target.name.replace('q', '');
                this.answers[questionNum] = e.target.value;
            });
        });
        
        // Submit button
        const submitBtn = document.getElementById('submit-quiz');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submit());
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-quiz');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    submit() {
        if (Object.keys(this.answers).length < Object.keys(this.questions).length) {
            alert('Please answer all questions before submitting.');
            return;
        }
        
        let score = 0;
        
        for (const [qNum, answer] of Object.entries(this.answers)) {
            const question = this.questions[qNum];
            const questionEl = this.container.querySelector(`[data-question="${qNum}"]`);
            const selectedOption = questionEl.querySelector(`input[value="${answer}"]`).closest('.option');
            const correctOption = questionEl.querySelector(`input[value="${question.correct}"]`).closest('.option');
            const feedbackEl = questionEl.querySelector('.question-feedback');
            
            if (answer === question.correct) {
                score++;
                selectedOption.classList.add('correct');
                feedbackEl.classList.add('correct', 'show');
                feedbackEl.textContent = '✓ Correct. ' + question.explanation;
            } else {
                selectedOption.classList.add('incorrect');
                correctOption.classList.add('correct');
                feedbackEl.classList.add('incorrect', 'show');
                feedbackEl.innerHTML = `✗ Incorrect. ${question.explanation}`;
            }
            
            questionEl.querySelectorAll('input').forEach(input => input.disabled = true);
        }
        
        const resultsEl = document.getElementById('quiz-results');
        const scoreEl = document.getElementById('score-value');
        const messageEl = document.getElementById('results-message');
        
        scoreEl.textContent = score;
        resultsEl.classList.add('show');
        
        if (score === 5) {
            messageEl.textContent = 'Excellent! You understand pattern recognition fundamentals.';
        } else if (score >= 3) {
            messageEl.textContent = 'Good progress. Review the explanations for questions you missed.';
        } else {
            messageEl.textContent = 'Consider re-reading the module and trying again.';
        }
    }
    
    reset() {
        this.answers = {};
        
        this.container.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('correct', 'incorrect');
        });
        
        this.container.querySelectorAll('.question-feedback').forEach(fb => {
            fb.classList.remove('correct', 'incorrect', 'show');
            fb.textContent = '';
        });
        
        this.container.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = false;
            input.disabled = false;
        });
        
        document.getElementById('quiz-results').classList.remove('show');
    }
}

// ============================================
// Additional Styles for Lab
// ============================================

const additionalStyles = `
    .lab-tabs {
        display: flex;
        gap: var(--space-sm);
        margin-bottom: var(--space-xl);
        border-bottom: 1px solid var(--surface-2);
        padding-bottom: var(--space-md);
    }
    
    .lab-tab {
        padding: var(--space-sm) var(--space-lg);
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .lab-tab:hover {
        color: var(--text-primary);
        background: var(--surface-2);
    }
    
    .lab-tab.active {
        background: var(--surface-2);
        border-color: var(--surface-3);
        border-bottom-color: var(--surface-2);
        color: var(--accent-gold);
    }
    
    .lab-panel {
        display: none;
    }
    
    .lab-panel.active {
        display: block;
        animation: fadeIn 0.3s ease;
    }
    
    .lab-description {
        margin-bottom: var(--space-lg);
        color: var(--text-secondary);
    }
    
    /* Sequence Patterns */
    .sequence-challenges {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .sequence-challenge {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .challenge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-md);
    }
    
    .challenge-level {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .challenge-status {
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .challenge-status.correct {
        color: var(--success);
    }
    
    .challenge-status.incorrect {
        color: var(--error);
    }
    
    .sequence-display {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        flex-wrap: wrap;
    }
    
    .seq-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background: var(--surface-3);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .seq-item.answer-box {
        background: var(--bg-tertiary);
        border: 2px dashed var(--accent-gold-dim);
    }
    
    .seq-input {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        text-align: center;
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        outline: none;
    }
    
    .seq-input::placeholder {
        color: var(--text-muted);
    }
    
    .seq-input.correct {
        color: var(--success);
    }
    
    .seq-input.incorrect {
        color: var(--error);
    }
    
    .seq-input.revealed {
        color: var(--accent-gold);
    }
    
    .pattern-explanation {
        margin-top: var(--space-md);
        padding: var(--space-md);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .pattern-explanation.hidden {
        display: none;
    }
    
    /* Visual Patterns */
    .visual-pattern-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xl);
    }
    
    .pattern-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
        justify-content: center;
    }
    
    .pattern-cell {
        width: 70px;
        height: 70px;
        background: var(--surface-2);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .pattern-cell.missing {
        border: 2px dashed var(--accent-gold-dim);
        background: transparent;
    }
    
    .pattern-cell.filled {
        background: var(--success-bg);
        border: 2px solid var(--success);
    }
    
    .missing-marker {
        font-size: 1.5rem;
        color: var(--text-muted);
    }
    
    .pattern-options {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .pattern-option {
        width: 70px;
        height: 70px;
        background: var(--surface-1);
        border: 2px solid var(--surface-3);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .pattern-option:hover {
        border-color: var(--text-tertiary);
    }
    
    .pattern-option.selected {
        border-color: var(--accent-gold);
    }
    
    .pattern-option.correct {
        border-color: var(--success);
        background: var(--success-bg);
    }
    
    .pattern-option.incorrect {
        border-color: var(--error);
        background: var(--error-bg);
    }
    
    .pattern-feedback {
        text-align: center;
        font-size: 0.95rem;
        min-height: 24px;
    }
    
    .pattern-feedback.correct {
        color: var(--success);
    }
    
    .pattern-feedback.incorrect {
        color: var(--error);
    }
    
    /* Analogies */
    .analogy-challenges {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }
    
    .analogy-item {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .analogy-format {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
        font-size: 1.1rem;
    }
    
    .analogy-word {
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .analogy-relation {
        color: var(--text-muted);
    }
    
    .analogy-equiv {
        color: var(--accent-gold);
        font-weight: 600;
        margin: 0 var(--space-sm);
    }
    
    .analogy-select {
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-3);
        border: 1px solid var(--surface-3);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 1rem;
        cursor: pointer;
    }
    
    .analogy-select.correct {
        border-color: var(--success);
        background: var(--success-bg);
    }
    
    .analogy-select.incorrect {
        border-color: var(--error);
        background: var(--error-bg);
    }
    
    .analogy-select.revealed {
        border-color: var(--accent-gold);
    }
    
    .analogy-explanation {
        margin-top: var(--space-md);
        padding: var(--space-md);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .analogy-explanation.hidden {
        display: none;
    }
    
    /* Concept Grid */
    .concept-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-lg);
        margin-bottom: var(--space-xl);
    }
    
    .concept-list {
        margin: var(--space-md) 0;
        padding-left: var(--space-lg);
    }
    
    .concept-list li {
        margin-bottom: var(--space-sm);
        color: var(--text-secondary);
    }
    
    .highlight-card {
        background: linear-gradient(135deg, var(--accent-gold-glow), transparent);
        border: 1px solid rgba(212, 168, 85, 0.2);
    }
    
    .example-block {
        background: var(--surface-1);
        border-left: 3px solid var(--accent-blue-dim);
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        padding: var(--space-xl);
        margin: var(--space-xl) 0;
    }
    
    .example-title {
        font-family: var(--font-display);
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent-blue);
        margin-bottom: var(--space-md);
    }
    
    .example-block p {
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
    }
    
    .example-block p:last-child {
        margin-bottom: 0;
    }
    
    /* Representation Demo */
    .visual-example {
        margin: var(--space-xl) 0;
    }
    
    .visual-example h4 {
        font-family: var(--font-display);
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: var(--space-lg);
    }
    
    .representation-demo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-lg);
        flex-wrap: wrap;
    }
    
    .repr-box {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        min-width: 250px;
        text-align: center;
    }
    
    .repr-title {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
        margin-bottom: var(--space-sm);
    }
    
    .repr-content code {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--accent-gold);
        display: block;
        margin-bottom: var(--space-sm);
    }
    
    .repr-note {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }
    
    .repr-arrow {
        font-size: 1.5rem;
        color: var(--accent-gold);
    }
    
    /* Navigation links */
    .nav-link {
        display: flex;
        align-items: baseline;
        gap: var(--space-md);
        text-decoration: none;
        color: inherit;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new LabTabs();
    new SequencePatternLab();
    new VisualPatternLab();
    new AnalogyLab();
    new ModuleQuiz('quiz-container');
});

