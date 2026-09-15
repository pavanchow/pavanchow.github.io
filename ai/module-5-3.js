// Module 5.3: From Research to Deployment
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // Deployment Decision Tree Lab
    // ==========================================
    let currentStep = 1;
    let answers = {};

    const questions = document.querySelectorAll('.decision-question');
    const recommendation = document.getElementById('recommendation');
    const recContent = document.getElementById('rec-content');
    const resetBtn = document.getElementById('reset-decision');

    const recommendations = {
        'realtime-cloud-small': {
            title: 'Serverless + Managed ML',
            content: `
                <p><strong>Architecture:</strong> AWS Lambda / Cloud Functions with model loaded in memory</p>
                <p><strong>Serving:</strong> API Gateway → Serverless function → Model inference</p>
                <p><strong>Pros:</strong> Zero ops, auto-scaling, pay-per-request</p>
                <p><strong>Considerations:</strong> Watch for cold starts; keep model small (&lt;250MB)</p>
            `
        },
        'realtime-cloud-medium': {
            title: 'Container-based Model Server',
            content: `
                <p><strong>Architecture:</strong> Kubernetes + TensorFlow Serving / Triton</p>
                <p><strong>Serving:</strong> Load Balancer → K8s Pods → Model Server</p>
                <p><strong>Pros:</strong> Optimized inference, batching, GPU support</p>
                <p><strong>Considerations:</strong> Requires K8s expertise; set up autoscaling</p>
            `
        },
        'realtime-cloud-large': {
            title: 'Distributed Model Serving',
            content: `
                <p><strong>Architecture:</strong> Multi-region K8s + GPU clusters + CDN caching</p>
                <p><strong>Serving:</strong> Global LB → Regional clusters → Model sharding if needed</p>
                <p><strong>Pros:</strong> High availability, low global latency</p>
                <p><strong>Considerations:</strong> Complex; consider managed platforms (Vertex AI, SageMaker)</p>
            `
        },
        'realtime-edge-small': {
            title: 'On-Device Inference',
            content: `
                <p><strong>Architecture:</strong> TensorFlow Lite / Core ML / ONNX Runtime on device</p>
                <p><strong>Serving:</strong> Model bundled in app, inference on device</p>
                <p><strong>Pros:</strong> Privacy, offline capability, zero latency</p>
                <p><strong>Considerations:</strong> Model must be small; test on target devices</p>
            `
        },
        'realtime-edge-medium': {
            title: 'Edge + Cloud Hybrid',
            content: `
                <p><strong>Architecture:</strong> Small model on device + cloud fallback for complex cases</p>
                <p><strong>Serving:</strong> Device inference first; escalate to cloud when needed</p>
                <p><strong>Pros:</strong> Best of both worlds</p>
                <p><strong>Considerations:</strong> Design escalation logic; handle offline gracefully</p>
            `
        },
        'realtime-edge-large': {
            title: 'Edge Computing Infrastructure',
            content: `
                <p><strong>Architecture:</strong> Edge servers (AWS Outposts, Azure Stack) near users</p>
                <p><strong>Serving:</strong> Regional edge nodes with GPU inference capability</p>
                <p><strong>Pros:</strong> Low latency at scale, data locality</p>
                <p><strong>Considerations:</strong> High infrastructure cost; specialized ops</p>
            `
        },
        'realtime-hybrid-small': {
            title: 'Tiered Edge-Cloud',
            content: `
                <p><strong>Architecture:</strong> Light model on device, full model in cloud</p>
                <p><strong>Serving:</strong> Device handles common cases, cloud for edge cases</p>
                <p><strong>Pros:</strong> Flexibility, graceful degradation</p>
                <p><strong>Considerations:</strong> Sync strategy for model updates</p>
            `
        },
        'realtime-hybrid-medium': {
            title: 'Smart Edge-Cloud Routing',
            content: `
                <p><strong>Architecture:</strong> Edge for latency-sensitive, cloud for complex</p>
                <p><strong>Serving:</strong> Router decides edge vs cloud based on input</p>
                <p><strong>Pros:</strong> Optimized cost and latency</p>
                <p><strong>Considerations:</strong> Design good routing heuristics</p>
            `
        },
        'realtime-hybrid-large': {
            title: 'Full Hybrid Infrastructure',
            content: `
                <p><strong>Architecture:</strong> Edge mesh + cloud clusters + model caching</p>
                <p><strong>Serving:</strong> Intelligent routing, caching, and fallback</p>
                <p><strong>Pros:</strong> Maximum flexibility and resilience</p>
                <p><strong>Considerations:</strong> Complex; requires dedicated ML platform team</p>
            `
        },
        'nearrealtime-cloud-small': {
            title: 'Simple API Service',
            content: `
                <p><strong>Architecture:</strong> Flask/FastAPI container on managed service</p>
                <p><strong>Serving:</strong> Simple HTTP API, single instance</p>
                <p><strong>Pros:</strong> Simple to build and maintain</p>
                <p><strong>Considerations:</strong> Add basic health checks and logging</p>
            `
        },
        'nearrealtime-cloud-medium': {
            title: 'Auto-scaling API Service',
            content: `
                <p><strong>Architecture:</strong> Containerized service with horizontal autoscaling</p>
                <p><strong>Serving:</strong> Load balancer → Auto-scaled containers</p>
                <p><strong>Pros:</strong> Handles variable load efficiently</p>
                <p><strong>Considerations:</strong> Set scaling policies based on latency</p>
            `
        },
        'nearrealtime-cloud-large': {
            title: 'Async Processing Pipeline',
            content: `
                <p><strong>Architecture:</strong> Queue (SQS/Kafka) → Worker fleet → Results cache</p>
                <p><strong>Serving:</strong> API accepts request, returns job ID, async processing</p>
                <p><strong>Pros:</strong> Handles bursts, reliable at scale</p>
                <p><strong>Considerations:</strong> Design good retry and DLQ strategy</p>
            `
        },
        'batch-cloud-small': {
            title: 'Scheduled Script',
            content: `
                <p><strong>Architecture:</strong> Cron job or scheduled Lambda running batch inference</p>
                <p><strong>Serving:</strong> Periodic job reads input, writes predictions to storage</p>
                <p><strong>Pros:</strong> Minimal infrastructure</p>
                <p><strong>Considerations:</strong> Add monitoring for job failures</p>
            `
        },
        'batch-cloud-medium': {
            title: 'Batch Processing Pipeline',
            content: `
                <p><strong>Architecture:</strong> Apache Spark / AWS Batch / Dataflow</p>
                <p><strong>Serving:</strong> Scheduled pipeline processes daily/hourly batches</p>
                <p><strong>Pros:</strong> Scalable, cost-efficient for large volumes</p>
                <p><strong>Considerations:</strong> Optimize for your data format and size</p>
            `
        },
        'batch-cloud-large': {
            title: 'Distributed Batch Infrastructure',
            content: `
                <p><strong>Architecture:</strong> Spark cluster + distributed storage + orchestration (Airflow)</p>
                <p><strong>Serving:</strong> DAG-based workflow processing massive datasets</p>
                <p><strong>Pros:</strong> Handles any scale</p>
                <p><strong>Considerations:</strong> Invest in data engineering; consider managed Spark</p>
            `
        }
    };

    function showQuestion(step) {
        questions.forEach(q => {
            const qStep = parseInt(q.dataset.step);
            if (qStep === step) {
                q.classList.remove('hidden');
            } else if (qStep > step) {
                q.classList.add('hidden');
            }
        });
    }

    function generateRecommendation() {
        const key = `${answers.latency}-${answers.data}-${answers.scale}`;
        const rec = recommendations[key] || recommendations['realtime-cloud-medium'];
        
        recContent.innerHTML = `<h4>${rec.title}</h4>${rec.content}`;
        recommendation.classList.remove('hidden');
        if (resetBtn) resetBtn.style.display = 'block';
    }

    function handleAnswer(e) {
        if (!e.target.classList.contains('decision-btn')) return;
        
        const answer = e.target.dataset.answer;
        const question = e.target.closest('.decision-question');
        const step = parseInt(question.dataset.step);
        
        // Mark selected
        question.querySelectorAll('.decision-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        e.target.classList.add('selected');
        
        // Store answer
        if (step === 1) {
            answers.latency = answer;
            // For batch, skip the data location question
            if (answer === 'batch') {
                answers.data = 'cloud';
                currentStep = 3;
            } else {
                currentStep = 2;
            }
        } else if (step === 2) {
            answers.data = answer;
            currentStep = 3;
        } else if (step === 3) {
            answers.scale = answer;
            generateRecommendation();
            return;
        }
        
        showQuestion(currentStep);
    }

    // Event delegation for decision buttons
    const decisionLab = document.querySelector('.decision-lab');
    if (decisionLab) {
        decisionLab.addEventListener('click', handleAnswer);
    }

    // Reset functionality
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            currentStep = 1;
            answers = {};
            
            questions.forEach((q, i) => {
                if (i === 0) {
                    q.classList.remove('hidden');
                } else {
                    q.classList.add('hidden');
                }
                q.querySelectorAll('.decision-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
            });
            
            recommendation.classList.add('hidden');
            this.style.display = 'none';
        });
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
            correct: "Correct! Training-serving skew occurs when features are computed differently between training and inference, causing the model to see different inputs in production than it was trained on, leading to degraded performance.",
            incorrect: "Training-serving skew is when features are computed differently during training vs serving. This is a silent killer—the model gets inputs that don't match what it was trained on."
        },
        q2: {
            correct: "Exactly! Canary deployment gradually shifts traffic to the new model (e.g., 1% → 5% → 25% → 100%) while monitoring for problems. It's named after canaries used in coal mines to detect danger.",
            incorrect: "A canary deployment gradually increases traffic to a new model version while closely monitoring for issues. If problems are detected, traffic is shifted back to the old version."
        },
        q3: {
            correct: "Right! Data drift means the input distribution has changed since training. A model trained on summer data may perform poorly on winter data. Monitoring helps detect this before users notice degraded predictions.",
            incorrect: "Data drift monitoring detects when input distributions change from what the model was trained on. This is crucial because models assume input distributions remain stable."
        },
        q4: {
            correct: "Correct! Feature stores ensure the same feature computation code runs for both training and inference, preventing training-serving skew. They also enable feature reuse across models and teams.",
            incorrect: "A feature store's primary purpose is ensuring feature consistency between training and serving. This prevents the subtle bugs that occur when features are computed differently in different contexts."
        },
        q5: {
            correct: "Exactly! Google's famous paper 'Hidden Technical Debt in ML Systems' showed that ML code (the model training and inference) is just a small fraction. Most code handles data pipelines, serving, monitoring, configuration, and testing.",
            incorrect: "In production ML systems, ML-specific code is typically only 5-10% of the total codebase. The majority is data pipelines, infrastructure, monitoring, and configuration management."
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
                resultsMessage.textContent = "Excellent! You're ready for production ML. Congratulations on completing the course!";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good progress! Review the deployment and monitoring sections to solidify your knowledge.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Consider revisiting the MLOps concepts before deploying models.";
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
        showQuestion(1);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

