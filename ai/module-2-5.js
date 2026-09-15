// Module 2.5: Specialized Architectures - Interactive Labs

document.addEventListener('DOMContentLoaded', () => {
    initConvolutionLab();
    initRNNLab();
    initClusteringLab();
    initQuiz();
    initLabTabs();
});

// Lab Tab Navigation
function initLabTabs() {
    const tabs = document.querySelectorAll('.lab-tab');
    const panels = document.querySelectorAll('.lab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab + '-panel';
            
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(targetId)?.classList.add('active');
        });
    });
}

// ============================================
// Convolution Visualizer
// ============================================

function initConvolutionLab() {
    const filters = {
        'edge-h': [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
        'edge-v': [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
        'blur': [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
        'sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
    };
    
    // Sample 5x5 input (grayscale values 0-255)
    let input = [
        [50, 50, 50, 200, 200],
        [50, 50, 50, 200, 200],
        [50, 50, 100, 200, 200],
        [100, 100, 100, 100, 100],
        [200, 200, 200, 200, 200]
    ];
    
    const inputGrid = document.getElementById('input-grid');
    const filterGrid = document.getElementById('filter-grid');
    const outputGrid = document.getElementById('output-grid');
    const filterSelect = document.getElementById('filter-select');
    const animateBtn = document.getElementById('animate-conv');
    const resetBtn = document.getElementById('reset-conv');
    
    if (!inputGrid) return;
    
    function renderGrid(grid, container, isFilter = false) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
        
        grid.forEach((row, i) => {
            row.forEach((val, j) => {
                const cell = document.createElement('div');
                cell.className = 'pixel-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (isFilter) {
                    cell.textContent = val.toFixed(1);
                    const color = val > 0 ? `rgba(34, 197, 94, ${Math.abs(val)})` : 
                                  val < 0 ? `rgba(239, 68, 68, ${Math.abs(val)})` : '#333';
                    cell.style.backgroundColor = color;
                } else {
                    const gray = Math.round(val);
                    cell.style.backgroundColor = `rgb(${gray}, ${gray}, ${gray})`;
                    cell.textContent = gray;
                    cell.style.color = gray > 128 ? '#000' : '#fff';
                }
                
                container.appendChild(cell);
            });
        });
    }
    
    function convolve(input, filter) {
        const output = [];
        const fSize = filter.length;
        const pad = Math.floor(fSize / 2);
        
        for (let i = pad; i < input.length - pad; i++) {
            const row = [];
            for (let j = pad; j < input[0].length - pad; j++) {
                let sum = 0;
                for (let fi = 0; fi < fSize; fi++) {
                    for (let fj = 0; fj < fSize; fj++) {
                        sum += input[i - pad + fi][j - pad + fj] * filter[fi][fj];
                    }
                }
                row.push(Math.max(0, Math.min(255, sum)));
            }
            output.push(row);
        }
        return output;
    }
    
    function updateVisualization() {
        const filterType = filterSelect.value;
        const filter = filters[filterType];
        const output = convolve(input, filter);
        
        renderGrid(input, inputGrid);
        renderGrid(filter, filterGrid, true);
        renderGrid(output, outputGrid);
    }
    
    async function animateConvolution() {
        const filterType = filterSelect.value;
        const filter = filters[filterType];
        const fSize = filter.length;
        const pad = Math.floor(fSize / 2);
        
        animateBtn.disabled = true;
        
        for (let i = pad; i < input.length - pad; i++) {
            for (let j = pad; j < input[0].length - pad; j++) {
                // Highlight current window in input
                document.querySelectorAll('#input-grid .pixel-cell').forEach(cell => {
                    cell.classList.remove('highlight');
                    const r = parseInt(cell.dataset.row);
                    const c = parseInt(cell.dataset.col);
                    if (r >= i - pad && r <= i + pad && c >= j - pad && c <= j + pad) {
                        cell.classList.add('highlight');
                    }
                });
                
                // Highlight corresponding output cell
                document.querySelectorAll('#output-grid .pixel-cell').forEach(cell => {
                    cell.classList.remove('highlight');
                    const r = parseInt(cell.dataset.row);
                    const c = parseInt(cell.dataset.col);
                    if (r === i - pad && c === j - pad) {
                        cell.classList.add('highlight');
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        document.querySelectorAll('.pixel-cell').forEach(cell => cell.classList.remove('highlight'));
        animateBtn.disabled = false;
    }
    
    filterSelect?.addEventListener('change', updateVisualization);
    animateBtn?.addEventListener('click', animateConvolution);
    resetBtn?.addEventListener('click', updateVisualization);
    
    updateVisualization();
}

// ============================================
// RNN State Visualization
// ============================================

function initRNNLab() {
    const canvas = document.getElementById('rnn-state-canvas');
    const stepBtn = document.getElementById('step-rnn');
    const resetBtn = document.getElementById('reset-rnn');
    const tokens = document.querySelectorAll('.sequence-tokens .token');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let currentStep = -1;
    
    // Simulated hidden states for each token
    const hiddenStates = [
        [0.1, 0.2, 0.1, 0.0],  // "The"
        [0.3, 0.5, 0.2, 0.1],  // "cat"
        [0.4, 0.6, 0.5, 0.2],  // "sat"
        [0.5, 0.5, 0.6, 0.4],  // "on"
        [0.4, 0.4, 0.5, 0.5],  // "the"
        [0.6, 0.7, 0.8, 0.6]   // "mat"
    ];
    
    function drawState() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = 60;
        const barSpacing = 20;
        const maxHeight = 150;
        const startX = 40;
        const startY = canvas.height - 30;
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(startX, 20);
        ctx.lineTo(startX, startY);
        ctx.lineTo(canvas.width - 20, startY);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#999';
        ctx.font = '12px DM Sans';
        ctx.fillText('Hidden State Dimensions', canvas.width / 2 - 60, canvas.height - 5);
        
        if (currentStep < 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px DM Sans';
            ctx.fillText('Click "Step Through" to see hidden state evolution', canvas.width / 2 - 140, canvas.height / 2);
            return;
        }
        
        const state = hiddenStates[currentStep];
        const colors = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B'];
        
        state.forEach((val, i) => {
            const x = startX + 30 + i * (barWidth + barSpacing);
            const height = val * maxHeight;
            
            ctx.fillStyle = colors[i];
            ctx.fillRect(x, startY - height, barWidth, height);
            
            // Value label
            ctx.fillStyle = '#fff';
            ctx.font = '11px JetBrains Mono';
            ctx.fillText(val.toFixed(2), x + 15, startY - height - 5);
            
            // Dimension label
            ctx.fillStyle = '#999';
            ctx.fillText(`h[${i}]`, x + 20, startY + 15);
        });
        
        // Token label
        ctx.fillStyle = '#F59E0B';
        ctx.font = '14px DM Sans';
        ctx.fillText(`After processing: "${tokens[currentStep].textContent}"`, startX + 30, 30);
    }
    
    function step() {
        currentStep = (currentStep + 1) % tokens.length;
        
        tokens.forEach((t, i) => {
            t.classList.toggle('active', i <= currentStep);
            t.classList.toggle('current', i === currentStep);
        });
        
        drawState();
    }
    
    function reset() {
        currentStep = -1;
        tokens.forEach(t => {
            t.classList.remove('active', 'current');
        });
        drawState();
    }
    
    stepBtn?.addEventListener('click', step);
    resetBtn?.addEventListener('click', reset);
    
    drawState();
}

// ============================================
// Clustering Visualization
// ============================================

function initClusteringLab() {
    const canvas = document.getElementById('cluster-canvas');
    const kSlider = document.getElementById('k-clusters');
    const kValue = document.getElementById('k-value');
    const patternSelect = document.getElementById('data-pattern');
    const generateBtn = document.getElementById('generate-data');
    const runBtn = document.getElementById('run-kmeans');
    const stepBtn = document.getElementById('step-kmeans');
    const iterDisplay = document.getElementById('kmeans-iter');
    const inertiaDisplay = document.getElementById('kmeans-inertia');
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let points = [];
    let centroids = [];
    let assignments = [];
    let iteration = 0;
    
    const colors = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    
    function generateData() {
        const pattern = patternSelect.value;
        const n = 150;
        points = [];
        
        if (pattern === 'blobs') {
            const centers = [[100, 100], [300, 150], [200, 300], [400, 350]];
            centers.forEach(center => {
                for (let i = 0; i < n / centers.length; i++) {
                    points.push([
                        center[0] + (Math.random() - 0.5) * 80,
                        center[1] + (Math.random() - 0.5) * 80
                    ]);
                }
            });
        } else if (pattern === 'moons') {
            for (let i = 0; i < n / 2; i++) {
                const angle = Math.PI * i / (n / 2);
                points.push([
                    150 + 100 * Math.cos(angle) + (Math.random() - 0.5) * 30,
                    200 - 80 * Math.sin(angle) + (Math.random() - 0.5) * 30
                ]);
                points.push([
                    350 - 100 * Math.cos(angle) + (Math.random() - 0.5) * 30,
                    200 + 80 * Math.sin(angle) + (Math.random() - 0.5) * 30
                ]);
            }
        } else if (pattern === 'circles') {
            for (let i = 0; i < n / 2; i++) {
                const angle = 2 * Math.PI * i / (n / 2);
                points.push([
                    250 + 50 * Math.cos(angle) + (Math.random() - 0.5) * 20,
                    200 + 50 * Math.sin(angle) + (Math.random() - 0.5) * 20
                ]);
                points.push([
                    250 + 120 * Math.cos(angle) + (Math.random() - 0.5) * 20,
                    200 + 120 * Math.sin(angle) + (Math.random() - 0.5) * 20
                ]);
            }
        }
        
        centroids = [];
        assignments = [];
        iteration = 0;
        updateDisplay();
        draw();
    }
    
    function initCentroids() {
        const k = parseInt(kSlider.value);
        centroids = [];
        
        // K-means++ initialization
        const firstIdx = Math.floor(Math.random() * points.length);
        centroids.push([...points[firstIdx]]);
        
        while (centroids.length < k) {
            const distances = points.map(p => {
                const minDist = Math.min(...centroids.map(c => 
                    Math.sqrt((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2)
                ));
                return minDist ** 2;
            });
            
            const sum = distances.reduce((a, b) => a + b, 0);
            let r = Math.random() * sum;
            
            for (let i = 0; i < points.length; i++) {
                r -= distances[i];
                if (r <= 0) {
                    centroids.push([...points[i]]);
                    break;
                }
            }
        }
        
        assignPoints();
    }
    
    function assignPoints() {
        assignments = points.map(p => {
            let minDist = Infinity;
            let minIdx = 0;
            
            centroids.forEach((c, i) => {
                const dist = Math.sqrt((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    minIdx = i;
                }
            });
            
            return minIdx;
        });
    }
    
    function updateCentroids() {
        const k = centroids.length;
        const newCentroids = Array(k).fill(null).map(() => [0, 0]);
        const counts = Array(k).fill(0);
        
        points.forEach((p, i) => {
            const c = assignments[i];
            newCentroids[c][0] += p[0];
            newCentroids[c][1] += p[1];
            counts[c]++;
        });
        
        centroids = newCentroids.map((c, i) => 
            counts[i] > 0 ? [c[0] / counts[i], c[1] / counts[i]] : centroids[i]
        );
    }
    
    function calculateInertia() {
        return points.reduce((sum, p, i) => {
            const c = centroids[assignments[i]];
            return sum + (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
        }, 0);
    }
    
    function kmeansStep() {
        if (centroids.length === 0) {
            initCentroids();
        } else {
            updateCentroids();
            assignPoints();
            iteration++;
        }
        
        updateDisplay();
        draw();
    }
    
    function runKmeans() {
        initCentroids();
        
        for (let i = 0; i < 20; i++) {
            const oldAssignments = [...assignments];
            updateCentroids();
            assignPoints();
            iteration++;
            
            if (oldAssignments.every((a, idx) => a === assignments[idx])) {
                break;
            }
        }
        
        updateDisplay();
        draw();
    }
    
    function updateDisplay() {
        iterDisplay.textContent = iteration;
        inertiaDisplay.textContent = centroids.length > 0 ? calculateInertia().toFixed(1) : '—';
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw points
        points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p[0], p[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = assignments.length > 0 ? colors[assignments[i] % colors.length] : '#666';
            ctx.fill();
        });
        
        // Draw centroids
        centroids.forEach((c, i) => {
            ctx.beginPath();
            ctx.arc(c[0], c[1], 12, 0, 2 * Math.PI);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Cross marker
            ctx.beginPath();
            ctx.moveTo(c[0] - 6, c[1]);
            ctx.lineTo(c[0] + 6, c[1]);
            ctx.moveTo(c[0], c[1] - 6);
            ctx.lineTo(c[0], c[1] + 6);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
    
    kSlider?.addEventListener('input', () => {
        kValue.textContent = kSlider.value;
    });
    
    generateBtn?.addEventListener('click', generateData);
    runBtn?.addEventListener('click', runKmeans);
    stepBtn?.addEventListener('click', kmeansStep);
    
    generateData();
}

// ============================================
// Quiz
// ============================================

function initQuiz() {
    const checkBtn = document.getElementById('check-quiz');
    const resultsDiv = document.getElementById('quiz-results');
    
    const answers = {
        '1': { correct: 'b', explanation: 'Weight sharing means the same filter is applied everywhere, giving translation invariance and dramatically reducing parameters compared to fully-connected layers.' },
        '2': { correct: 'b', explanation: 'LSTMs use gates (forget, input, output) to control information flow, allowing gradients to propagate over many time steps without vanishing.' },
        '3': { correct: 'b', explanation: 'K-Means minimizes the sum of squared distances from each point to its assigned centroid (within-cluster variance or inertia).' },
        '4': { correct: 'c', explanation: 'CNNs have stronger inductive bias for images, needing less data. They\'re also faster and smaller, making them ideal for edge deployment and limited-data scenarios.' }
    };
    
    checkBtn?.addEventListener('click', () => {
        let score = 0;
        const total = Object.keys(answers).length;
        
        Object.entries(answers).forEach(([qNum, answer]) => {
            const selected = document.querySelector(`input[name="q${qNum}"]:checked`);
            const feedback = document.querySelector(`.quiz-question[data-question="${qNum}"] .question-feedback`);
            const options = document.querySelectorAll(`.quiz-question[data-question="${qNum}"] .option`);
            
            options.forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
                const input = opt.querySelector('input');
                if (input.value === answer.correct) {
                    opt.classList.add('correct');
                }
            });
            
            if (selected) {
                const selectedOption = selected.closest('.option');
                if (selected.value === answer.correct) {
                    score++;
                    feedback.innerHTML = `<span class="correct-feedback">✓ Correct!</span> ${answer.explanation}`;
                } else {
                    selectedOption.classList.add('incorrect');
                    feedback.innerHTML = `<span class="incorrect-feedback">✗ Incorrect.</span> ${answer.explanation}`;
                }
            } else {
                feedback.innerHTML = `<span class="incorrect-feedback">No answer selected.</span> ${answer.explanation}`;
            }
            
            feedback.style.display = 'block';
        });
        
        resultsDiv.innerHTML = `You got <strong>${score}/${total}</strong> correct.`;
        resultsDiv.style.display = 'block';
    });
}

