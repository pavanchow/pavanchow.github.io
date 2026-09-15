/**
 * Module 1.4: Optimization & Gradients
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
// Gradient Descent Visualizer
// ============================================

class GradientDescentVisualizer {
    constructor() {
        this.canvas = document.getElementById('descent-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // State
        this.position = null;
        this.path = [];
        this.isRunning = false;
        this.animationId = null;
        this.stepCount = 0;
        
        // Settings
        this.learningRate = 0.03;
        this.surfaceType = 'bowl';
        
        // Elements
        this.surfaceSelect = document.getElementById('surface-select');
        this.lrSlider = document.getElementById('lr-slider');
        this.lrValue = document.getElementById('lr-value');
        this.stepCountEl = document.getElementById('step-count');
        this.currentLossEl = document.getElementById('current-loss');
        this.gradMagEl = document.getElementById('gradient-magnitude');
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        // Canvas click for starting position
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.width * 4 - 2; // Map to [-2, 2]
            const y = (e.clientY - rect.top) / this.height * 4 - 2;
            
            this.reset();
            this.position = { x, y };
            this.path = [{ ...this.position }];
            this.draw();
            this.updateInfo();
        });
        
        // Surface select
        if (this.surfaceSelect) {
            this.surfaceSelect.addEventListener('change', (e) => {
                this.surfaceType = e.target.value;
                this.reset();
                this.draw();
            });
        }
        
        // Learning rate slider
        if (this.lrSlider) {
            this.lrSlider.addEventListener('input', (e) => {
                this.learningRate = parseFloat(e.target.value) / 1000;
                if (this.lrValue) {
                    this.lrValue.textContent = this.learningRate.toFixed(3);
                }
            });
        }
        
        // Buttons
        const startBtn = document.getElementById('start-descent');
        const stepBtn = document.getElementById('step-descent');
        const resetBtn = document.getElementById('reset-descent');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (stepBtn) stepBtn.addEventListener('click', () => this.step());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    }
    
    // Loss functions for different surfaces
    loss(x, y) {
        switch (this.surfaceType) {
            case 'bowl':
                // Simple quadratic bowl centered at (0, 0)
                return x * x + y * y;
            case 'valley':
                // Narrow valley: steep in one direction, shallow in another
                return 10 * x * x + 0.5 * y * y;
            case 'saddle':
                // Saddle point at origin
                return x * x - y * y + 0.5;
            case 'multimodal':
                // Multiple local minima
                return Math.sin(x * 2) * Math.cos(y * 2) + 0.1 * (x * x + y * y);
            default:
                return x * x + y * y;
        }
    }
    
    // Gradient of loss function
    gradient(x, y) {
        switch (this.surfaceType) {
            case 'bowl':
                return { dx: 2 * x, dy: 2 * y };
            case 'valley':
                return { dx: 20 * x, dy: y };
            case 'saddle':
                return { dx: 2 * x, dy: -2 * y };
            case 'multimodal':
                return {
                    dx: 2 * Math.cos(x * 2) * Math.cos(y * 2) + 0.2 * x,
                    dy: -2 * Math.sin(x * 2) * Math.sin(y * 2) + 0.2 * y
                };
            default:
                return { dx: 2 * x, dy: 2 * y };
        }
    }
    
    step() {
        if (!this.position) return;
        
        const grad = this.gradient(this.position.x, this.position.y);
        
        // Gradient descent update
        this.position.x -= this.learningRate * grad.dx;
        this.position.y -= this.learningRate * grad.dy;
        
        // Clamp to bounds
        this.position.x = Math.max(-2, Math.min(2, this.position.x));
        this.position.y = Math.max(-2, Math.min(2, this.position.y));
        
        this.path.push({ ...this.position });
        this.stepCount++;
        
        this.draw();
        this.updateInfo();
        
        // Check for convergence
        const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
        if (gradMag < 0.001 || this.stepCount > 1000) {
            this.stop();
        }
    }
    
    start() {
        if (!this.position) {
            // Default starting position
            this.position = { x: 1.5, y: 1.5 };
            this.path = [{ ...this.position }];
        }
        
        this.isRunning = true;
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.step();
        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.animate(), 50);
        });
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.stop();
        this.position = null;
        this.path = [];
        this.stepCount = 0;
        this.updateInfo();
        this.draw();
    }
    
    updateInfo() {
        if (this.stepCountEl) this.stepCountEl.textContent = this.stepCount;
        
        if (this.position) {
            const lossVal = this.loss(this.position.x, this.position.y);
            const grad = this.gradient(this.position.x, this.position.y);
            const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
            
            if (this.currentLossEl) this.currentLossEl.textContent = lossVal.toFixed(4);
            if (this.gradMagEl) this.gradMagEl.textContent = gradMag.toFixed(4);
        } else {
            if (this.currentLossEl) this.currentLossEl.textContent = '—';
            if (this.gradMagEl) this.gradMagEl.textContent = '—';
        }
    }
    
    draw() {
        // Clear
        this.ctx.fillStyle = '#0d0f12';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw contours
        this.drawContours();
        
        // Draw path
        if (this.path.length > 1) {
            this.ctx.beginPath();
            const start = this.toCanvas(this.path[0].x, this.path[0].y);
            this.ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < this.path.length; i++) {
                const p = this.toCanvas(this.path[i].x, this.path[i].y);
                this.ctx.lineTo(p.x, p.y);
            }
            
            this.ctx.strokeStyle = '#d4a855';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Draw current position
        if (this.position) {
            const pos = this.toCanvas(this.position.x, this.position.y);
            
            // Outer glow
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(212, 168, 85, 0.3)';
            this.ctx.fill();
            
            // Inner circle
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#d4a855';
            this.ctx.fill();
            
            // Draw gradient arrow
            const grad = this.gradient(this.position.x, this.position.y);
            const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
            
            if (gradMag > 0.01) {
                const scale = Math.min(30, gradMag * 10);
                const endX = pos.x - (grad.dx / gradMag) * scale;
                const endY = pos.y - (grad.dy / gradMag) * scale;
                
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.strokeStyle = '#e07a5f';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Arrow head
                const angle = Math.atan2(endY - pos.y, endX - pos.x);
                this.ctx.beginPath();
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(endX - 8 * Math.cos(angle - 0.4), endY - 8 * Math.sin(angle - 0.4));
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(endX - 8 * Math.cos(angle + 0.4), endY - 8 * Math.sin(angle + 0.4));
                this.ctx.stroke();
            }
        }
        
        // Draw starting points for path
        this.path.forEach((p, i) => {
            if (i === 0 && this.path.length > 1) {
                const pos = this.toCanvas(p.x, p.y);
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#5b9bd5';
                this.ctx.fill();
            }
        });
    }
    
    drawContours() {
        const resolution = 5;
        
        for (let px = 0; px < this.width; px += resolution) {
            for (let py = 0; py < this.height; py += resolution) {
                const x = (px / this.width) * 4 - 2;
                const y = (py / this.height) * 4 - 2;
                const lossVal = this.loss(x, y);
                
                // Map loss to color
                const normalized = Math.min(1, lossVal / 5);
                const r = Math.floor(30 + normalized * 40);
                const g = Math.floor(35 + normalized * 20);
                const b = Math.floor(45 + normalized * 10);
                
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                this.ctx.fillRect(px, py, resolution, resolution);
            }
        }
        
        // Draw contour lines
        const contourLevels = [0.5, 1, 2, 3, 4];
        
        contourLevels.forEach(level => {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                // For bowl-like surfaces, draw circular contours
                if (this.surfaceType === 'bowl') {
                    const r = Math.sqrt(level);
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    const pos = this.toCanvas(x, y);
                    
                    if (angle === 0) {
                        this.ctx.moveTo(pos.x, pos.y);
                    } else {
                        this.ctx.lineTo(pos.x, pos.y);
                    }
                }
            }
            
            this.ctx.closePath();
            this.ctx.stroke();
        });
    }
    
    toCanvas(x, y) {
        return {
            x: (x + 2) / 4 * this.width,
            y: (y + 2) / 4 * this.height
        };
    }
}

// ============================================
// Learning Rate Explorer
// ============================================

class LearningRateExplorer {
    constructor() {
        this.canvases = document.querySelectorAll('.lr-canvas');
        this.tracks = {
            low: { lr: 0.001, canvas: null, ctx: null, position: null, path: [], steps: 0 },
            good: { lr: 0.03, canvas: null, ctx: null, position: null, path: [], steps: 0 },
            high: { lr: 0.15, canvas: null, ctx: null, position: null, path: [], steps: 0 }
        };
        
        this.isRunning = false;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        document.querySelectorAll('.lr-track').forEach(track => {
            const lr = track.dataset.lr;
            const canvas = track.querySelector('.lr-canvas');
            if (canvas && this.tracks[lr]) {
                this.tracks[lr].canvas = canvas;
                this.tracks[lr].ctx = canvas.getContext('2d');
            }
        });
        
        this.drawAll();
    }
    
    bindEvents() {
        const startBtn = document.getElementById('start-lr-comparison');
        const resetBtn = document.getElementById('reset-lr-comparison');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    }
    
    loss(x, y) {
        return x * x + y * y;
    }
    
    gradient(x, y) {
        return { dx: 2 * x, dy: 2 * y };
    }
    
    start() {
        // Initialize all tracks
        Object.keys(this.tracks).forEach(key => {
            this.tracks[key].position = { x: 1.5, y: 1.5 };
            this.tracks[key].path = [{ ...this.tracks[key].position }];
            this.tracks[key].steps = 0;
        });
        
        this.isRunning = true;
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        let allConverged = true;
        
        Object.keys(this.tracks).forEach(key => {
            const track = this.tracks[key];
            if (!track.position) return;
            
            const grad = this.gradient(track.position.x, track.position.y);
            const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
            
            if (gradMag > 0.001 && track.steps < 500 && Math.abs(track.position.x) < 3 && Math.abs(track.position.y) < 3) {
                track.position.x -= track.lr * grad.dx;
                track.position.y -= track.lr * grad.dy;
                track.path.push({ ...track.position });
                track.steps++;
                allConverged = false;
            }
        });
        
        this.drawAll();
        this.updateStatus();
        
        if (!allConverged) {
            requestAnimationFrame(() => {
                setTimeout(() => this.animate(), 30);
            });
        } else {
            this.isRunning = false;
        }
    }
    
    reset() {
        this.isRunning = false;
        
        Object.keys(this.tracks).forEach(key => {
            this.tracks[key].position = null;
            this.tracks[key].path = [];
            this.tracks[key].steps = 0;
        });
        
        this.drawAll();
        this.updateStatus();
    }
    
    updateStatus() {
        document.querySelectorAll('.lr-track').forEach(track => {
            const lr = track.dataset.lr;
            const statusSpan = track.querySelector('.lr-status span');
            if (statusSpan && this.tracks[lr]) {
                statusSpan.textContent = this.tracks[lr].steps;
            }
        });
    }
    
    drawAll() {
        Object.keys(this.tracks).forEach(key => this.draw(key));
    }
    
    draw(trackKey) {
        const track = this.tracks[trackKey];
        if (!track.canvas || !track.ctx) return;
        
        const ctx = track.ctx;
        const w = track.canvas.width;
        const h = track.canvas.height;
        
        // Clear and draw background
        ctx.fillStyle = '#0d0f12';
        ctx.fillRect(0, 0, w, h);
        
        // Draw contours
        const resolution = 4;
        for (let px = 0; px < w; px += resolution) {
            for (let py = 0; py < h; py += resolution) {
                const x = (px / w) * 4 - 2;
                const y = (py / h) * 4 - 2;
                const lossVal = this.loss(x, y);
                
                const normalized = Math.min(1, lossVal / 8);
                const r = Math.floor(30 + normalized * 40);
                const g = Math.floor(35 + normalized * 20);
                const b = Math.floor(45 + normalized * 10);
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(px, py, resolution, resolution);
            }
        }
        
        // Draw path
        if (track.path.length > 1) {
            ctx.beginPath();
            const start = this.toCanvas(track.path[0].x, track.path[0].y, w, h);
            ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < track.path.length; i++) {
                const p = this.toCanvas(track.path[i].x, track.path[i].y, w, h);
                ctx.lineTo(p.x, p.y);
            }
            
            ctx.strokeStyle = '#d4a855';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw current position
        if (track.position) {
            const pos = this.toCanvas(track.position.x, track.position.y, w, h);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#d4a855';
            ctx.fill();
        }
        
        // Draw target (center)
        ctx.beginPath();
        ctx.arc(w/2, h/2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#50b892';
        ctx.fill();
    }
    
    toCanvas(x, y, w, h) {
        return {
            x: (x + 2) / 4 * w,
            y: (y + 2) / 4 * h
        };
    }
}

// ============================================
// SGD vs Momentum Comparison
// ============================================

class SGDComparison {
    constructor() {
        this.tracks = {
            sgd: { canvas: null, ctx: null, position: null, path: [], steps: 0, velocity: {x: 0, y: 0} },
            momentum: { canvas: null, ctx: null, position: null, path: [], steps: 0, velocity: {x: 0, y: 0} }
        };
        
        this.surfaceType = 'valley';
        this.learningRate = 0.02;
        this.beta = 0.9;
        this.isRunning = false;
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        document.querySelectorAll('.sgd-track').forEach(track => {
            const optimizer = track.dataset.optimizer;
            const canvas = track.querySelector('.sgd-canvas');
            if (canvas && this.tracks[optimizer]) {
                this.tracks[optimizer].canvas = canvas;
                this.tracks[optimizer].ctx = canvas.getContext('2d');
            }
        });
        
        this.drawAll();
    }
    
    bindEvents() {
        const startBtn = document.getElementById('start-sgd-comparison');
        const resetBtn = document.getElementById('reset-sgd-comparison');
        const surfaceSelect = document.getElementById('sgd-surface-select');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (surfaceSelect) {
            surfaceSelect.addEventListener('change', (e) => {
                this.surfaceType = e.target.value;
                this.reset();
            });
        }
    }
    
    loss(x, y) {
        if (this.surfaceType === 'valley') {
            return 10 * x * x + 0.5 * y * y;
        }
        return x * x + y * y;
    }
    
    gradient(x, y) {
        if (this.surfaceType === 'valley') {
            return { dx: 20 * x, dy: y };
        }
        return { dx: 2 * x, dy: 2 * y };
    }
    
    start() {
        // Initialize both tracks at same position
        const startPos = { x: 1.8, y: 1.8 };
        
        Object.keys(this.tracks).forEach(key => {
            this.tracks[key].position = { ...startPos };
            this.tracks[key].path = [{ ...startPos }];
            this.tracks[key].steps = 0;
            this.tracks[key].velocity = { x: 0, y: 0 };
        });
        
        this.isRunning = true;
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        let allConverged = true;
        
        // SGD update
        const sgd = this.tracks.sgd;
        if (sgd.position) {
            const grad = this.gradient(sgd.position.x, sgd.position.y);
            const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
            
            if (gradMag > 0.001 && sgd.steps < 300) {
                sgd.position.x -= this.learningRate * grad.dx;
                sgd.position.y -= this.learningRate * grad.dy;
                sgd.path.push({ ...sgd.position });
                sgd.steps++;
                allConverged = false;
            }
        }
        
        // Momentum update
        const mom = this.tracks.momentum;
        if (mom.position) {
            const grad = this.gradient(mom.position.x, mom.position.y);
            const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
            
            if (gradMag > 0.001 && mom.steps < 300) {
                // Velocity update with momentum
                mom.velocity.x = this.beta * mom.velocity.x - this.learningRate * grad.dx;
                mom.velocity.y = this.beta * mom.velocity.y - this.learningRate * grad.dy;
                
                // Position update
                mom.position.x += mom.velocity.x;
                mom.position.y += mom.velocity.y;
                mom.path.push({ ...mom.position });
                mom.steps++;
                allConverged = false;
            }
        }
        
        this.drawAll();
        this.updateStatus();
        
        if (!allConverged) {
            requestAnimationFrame(() => {
                setTimeout(() => this.animate(), 30);
            });
        } else {
            this.isRunning = false;
        }
    }
    
    reset() {
        this.isRunning = false;
        
        Object.keys(this.tracks).forEach(key => {
            this.tracks[key].position = null;
            this.tracks[key].path = [];
            this.tracks[key].steps = 0;
            this.tracks[key].velocity = { x: 0, y: 0 };
        });
        
        this.drawAll();
        this.updateStatus();
    }
    
    updateStatus() {
        document.querySelectorAll('.sgd-track').forEach(track => {
            const optimizer = track.dataset.optimizer;
            const statusSpans = track.querySelectorAll('.sgd-status span');
            if (statusSpans.length >= 2 && this.tracks[optimizer]) {
                statusSpans[0].textContent = this.tracks[optimizer].steps;
                const pos = this.tracks[optimizer].position;
                if (pos) {
                    statusSpans[1].textContent = this.loss(pos.x, pos.y).toFixed(4);
                } else {
                    statusSpans[1].textContent = '—';
                }
            }
        });
    }
    
    drawAll() {
        Object.keys(this.tracks).forEach(key => this.draw(key));
    }
    
    draw(trackKey) {
        const track = this.tracks[trackKey];
        if (!track.canvas || !track.ctx) return;
        
        const ctx = track.ctx;
        const w = track.canvas.width;
        const h = track.canvas.height;
        
        // Clear and draw background
        ctx.fillStyle = '#0d0f12';
        ctx.fillRect(0, 0, w, h);
        
        // Draw contours
        const resolution = 4;
        for (let px = 0; px < w; px += resolution) {
            for (let py = 0; py < h; py += resolution) {
                const x = (px / w) * 4 - 2;
                const y = (py / h) * 4 - 2;
                const lossVal = this.loss(x, y);
                
                const normalized = Math.min(1, lossVal / 10);
                const r = Math.floor(30 + normalized * 40);
                const g = Math.floor(35 + normalized * 20);
                const b = Math.floor(45 + normalized * 10);
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(px, py, resolution, resolution);
            }
        }
        
        // Draw path
        if (track.path.length > 1) {
            ctx.beginPath();
            const start = this.toCanvas(track.path[0].x, track.path[0].y, w, h);
            ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < Math.min(track.path.length, 500); i++) {
                const p = this.toCanvas(track.path[i].x, track.path[i].y, w, h);
                ctx.lineTo(p.x, p.y);
            }
            
            ctx.strokeStyle = trackKey === 'sgd' ? '#5b9bd5' : '#d4a855';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw current position
        if (track.position) {
            const pos = this.toCanvas(track.position.x, track.position.y, w, h);
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = trackKey === 'sgd' ? '#5b9bd5' : '#d4a855';
            ctx.fill();
        }
        
        // Draw target (center)
        ctx.beginPath();
        ctx.arc(w/2, h/2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#50b892';
        ctx.fill();
    }
    
    toCanvas(x, y, w, h) {
        return {
            x: (x + 2) / 4 * w,
            y: (y + 2) / 4 * h
        };
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
                explanation: 'The gradient is a vector of partial derivatives that points in the direction of steepest increase of the function. We subtract it (or move opposite to it) to descend.' 
            },
            2: { 
                correct: 'b', 
                explanation: 'Mini-batches allow faster updates (more iterations per pass through data) and introduce helpful noise that can escape sharp local minima that wouldn\'t generalize well.' 
            },
            3: { 
                correct: 'b', 
                explanation: 'A learning rate that\'s too high causes the optimizer to take steps that are too large, overshooting minima and potentially oscillating wildly or diverging to infinity.' 
            },
            4: { 
                correct: 'b', 
                explanation: 'In high dimensions, saddle points (where gradients are zero but it\'s not a minimum) are exponentially more common than local minima. They dramatically slow convergence.' 
            },
            5: { 
                correct: 'b', 
                explanation: 'Momentum maintains a "velocity" based on past gradients. This helps accelerate through flat regions and dampens the oscillations that occur in narrow valleys.' 
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
            messageEl.textContent = 'Excellent! You\'ve mastered optimization fundamentals. Ready for neural networks!';
        } else if (score >= 3) {
            messageEl.textContent = 'Good understanding. Review the gradient descent visualizer to build more intuition.';
        } else {
            messageEl.textContent = 'Consider re-reading about gradients and the loss landscape.';
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
// Additional Styles
// ============================================

const additionalStyles = `
    /* Descent visualizer */
    .descent-controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        align-items: flex-end;
        margin-bottom: var(--space-xl);
        padding-bottom: var(--space-lg);
        border-bottom: 1px solid var(--surface-2);
    }
    
    .control-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        min-width: 150px;
    }
    
    .control-group label {
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--text-secondary);
    }
    
    .control-group select,
    .control-group input[type="range"] {
        width: 100%;
    }
    
    .control-group select {
        padding: var(--space-sm) var(--space-md);
        background: var(--surface-2);
        border: 1px solid var(--surface-3);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.9rem;
    }
    
    .control-actions {
        display: flex;
        gap: var(--space-sm);
        margin-left: auto;
    }
    
    .descent-visualization {
        position: relative;
    }
    
    #descent-canvas {
        display: block;
        width: 100%;
        border-radius: var(--radius-md);
        cursor: crosshair;
    }
    
    .descent-info {
        display: flex;
        justify-content: center;
        gap: var(--space-2xl);
        margin-top: var(--space-lg);
    }
    
    .info-item {
        text-align: center;
    }
    
    .info-label {
        display: block;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
        margin-bottom: var(--space-xs);
    }
    
    .info-value {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--accent-gold);
    }
    
    .descent-instructions {
        text-align: center;
        margin-top: var(--space-md);
        font-size: 0.85rem;
        color: var(--text-tertiary);
    }
    
    /* Challenge grid */
    .challenge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--space-lg);
        margin: var(--space-xl) 0;
    }
    
    .challenge-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .challenge-icon {
        font-size: 1.5rem;
        margin-bottom: var(--space-md);
        opacity: 0.7;
    }
    
    .challenge-title {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .challenge-card p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--space-md);
    }
    
    .challenge-solution {
        background: var(--bg-tertiary);
        padding: var(--space-md);
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
    }
    
    /* Optimizer timeline */
    .optimizer-timeline {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin: var(--space-xl) 0;
    }
    
    .optimizer-item {
        display: grid;
        grid-template-columns: 100px 1fr auto;
        gap: var(--space-lg);
        align-items: start;
        padding: var(--space-lg);
        background: var(--surface-1);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--accent-gold-dim);
    }
    
    .optimizer-name {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--accent-gold);
    }
    
    .optimizer-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .optimizer-formula {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--text-tertiary);
        background: var(--bg-tertiary);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
    }
    
    /* SGD cards */
    .sgd-card {
        background: var(--surface-1);
        border: 1px solid var(--surface-2);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .sgd-card .card-title {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--space-xs);
    }
    
    .sgd-card .card-subtitle {
        font-size: 0.8rem;
        color: var(--text-tertiary);
        margin-bottom: var(--space-md);
    }
    
    .sgd-card .card-content ul {
        list-style: none;
    }
    
    .sgd-card .card-content li {
        position: relative;
        padding-left: var(--space-lg);
        margin-bottom: var(--space-sm);
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .sgd-card .card-content li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: var(--accent-gold-dim);
    }
    
    /* Visual concept */
    .visual-concept {
        margin: var(--space-xl) 0;
    }
    
    .visual-concept h4 {
        font-family: var(--font-display);
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: var(--space-lg);
    }
    
    .gradient-visualization {
        background: var(--surface-1);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
    }
    
    .viz-description {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .viz-description ul {
        margin: var(--space-md) 0;
        padding-left: var(--space-lg);
    }
    
    .viz-description li {
        margin-bottom: var(--space-sm);
        font-family: var(--font-mono);
        font-size: 0.85rem;
    }
    
    /* LR Explorer */
    .lr-comparison {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
        flex-wrap: wrap;
        margin-bottom: var(--space-xl);
    }
    
    .lr-track {
        text-align: center;
    }
    
    .lr-track h4 {
        font-size: 0.9rem;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .lr-label {
        font-size: 0.75rem;
        color: var(--text-tertiary);
    }
    
    .lr-canvas {
        display: block;
        border-radius: var(--radius-md);
        margin-bottom: var(--space-sm);
    }
    
    .lr-status {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .lr-actions,
    .sgd-actions {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
        margin-bottom: var(--space-xl);
    }
    
    .lr-observations,
    .sgd-observations {
        background: var(--surface-1);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
    }
    
    .lr-observations h4 {
        font-family: var(--font-display);
        font-size: 1rem;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .lr-observations ul {
        list-style: none;
    }
    
    .lr-observations li {
        margin-bottom: var(--space-sm);
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    /* SGD Comparison */
    .sgd-comparison {
        display: flex;
        justify-content: center;
        gap: var(--space-xl);
        flex-wrap: wrap;
        margin-bottom: var(--space-xl);
    }
    
    .sgd-track {
        text-align: center;
    }
    
    .sgd-track h4 {
        font-size: 0.9rem;
        color: var(--text-primary);
        margin-bottom: var(--space-md);
    }
    
    .sgd-canvas {
        display: block;
        border-radius: var(--radius-md);
        margin-bottom: var(--space-sm);
    }
    
    .sgd-status {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    
    .sgd-controls {
        display: flex;
        justify-content: center;
        margin-bottom: var(--space-lg);
    }
    
    .sgd-description {
        text-align: center;
        color: var(--text-secondary);
        margin-bottom: var(--space-xl);
    }
    
    /* Completed section styling */
    .completed-section {
        background: linear-gradient(135deg, var(--success-bg), transparent);
        border-color: var(--success);
    }
    
    .completed-section .nav-direction {
        color: var(--success);
    }
    
    @media (max-width: 768px) {
        .optimizer-item {
            grid-template-columns: 1fr;
        }
        
        .lr-comparison,
        .sgd-comparison {
            flex-direction: column;
            align-items: center;
        }
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
    new GradientDescentVisualizer();
    new LearningRateExplorer();
    new SGDComparison();
    new ModuleQuiz('quiz-container');
});

