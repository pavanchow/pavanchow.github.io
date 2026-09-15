// Module 5.1: Model Evaluation
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // ROC Curve Visualization
    // ==========================================
    const rocCanvas = document.getElementById('roc-canvas');
    const rocCtx = rocCanvas ? rocCanvas.getContext('2d') : null;

    function drawROCCurve() {
        if (!rocCtx) return;
        
        const width = rocCanvas.width;
        const height = rocCanvas.height;
        const padding = { left: 50, right: 20, top: 20, bottom: 40 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        
        // Clear
        rocCtx.fillStyle = '#0A0A0F';
        rocCtx.fillRect(0, 0, width, height);
        
        // Draw grid
        rocCtx.strokeStyle = '#1F2937';
        rocCtx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const x = padding.left + (i / 4) * plotWidth;
            const y = padding.top + (i / 4) * plotHeight;
            
            rocCtx.beginPath();
            rocCtx.moveTo(x, padding.top);
            rocCtx.lineTo(x, height - padding.bottom);
            rocCtx.stroke();
            
            rocCtx.beginPath();
            rocCtx.moveTo(padding.left, y);
            rocCtx.lineTo(width - padding.right, y);
            rocCtx.stroke();
        }
        
        // Draw axes
        rocCtx.strokeStyle = '#4B5563';
        rocCtx.lineWidth = 2;
        rocCtx.beginPath();
        rocCtx.moveTo(padding.left, padding.top);
        rocCtx.lineTo(padding.left, height - padding.bottom);
        rocCtx.lineTo(width - padding.right, height - padding.bottom);
        rocCtx.stroke();
        
        // Draw random baseline (diagonal)
        rocCtx.strokeStyle = '#6B7280';
        rocCtx.lineWidth = 1;
        rocCtx.setLineDash([5, 5]);
        rocCtx.beginPath();
        rocCtx.moveTo(padding.left, height - padding.bottom);
        rocCtx.lineTo(width - padding.right, padding.top);
        rocCtx.stroke();
        rocCtx.setLineDash([]);
        
        // Draw a "good model" ROC curve (AUC ~0.85)
        rocCtx.strokeStyle = '#D4A855';
        rocCtx.lineWidth = 3;
        rocCtx.beginPath();
        
        // Parametric curve for a good ROC
        for (let t = 0; t <= 100; t++) {
            const fpr = t / 100;
            // Use a power function to create the characteristic ROC shape
            const tpr = Math.pow(fpr, 0.3);
            
            const x = padding.left + fpr * plotWidth;
            const y = height - padding.bottom - tpr * plotHeight;
            
            if (t === 0) {
                rocCtx.moveTo(x, y);
            } else {
                rocCtx.lineTo(x, y);
            }
        }
        rocCtx.stroke();
        
        // Fill AUC area
        rocCtx.fillStyle = 'rgba(212, 168, 85, 0.15)';
        rocCtx.beginPath();
        rocCtx.moveTo(padding.left, height - padding.bottom);
        for (let t = 0; t <= 100; t++) {
            const fpr = t / 100;
            const tpr = Math.pow(fpr, 0.3);
            const x = padding.left + fpr * plotWidth;
            const y = height - padding.bottom - tpr * plotHeight;
            rocCtx.lineTo(x, y);
        }
        rocCtx.lineTo(width - padding.right, height - padding.bottom);
        rocCtx.closePath();
        rocCtx.fill();
        
        // Labels
        rocCtx.fillStyle = '#9CA3AF';
        rocCtx.font = '11px "DM Sans", sans-serif';
        rocCtx.textAlign = 'center';
        rocCtx.fillText('False Positive Rate (1 - Specificity)', width / 2, height - 8);
        
        rocCtx.save();
        rocCtx.translate(15, height / 2);
        rocCtx.rotate(-Math.PI / 2);
        rocCtx.fillText('True Positive Rate (Recall)', 0, 0);
        rocCtx.restore();
        
        // Axis values
        rocCtx.fillStyle = '#6B7280';
        rocCtx.font = '10px "JetBrains Mono", monospace';
        rocCtx.textAlign = 'center';
        rocCtx.fillText('0', padding.left, height - padding.bottom + 15);
        rocCtx.fillText('1', width - padding.right, height - padding.bottom + 15);
        
        rocCtx.textAlign = 'right';
        rocCtx.fillText('0', padding.left - 5, height - padding.bottom + 3);
        rocCtx.fillText('1', padding.left - 5, padding.top + 3);
        
        // AUC annotation
        rocCtx.fillStyle = '#D4A855';
        rocCtx.font = '12px "JetBrains Mono", monospace';
        rocCtx.textAlign = 'left';
        rocCtx.fillText('AUC ≈ 0.85', padding.left + 20, padding.top + 30);
        
        // Random line label
        rocCtx.fillStyle = '#6B7280';
        rocCtx.font = '10px "DM Sans", sans-serif';
        rocCtx.fillText('Random (AUC = 0.5)', width / 2 + 20, height / 2 + 30);
    }

    // ==========================================
    // Confusion Matrix Lab
    // ==========================================
    const tnInput = document.getElementById('tn-input');
    const fpInput = document.getElementById('fp-input');
    const fnInput = document.getElementById('fn-input');
    const tpInput = document.getElementById('tp-input');
    
    const accuracyVal = document.getElementById('accuracy-val');
    const precisionVal = document.getElementById('precision-val');
    const recallVal = document.getElementById('recall-val');
    const f1Val = document.getElementById('f1-val');
    const specificityVal = document.getElementById('specificity-val');
    const mccVal = document.getElementById('mcc-val');
    
    const presetBtns = document.querySelectorAll('.preset-btn');

    function computeMetrics() {
        const tn = parseInt(tnInput?.value) || 0;
        const fp = parseInt(fpInput?.value) || 0;
        const fn = parseInt(fnInput?.value) || 0;
        const tp = parseInt(tpInput?.value) || 0;
        
        const total = tn + fp + fn + tp;
        if (total === 0) return;
        
        // Accuracy
        const accuracy = (tp + tn) / total;
        if (accuracyVal) accuracyVal.textContent = (accuracy * 100).toFixed(1) + '%';
        
        // Precision
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        if (precisionVal) precisionVal.textContent = (precision * 100).toFixed(1) + '%';
        
        // Recall
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        if (recallVal) recallVal.textContent = (recall * 100).toFixed(1) + '%';
        
        // F1 Score
        const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
        if (f1Val) f1Val.textContent = (f1 * 100).toFixed(1) + '%';
        
        // Specificity
        const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;
        if (specificityVal) specificityVal.textContent = (specificity * 100).toFixed(1) + '%';
        
        // MCC
        const mccNum = (tp * tn) - (fp * fn);
        const mccDenom = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
        const mcc = mccDenom > 0 ? mccNum / mccDenom : 0;
        if (mccVal) mccVal.textContent = mcc.toFixed(2);
    }

    // Add event listeners
    [tnInput, fpInput, fnInput, tpInput].forEach(input => {
        if (input) {
            input.addEventListener('input', computeMetrics);
        }
    });

    // Preset scenarios
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (tnInput) tnInput.value = this.dataset.tn;
            if (fpInput) fpInput.value = this.dataset.fp;
            if (fnInput) fnInput.value = this.dataset.fn;
            if (tpInput) tpInput.value = this.dataset.tp;
            computeMetrics();
        });
    });

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
            correct: "Exactly! Recall (Sensitivity) measures the proportion of actual positives correctly identified. 10% recall means 90% of disease cases are missed—a critical failure that high accuracy masks.",
            incorrect: "Recall (Sensitivity) = TP/(TP+FN) measures how many actual positives are found. 10% recall means 90% of disease cases are missed. Accuracy is misleading here because the disease is rare."
        },
        q2: {
            correct: "Correct! AUC = 0.5 means the ROC curve follows the diagonal—the model's predictions are no better than random coin flips at distinguishing classes.",
            incorrect: "AUC = 0.5 corresponds to the diagonal line on the ROC curve, indicating the model has no discriminative power—it performs no better than random guessing."
        },
        q3: {
            correct: "Right! Data leakage occurs when information that wouldn't be available at prediction time is used during training. This includes test data contamination, future data in time series, or features that encode the target.",
            incorrect: "Data leakage is when information from the test set or deployment environment 'leaks' into training, causing inflated performance estimates that don't generalize."
        },
        q4: {
            correct: "Correct! FID compares the distribution of InceptionNet features between real and generated images. Lower FID suggests generated images come from a similar distribution as real images.",
            incorrect: "FID measures the distance between feature distributions (using InceptionNet) of real and generated images. It captures both quality and diversity but requires many samples for stability."
        },
        q5: {
            correct: "Exactly! MCC uses all four confusion matrix values and produces a balanced measure even when classes are highly imbalanced. It ranges from -1 to +1, where 0 indicates random performance.",
            incorrect: "MCC considers all four quadrants (TP, TN, FP, FN) and remains balanced even with severe class imbalance, unlike accuracy which can be misleadingly high when predicting the majority class."
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
                resultsMessage.textContent = "Excellent! You have a strong grasp of model evaluation principles.";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good progress! Review the metrics section to strengthen your understanding.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Consider revisiting the module, especially the classification metrics section.";
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
        drawROCCurve();
        computeMetrics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

