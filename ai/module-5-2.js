// Module 5.2: Responsible AI Reasoning
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // Fairness Trade-offs Lab
    // ==========================================
    const thresholdA = document.getElementById('threshold-a');
    const thresholdB = document.getElementById('threshold-b');
    const thresholdAVal = document.getElementById('threshold-a-val');
    const thresholdBVal = document.getElementById('threshold-b-val');
    
    const approvalA = document.getElementById('approval-a');
    const approvalB = document.getElementById('approval-b');
    const dpDiff = document.getElementById('dp-diff');
    const tprA = document.getElementById('tpr-a');
    const tprB = document.getElementById('tpr-b');
    const eoDiff = document.getElementById('eo-diff');
    const overallAcc = document.getElementById('overall-acc');

    // Base rates: Group A has 60% qualified, Group B has 40% qualified
    const baseRateA = 0.6;
    const baseRateB = 0.4;
    const groupASize = 600;  // 60% of population
    const groupBSize = 400;  // 40% of population

    function computeFairnessMetrics() {
        const tA = parseInt(thresholdA?.value) || 50;
        const tB = parseInt(thresholdB?.value) || 50;
        
        // Update threshold display
        if (thresholdAVal) thresholdAVal.textContent = tA + '%';
        if (thresholdBVal) thresholdBVal.textContent = tB + '%';
        
        // For simplicity, assume scores are uniformly distributed
        // Qualified people have scores in [threshold, 100], unqualified in [0, threshold]
        // with some overlap
        
        // Group A
        const qualifiedA = groupASize * baseRateA;
        const unqualifiedA = groupASize * (1 - baseRateA);
        
        // At threshold tA, we approve tA% of qualified and (100-tA)/2% of unqualified (simplified)
        const tpA = qualifiedA * (100 - tA) / 100;  // True positives
        const fpA = unqualifiedA * (100 - tA) / 200;  // False positives (less likely)
        const fnA = qualifiedA - tpA;  // False negatives
        const tnA = unqualifiedA - fpA;  // True negatives
        
        // Group B
        const qualifiedB = groupBSize * baseRateB;
        const unqualifiedB = groupBSize * (1 - baseRateB);
        
        const tpB = qualifiedB * (100 - tB) / 100;
        const fpB = unqualifiedB * (100 - tB) / 200;
        const fnB = qualifiedB - tpB;
        const tnB = unqualifiedB - fpB;
        
        // Approval rates (demographic parity)
        const approvalRateA = (tpA + fpA) / groupASize;
        const approvalRateB = (tpB + fpB) / groupBSize;
        
        // True positive rates (equal opportunity)
        const tprAVal = tpA / qualifiedA;
        const tprBVal = tpB / qualifiedB;
        
        // Overall accuracy
        const totalCorrect = tpA + tnA + tpB + tnB;
        const totalPop = groupASize + groupBSize;
        const accuracy = totalCorrect / totalPop;
        
        // Update display
        if (approvalA) approvalA.textContent = (approvalRateA * 100).toFixed(0) + '%';
        if (approvalB) approvalB.textContent = (approvalRateB * 100).toFixed(0) + '%';
        if (dpDiff) {
            const diff = Math.abs(approvalRateA - approvalRateB) * 100;
            dpDiff.textContent = diff.toFixed(0) + '%';
            dpDiff.style.color = diff < 5 ? '#4ECDC4' : diff > 15 ? '#FF6B6B' : '#D4A855';
        }
        
        if (tprA) tprA.textContent = (tprAVal * 100).toFixed(0) + '%';
        if (tprB) tprB.textContent = (tprBVal * 100).toFixed(0) + '%';
        if (eoDiff) {
            const diff = Math.abs(tprAVal - tprBVal) * 100;
            eoDiff.textContent = diff.toFixed(0) + '%';
            eoDiff.style.color = diff < 5 ? '#4ECDC4' : diff > 15 ? '#FF6B6B' : '#D4A855';
        }
        
        if (overallAcc) overallAcc.textContent = (accuracy * 100).toFixed(0) + '%';
    }

    // Event listeners for sliders
    if (thresholdA) {
        thresholdA.addEventListener('input', computeFairnessMetrics);
    }
    if (thresholdB) {
        thresholdB.addEventListener('input', computeFairnessMetrics);
    }

    // Preset buttons
    const presetBtns = document.querySelectorAll('.fairness-lab .preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const preset = this.dataset.preset;
            
            switch(preset) {
                case 'equal-threshold':
                    if (thresholdA) thresholdA.value = 50;
                    if (thresholdB) thresholdB.value = 50;
                    break;
                case 'demographic-parity':
                    // Lower threshold for Group B to increase their approval rate
                    if (thresholdA) thresholdA.value = 50;
                    if (thresholdB) thresholdB.value = 25;
                    break;
                case 'max-accuracy':
                    // Optimal thresholds for accuracy
                    if (thresholdA) thresholdA.value = 40;
                    if (thresholdB) thresholdB.value = 60;
                    break;
            }
            
            computeFairnessMetrics();
        });
    });

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
            correct: "Exactly! This is known as the 'impossibility theorem' of fairness. When base rates differ between groups, calibration and equalized odds are mathematically incompatible. No algorithm can satisfy all reasonable fairness definitions simultaneously.",
            incorrect: "The impossibility theorem proves that different fairness criteria (like calibration and equalized odds) are mathematically incompatible when base rates differ between groups. This is a mathematical fact, not a limitation of current AI."
        },
        q2: {
            correct: "Correct! Other features like zip code, name, or browsing history can serve as proxies for protected attributes. The information remains in the data even when the explicit attribute is removed—this is why 'fairness through unawareness' doesn't work.",
            incorrect: "Removing protected attributes doesn't eliminate bias because other features correlate with them (zip code → race, name → gender). This is called proxy discrimination, and it's why 'fairness through unawareness' is insufficient."
        },
        q3: {
            correct: "Right! Reward hacking occurs when an AI system finds unexpected ways to maximize its reward signal that don't align with what the designer actually wanted. Example: a robot told to get to a finish line might find it easier to spin in circles to trigger reward sensors.",
            incorrect: "Reward hacking is when AI finds unintended shortcuts to maximize reward. For example, a game-playing AI might exploit bugs rather than learn the intended strategy. It's a fundamental alignment challenge."
        },
        q4: {
            correct: "Correct! LIME and SHAP show which features correlate with the prediction, but correlation ≠ causation. Two models with identical predictions can have very different explanations. The explanations are approximations, not ground truth about the model's reasoning.",
            incorrect: "Post-hoc explanations like LIME and SHAP are approximations that show correlations, not the model's true causal reasoning. They can be misleading—don't treat them as ground truth."
        },
        q5: {
            correct: "Exactly! Differential privacy provides mathematical guarantees that limit how much the output can change based on any individual's data, making it difficult to infer whether a specific person was in the training set (membership inference attacks).",
            incorrect: "Differential privacy protects against membership inference—determining whether a specific individual's data was used in training. It provides formal guarantees about individual privacy in aggregate statistics."
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
                resultsMessage.textContent = "Excellent! You have a strong grasp of responsible AI principles.";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good progress! Review the fairness definitions and safety concepts.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Consider revisiting the module, especially the sections on bias and fairness.";
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
        computeFairnessMetrics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

