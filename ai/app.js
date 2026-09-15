/**
 * Foundations of AI - Interactive Learning Platform
 * Main Application JavaScript
 */

// ============================================
// Theme Manager
// ============================================

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('ai-course-theme') || this.getPreferredTheme();
        this.init();
    }

    getPreferredTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.theme);

        // Bind toggle buttons
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('ai-course-theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0d0f12' : '#f8f9fa');
        }
    }

    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
        localStorage.setItem('ai-course-theme', this.theme);

        // Dispatch event for components that need to update (like canvas)
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: this.theme } }));
    }

    isDark() {
        return this.theme === 'dark';
    }
}

// ============================================
// Sidebar Manager (Collapsible Sidebar)
// ============================================

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.toggleBtn = document.querySelector('.sidebar-toggle');
        this.floatingToggleBtn = document.querySelector('.sidebar-toggle-floating');
        this.backdrop = document.querySelector('.sidebar-backdrop');
        this.storageKey = 'ai-course-sidebar-collapsed';

        // Get saved state (default: open on desktop, collapsed on mobile)
        this.isCollapsed = this.getSavedState();

        this.init();
    }

    getSavedState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved !== null) {
            return saved === 'true';
        }
        // Default: collapsed on mobile, open on desktop
        return window.innerWidth <= 1024;
    }

    init() {
        // Apply initial state
        this.applyState(false);

        // In-sidebar toggle button click (closes sidebar)
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.collapse();
            });
            this.toggleBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.collapse();
            });
        }

        // Floating toggle button click (opens sidebar)
        if (this.floatingToggleBtn) {
            this.floatingToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.expand();
            });
            // Also handle touch for mobile
            this.floatingToggleBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.expand();
            });
        }

        // Backdrop click closes sidebar
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.collapse());
        }

        // Close sidebar when clicking a nav link (mobile only)
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    this.collapse();
                }
            });
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isCollapsed) {
                this.collapse();
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // On resize to desktop, keep user preference
                // On resize to mobile, collapse if not explicitly opened
                if (window.innerWidth <= 1024 && !this.isCollapsed) {
                    // Activate backdrop on mobile when sidebar is open
                    this.backdrop?.classList.add('active');
                } else if (window.innerWidth > 1024) {
                    this.backdrop?.classList.remove('active');
                }
            }, 100);
        });

        // Handle swipe gestures on mobile
        this.setupSwipeGestures();
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let tracking = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;

            // Only track swipes from left edge (to open) or on sidebar (to close)
            if (startX < 30 || (this.sidebar && this.sidebar.contains(e.target))) {
                tracking = true;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!tracking) return;
            tracking = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = Math.abs(endY - startY);

            // Horizontal swipe (more horizontal than vertical)
            if (Math.abs(diffX) > 50 && diffY < 100) {
                if (diffX > 0 && this.isCollapsed) {
                    // Swipe right - open
                    this.expand();
                } else if (diffX < 0 && !this.isCollapsed) {
                    // Swipe left - close
                    this.collapse();
                }
            }
        }, { passive: true });
    }

    toggle() {
        this.isCollapsed ? this.expand() : this.collapse();
    }

    expand() {
        this.isCollapsed = false;
        this.applyState(true);
        this.saveState();
    }

    collapse() {
        this.isCollapsed = true;
        this.applyState(true);
        this.saveState();
    }

    applyState(animate = true) {
        if (!animate) {
            // Temporarily disable transitions for initial load
            document.body.style.setProperty('--transition-base', '0ms');
        }

        if (this.isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
            this.backdrop?.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            document.body.classList.remove('sidebar-collapsed');

            // On mobile/tablet, show backdrop and prevent scroll
            if (window.innerWidth <= 1024) {
                this.backdrop?.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        if (!animate) {
            // Re-enable transitions after a tick
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    document.body.style.removeProperty('--transition-base');
                });
            });
        }

        // Update toggle button aria attributes
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('aria-expanded', !this.isCollapsed);
            this.toggleBtn.setAttribute('aria-label', this.isCollapsed ? 'Open sidebar' : 'Close sidebar');
        }
    }

    saveState() {
        localStorage.setItem(this.storageKey, this.isCollapsed.toString());
    }
}

// Legacy MobileNavigation kept for backward compatibility
class MobileNavigation {
    constructor() {
        // Now handled by SidebarManager
    }
}

// ============================================
// Decision Boundary Lab
// ============================================

class DecisionBoundaryLab {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // High DPI support
        this.setupHighDPI();

        // Data points
        this.points = [];
        this.currentClass = 0;

        // Model parameters
        this.complexity = 2;
        this.learningRate = 0.05;
        this.weights = null;
        this.bias = null;

        // Training state
        this.isTraining = false;
        this.iterations = 0;
        this.accuracy = null;

        // Colors - will be updated based on theme
        this.updateColors();

        // Initialize
        this.bindEvents();
        this.render();
    }

    updateColors() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        this.colors = {
            classA: isDark ? '#e07a5f' : '#dc2626',
            classB: isDark ? '#5b9bd5' : '#2563eb',
            background: isDark ? '#0d0f12' : '#f8f9fa',
            grid: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
            boundary: isDark ? 'rgba(212, 168, 85, 0.8)' : 'rgba(184, 134, 11, 0.8)',
            boundaryFill: isDark ? 'rgba(212, 168, 85, 0.1)' : 'rgba(184, 134, 11, 0.1)'
        };
    }

    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
    }

    bindEvents() {
        // Canvas click to add points - handle both mouse and touch events
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleCanvasClick(e);
        });

        // Touch support for mobile and iPad
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            // Create a synthetic event object with clientX and clientY from touch
            const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.handleCanvasClick(syntheticEvent);
        }, { passive: false });

        // Class selector buttons
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentClass = parseInt(btn.dataset.class);
            });
        });

        // Complexity slider
        const complexitySlider = document.getElementById('complexity-slider');
        if (complexitySlider) {
            complexitySlider.addEventListener('input', (e) => {
                this.complexity = parseInt(e.target.value);
                if (this.weights) {
                    this.initializeModel();
                    this.render();
                }
            });
        }

        // Learning rate slider
        const lrSlider = document.getElementById('learning-rate-slider');
        if (lrSlider) {
            lrSlider.addEventListener('input', (e) => {
                this.learningRate = parseFloat(e.target.value) / 100;
            });
        }

        // Train button
        const trainBtn = document.getElementById('train-btn');
        if (trainBtn) {
            trainBtn.addEventListener('click', () => this.train());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // Preset button
        const presetBtn = document.getElementById('preset-btn');
        if (presetBtn) {
            presetBtn.addEventListener('click', () => this.loadPreset());
        }

        // Theme change listener
        window.addEventListener('themechange', () => {
            this.updateColors();
            this.render();
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        this.points.push({
            x: x,
            y: y,
            class: this.currentClass
        });

        this.updateMetrics();
        this.render();
    }

    // Feature expansion for polynomial decision boundaries
    expandFeatures(x, y) {
        const features = [1]; // Bias term

        for (let degree = 1; degree <= this.complexity; degree++) {
            for (let i = 0; i <= degree; i++) {
                const j = degree - i;
                features.push(Math.pow(x, i) * Math.pow(y, j));
            }
        }

        return features;
    }

    getFeatureCount() {
        let count = 1; // Bias
        for (let d = 1; d <= this.complexity; d++) {
            count += d + 1;
        }
        return count;
    }

    initializeModel() {
        const featureCount = this.getFeatureCount();
        this.weights = new Array(featureCount).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
    }

    predict(x, y) {
        const features = this.expandFeatures(x, y);
        let z = 0;
        for (let i = 0; i < features.length; i++) {
            z += this.weights[i] * features[i];
        }
        return this.sigmoid(z);
    }

    train() {
        if (this.points.length < 2) {
            alert('Add at least 2 points to train the model.');
            return;
        }

        // Check if we have both classes
        const hasClassA = this.points.some(p => p.class === 0);
        const hasClassB = this.points.some(p => p.class === 1);

        if (!hasClassA || !hasClassB) {
            alert('Add points from both classes to train the model.');
            return;
        }

        this.initializeModel();
        this.isTraining = true;
        this.iterations = 0;

        const trainStep = () => {
            // Mini-batch gradient descent
            for (let epoch = 0; epoch < 50; epoch++) {
                const gradients = new Array(this.weights.length).fill(0);

                for (const point of this.points) {
                    const features = this.expandFeatures(point.x, point.y);
                    const prediction = this.predict(point.x, point.y);
                    const error = prediction - point.class;

                    for (let i = 0; i < features.length; i++) {
                        gradients[i] += error * features[i];
                    }
                }

                // Update weights
                for (let i = 0; i < this.weights.length; i++) {
                    this.weights[i] -= this.learningRate * gradients[i] / this.points.length;
                }

                this.iterations++;
            }

            this.calculateAccuracy();
            this.updateMetrics();
            this.render();

            // Continue training if accuracy is not perfect and under iteration limit
            if (this.accuracy < 1.0 && this.iterations < 2000) {
                requestAnimationFrame(trainStep);
            } else {
                this.isTraining = false;
            }
        };

        trainStep();
    }

    calculateAccuracy() {
        if (this.points.length === 0) {
            this.accuracy = null;
            return;
        }

        let correct = 0;
        for (const point of this.points) {
            const prediction = this.predict(point.x, point.y) > 0.5 ? 1 : 0;
            if (prediction === point.class) {
                correct++;
            }
        }

        this.accuracy = correct / this.points.length;
    }

    updateMetrics() {
        const accuracyEl = document.getElementById('accuracy-value');
        const pointsEl = document.getElementById('points-value');
        const iterationsEl = document.getElementById('iterations-value');

        if (accuracyEl) {
            accuracyEl.textContent = this.accuracy !== null
                ? (this.accuracy * 100).toFixed(1) + '%'
                : '—';
        }

        if (pointsEl) {
            pointsEl.textContent = this.points.length;
        }

        if (iterationsEl) {
            iterationsEl.textContent = this.iterations;
        }
    }

    clear() {
        this.points = [];
        this.weights = null;
        this.iterations = 0;
        this.accuracy = null;
        this.isTraining = false;
        this.updateMetrics();
        this.render();
    }

    loadPreset() {
        this.clear();

        // Create an interesting non-linear pattern
        const presets = [
            // XOR-like pattern
            () => {
                const points = [];
                // Class A - top-left and bottom-right
                for (let i = 0; i < 8; i++) {
                    points.push({ x: 0.15 + Math.random() * 0.25, y: 0.15 + Math.random() * 0.25, class: 0 });
                    points.push({ x: 0.6 + Math.random() * 0.25, y: 0.6 + Math.random() * 0.25, class: 0 });
                }
                // Class B - top-right and bottom-left
                for (let i = 0; i < 8; i++) {
                    points.push({ x: 0.6 + Math.random() * 0.25, y: 0.15 + Math.random() * 0.25, class: 1 });
                    points.push({ x: 0.15 + Math.random() * 0.25, y: 0.6 + Math.random() * 0.25, class: 1 });
                }
                return points;
            },
            // Circular pattern
            () => {
                const points = [];
                // Inner circle - Class A
                for (let i = 0; i < 15; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * 0.15;
                    points.push({
                        x: 0.5 + Math.cos(angle) * r,
                        y: 0.5 + Math.sin(angle) * r,
                        class: 0
                    });
                }
                // Outer ring - Class B
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = 0.25 + Math.random() * 0.1;
                    points.push({
                        x: 0.5 + Math.cos(angle) * r,
                        y: 0.5 + Math.sin(angle) * r,
                        class: 1
                    });
                }
                return points;
            },
            // Linear separable
            () => {
                const points = [];
                for (let i = 0; i < 15; i++) {
                    points.push({ x: 0.1 + Math.random() * 0.35, y: 0.1 + Math.random() * 0.8, class: 0 });
                    points.push({ x: 0.55 + Math.random() * 0.35, y: 0.1 + Math.random() * 0.8, class: 1 });
                }
                return points;
            }
        ];

        const randomPreset = presets[Math.floor(Math.random() * presets.length)];
        this.points = randomPreset();
        this.updateMetrics();
        this.render();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid
        this.drawGrid();

        // Draw decision boundary if model is trained
        if (this.weights) {
            this.drawDecisionBoundary();
        }

        // Draw points
        this.drawPoints();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        const gridSize = 30;

        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawDecisionBoundary() {
        const resolution = 4;
        const imageData = this.ctx.createImageData(this.width, this.height);

        // Color arrays
        const colorA = this.hexToRgb(this.colors.classA);
        const colorB = this.hexToRgb(this.colors.classB);

        for (let py = 0; py < this.height; py += resolution) {
            for (let px = 0; px < this.width; px += resolution) {
                const x = px / this.width;
                const y = py / this.height;
                const prediction = this.predict(x, y);

                // Blend colors based on prediction confidence
                const alpha = Math.abs(prediction - 0.5) * 0.4;
                const color = prediction > 0.5 ? colorB : colorA;

                // Fill the resolution block
                for (let dy = 0; dy < resolution && py + dy < this.height; dy++) {
                    for (let dx = 0; dx < resolution && px + dx < this.width; dx++) {
                        const idx = ((py + dy) * this.width + (px + dx)) * 4;
                        imageData.data[idx] = color.r;
                        imageData.data[idx + 1] = color.g;
                        imageData.data[idx + 2] = color.b;
                        imageData.data[idx + 3] = alpha * 255;
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        // Draw decision boundary contour (where prediction ≈ 0.5)
        this.ctx.strokeStyle = this.colors.boundary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const contourResolution = 3;
        for (let px = 0; px < this.width; px += contourResolution) {
            for (let py = 0; py < this.height; py += contourResolution) {
                const x = px / this.width;
                const y = py / this.height;
                const p = this.predict(x, y);

                // Check neighbors for boundary crossing
                const pRight = this.predict((px + contourResolution) / this.width, y);
                const pDown = this.predict(x, (py + contourResolution) / this.height);

                if ((p < 0.5 && pRight >= 0.5) || (p >= 0.5 && pRight < 0.5) ||
                    (p < 0.5 && pDown >= 0.5) || (p >= 0.5 && pDown < 0.5)) {
                    this.ctx.fillStyle = this.colors.boundary;
                    this.ctx.fillRect(px - 1, py - 1, 3, 3);
                }
            }
        }
    }

    drawPoints() {
        for (const point of this.points) {
            const x = point.x * this.width;
            const y = point.y * this.height;

            // Outer ring
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = point.class === 0 ? this.colors.classA : this.colors.classB;
            this.ctx.fill();

            // Inner circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors.background;
            this.ctx.fill();

            // Center dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = point.class === 0 ? this.colors.classA : this.colors.classB;
            this.ctx.fill();
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}


// ============================================
// Quiz System
// ============================================

class QuizSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.questions = this.getQuestions();
        this.answers = {};
        this.submitted = false;

        this.bindEvents();
    }

    getQuestions() {
        return {
            1: { correct: 'b', explanation: 'The operational definition focuses on observable behavior—specifically, the ability to generalize from learned patterns to handle novel situations appropriately.' },
            2: { correct: 'b', explanation: 'Deep learning\'s distinguishing feature is the use of multi-layer neural networks that automatically learn hierarchical feature representations, eliminating the need for manual feature engineering.' },
            3: { correct: 'b', explanation: 'Current AI systems achieve competence through mathematical optimization of parameters, not through understanding or awareness. They are sophisticated pattern matchers, not comprehending agents.' },
            4: { correct: 'b', explanation: 'Overfitting occurs when a model is too complex for the data. For linearly separable data, a high-complexity model may fit the noise in the training points rather than the simple linear pattern.' },
            5: { correct: 'b', explanation: 'Mitchell\'s formal definition requires specifying the Task (what the system should do), the Performance measure (how to evaluate success), and the Experience (what data to learn from).' }
        };
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

        this.submitted = true;
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
                feedbackEl.innerHTML = `✗ Incorrect. The correct answer is highlighted. ${question.explanation}`;
            }

            // Disable all options
            questionEl.querySelectorAll('input').forEach(input => input.disabled = true);
        }

        // Show results
        const resultsEl = document.getElementById('quiz-results');
        const scoreEl = document.getElementById('score-value');
        const messageEl = document.getElementById('results-message');

        scoreEl.textContent = score;
        resultsEl.classList.add('show');

        if (score === 5) {
            messageEl.textContent = 'Excellent! You have a strong grasp of these fundamental concepts.';
        } else if (score >= 3) {
            messageEl.textContent = 'Good progress. Review the explanations for the questions you missed.';
        } else {
            messageEl.textContent = 'Consider re-reading the module content and trying again.';
        }
    }

    reset() {
        this.answers = {};
        this.submitted = false;

        // Clear all styling and feedback
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
// Navigation System
// ============================================

class NavigationSystem {
    constructor() {
        this.currentModule = 'what-ai-is';
        this.bindEvents();
    }

    bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const moduleId = item.dataset.module;
                if (moduleId) {
                    this.setActiveModule(moduleId);
                }
            });
        });

        // Module navigation buttons
        document.querySelectorAll('.nav-next, .nav-prev').forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleId = btn.dataset.module;
                if (moduleId && !btn.classList.contains('disabled')) {
                    this.setActiveModule(moduleId);
                }
            });
        });
    }

    setActiveModule(moduleId) {
        // Update sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleId);
        });

        this.currentModule = moduleId;

        // In a full implementation, this would load the module content
        // For now, we just update the UI state
        console.log(`Navigating to module: ${moduleId}`);
    }
}


// ============================================
// Scroll Progress Indicator
// ============================================

class ScrollProgress {
    constructor() {
        this.init();
    }

    init() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-progress';
        indicator.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(indicator);

        this.bar = indicator.querySelector('.scroll-progress-bar');

        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    }

    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        this.bar.style.width = `${progress}%`;
    }
}

// ============================================
// Back to Top Button
// ============================================

class BackToTop {
    constructor() {
        this.init();
    }

    init() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);

        this.btn = btn;

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    }

    update() {
        if (window.scrollY > 400) {
            this.btn.classList.add('visible');
        } else {
            this.btn.classList.remove('visible');
        }
    }
}

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager first
    const themeManager = new ThemeManager();

    // Initialize sidebar manager (collapsible sidebar)
    const sidebarManager = new SidebarManager();

    // Initialize the decision boundary lab (if canvas exists)
    const canvas = document.getElementById('decision-boundary-canvas');
    let lab = null;
    if (canvas) {
        lab = new DecisionBoundaryLab('decision-boundary-canvas');
    }

    // Initialize the quiz system (if container exists)
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        new QuizSystem('quiz-container');
    }

    // Initialize navigation
    new NavigationSystem();

    // Initialize scroll progress
    new ScrollProgress();

    // Initialize back to top
    new BackToTop();

    // Add smooth scroll behavior to internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle window resize for canvas
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (lab) {
                lab.setupHighDPI();
                lab.render();
            }
        }, 250);
    });

    // Add active state to current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.closest('.nav-item')?.classList.add('active');
        }
    });
});

