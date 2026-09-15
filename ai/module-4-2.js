// Module 4.2: Diffusion Models
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // Diffusion Process Visualization
    // ==========================================
    const diffusionCanvas = document.getElementById('diffusion-canvas');
    const scheduleCanvas = document.getElementById('schedule-canvas');
    const diffCtx = diffusionCanvas ? diffusionCanvas.getContext('2d') : null;
    const schedCtx = scheduleCanvas ? scheduleCanvas.getContext('2d') : null;

    const timestepSlider = document.getElementById('timestep-slider');
    const timestepDisplay = document.getElementById('timestep-display');
    const scheduleSelect = document.getElementById('schedule-select');
    const playForwardBtn = document.getElementById('play-forward');
    const playReverseBtn = document.getElementById('play-reverse');
    const resetBtn = document.getElementById('reset-diffusion');

    let animationId = null;
    let originalPattern = null;
    let currentTimestep = 0;

    // Generate a simple pattern (circle with some structure)
    function createOriginalPattern(size) {
        const pattern = [];
        const cx = size / 2;
        const cy = size / 2;
        
        for (let y = 0; y < size; y++) {
            pattern[y] = [];
            for (let x = 0; x < size; x++) {
                // Create a face-like pattern
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Face circle
                let value = dist < size * 0.4 ? 0.9 : 0.1;
                
                // Eyes
                const eyeSize = size * 0.08;
                const eyeY = cy - size * 0.1;
                const leftEyeX = cx - size * 0.15;
                const rightEyeX = cx + size * 0.15;
                
                const leftEyeDist = Math.sqrt((x - leftEyeX) ** 2 + (y - eyeY) ** 2);
                const rightEyeDist = Math.sqrt((x - rightEyeX) ** 2 + (y - eyeY) ** 2);
                
                if (leftEyeDist < eyeSize || rightEyeDist < eyeSize) {
                    value = 0.2;
                }
                
                // Smile
                const smileY = cy + size * 0.1;
                const smileDist = Math.sqrt(dx * dx + (y - smileY) ** 2);
                if (smileDist > size * 0.15 && smileDist < size * 0.25 && y > smileY) {
                    value = 0.3;
                }
                
                pattern[y][x] = value;
            }
        }
        return pattern;
    }

    // Noise schedules
    function getAlphaBar(t, maxT, schedule) {
        const ratio = t / maxT;
        switch (schedule) {
            case 'linear':
                // Linear schedule: beta goes from 0.0001 to 0.02
                // alpha_bar decreases linearly (approximately)
                return 1 - ratio * 0.99;
            
            case 'cosine':
                // Cosine schedule: smoother transition
                const s = 0.008;
                const f_t = Math.cos((ratio + s) / (1 + s) * Math.PI / 2) ** 2;
                const f_0 = Math.cos(s / (1 + s) * Math.PI / 2) ** 2;
                return Math.max(f_t / f_0, 0.001);
            
            case 'quadratic':
                // Quadratic: faster initial decay
                return Math.max((1 - ratio) ** 2, 0.001);
            
            default:
                return 1 - ratio * 0.99;
        }
    }

    function addNoiseToPattern(pattern, alphaBar) {
        const size = pattern.length;
        const noisyPattern = [];
        const sqrtAlpha = Math.sqrt(alphaBar);
        const sqrtOneMinusAlpha = Math.sqrt(1 - alphaBar);
        
        for (let y = 0; y < size; y++) {
            noisyPattern[y] = [];
            for (let x = 0; x < size; x++) {
                // Box-Muller for Gaussian noise
                const u1 = Math.random();
                const u2 = Math.random();
                const noise = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
                
                // x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * noise
                const value = sqrtAlpha * pattern[y][x] + sqrtOneMinusAlpha * noise * 0.5;
                noisyPattern[y][x] = Math.max(0, Math.min(1, value));
            }
        }
        return noisyPattern;
    }

    function drawPattern(ctx, pattern, x, y, cellSize) {
        const size = pattern.length;
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const value = Math.floor(pattern[py][px] * 255);
                ctx.fillStyle = `rgb(${value}, ${Math.floor(value * 0.95)}, ${Math.floor(value * 1.05)})`;
                ctx.fillRect(x + px * cellSize, y + py * cellSize, cellSize, cellSize);
            }
        }
    }

    function drawDiffusionState() {
        if (!diffCtx || !originalPattern) return;
        
        const width = diffusionCanvas.width;
        const height = diffusionCanvas.height;
        const patternSize = originalPattern.length;
        const cellSize = Math.floor(height / patternSize) - 1;
        
        // Clear
        diffCtx.fillStyle = '#0A0A0F';
        diffCtx.fillRect(0, 0, width, height);
        
        const schedule = scheduleSelect ? scheduleSelect.value : 'linear';
        const alphaBar = getAlphaBar(currentTimestep, 100, schedule);
        const noisyPattern = currentTimestep === 0 ? originalPattern : addNoiseToPattern(originalPattern, alphaBar);
        
        // Draw original on left
        const padding = 30;
        drawPattern(diffCtx, originalPattern, padding, padding, cellSize);
        
        // Draw noisy in middle-right
        const rightX = width - patternSize * cellSize - padding;
        drawPattern(diffCtx, noisyPattern, rightX, padding, cellSize);
        
        // Labels
        diffCtx.fillStyle = '#9CA3AF';
        diffCtx.font = '11px "JetBrains Mono", monospace';
        diffCtx.textAlign = 'center';
        diffCtx.fillText('x₀ (Original)', padding + patternSize * cellSize / 2, height - 10);
        diffCtx.fillText(`x_t (t=${currentTimestep})`, rightX + patternSize * cellSize / 2, height - 10);
        
        // Alpha bar display
        diffCtx.fillStyle = '#8B5CF6';
        diffCtx.fillText(`α̅_t = ${alphaBar.toFixed(3)}`, width / 2, height - 10);
        
        // Arrow
        diffCtx.strokeStyle = '#6B7280';
        diffCtx.lineWidth = 2;
        diffCtx.beginPath();
        const arrowY = height / 2;
        const arrowStartX = padding + patternSize * cellSize + 20;
        const arrowEndX = rightX - 20;
        diffCtx.moveTo(arrowStartX, arrowY);
        diffCtx.lineTo(arrowEndX, arrowY);
        diffCtx.lineTo(arrowEndX - 10, arrowY - 8);
        diffCtx.moveTo(arrowEndX, arrowY);
        diffCtx.lineTo(arrowEndX - 10, arrowY + 8);
        diffCtx.stroke();
        
        // Update schedule visualization
        drawSchedule();
    }

    function drawSchedule() {
        if (!schedCtx) return;
        
        const width = scheduleCanvas.width;
        const height = scheduleCanvas.height;
        const schedule = scheduleSelect ? scheduleSelect.value : 'linear';
        
        schedCtx.fillStyle = '#0A0A0F';
        schedCtx.fillRect(0, 0, width, height);
        
        // Draw axes
        const padding = { left: 40, right: 20, top: 15, bottom: 25 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        
        schedCtx.strokeStyle = '#374151';
        schedCtx.lineWidth = 1;
        schedCtx.beginPath();
        schedCtx.moveTo(padding.left, padding.top);
        schedCtx.lineTo(padding.left, height - padding.bottom);
        schedCtx.lineTo(width - padding.right, height - padding.bottom);
        schedCtx.stroke();
        
        // Draw schedule curve
        schedCtx.strokeStyle = '#8B5CF6';
        schedCtx.lineWidth = 2;
        schedCtx.beginPath();
        
        for (let t = 0; t <= 100; t++) {
            const alpha = getAlphaBar(t, 100, schedule);
            const x = padding.left + (t / 100) * plotWidth;
            const y = height - padding.bottom - alpha * plotHeight;
            
            if (t === 0) {
                schedCtx.moveTo(x, y);
            } else {
                schedCtx.lineTo(x, y);
            }
        }
        schedCtx.stroke();
        
        // Mark current timestep
        const currentX = padding.left + (currentTimestep / 100) * plotWidth;
        const currentAlpha = getAlphaBar(currentTimestep, 100, schedule);
        const currentY = height - padding.bottom - currentAlpha * plotHeight;
        
        schedCtx.fillStyle = '#FF6B6B';
        schedCtx.beginPath();
        schedCtx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        schedCtx.fill();
        
        // Vertical line to current point
        schedCtx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
        schedCtx.setLineDash([4, 4]);
        schedCtx.beginPath();
        schedCtx.moveTo(currentX, currentY);
        schedCtx.lineTo(currentX, height - padding.bottom);
        schedCtx.stroke();
        schedCtx.setLineDash([]);
        
        // Labels
        schedCtx.fillStyle = '#9CA3AF';
        schedCtx.font = '10px "JetBrains Mono", monospace';
        schedCtx.textAlign = 'center';
        schedCtx.fillText('t=0', padding.left, height - 5);
        schedCtx.fillText('t=T', width - padding.right, height - 5);
        
        schedCtx.textAlign = 'right';
        schedCtx.fillText('1', padding.left - 5, padding.top + 5);
        schedCtx.fillText('0', padding.left - 5, height - padding.bottom + 5);
        
        // Y-axis label
        schedCtx.save();
        schedCtx.translate(12, height / 2);
        schedCtx.rotate(-Math.PI / 2);
        schedCtx.textAlign = 'center';
        schedCtx.fillText('α̅_t', 0, 0);
        schedCtx.restore();
    }

    // Animation functions
    function playForward() {
        if (animationId) cancelAnimationFrame(animationId);
        
        function animate() {
            if (currentTimestep < 100) {
                currentTimestep += 2;
                if (timestepSlider) timestepSlider.value = currentTimestep;
                if (timestepDisplay) timestepDisplay.textContent = `t = ${currentTimestep}`;
                drawDiffusionState();
                animationId = requestAnimationFrame(animate);
            }
        }
        animate();
    }

    function playReverse() {
        if (animationId) cancelAnimationFrame(animationId);
        
        function animate() {
            if (currentTimestep > 0) {
                currentTimestep -= 2;
                if (timestepSlider) timestepSlider.value = currentTimestep;
                if (timestepDisplay) timestepDisplay.textContent = `t = ${currentTimestep}`;
                drawDiffusionState();
                animationId = requestAnimationFrame(animate);
            }
        }
        animate();
    }

    function resetDiffusion() {
        if (animationId) cancelAnimationFrame(animationId);
        currentTimestep = 0;
        if (timestepSlider) timestepSlider.value = 0;
        if (timestepDisplay) timestepDisplay.textContent = 't = 0';
        drawDiffusionState();
    }

    // Event listeners
    if (timestepSlider) {
        timestepSlider.addEventListener('input', function() {
            currentTimestep = parseInt(this.value);
            if (timestepDisplay) timestepDisplay.textContent = `t = ${currentTimestep}`;
            drawDiffusionState();
        });
    }

    if (scheduleSelect) {
        scheduleSelect.addEventListener('change', drawDiffusionState);
    }

    if (playForwardBtn) {
        playForwardBtn.addEventListener('click', playForward);
    }

    if (playReverseBtn) {
        playReverseBtn.addEventListener('click', playReverse);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetDiffusion);
    }

    // ==========================================
    // Quiz Functionality
    // ==========================================
    const quizAnswers = {
        q1: 'b',
        q2: 'a',
        q3: 'b',
        q4: 'b',
        q5: 'b'
    };

    const quizExplanations = {
        q1: {
            correct: "Correct! In ε-prediction (the most common approach), the model learns to predict the noise that was added to a clean image. Given x_t and t, predict ε. This is equivalent to learning the score function.",
            incorrect: "The standard training objective (ε-prediction) has the model predict the noise ε that was added to create x_t. This is simpler than predicting the original image and works remarkably well."
        },
        q2: {
            correct: "Exactly! Latent Diffusion Models first compress images into a VAE latent space (~64× smaller), then run diffusion there. This is massively more efficient than pixel-space diffusion.",
            incorrect: "The key innovation is running diffusion in a compressed latent space. A pretrained VAE encodes images to latents, diffusion happens there, then the VAE decodes back to pixels."
        },
        q3: {
            correct: "Right! CFG lets you control how strongly the generation follows the prompt (high guidance) versus being more diverse (low guidance). It interpolates between conditional and unconditional predictions.",
            incorrect: "Classifier-Free Guidance controls the trade-off between prompt adherence and diversity. Higher guidance scale means more faithful to the prompt but less diverse."
        },
        q4: {
            correct: "Correct! The score ∇log p(x) points toward regions of higher probability. Predicting noise ε is mathematically equivalent to predicting the score. The model learns to follow this gradient from noise to data.",
            incorrect: "The score function ∇log p(x) is the gradient of log probability—it points toward high-probability regions. Predicting noise is equivalent to predicting the score, explaining why denoising leads to generation."
        },
        q5: {
            correct: "Exactly! The denoising objective (simple MSE on noise prediction) naturally trains the model to cover all modes of the distribution. There's no adversarial game where the generator might focus on fooling the discriminator with a few modes.",
            incorrect: "Mode collapse in GANs comes from the adversarial training dynamic. Diffusion models use a simple denoising objective (MSE) that naturally covers the full distribution—no minimax game, no mode collapse."
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
                
                options.forEach(opt => opt.classList.remove('correct', 'incorrect'));
                
                if (selected) {
                    const isCorrect = selected.value === quizAnswers[q];
                    if (isCorrect) {
                        score++;
                        selected.closest('.option').classList.add('correct');
                        feedback.innerHTML = `<span class="feedback-correct">✓ ${quizExplanations[q].correct}</span>`;
                    } else {
                        selected.closest('.option').classList.add('incorrect');
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
            
            const scoreValue = document.getElementById('score-value');
            const resultsMessage = document.getElementById('results-message');
            
            scoreValue.textContent = score;
            
            if (score === 5) {
                resultsMessage.textContent = "Excellent! You have a strong grasp of diffusion models.";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good progress! Review the mathematical foundations to solidify your understanding.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Consider revisiting the module, especially the forward/reverse process sections.";
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
        originalPattern = createOriginalPattern(20);
        drawDiffusionState();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

