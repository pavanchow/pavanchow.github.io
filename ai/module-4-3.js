// Module 4.3: Multimodal Systems
// Interactive Lab Implementation

(function() {
    'use strict';

    // ==========================================
    // Embedding Space Visualization
    // ==========================================
    const embeddingCanvas = document.getElementById('embedding-canvas');
    const embCtx = embeddingCanvas ? embeddingCanvas.getContext('2d') : null;
    const similarityMatrix = document.getElementById('similarity-matrix');
    
    const itemTypeSelect = document.getElementById('item-type');
    const itemValueSelect = document.getElementById('item-value');
    const addItemBtn = document.getElementById('add-item');
    const customTextInput = document.getElementById('custom-text');
    const addCustomBtn = document.getElementById('add-custom');
    const clearBtn = document.getElementById('clear-embeddings');

    // Simulated embedding space (2D for visualization)
    // Real CLIP uses 512 or 768 dimensions, but we simulate key relationships
    const embeddingDatabase = {
        // Animals cluster
        dog: { base: [0.2, 0.7], variance: 0.05 },
        cat: { base: [0.25, 0.65], variance: 0.05 },
        
        // Vehicles cluster
        car: { base: [0.7, 0.3], variance: 0.05 },
        airplane: { base: [0.75, 0.25], variance: 0.05 },
        
        // Buildings/Nature cluster
        house: { base: [0.5, 0.5], variance: 0.05 },
        tree: { base: [0.4, 0.55], variance: 0.05 },
        
        // Text variations (slightly offset from image concepts)
        'a dog': { base: [0.22, 0.68], variance: 0.03 },
        'a cat': { base: [0.27, 0.63], variance: 0.03 },
        'a car': { base: [0.68, 0.32], variance: 0.03 },
        'an airplane': { base: [0.73, 0.27], variance: 0.03 },
        'a house': { base: [0.48, 0.52], variance: 0.03 },
        'a tree': { base: [0.38, 0.57], variance: 0.03 },
        
        // General categories
        'animal': { base: [0.23, 0.67], variance: 0.08 },
        'vehicle': { base: [0.72, 0.28], variance: 0.08 },
        'pet': { base: [0.22, 0.66], variance: 0.06 },
        'furry': { base: [0.21, 0.69], variance: 0.07 },
        'four wheels': { base: [0.69, 0.31], variance: 0.06 },
        'flying': { base: [0.74, 0.23], variance: 0.06 }
    };

    let embeddedItems = [];

    const colors = {
        image: '#FF6B6B',
        text: '#4ECDC4',
        background: '#0A0A0F',
        grid: '#1F2937',
        label: '#9CA3AF'
    };

    function getEmbedding(name, type) {
        const key = type === 'text' ? name.toLowerCase() : name.toLowerCase();
        
        if (embeddingDatabase[key]) {
            const base = embeddingDatabase[key].base;
            const variance = embeddingDatabase[key].variance;
            return [
                base[0] + (Math.random() - 0.5) * variance,
                base[1] + (Math.random() - 0.5) * variance
            ];
        }
        
        // For unknown text, create a semi-random but consistent embedding
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash = hash & hash;
        }
        
        // Map hash to 0-1 range
        const x = ((hash % 1000) / 1000 + 1) / 2;
        const y = (((hash * 31) % 1000) / 1000 + 1) / 2;
        
        return [x * 0.8 + 0.1, y * 0.8 + 0.1]; // Keep within margins
    }

    function cosineSimilarity(a, b) {
        const dotProduct = a[0] * b[0] + a[1] * b[1];
        const magnitudeA = Math.sqrt(a[0] ** 2 + a[1] ** 2);
        const magnitudeB = Math.sqrt(b[0] ** 2 + b[1] ** 2);
        return dotProduct / (magnitudeA * magnitudeB);
    }

    function addItem(name, type) {
        const embedding = getEmbedding(name, type);
        embeddedItems.push({
            name: name,
            type: type,
            embedding: embedding,
            id: Date.now() + Math.random()
        });
        drawEmbeddingSpace();
        updateSimilarityMatrix();
    }

    function drawEmbeddingSpace() {
        if (!embCtx) return;
        
        const width = embeddingCanvas.width;
        const height = embeddingCanvas.height;
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        // Clear
        embCtx.fillStyle = colors.background;
        embCtx.fillRect(0, 0, width, height);
        
        // Draw grid
        embCtx.strokeStyle = colors.grid;
        embCtx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i / 4) * plotWidth;
            const y = padding + (i / 4) * plotHeight;
            
            embCtx.beginPath();
            embCtx.moveTo(x, padding);
            embCtx.lineTo(x, height - padding);
            embCtx.stroke();
            
            embCtx.beginPath();
            embCtx.moveTo(padding, y);
            embCtx.lineTo(width - padding, y);
            embCtx.stroke();
        }
        
        // Draw axes
        embCtx.strokeStyle = '#4B5563';
        embCtx.lineWidth = 2;
        embCtx.beginPath();
        embCtx.moveTo(padding, padding);
        embCtx.lineTo(padding, height - padding);
        embCtx.lineTo(width - padding, height - padding);
        embCtx.stroke();
        
        // Axis labels
        embCtx.fillStyle = colors.label;
        embCtx.font = '11px "JetBrains Mono", monospace';
        embCtx.textAlign = 'center';
        embCtx.fillText('Embedding Dimension 1', width / 2, height - 8);
        
        embCtx.save();
        embCtx.translate(12, height / 2);
        embCtx.rotate(-Math.PI / 2);
        embCtx.fillText('Embedding Dimension 2', 0, 0);
        embCtx.restore();
        
        // Draw items
        embeddedItems.forEach((item, index) => {
            const x = padding + item.embedding[0] * plotWidth;
            const y = height - padding - item.embedding[1] * plotHeight;
            
            // Marker
            embCtx.beginPath();
            if (item.type === 'image') {
                // Square for images
                embCtx.rect(x - 8, y - 8, 16, 16);
            } else {
                // Circle for text
                embCtx.arc(x, y, 8, 0, Math.PI * 2);
            }
            embCtx.fillStyle = item.type === 'image' ? colors.image : colors.text;
            embCtx.fill();
            embCtx.strokeStyle = '#fff';
            embCtx.lineWidth = 2;
            embCtx.stroke();
            
            // Label
            embCtx.fillStyle = '#E5E7EB';
            embCtx.font = '10px "DM Sans", sans-serif';
            embCtx.textAlign = 'center';
            
            // Truncate long labels
            let label = item.name;
            if (label.length > 12) {
                label = label.substring(0, 10) + '...';
            }
            
            embCtx.fillText(label, x, y - 14);
            
            // Type indicator
            embCtx.fillStyle = item.type === 'image' ? colors.image : colors.text;
            embCtx.font = '8px "JetBrains Mono", monospace';
            embCtx.fillText(item.type === 'image' ? '[IMG]' : '[TXT]', x, y + 20);
        });
        
        // Draw legend
        embCtx.fillStyle = colors.label;
        embCtx.font = '10px "DM Sans", sans-serif';
        embCtx.textAlign = 'left';
        
        // Image legend
        embCtx.fillStyle = colors.image;
        embCtx.fillRect(width - 120, 15, 12, 12);
        embCtx.fillStyle = '#E5E7EB';
        embCtx.fillText('Image', width - 100, 25);
        
        // Text legend
        embCtx.fillStyle = colors.text;
        embCtx.beginPath();
        embCtx.arc(width - 114, 45, 6, 0, Math.PI * 2);
        embCtx.fill();
        embCtx.fillStyle = '#E5E7EB';
        embCtx.fillText('Text', width - 100, 49);
    }

    function updateSimilarityMatrix() {
        if (!similarityMatrix) return;
        
        if (embeddedItems.length < 2) {
            similarityMatrix.innerHTML = '<p class="matrix-note">Add at least 2 items to see similarity</p>';
            return;
        }
        
        // Calculate similarity matrix
        let html = '<table class="sim-table"><thead><tr><th></th>';
        
        embeddedItems.forEach(item => {
            let label = item.name;
            if (label.length > 8) label = label.substring(0, 6) + '..';
            html += `<th class="${item.type}">${label}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        embeddedItems.forEach((itemA, i) => {
            let label = itemA.name;
            if (label.length > 8) label = label.substring(0, 6) + '..';
            html += `<tr><td class="row-label ${itemA.type}">${label}</td>`;
            
            embeddedItems.forEach((itemB, j) => {
                const sim = cosineSimilarity(itemA.embedding, itemB.embedding);
                const intensity = Math.abs(sim);
                
                let colorClass = 'sim-low';
                if (sim > 0.9) colorClass = 'sim-very-high';
                else if (sim > 0.7) colorClass = 'sim-high';
                else if (sim > 0.5) colorClass = 'sim-medium';
                
                html += `<td class="${colorClass}">${sim.toFixed(2)}</td>`;
            });
            
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        similarityMatrix.innerHTML = html;
    }

    // Event listeners
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            const type = itemTypeSelect.value;
            const value = itemValueSelect.value;
            const name = type === 'image' ? value : `a ${value}`;
            addItem(name, type);
        });
    }

    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', function() {
            const text = customTextInput.value.trim();
            if (text) {
                addItem(text, 'text');
                customTextInput.value = '';
            }
        });
    }

    if (customTextInput) {
        customTextInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const text = this.value.trim();
                if (text) {
                    addItem(text, 'text');
                    this.value = '';
                }
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            embeddedItems = [];
            drawEmbeddingSpace();
            updateSimilarityMatrix();
        });
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
            correct: "Correct! CLIP uses contrastive learning: given a batch of N image-text pairs, it learns to maximize similarity for true pairs and minimize it for the N²-N false pairs. This creates the shared embedding space.",
            incorrect: "CLIP's training objective is contrastive: align matching image-text pairs while pushing non-matching pairs apart. This is what enables zero-shot capabilities."
        },
        q2: {
            correct: "Exactly! Adapter-based VLMs like LLaVA use a projection layer to map visual features from an image encoder (like ViT) into the token embedding space of the LLM. The LLM then processes these visual tokens alongside text tokens.",
            incorrect: "Adapter-based approaches project visual features into the LLM's embedding space. The LLM treats these projected features as additional tokens in its input sequence."
        },
        q3: {
            correct: "Right! Hallucination is a critical challenge—VLMs may describe objects, attributes, or relationships that don't exist in the image, relying on statistical priors rather than actual visual evidence.",
            incorrect: "A major challenge with VLMs is hallucination: generating confident descriptions of things not present in the image. This happens when the model relies on language priors over visual evidence."
        },
        q4: {
            correct: "Correct! Text-to-image models use cross-attention to inject text conditioning. The U-Net's queries come from image features, and keys/values come from text embeddings, allowing each spatial location to attend to relevant parts of the prompt.",
            incorrect: "In Stable Diffusion, cross-attention layers let image features (queries) attend to text embeddings (keys/values). This is how the text prompt guides what gets generated at each location."
        },
        q5: {
            correct: "Exactly! Native multimodal models like Gemini are trained from scratch on interleaved multimodal data with a unified architecture. This allows deeper integration compared to bolting a vision encoder onto an existing LLM.",
            incorrect: "Native multimodal models differ from adapter approaches by being trained from the ground up on interleaved multimodal data, rather than adapting a pre-trained text-only LLM."
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
                resultsMessage.textContent = "Excellent! You have a strong understanding of multimodal AI systems.";
                resultsMessage.className = 'results-message excellent';
            } else if (score >= 3) {
                resultsMessage.textContent = "Good progress! Review the CLIP and VLM architecture sections for deeper understanding.";
                resultsMessage.className = 'results-message good';
            } else {
                resultsMessage.textContent = "Consider revisiting the module, especially the multimodal fusion strategies.";
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
        drawEmbeddingSpace();
        updateSimilarityMatrix();
        
        // Add some default items
        addItem('dog', 'image');
        addItem('a dog', 'text');
        addItem('cat', 'image');
        addItem('car', 'image');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

