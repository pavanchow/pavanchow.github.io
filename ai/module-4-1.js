// Module 4.1: Generative vs Discriminative Models
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // Lab Tab Navigation
    // ==========================================
    const tabs = document.querySelectorAll('.lab-tab');
    const panels = document.querySelectorAll('.lab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}-panel`).classList.add('active');
        });
    });

    // ==========================================
    // Lab 1: Decision Boundary vs Density
    // ==========================================
    const discCanvas = document.getElementById('disc-canvas');
    const genCanvas = document.getElementById('gen-canvas');
    const discCtx = discCanvas ? discCanvas.getContext('2d') : null;
    const genCtx = genCanvas ? genCanvas.getContext('2d') : null;

    let dataPoints = [];
    const colors = {
        class0: '#FF6B6B',
        class1: '#4ECDC4',
        boundary: '#8B5CF6',
        density0: 'rgba(255, 107, 107, 0.15)',
        density1: 'rgba(78, 205, 196, 0.15)',
        background: '#0A0A0F'
    };

    function generateGaussianCluster(cx, cy, stdx, stdy, n) {
        const points = [];
        for (let i = 0; i < n; i++) {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
            points.push({
                x: cx + z1 * stdx,
                y: cy + z2 * stdy
            });
        }
        return points;
    }

    function generateData() {
        dataPoints = [];
        
        // Class 0: centered around (90, 140)
        const class0 = generateGaussianCluster(90, 140, 35, 40, 40);
        class0.forEach(p => dataPoints.push({ ...p, label: 0 }));
        
        // Class 1: centered around (190, 140)
        const class1 = generateGaussianCluster(190, 140, 35, 40, 40);
        class1.forEach(p => dataPoints.push({ ...p, label: 1 }));
        
        drawDiscriminative();
        drawGenerative();
    }

    function drawDiscriminative() {
        if (!discCtx) return;
        
        const width = discCanvas.width;
        const height = discCanvas.height;
        
        discCtx.fillStyle = colors.background;
        discCtx.fillRect(0, 0, width, height);
        
        // Draw decision boundary background
        const imageData = discCtx.createImageData(width, height);
        const data = imageData.data;
        
        // Compute class centroids
        const c0 = { x: 0, y: 0, count: 0 };
        const c1 = { x: 0, y: 0, count: 0 };
        dataPoints.forEach(p => {
            if (p.label === 0) {
                c0.x += p.x;
                c0.y += p.y;
                c0.count++;
            } else {
                c1.x += p.x;
                c1.y += p.y;
                c1.count++;
            }
        });
        c0.x /= c0.count;
        c0.y /= c0.count;
        c1.x /= c1.count;
        c1.y /= c1.count;
        
        // Midpoint between centroids
        const midX = (c0.x + c1.x) / 2;
        const midY = (c0.y + c1.y) / 2;
        
        // Direction perpendicular to line connecting centroids
        const dx = c1.x - c0.x;
        const dy = c1.y - c0.y;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Distance from point to decision boundary
                // Project onto direction from c0 to c1
                const projX = x - midX;
                const projY = y - midY;
                const dot = projX * dx + projY * dy;
                const dist = dot / Math.sqrt(dx * dx + dy * dy);
                
                // Sigmoid for smooth boundary
                const prob = 1 / (1 + Math.exp(-dist / 15));
                
                // Blend colors
                const r = Math.round(255 * (1 - prob) * 0.15 + 78 * prob * 0.15);
                const g = Math.round(107 * (1 - prob) * 0.15 + 205 * prob * 0.15);
                const b = Math.round(107 * (1 - prob) * 0.15 + 196 * prob * 0.15);
                
                data[idx] = r + 10;
                data[idx + 1] = g + 10;
                data[idx + 2] = b + 15;
                data[idx + 3] = 255;
            }
        }
        
        discCtx.putImageData(imageData, 0, 0);
        
        // Draw decision boundary line
        discCtx.strokeStyle = colors.boundary;
        discCtx.lineWidth = 3;
        discCtx.setLineDash([8, 4]);
        discCtx.beginPath();
        
        // Perpendicular line through midpoint
        const perpX = -dy;
        const perpY = dx;
        const scale = 200;
        discCtx.moveTo(midX - perpX / Math.sqrt(perpX*perpX + perpY*perpY) * scale,
                       midY - perpY / Math.sqrt(perpX*perpX + perpY*perpY) * scale);
        discCtx.lineTo(midX + perpX / Math.sqrt(perpX*perpX + perpY*perpY) * scale,
                       midY + perpY / Math.sqrt(perpX*perpX + perpY*perpY) * scale);
        discCtx.stroke();
        discCtx.setLineDash([]);
        
        // Draw data points
        dataPoints.forEach(p => {
            discCtx.beginPath();
            discCtx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            discCtx.fillStyle = p.label === 0 ? colors.class0 : colors.class1;
            discCtx.fill();
            discCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            discCtx.lineWidth = 1;
            discCtx.stroke();
        });
        
        // Label
        discCtx.fillStyle = colors.boundary;
        discCtx.font = '12px "JetBrains Mono", monospace';
        discCtx.fillText('Decision Boundary', 10, height - 10);
    }

    function drawGenerative() {
        if (!genCtx) return;
        
        const width = genCanvas.width;
        const height = genCanvas.height;
        
        genCtx.fillStyle = colors.background;
        genCtx.fillRect(0, 0, width, height);
        
        // Compute class statistics (mean and covariance)
        const stats = [
            { sumX: 0, sumY: 0, sumXX: 0, sumYY: 0, sumXY: 0, count: 0 },
            { sumX: 0, sumY: 0, sumXX: 0, sumYY: 0, sumXY: 0, count: 0 }
        ];
        
        dataPoints.forEach(p => {
            const s = stats[p.label];
            s.sumX += p.x;
            s.sumY += p.y;
            s.sumXX += p.x * p.x;
            s.sumYY += p.y * p.y;
            s.sumXY += p.x * p.y;
            s.count++;
        });
        
        const gaussians = stats.map(s => {
            const meanX = s.sumX / s.count;
            const meanY = s.sumY / s.count;
            const varX = s.sumXX / s.count - meanX * meanX;
            const varY = s.sumYY / s.count - meanY * meanY;
            const covXY = s.sumXY / s.count - meanX * meanY;
            return { meanX, meanY, varX, varY, covXY };
        });
        
        // Draw density contours
        function drawDensityContours(g, color) {
            genCtx.strokeStyle = color;
            genCtx.lineWidth = 2;
            
            // Draw ellipses at 1, 2, 3 standard deviations
            for (let k = 1; k <= 3; k++) {
                genCtx.globalAlpha = 1 - (k - 1) * 0.25;
                genCtx.beginPath();
                
                // Eigendecomposition for ellipse orientation
                const a = g.varX;
                const b = g.covXY;
                const c = g.varY;
                
                const trace = a + c;
                const det = a * c - b * b;
                const lambda1 = trace / 2 + Math.sqrt(trace * trace / 4 - det);
                const lambda2 = trace / 2 - Math.sqrt(trace * trace / 4 - det);
                
                const angle = Math.atan2(lambda1 - a, b) || 0;
                
                const rx = k * Math.sqrt(Math.max(lambda1, 1));
                const ry = k * Math.sqrt(Math.max(lambda2, 1));
                
                genCtx.ellipse(g.meanX, g.meanY, rx, ry, angle, 0, Math.PI * 2);
                genCtx.stroke();
            }
            genCtx.globalAlpha = 1;
        }
        
        drawDensityContours(gaussians[0], colors.class0);
        drawDensityContours(gaussians[1], colors.class1);
        
        // Draw means
        gaussians.forEach((g, i) => {
            genCtx.beginPath();
            genCtx.arc(g.meanX, g.meanY, 8, 0, Math.PI * 2);
            genCtx.fillStyle = i === 0 ? colors.class0 : colors.class1;
            genCtx.fill();
            genCtx.strokeStyle = '#fff';
            genCtx.lineWidth = 2;
            genCtx.stroke();
            
            // Cross marker
            genCtx.beginPath();
            genCtx.moveTo(g.meanX - 5, g.meanY);
            genCtx.lineTo(g.meanX + 5, g.meanY);
            genCtx.moveTo(g.meanX, g.meanY - 5);
            genCtx.lineTo(g.meanX, g.meanY + 5);
            genCtx.strokeStyle = '#fff';
            genCtx.lineWidth = 2;
            genCtx.stroke();
        });
        
        // Draw data points
        dataPoints.forEach(p => {
            genCtx.beginPath();
            genCtx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            genCtx.fillStyle = p.label === 0 ? colors.class0 : colors.class1;
            genCtx.globalAlpha = 0.7;
            genCtx.fill();
            genCtx.globalAlpha = 1;
        });
        
        // Label
        genCtx.fillStyle = '#9CA3AF';
        genCtx.font = '12px "JetBrains Mono", monospace';
        genCtx.fillText('P(x|class) Density Contours', 10, height - 10);
    }

    // Button handler
    const genNewDataBtn = document.getElementById('gen-new-data');
    if (genNewDataBtn) {
        genNewDataBtn.addEventListener('click', generateData);
    }

    // ==========================================
    // Lab 2: Sampling Visualizations
    // ==========================================
    const arCanvas = document.getElementById('ar-canvas');
    const vaeCanvas = document.getElementById('vae-canvas');
    const diffCanvas = document.getElementById('diff-canvas');

    const arCtx = arCanvas ? arCanvas.getContext('2d') : null;
    const vaeCtx = vaeCanvas ? vaeCanvas.getContext('2d') : null;
    const diffCtx = diffCanvas ? diffCanvas.getContext('2d') : null;

    let samplingAnimations = [];

    function createSimplePattern() {
        // Create a simple 16x16 "digit-like" pattern
        const size = 16;
        const pattern = [];
        
        // Generate a simple circular/blob pattern
        const cx = size / 2 + (Math.random() - 0.5) * 4;
        const cy = size / 2 + (Math.random() - 0.5) * 4;
        const rx = 3 + Math.random() * 3;
        const ry = 3 + Math.random() * 3;
        
        for (let y = 0; y < size; y++) {
            pattern[y] = [];
            for (let x = 0; x < size; x++) {
                const dx = (x - cx) / rx;
                const dy = (y - cy) / ry;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const value = Math.max(0, 1 - dist) + Math.random() * 0.1;
                pattern[y][x] = Math.min(1, Math.max(0, value));
            }
        }
        return pattern;
    }

    function drawPattern(ctx, pattern, progress = 1, mode = 'full') {
        if (!ctx) return;
        
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const size = pattern.length;
        const cellSize = Math.floor(Math.min(width, height) / size);
        const offsetX = (width - cellSize * size) / 2;
        const offsetY = (height - cellSize * size) / 2;
        
        ctx.fillStyle = '#0A0A0F';
        ctx.fillRect(0, 0, width, height);
        
        const totalCells = size * size;
        const cellsToShow = Math.floor(progress * totalCells);
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cellIdx = y * size + x;
                let value = pattern[y][x];
                let alpha = 1;
                
                if (mode === 'autoregressive') {
                    if (cellIdx >= cellsToShow) {
                        continue;
                    }
                } else if (mode === 'vae') {
                    // VAE shows all at once but with blur effect
                    const blur = 1 - progress;
                    value = value * progress + 0.3 * blur;
                } else if (mode === 'diffusion') {
                    // Diffusion: add decreasing noise
                    const noiseLevel = 1 - progress;
                    value = value * progress + (Math.random() * noiseLevel);
                }
                
                const intensity = Math.floor(value * 255);
                ctx.fillStyle = `rgb(${intensity}, ${Math.floor(intensity * 0.9)}, ${Math.floor(intensity * 1.1)})`;
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize - 1, cellSize - 1);
            }
        }
    }

    function runSamplingAnimation() {
        // Cancel any existing animations
        samplingAnimations.forEach(id => cancelAnimationFrame(id));
        samplingAnimations = [];
        
        const pattern = createSimplePattern();
        const duration = 2000; // 2 seconds
        const start = performance.now();
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(1, elapsed / duration);
            
            // Autoregressive: sequential pixel reveal
            drawPattern(arCtx, pattern, progress, 'autoregressive');
            
            // VAE: parallel but blurry → sharp
            drawPattern(vaeCtx, pattern, progress, 'vae');
            
            // Diffusion: noisy → clean
            drawPattern(diffCtx, pattern, progress, 'diffusion');
            
            if (progress < 1) {
                samplingAnimations.push(requestAnimationFrame(animate));
            }
        }
        
        samplingAnimations.push(requestAnimationFrame(animate));
    }

    const runSamplingBtn = document.getElementById('run-sampling');
    if (runSamplingBtn) {
        runSamplingBtn.addEventListener('click', runSamplingAnimation);
    }

    // ==========================================
    // Quiz Functionality
    // ==========================================
    const quizAnswers = {
        q1: 'b',
        q2: 'b',
        q3: 'b',
        q4: 'b',
        q5: 'b'
    };

    const quizExplanations = {
        q1: {
            correct: "Exactly! Discriminative models learn P(y|x)—the conditional probability of labels given input. Generative models learn P(x) or P(x,y)—the full data distribution, enabling them to generate new samples.",
            incorrect: "The key distinction is mathematical: discriminative models learn P(y|x) (label given input), while generative models learn P(x) or P(x,y) (the data distribution itself)."
        },
        q2: {
            correct: "Correct! GPT is autoregressive—it generates text token by token, each conditioned on all previous tokens: P(x) = P(x₁)P(x₂|x₁)P(x₃|x₁,x₂)...",
            incorrect: "GPT belongs to the autoregressive family. It generates text sequentially, predicting each token based on all previous tokens."
        },
        q3: {
            correct: "Right! Discriminative models focus entirely on the classification boundary without modeling irrelevant features of P(x). This focused optimization often yields better accuracy with limited data.",
            incorrect: "Discriminative models outperform for classification because they directly optimize for the task, ignoring features that don't help distinguish classes—a simpler problem than modeling P(x)."
        },
        q4: {
            correct: "Exactly! Diffusion models have much more stable training than GANs (no minimax game) and avoid mode collapse, covering the full data distribution better.",
            incorrect: "Diffusion models' main advantages over GANs are training stability (no adversarial training) and better mode coverage. The trade-off is slower sampling."
        },
        q5: {
            correct: "Correct! Generating new images requires sampling from P(image), which only generative models can do. The other tasks are classification/regression problems suited for discriminative approaches.",
            incorrect: "Creating new images requires generating samples from the data distribution—only possible with generative models. Classification tasks like spam detection use discriminative models."
        }
    };

    const submitQuizBtn = document.getElementById('submit-quiz');
    const resetQuizBtn = document.getElementById('reset-quiz');
    const quizResults = document.getElementById('quiz-results');

    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', function() {
            let score = 0;
            
            Object.keys(quizAnswers).forEach(q => {
                const questionDiv = document.querySelector(`[data-question="${q.slice(1)}"]`);
                const selected = document.querySelector(`input[name="${q}"]:checked`);
                const feedback = questionDiv.querySelector('.question-feedback');
                const options = questionDiv.querySelectorAll('.option');
                
                options.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect');
                });
                
                if (selected) {
                    const isCorrect = selected.value === quizAnswers[q];
                    if (isCorrect) {
                        score++;
                        selected.closest('.option').classList.add('correct');
                        feedback.innerHTML = `<span class="feedback-correct">✓ ${quizExplanations[q].correct}</span>`;
                    } else {
                        selected.closest('.option').classList.add('incorrect');
                        // Highlight correct answer
                        const correctOption = questionDiv.querySelector(`input[value="${quizAnswers[q]}"]`);
                        if (correctOption) {
                            correctOption.closest('.option').classList.add('correct');
                        }
                        feedback.innerHTML = `<span class="feedback-incorrect">✗ ${quizExplanations[q].incorrect}</span>`;
                    }
                } else {
                    feedback.innerHTML = `<span class="feedback-incorrect">Please select an answer.</span>`;
                }
                
                feedback.style.display = 'block';
            });
            
            // Show results
            const scoreValue = document.getElementById('score-value');
            const resultsMessage = document.getElementById('results-message');
            
            scoreValue.textContent = score;
            
            if (score === 5) {
                resultsMessage.textContent = "Excellent! You understand the generative/discriminative distinction perfectly.";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good work! Review the explanations above to strengthen your understanding.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Take another look at the material and try again.";
                resultsMessage.className = 'results-message needs-work';
            }
            
            quizResults.style.display = 'block';
        });
    }

    if (resetQuizBtn) {
        resetQuizBtn.addEventListener('click', function() {
            document.querySelectorAll('.quiz-question input[type="radio"]').forEach(input => {
                input.checked = false;
            });
            document.querySelectorAll('.question-feedback').forEach(feedback => {
                feedback.style.display = 'none';
            });
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
            });
            quizResults.style.display = 'none';
        });
    }

    // ==========================================
    // Initialize
    // ==========================================
    function init() {
        generateData();
        
        // Initialize sampling canvases with placeholder
        if (arCtx) {
            arCtx.fillStyle = '#0A0A0F';
            arCtx.fillRect(0, 0, arCanvas.width, arCanvas.height);
            arCtx.fillStyle = '#6B7280';
            arCtx.font = '12px "DM Sans", sans-serif';
            arCtx.textAlign = 'center';
            arCtx.fillText('Click "Generate"', arCanvas.width / 2, arCanvas.height / 2);
        }
        if (vaeCtx) {
            vaeCtx.fillStyle = '#0A0A0F';
            vaeCtx.fillRect(0, 0, vaeCanvas.width, vaeCanvas.height);
            vaeCtx.fillStyle = '#6B7280';
            vaeCtx.font = '12px "DM Sans", sans-serif';
            vaeCtx.textAlign = 'center';
            vaeCtx.fillText('Click "Generate"', vaeCanvas.width / 2, vaeCanvas.height / 2);
        }
        if (diffCtx) {
            diffCtx.fillStyle = '#0A0A0F';
            diffCtx.fillRect(0, 0, diffCanvas.width, diffCanvas.height);
            diffCtx.fillStyle = '#6B7280';
            diffCtx.font = '12px "DM Sans", sans-serif';
            diffCtx.textAlign = 'center';
            diffCtx.fillText('Click "Generate"', diffCanvas.width / 2, diffCanvas.height / 2);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

