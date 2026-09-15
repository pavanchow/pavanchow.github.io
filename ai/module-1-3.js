/**
 * Module 1.3: Probability & Uncertainty
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
// Bayes Calculator Lab
// ============================================

class BayesCalculator {
    constructor() {
        this.priorSlider = document.getElementById('prior-slider');
        this.sensitivitySlider = document.getElementById('sensitivity-slider');
        this.fprSlider = document.getElementById('fpr-slider');
        
        this.priorValue = document.getElementById('prior-value');
        this.sensitivityValue = document.getElementById('sensitivity-value');
        this.fprValue = document.getElementById('fpr-value');
        
        this.posteriorValue = document.getElementById('posterior-value');
        this.breakdownFormula = document.getElementById('breakdown-formula');
        this.populationGrid = document.getElementById('population-grid');
        
        this.bindEvents();
        this.update();
    }
    
    bindEvents() {
        [this.priorSlider, this.sensitivitySlider, this.fprSlider].forEach(slider => {
            if (slider) {
                slider.addEventListener('input', () => this.update());
            }
        });
    }
    
    update() {
        const prior = parseFloat(this.priorSlider.value) / 100;
        const sensitivity = parseFloat(this.sensitivitySlider.value) / 100;
        const fpr = parseFloat(this.fprSlider.value) / 100;
        
        // Update display values
        this.priorValue.textContent = this.priorSlider.value + '%';
        this.sensitivityValue.textContent = this.sensitivitySlider.value + '%';
        this.fprValue.textContent = this.fprSlider.value + '%';
        
        // Calculate P(Positive)
        const pPositive = sensitivity * prior + fpr * (1 - prior);
        
        // Calculate posterior P(Disease | Positive)
        const posterior = (sensitivity * prior) / pPositive;
        
        // Update result
        this.posteriorValue.textContent = (posterior * 100).toFixed(1) + '%';
        
        // Update color based on value
        if (posterior > 0.5) {
            this.posteriorValue.style.color = '#e07a5f';
        } else {
            this.posteriorValue.style.color = '#50b892';
        }
        
        // Update breakdown formula
        this.breakdownFormula.innerHTML = `
            <div class="formula-step">
                <span class="step-label">P(Positive)</span>
                <span class="step-calc">= P(Pos|Disease) × P(Disease) + P(Pos|Healthy) × P(Healthy)</span>
            </div>
            <div class="formula-step">
                <span class="step-label"></span>
                <span class="step-calc">= ${(sensitivity*100).toFixed(0)}% × ${(prior*100).toFixed(1)}% + ${(fpr*100).toFixed(0)}% × ${((1-prior)*100).toFixed(1)}%</span>
            </div>
            <div class="formula-step">
                <span class="step-label"></span>
                <span class="step-calc">= ${(pPositive*100).toFixed(2)}%</span>
            </div>
            <div class="formula-step highlight">
                <span class="step-label">P(Disease|Positive)</span>
                <span class="step-calc">= (${(sensitivity*100).toFixed(0)}% × ${(prior*100).toFixed(1)}%) / ${(pPositive*100).toFixed(2)}%</span>
            </div>
            <div class="formula-step result">
                <span class="step-label"></span>
                <span class="step-calc">= <strong>${(posterior*100).toFixed(1)}%</strong></span>
            </div>
        `;
        
        // Update population grid visualization
        this.updatePopulationGrid(prior, sensitivity, fpr);
    }
    
    updatePopulationGrid(prior, sensitivity, fpr) {
        if (!this.populationGrid) return;
        
        const total = 100;
        const sick = Math.round(prior * total);
        const healthy = total - sick;
        
        const truePositive = Math.round(sensitivity * sick);
        const falseNegative = sick - truePositive;
        const falsePositive = Math.round(fpr * healthy);
        const trueNegative = healthy - falsePositive;
        
        let html = '';
        let count = 0;
        
        // Sick people (true positives and false negatives)
        for (let i = 0; i < truePositive; i++) {
            html += '<div class="grid-dot sick-positive" title="Sick, Test Positive"></div>';
            count++;
        }
        for (let i = 0; i < falseNegative; i++) {
            html += '<div class="grid-dot sick-negative" title="Sick, Test Negative"></div>';
            count++;
        }
        
        // Healthy people (false positives and true negatives)
        for (let i = 0; i < falsePositive; i++) {
            html += '<div class="grid-dot healthy-positive" title="Healthy, Test Positive"></div>';
            count++;
        }
        for (let i = 0; i < trueNegative; i++) {
            html += '<div class="grid-dot healthy-negative" title="Healthy, Test Negative"></div>';
            count++;
        }
        
        this.populationGrid.innerHTML = html;
    }
}

// ============================================
// Distribution Visualizer
// ============================================

class DistributionVisualizer {
    constructor() {
        this.canvas = document.getElementById('distribution-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        this.typeSelect = document.getElementById('dist-type');
        this.meanSlider = document.getElementById('dist-mean');
        this.spreadSlider = document.getElementById('dist-spread');
        
        this.meanValue = document.getElementById('mean-value');
        this.spreadValue = document.getElementById('spread-value');
        
        this.statMean = document.getElementById('stat-mean');
        this.statStd = document.getElementById('stat-std');
        this.statProb = document.getElementById('stat-prob');
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        [this.typeSelect, this.meanSlider, this.spreadSlider].forEach(el => {
            if (el) {
                el.addEventListener('input', () => this.draw());
            }
        });
    }
    
    normalPDF(x, mean, std) {
        const variance = std * std;
        return (1 / Math.sqrt(2 * Math.PI * variance)) * 
               Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    }
    
    normalCDF(x, mean, std) {
        // Approximation of the cumulative distribution function
        const z = (x - mean) / std;
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - p : p;
    }
    
    draw() {
        const type = this.typeSelect ? this.typeSelect.value : 'normal';
        const mean = this.meanSlider ? parseFloat(this.meanSlider.value) : 50;
        const spread = this.spreadSlider ? parseFloat(this.spreadSlider.value) : 15;
        
        // Update display values
        if (this.meanValue) this.meanValue.textContent = mean;
        if (this.spreadValue) this.spreadValue.textContent = spread;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        
        // Clear canvas
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        this.ctx.strokeStyle = '#2d333d';
        this.ctx.lineWidth = 1;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.stroke();
        
        // Generate distribution data
        const points = [];
        const xMin = 0;
        const xMax = 100;
        const numPoints = 200;
        
        let maxY = 0;
        
        for (let i = 0; i < numPoints; i++) {
            const x = xMin + (xMax - xMin) * (i / numPoints);
            let y;
            
            if (type === 'normal') {
                y = this.normalPDF(x, mean, spread);
            } else if (type === 'uniform') {
                const halfWidth = spread;
                y = (x >= mean - halfWidth && x <= mean + halfWidth) ? 1 / (2 * halfWidth) : 0;
            } else if (type === 'bimodal') {
                y = this.normalPDF(x, mean - spread, spread/2) * 0.5 + 
                    this.normalPDF(x, mean + spread, spread/2) * 0.5;
            }
            
            maxY = Math.max(maxY, y);
            points.push({ x, y });
        }
        
        // Draw distribution
        const xScale = (width - 2 * padding) / (xMax - xMin);
        const yScale = (height - 2 * padding) / maxY;
        
        // Fill area
        this.ctx.beginPath();
        this.ctx.moveTo(padding, height - padding);
        
        points.forEach((point, i) => {
            const px = padding + (point.x - xMin) * xScale;
            const py = height - padding - point.y * yScale;
            
            if (i === 0) {
                this.ctx.lineTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        });
        
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.closePath();
        
        const gradient = this.ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(212, 168, 85, 0.4)');
        gradient.addColorStop(1, 'rgba(212, 168, 85, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw line
        this.ctx.beginPath();
        points.forEach((point, i) => {
            const px = padding + (point.x - xMin) * xScale;
            const py = height - padding - point.y * yScale;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        });
        this.ctx.strokeStyle = '#d4a855';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw mean line
        const meanPx = padding + (mean - xMin) * xScale;
        this.ctx.beginPath();
        this.ctx.moveTo(meanPx, padding);
        this.ctx.lineTo(meanPx, height - padding);
        this.ctx.strokeStyle = 'rgba(91, 155, 213, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw label for mean
        this.ctx.fillStyle = '#5b9bd5';
        this.ctx.font = '12px "DM Sans"';
        this.ctx.fillText('μ = ' + mean, meanPx + 5, padding + 15);
        
        // X-axis labels
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = '11px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        for (let x = 0; x <= 100; x += 20) {
            const px = padding + x * xScale;
            this.ctx.fillText(x.toString(), px, height - padding + 20);
        }
        
        // Update stats
        if (this.statMean) this.statMean.textContent = mean;
        if (this.statStd) this.statStd.textContent = spread;
        
        // Calculate P(X < 40)
        let prob;
        if (type === 'normal') {
            prob = this.normalCDF(40, mean, spread);
        } else if (type === 'uniform') {
            const low = mean - spread;
            const high = mean + spread;
            if (40 <= low) prob = 0;
            else if (40 >= high) prob = 1;
            else prob = (40 - low) / (high - low);
        } else {
            prob = (this.normalCDF(40, mean - spread, spread/2) + this.normalCDF(40, mean + spread, spread/2)) / 2;
        }
        
        if (this.statProb) this.statProb.textContent = (prob * 100).toFixed(1) + '%';
    }
}

// ============================================
// Calibration Demo
// ============================================

class CalibrationDemo {
    constructor() {
        this.numTrials = 0;
        this.results = {
            bins: [[], [], [], [], []], // 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
        };
        
        this.currentModel = 'calibrated';
        this.currentConfidence = 0;
        this.currentIsActuallyCat = true;
        
        this.images = ['🐱', '🐕', '🐱', '🐈', '🐶', '🐱', '🐩', '🐱', '🐱', '🐕'];
        this.currentImageIndex = 0;
        
        this.bindEvents();
        this.generateQuestion();
    }
    
    bindEvents() {
        // Model selection
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentModel = btn.dataset.model;
                this.resetResults();
            });
        });
        
        // Answer buttons
        const catBtn = document.getElementById('answer-cat');
        const notCatBtn = document.getElementById('answer-not-cat');
        
        if (catBtn) catBtn.addEventListener('click', () => this.recordAnswer(true));
        if (notCatBtn) notCatBtn.addEventListener('click', () => this.recordAnswer(false));
    }
    
    generateQuestion() {
        // Pick a random image
        this.currentImageIndex = Math.floor(Math.random() * this.images.length);
        const image = this.images[this.currentImageIndex];
        this.currentIsActuallyCat = image === '🐱' || image === '🐈';
        
        // Generate model's confidence based on model type
        let baseConfidence;
        if (this.currentIsActuallyCat) {
            baseConfidence = 0.7 + Math.random() * 0.25; // 70-95% for actual cats
        } else {
            baseConfidence = 0.3 + Math.random() * 0.4; // 30-70% for non-cats
        }
        
        // Adjust based on model type
        if (this.currentModel === 'overconfident') {
            // Push towards extremes
            if (baseConfidence > 0.5) {
                this.currentConfidence = Math.min(0.99, baseConfidence + 0.15);
            } else {
                this.currentConfidence = Math.max(0.01, baseConfidence - 0.15);
            }
        } else if (this.currentModel === 'underconfident') {
            // Push towards 50%
            this.currentConfidence = 0.5 + (baseConfidence - 0.5) * 0.5;
        } else {
            // Calibrated model
            this.currentConfidence = baseConfidence;
        }
        
        // Update display
        const imageEl = document.getElementById('test-image');
        const confEl = document.getElementById('model-confidence');
        
        if (imageEl) imageEl.textContent = image;
        if (confEl) confEl.textContent = (this.currentConfidence * 100).toFixed(0) + '%';
    }
    
    recordAnswer(userSaidCat) {
        const modelPredictedCat = this.currentConfidence > 0.5;
        const modelCorrect = (modelPredictedCat === this.currentIsActuallyCat);
        
        // Determine which bin this confidence falls into
        const confidence = this.currentConfidence > 0.5 ? this.currentConfidence : (1 - this.currentConfidence);
        let binIndex;
        if (confidence < 0.6) binIndex = 0;
        else if (confidence < 0.7) binIndex = 1;
        else if (confidence < 0.8) binIndex = 2;
        else if (confidence < 0.9) binIndex = 3;
        else binIndex = 4;
        
        this.results.bins[binIndex].push(modelCorrect ? 1 : 0);
        this.numTrials++;
        
        // Update display
        this.updateCalibrationChart();
        this.generateQuestion();
    }
    
    updateCalibrationChart() {
        const numTrialsEl = document.getElementById('num-trials');
        const chartEl = document.getElementById('calibration-chart');
        const interpEl = document.getElementById('calibration-interpretation');
        
        if (numTrialsEl) numTrialsEl.textContent = this.numTrials;
        
        if (chartEl) {
            const binLabels = ['50-60%', '60-70%', '70-80%', '80-90%', '90-100%'];
            const expectedAccuracies = [55, 65, 75, 85, 95];
            
            let html = '<div class="calibration-bars">';
            
            this.results.bins.forEach((bin, i) => {
                const count = bin.length;
                const accuracy = count > 0 ? (bin.reduce((a, b) => a + b, 0) / count * 100) : null;
                const expected = expectedAccuracies[i];
                
                html += `
                    <div class="calibration-bar-group">
                        <div class="bar-label">${binLabels[i]}</div>
                        <div class="bar-container">
                            <div class="bar expected" style="height: ${expected}%"></div>
                            ${accuracy !== null ? 
                                `<div class="bar actual" style="height: ${accuracy}%"></div>` : 
                                '<div class="bar actual empty"></div>'}
                        </div>
                        <div class="bar-value">${accuracy !== null ? accuracy.toFixed(0) + '%' : '—'}</div>
                        <div class="bar-count">(n=${count})</div>
                    </div>
                `;
            });
            
            html += '</div>';
            html += '<div class="calibration-legend"><span class="legend-expected">■ Expected</span><span class="legend-actual">■ Actual</span></div>';
            
            chartEl.innerHTML = html;
        }
        
        if (interpEl && this.numTrials >= 10) {
            if (this.currentModel === 'calibrated') {
                interpEl.textContent = 'A well-calibrated model has actual accuracy matching expected confidence. The bars should be similar heights.';
            } else if (this.currentModel === 'overconfident') {
                interpEl.textContent = 'An overconfident model claims high confidence but is often wrong. Actual accuracy (orange) is lower than expected (blue).';
            } else {
                interpEl.textContent = 'An underconfident model is often more accurate than it claims. It could be trusted more than its stated confidence suggests.';
            }
        }
    }
    
    resetResults() {
        this.numTrials = 0;
        this.results.bins = [[], [], [], [], []];
        this.updateCalibrationChart();
        this.generateQuestion();
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
                explanation: 'The prior P(H) represents our initial belief in a hypothesis before observing any evidence. It gets updated to the posterior P(H|E) after seeing evidence.' 
            },
            2: { 
                correct: 'b', 
                explanation: 'Aleatoric uncertainty is inherent randomness (like noise) that cannot be reduced. Epistemic uncertainty comes from limited knowledge and can be reduced with more data or better models.' 
            },
            3: { 
                correct: 'b', 
                explanation: 'Using Bayes\' theorem: P(Disease|Pos) = (0.99 × 0.001) / (0.99 × 0.001 + 0.01 × 0.999) ≈ 9%. The false positives from the healthy majority dominate.' 
            },
            4: { 
                correct: 'b', 
                explanation: 'Calibration means the model\'s confidence scores match its actual accuracy rate. If it says 80% confident, it should be right about 80% of the time for such predictions.' 
            },
            5: { 
                correct: 'b', 
                explanation: 'Temperature controls randomness in sampling. Low temperature makes the model pick the most likely tokens (deterministic), high temperature flattens the distribution for more random, diverse outputs.' 
            }
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
        
        const submitBtn = document.getElementById('submit-quiz');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submit());
        }
        
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
            messageEl.textContent = 'Excellent! You understand probabilistic reasoning well.';
        } else if (score >= 3) {
            messageEl.textContent = 'Good progress. Review Bayes\' theorem and uncertainty types.';
        } else {
            messageEl.textContent = 'Consider re-reading the module, especially the Bayes example.';
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
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new LabTabs();
    new BayesCalculator();
    new DistributionVisualizer();
    new CalibrationDemo();
    new ModuleQuiz('quiz-container');
});

