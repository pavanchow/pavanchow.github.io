// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sectionsContainer = document.getElementById('sectionsContainer');
    const titlePageSection = document.getElementById('titlePageSection');
    const prefaceSection = document.getElementById('prefaceSection');
    const aboutAuthorSection = document.getElementById('aboutAuthorSection');
    const tocSection = document.getElementById('tocSection');
    const chapterEditSection = document.getElementById('chapterEditSection');
    const appendixSection = document.getElementById('appendixSection');
    const indexSection = document.getElementById('indexSection');
    const exportPageSection = document.getElementById('exportPageSection');
    const bookStructureSection = document.getElementById('bookStructureSection');
    const structureListContainer = document.getElementById('structureListContainer');
    const addCustomSectionBtn = document.getElementById('addCustomSectionBtn');
    const customSectionEditor = document.getElementById('customSectionEditor');
    const customSectionTitleHeader = document.getElementById('customSectionTitleHeader');
    const customSectionContentInput = document.getElementById('customSectionContentInput');

    const ebookTitleInput = document.getElementById('ebookTitle');
    const ebookAuthorNameInput = document.getElementById('ebookAuthorName');
    const prefaceContentInput = document.getElementById('prefaceContent');
    const aboutAuthorContentInput = document.getElementById('aboutAuthorContent');
    const chapterEditTitleHeader = document.getElementById('chapterEditTitle');
    const chapterTitleInput = document.getElementById('chapterTitleInput');
    const chapterContentInput = document.getElementById('chapterContentInput');
    const appendixContentInput = document.getElementById('appendixContent');
    const indexContentInput = document.getElementById('indexContent');

    // Cover Image Elements
    const coverImageUploadInput = document.getElementById('coverImageUploadInput');
    const uploadCoverBtn = document.getElementById('uploadCoverBtn');
    const coverPreview = document.getElementById('coverPreview');
    const removeCoverBtn = document.getElementById('removeCoverBtn');

    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const addChapterBtn = document.getElementById('addChapterBtn');
    const previewBookBtn = document.getElementById('previewBookBtn');
    const goToExportBtn = document.getElementById('goToExportBtn');
    const finalExportBtn = document.getElementById('finalExportBtn');

    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const previewContentContainer = document.getElementById('previewContentContainer');

    const currentStepNameEl = document.getElementById('currentStepName');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadingIndicatorText = document.getElementById('loadingIndicatorText');

    const infoModal = document.getElementById('infoModal');
    const infoModalTitle = document.getElementById('infoModalTitle');
    const infoModalContent = document.getElementById('infoModalContent');
    const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
    const okInfoModalBtn = document.getElementById('okInfoModalBtn');

    const instructionsModal = document.getElementById('instructionsModal');
    const showInstructionsBtn = document.getElementById('showInstructionsBtn');
    const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');
    const okInstructionsBtn = document.getElementById('okInstructionsBtn');

    const imageUploadInput = document.getElementById('imageUploadInput'); // For general content images
    let activeTextareaForImage = null;

    // --- Application State ---
    let ebookData = {
        title: "My E-book Title",
        authorNameForTitlePage: "",
        coverImage: { // New state for cover image
            dataUrl: null, // Base64 data URL
            filename: null,
            type: null     // MIME type
        },
        structure: [
            { id: 'preface', type: 'predefined', title: 'Preface', originalTitle: 'Preface', content: "", domId: 'prefaceSection', inputElId: 'prefaceContent', isOptional: true, visible: true, hasContentInput: true, hasImageUpload: true, isRemovable: false },
            { id: 'aboutAuthor', type: 'predefined', title: 'About the Author', originalTitle: 'About the Author', content: "", domId: 'aboutAuthorSection', inputElId: 'aboutAuthorContent', isOptional: true, visible: true, hasContentInput: true, hasImageUpload: true, isRemovable: false },
            { id: 'toc', type: 'toc', title: 'Table of Contents', originalTitle: 'Table of Contents', content: "", domId: 'tocSection', isOptional: true, visible: true, hasContentInput: false, hasImageUpload: false, isRemovable: false },
            { id: 'chapters', type: 'chapterGroup', title: 'Chapters', originalTitle: 'Chapters', chapters: [{ title: "Chapter 1", content: "" }], domId: 'chapterEditSection', hasContentInput: true, hasImageUpload: true, isRemovable: false, visible: true },
            { id: 'appendix', type: 'predefined', title: 'Appendix', originalTitle: 'Appendix', content: "", domId: 'appendixSection', inputElId: 'appendixContent', isOptional: true, visible: true, hasContentInput: true, hasImageUpload: true, isRemovable: false },
            { id: 'index', type: 'predefined', title: 'Index', originalTitle: 'Index', content: "", domId: 'indexSection', inputElId: 'indexContent', isOptional: true, visible: true, hasContentInput: true, hasImageUpload: true, isRemovable: false }
        ],
    };

    const navigationFlow = [
        { id: 'titlePageSection', name: 'Book Title, Author & Cover' },
        { id: 'bookStructureSection', name: 'Book Structure' },
        { id: 'exportPageSection', name: 'Export E-book' }
    ];
    const titlePageFlowIndex = 0;
    const bookStructureFlowIndex = 1;

    let currentSectionManager = {
        flowIndex: 0,
        structureIndex: -1,
        chapterIndex: 0,

        getCurrentNavFlowInfo: function() {
            if (this.structureIndex !== -1) return { id: 'contentEditing', name: 'Content Editing'};
            if (this.flowIndex >= navigationFlow.length) return navigationFlow[navigationFlow.length -1];
            return navigationFlow[this.flowIndex];
        },
        getCurrentStructureInfo: function() {
            if (this.structureIndex >= 0 && this.structureIndex < ebookData.structure.length) {
                return ebookData.structure[this.structureIndex];
            }
            return null;
        },
        isEditingChapterGroup: function() {
            const structInfo = this.getCurrentStructureInfo();
            return structInfo?.type === 'chapterGroup';
        },

        loadDataForCurrentStep: function() {
            const navInfo = this.getCurrentNavFlowInfo();
            if (!navInfo) return;

            if (this.flowIndex === titlePageFlowIndex && this.structureIndex === -1) {
                ebookTitleInput.value = ebookData.title;
                ebookAuthorNameInput.value = ebookData.authorNameForTitlePage;
                // Load cover image preview
                if (ebookData.coverImage.dataUrl) {
                    coverPreview.src = ebookData.coverImage.dataUrl;
                    coverPreview.classList.remove('hidden');
                    removeCoverBtn.classList.remove('hidden');
                } else {
                    coverPreview.classList.add('hidden');
                    removeCoverBtn.classList.add('hidden');
                    coverPreview.src = "#"; // Clear src
                }
                activeTextareaForImage = null;
            } else if (this.flowIndex === bookStructureFlowIndex && this.structureIndex === -1) {
                renderBookStructureUI();
                activeTextareaForImage = null;
            } else if (this.structureIndex !== -1) {
                const structInfo = this.getCurrentStructureInfo();
                if (!structInfo || !structInfo.visible) return;

                if (structInfo.type === 'predefined') {
                    const inputEl = document.getElementById(structInfo.inputElId);
                    if (inputEl) inputEl.value = structInfo.content;
                    activeTextareaForImage = inputEl;
                } else if (structInfo.type === 'custom') {
                    customSectionTitleHeader.textContent = `Edit: ${structInfo.title}`;
                    customSectionContentInput.value = structInfo.content;
                    activeTextareaForImage = customSectionContentInput;
                } else if (structInfo.type === 'chapterGroup') {
                    if (!structInfo.chapters) structInfo.chapters = [];
                    if (structInfo.chapters.length === 0) {
                        structInfo.chapters.push({ title: `Chapter 1`, content: "" });
                    }
                    this.chapterIndex = Math.max(0, Math.min(this.chapterIndex, structInfo.chapters.length - 1));

                    const chapter = structInfo.chapters[this.chapterIndex];
                    chapterEditTitleHeader.textContent = `Edit ${structInfo.title} - Chapter ${this.chapterIndex + 1}: ${chapter.title || '(Untitled)'}`;
                    chapterTitleInput.value = chapter.title;
                    chapterContentInput.value = chapter.content;
                    activeTextareaForImage = chapterContentInput;
                } else if (structInfo.type === 'toc') {
                    activeTextareaForImage = null;
                }
            }
        },
        saveDataForCurrentStep: function() {
            const navInfo = this.getCurrentNavFlowInfo();
            if (!navInfo) return;

            if (this.flowIndex === titlePageFlowIndex && this.structureIndex === -1) {
                ebookData.title = ebookTitleInput.value.trim();
                ebookData.authorNameForTitlePage = ebookAuthorNameInput.value.trim();
                // Cover image data is saved directly by its event handler
            } else if (this.structureIndex !== -1) {
                const structInfo = this.getCurrentStructureInfo();
                if (!structInfo || !structInfo.visible) return;

                if (structInfo.type === 'predefined' && structInfo.hasContentInput) {
                    const inputEl = document.getElementById(structInfo.inputElId);
                    if (inputEl) structInfo.content = inputEl.value;
                } else if (structInfo.type === 'custom') {
                    structInfo.content = customSectionContentInput.value;
                } else if (structInfo.type === 'chapterGroup') {
                    if (structInfo.chapters && structInfo.chapters[this.chapterIndex]) {
                        const chapter = structInfo.chapters[this.chapterIndex];
                        chapter.title = chapterTitleInput.value.trim() || `Chapter ${this.chapterIndex + 1}`;
                        chapter.content = chapterContentInput.value;
                    }
                }
            }
        }
    };

    const markdownConverter = new showdown.Converter({
        ghCompatibleHeaderId: true, simpleLineBreaks: true, tables: true,
        strikethrough: true, tasklists: true, openLinksInNewWindow: false,
        backslashEscapesHTMLTags: true
    });

    function sanitizeFilename(name) {
        let baseName = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
        return baseName.replace(/[^a-z0-9_\-\s]/gi, '_').replace(/\s+/g, '_').toLowerCase() || 'ebook_export';
    }
    function escapeXml(unsafe) {
        if (typeof unsafe !== 'string') {
            if (unsafe === null || typeof unsafe === 'undefined') return "";
            unsafe = String(unsafe);
        }
        return unsafe.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','\'':'&apos;','"':'&quot;'}[c]));
    }
    function showInfoModal(title, message) {
        if (!infoModal || !infoModalTitle || !infoModalContent) {
            const simpleMessage = message.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, '');
            alert(title + "\n\n" + simpleMessage); return;
        }
        infoModalTitle.textContent = title; infoModalContent.innerHTML = message;
        infoModal.classList.remove('hidden');
    }
    function setLoadingState(isLoading, message = "Generating, please wait...") {
        loadingIndicatorText.textContent = message;
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    // --- Cover Image Handling ---
    if (uploadCoverBtn) {
        uploadCoverBtn.addEventListener('click', () => {
            coverImageUploadInput.click();
        });
    }

    if (coverImageUploadInput) {
        coverImageUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    showInfoModal("Invalid Cover Image Type", "Please select a JPG or PNG image for the cover.");
                    coverImageUploadInput.value = null; // Reset input
                    return;
                }
                if (file.size > 2 * 1024 * 1024) { // 2MB limit for cover
                    showInfoModal("Cover Image Too Large", "Please select an image smaller than 2MB for the cover.");
                    coverImageUploadInput.value = null;
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    ebookData.coverImage.dataUrl = e.target.result;
                    ebookData.coverImage.filename = file.name;
                    ebookData.coverImage.type = file.type;
                    coverPreview.src = e.target.result;
                    coverPreview.classList.remove('hidden');
                    removeCoverBtn.classList.remove('hidden');
                };
                reader.onerror = () => {
                    showInfoModal("File Read Error", "Could not read the cover image file.");
                    ebookData.coverImage = { dataUrl: null, filename: null, type: null }; // Reset
                    coverPreview.classList.add('hidden');
                    removeCoverBtn.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
            coverImageUploadInput.value = null; // Reset file input to allow re-selection of the same file
        });
    }

    if (removeCoverBtn) {
        removeCoverBtn.addEventListener('click', () => {
            ebookData.coverImage = { dataUrl: null, filename: null, type: null };
            coverPreview.src = "#";
            coverPreview.classList.add('hidden');
            removeCoverBtn.classList.add('hidden');
            coverImageUploadInput.value = null; // Reset input
        });
    }


    function updateUI() {
        document.querySelectorAll('#sectionsContainer > div').forEach(sec => {
            sec.classList.remove('section-active');
            sec.classList.add('section-hidden');
        });

        let currentSectionElement;
        let stepName = "";

        if (currentSectionManager.structureIndex === -1) {
            const navFlowItem = navigationFlow[currentSectionManager.flowIndex];
            if (!navFlowItem) {
                currentSectionManager.flowIndex = titlePageFlowIndex;
                updateUI(); return;
            }
            currentSectionElement = document.getElementById(navFlowItem.id);
            stepName = navFlowItem.name;
            if (navFlowItem.id === 'bookStructureSection') {
                renderBookStructureUI();
            }
        } else {
            const structInfo = currentSectionManager.getCurrentStructureInfo();
            if (structInfo && structInfo.visible) {
                stepName = structInfo.title;
                currentSectionElement = document.getElementById(structInfo.domId);
                if (structInfo.type === 'chapterGroup') {
                    stepName += ` - Chapter ${currentSectionManager.chapterIndex + 1}`;
                }
            } else {
                console.warn("updateUI: structureIndex active but item not found/visible. Attempting to adjust.");
                currentSectionManager.structureIndex = -1;
                currentSectionManager.flowIndex = navigationFlow.length -1;
                updateUI(); return;
            }
        }

        if (currentSectionElement) {
            currentSectionElement.classList.remove('section-hidden');
            currentSectionElement.classList.add('section-active');
        } else {
            console.error("updateUI: No currentSectionElement found for state:", currentSectionManager);
            currentSectionManager.flowIndex = titlePageFlowIndex;
            currentSectionManager.structureIndex = -1;
            updateUI(); return;
        }

        currentStepNameEl.textContent = stepName;
        currentSectionManager.loadDataForCurrentStep();

        backBtn.disabled = (currentSectionManager.flowIndex === titlePageFlowIndex && currentSectionManager.structureIndex === -1);

        const isExportPage = (currentSectionManager.structureIndex === -1 && currentSectionManager.flowIndex === (navigationFlow.length - 1));
        nextBtn.style.display = isExportPage ? 'none' : 'inline-block';
        goToExportBtn.style.display = isExportPage ? 'none' : 'inline-block';

        addChapterBtn.style.display = 'none';
        if (currentSectionManager.isEditingChapterGroup()) {
            addChapterBtn.style.display = 'inline-block';
            const group = currentSectionManager.getCurrentStructureInfo();
            if (group && currentSectionManager.chapterIndex < group.chapters.length - 1) {
                nextBtn.textContent = 'Next Chapter';
            } else {
                nextBtn.textContent = 'Next Section';
            }
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    function navigateNext() {
        currentSectionManager.saveDataForCurrentStep();

        if (currentSectionManager.structureIndex === -1) {
            if (currentSectionManager.flowIndex < (navigationFlow.length - 1)) {
                currentSectionManager.flowIndex++;
                if (currentSectionManager.flowIndex === bookStructureFlowIndex + 1) {
                    currentSectionManager.structureIndex = 0;
                    currentSectionManager.chapterIndex = 0;
                    while(currentSectionManager.structureIndex < ebookData.structure.length &&
                          !ebookData.structure[currentSectionManager.structureIndex].visible) {
                        currentSectionManager.structureIndex++;
                    }
                    if (currentSectionManager.structureIndex >= ebookData.structure.length) {
                        currentSectionManager.structureIndex = -1;
                        currentSectionManager.flowIndex = navigationFlow.length - 1;
                    }
                }
            }
        } else {
            const structInfo = currentSectionManager.getCurrentStructureInfo();
            if (structInfo && structInfo.type === 'chapterGroup' && currentSectionManager.chapterIndex < structInfo.chapters.length - 1) {
                currentSectionManager.chapterIndex++;
            } else {
                currentSectionManager.structureIndex++;
                currentSectionManager.chapterIndex = 0;
                while(currentSectionManager.structureIndex < ebookData.structure.length &&
                      !ebookData.structure[currentSectionManager.structureIndex].visible) {
                    currentSectionManager.structureIndex++;
                }
                if (currentSectionManager.structureIndex >= ebookData.structure.length) {
                    currentSectionManager.structureIndex = -1;
                    currentSectionManager.flowIndex = navigationFlow.length - 1;
                }
            }
        }
        updateUI();
    }

    function navigateBack() {
        currentSectionManager.saveDataForCurrentStep();

        if (currentSectionManager.structureIndex !== -1) {
            const structInfo = currentSectionManager.getCurrentStructureInfo();
            if (structInfo && structInfo.type === 'chapterGroup' && currentSectionManager.chapterIndex > 0) {
                currentSectionManager.chapterIndex--;
            } else {
                currentSectionManager.structureIndex--;
                while(currentSectionManager.structureIndex >= 0 &&
                      !ebookData.structure[currentSectionManager.structureIndex].visible) {
                    currentSectionManager.structureIndex--;
                }

                if (currentSectionManager.structureIndex < 0) {
                    currentSectionManager.flowIndex = bookStructureFlowIndex;
                } else {
                    const prevStructInfo = currentSectionManager.getCurrentStructureInfo();
                    if (prevStructInfo && prevStructInfo.type === 'chapterGroup') {
                        currentSectionManager.chapterIndex = Math.max(0, prevStructInfo.chapters.length - 1);
                    } else {
                        currentSectionManager.chapterIndex = 0;
                    }
                }
            }
        } else {
            if (currentSectionManager.flowIndex > 0) {
                currentSectionManager.flowIndex--;
                if (currentSectionManager.flowIndex === bookStructureFlowIndex ) {
                     currentSectionManager.structureIndex = ebookData.structure.length - 1;
                     while(currentSectionManager.structureIndex >= 0 && !ebookData.structure[currentSectionManager.structureIndex].visible){
                         currentSectionManager.structureIndex--;
                     }
                     if(currentSectionManager.structureIndex < 0) {
                        currentSectionManager.structureIndex = -1;
                     } else {
                        const lastStructItem = ebookData.structure[currentSectionManager.structureIndex];
                        if (lastStructItem.type === 'chapterGroup') {
                            currentSectionManager.chapterIndex = Math.max(0, lastStructItem.chapters.length - 1);
                        } else {
                            currentSectionManager.chapterIndex = 0;
                        }
                     }
                }
            }
        }
        updateUI();
    }

    function addNewChapterToGroup() {
        const structInfo = currentSectionManager.getCurrentStructureInfo();
        if (structInfo && structInfo.type === 'chapterGroup') {
            currentSectionManager.saveDataForCurrentStep();
            const newChapterNumber = structInfo.chapters.length + 1;
            structInfo.chapters.push({ title: `Chapter ${newChapterNumber}`, content: "" });
            currentSectionManager.chapterIndex = structInfo.chapters.length - 1;
            updateUI();
        }
    }
    if (addChapterBtn) addChapterBtn.addEventListener('click', addNewChapterToGroup);

    function navigateToExportPage() {
        currentSectionManager.saveDataForCurrentStep();
        currentSectionManager.structureIndex = -1;
        currentSectionManager.flowIndex = navigationFlow.length - 1;
        updateUI();
    }

    function handleImageSelection(event) {
        const file = event.target.files[0];
        if (file && activeTextareaForImage && typeof activeTextareaForImage.value !== 'undefined') {
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                showInfoModal("Invalid File Type", "Please select a JPG, PNG, or GIF image.");
                imageUploadInput.value = null; return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showInfoModal("Image Too Large", "Please select an image smaller than 5MB for better performance and compatibility.");
                imageUploadInput.value = null; return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const markdownImage = `![Image](${e.target.result})\n\n`;
                const textarea = activeTextareaForImage;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + markdownImage + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + markdownImage.length;
                textarea.focus();
                currentSectionManager.saveDataForCurrentStep();
            }
            reader.onerror = () => showInfoModal("File Read Error", "Could not read the image file.");
            reader.readAsDataURL(file);
        }
        imageUploadInput.value = null;
    }

    document.querySelectorAll('.addImageBtn').forEach(button => {
        button.addEventListener('click', function() {
            const targetTextareaId = this.dataset.targetTextarea;
            activeTextareaForImage = document.getElementById(targetTextareaId);
            if (activeTextareaForImage && activeTextareaForImage.tagName === 'TEXTAREA') {
                imageUploadInput.click();
            } else {
                if (this.id === 'customSectionAddImageBtn' && customSectionContentInput) {
                    activeTextareaForImage = customSectionContentInput;
                    imageUploadInput.click();
                } else {
                    console.error("Target textarea not found or invalid for image button:", targetTextareaId, this.id);
                    activeTextareaForImage = null;
                }
            }
        });
    });
    if (imageUploadInput) imageUploadInput.addEventListener('change', handleImageSelection);

    function renderBookStructureUI() {
        if (!structureListContainer) return;
        structureListContainer.innerHTML = '';

        ebookData.structure.forEach((section, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'structure-item p-3 mb-2 border border-slate-300 rounded-md bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'font-medium text-slate-700 mb-2 sm:mb-0';
            let titleText = section.title;
            if (section.type === 'chapterGroup') titleText += ` (${section.chapters.length} chapter${section.chapters.length !== 1 ? 's' : ''})`;
            if (!section.visible) titleText += " (Hidden)";
            titleDiv.textContent = titleText;
            itemDiv.appendChild(titleDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex flex-wrap gap-2 items-center';

            if (section.isOptional !== false) {
                const visibilityBtn = document.createElement('button');
                visibilityBtn.textContent = section.visible ? 'Hide' : 'Show';
                visibilityBtn.className = `px-2 py-1 text-xs rounded-md shadow-sm ${section.visible ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-green-400 hover:bg-green-500'} text-white transition-colors`;
                visibilityBtn.onclick = () => toggleSectionVisibility(index);
                actionsDiv.appendChild(visibilityBtn);
            }

            if (section.type === 'custom') {
                const renameBtn = document.createElement('button');
                renameBtn.textContent = 'Rename';
                renameBtn.className = 'px-2 py-1 text-xs bg-blue-400 hover:bg-blue-500 text-white rounded-md shadow-sm transition-colors';
                renameBtn.onclick = () => renameCustomSection(index);
                actionsDiv.appendChild(renameBtn);
            }

            if (index > 0) {
                const moveUpBtn = document.createElement('button');
                moveUpBtn.innerHTML = '&uarr; Up';
                moveUpBtn.className = 'px-2 py-1 text-xs bg-slate-300 hover:bg-slate-400 rounded-md shadow-sm transition-colors';
                moveUpBtn.onclick = () => moveSection(index, -1);
                actionsDiv.appendChild(moveUpBtn);
            }
            if (index < ebookData.structure.length - 1) {
                const moveDownBtn = document.createElement('button');
                moveDownBtn.innerHTML = '&darr; Down';
                moveDownBtn.className = 'px-2 py-1 text-xs bg-slate-300 hover:bg-slate-400 rounded-md shadow-sm transition-colors';
                moveDownBtn.onclick = () => moveSection(index, 1);
                actionsDiv.appendChild(moveDownBtn);
            }

            if (section.isRemovable === true) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition-colors';
                deleteBtn.onclick = () => deleteBookSection(index);
                actionsDiv.appendChild(deleteBtn);
            }

            itemDiv.appendChild(actionsDiv);
            structureListContainer.appendChild(itemDiv);
        });
         if (ebookData.structure.length === 0) {
            structureListContainer.innerHTML = '<p class="text-slate-500 italic text-center py-4">No sections defined. Add some sections to get started!</p>';
        }
    }

    function addCustomSectionToList() {
        const title = prompt("Enter title for the new custom section:", "New Custom Section");
        if (title && title.trim() !== "") {
            const newSection = {
                id: `custom-${Date.now()}`, type: 'custom', title: title.trim(), originalTitle: title.trim(),
                content: "", domId: 'customSectionEditor', inputElId: 'customSectionContentInput',
                isOptional: true, visible: true, hasContentInput: true, hasImageUpload: true, isRemovable: true
            };
            ebookData.structure.push(newSection);
            renderBookStructureUI();
        } else if (title !== null) {
            showInfoModal("Invalid Title", "Custom section title cannot be empty.");
        }
    }
    if (addCustomSectionBtn) addCustomSectionBtn.addEventListener('click', addCustomSectionToList);

    function deleteBookSection(index) {
        const section = ebookData.structure[index];
        if (section.isRemovable && confirm(`Are you sure you want to delete the section "${section.title}"? This cannot be undone.`)) {
            ebookData.structure.splice(index, 1);
            renderBookStructureUI();
        }
    }

    function toggleSectionVisibility(index) {
        const section = ebookData.structure[index];
        if (section.isOptional !== false) {
            section.visible = !section.visible;
            renderBookStructureUI();
        }
    }

    function renameCustomSection(index) {
        const section = ebookData.structure[index];
        if (section.type === 'custom') {
            const newTitle = prompt("Enter new title for this section:", section.title);
            if (newTitle && newTitle.trim() !== "") {
                section.title = newTitle.trim();
                section.originalTitle = newTitle.trim();
                renderBookStructureUI();
            } else if (newTitle !== null) {
                 showInfoModal("Invalid Title", "Custom section title cannot be empty.");
            }
        }
    }

    function moveSection(index, direction) {
        if ((direction === -1 && index === 0) || (direction === 1 && index === ebookData.structure.length - 1)) {
            return;
        }
        const itemToMove = ebookData.structure.splice(index, 1)[0];
        ebookData.structure.splice(index + direction, 0, itemToMove);
        renderBookStructureUI();
    }

    function generateTocContentHTML(structureModel, currentTocSectionIdToExclude) {
        let tocHtml = `<h2 style="text-align: center;">Table of Contents</h2><ol style="list-style-type: none; padding-left: 0; text-align: left;">`;
        structureModel.forEach(section => {
            if (section.visible && section.id !== currentTocSectionIdToExclude && section.type !== 'toc') {
                if (section.type === 'chapterGroup') {
                    section.chapters.forEach((chap, chapIdx) => {
                        const chapTitleEscaped = escapeXml(chap.title) || `Chapter ${chapIdx + 1}`;
                        tocHtml += `<li style="margin-bottom: 0.5em;"><a href="#section-preview-${section.id}-chapter-${chapIdx}">${chapTitleEscaped}</a></li>`;
                    });
                } else {
                     const sectionTitleEscaped = escapeXml(section.title);
                     tocHtml += `<li style="margin-bottom: 0.5em;"><a href="#section-preview-${section.id}">${sectionTitleEscaped}</a></li>`;
                }
            }
        });
        tocHtml += `</ol>`;
        return tocHtml;
    }

    function generateBookHTML(forPreview = true) {
        return new Promise((resolve) => {
            const headingStyle = "text-align: center;";
            const pageBreakClass = forPreview ? "" : "page-break-before";

            let html = `<div class="${forPreview ? 'prose prose-sm sm:prose-base max-w-none' : ''}">`;
            html += `<h1 style="${headingStyle} margin-bottom: 0.5em;">${escapeXml(ebookData.title) || "Untitled E-book"}</h1>`;

            if (ebookData.authorNameForTitlePage && ebookData.authorNameForTitlePage.trim() !== "") {
                html += `<p style="text-align:center; font-style:italic; margin-top:0.2em; margin-bottom:1.5em;">By ${escapeXml(ebookData.authorNameForTitlePage.trim())}</p>`;
            }

            let tempHtmlBody = "";
            let isFirstRenderedContentSection = true;

            ebookData.structure.forEach((section) => {
                if (section.visible) {
                    let currentSectionBreakClass = (!forPreview && !isFirstRenderedContentSection) ? pageBreakClass : "";

                    if (section.type === 'toc') {
                        tempHtmlBody += `<div class="${currentSectionBreakClass}" id="section-preview-${section.id}">${generateTocContentHTML(ebookData.structure, section.id)}</div>`;
                    } else if (section.type === 'chapterGroup') {
                        section.chapters.forEach((chap, chapIdx) => {
                            let chapBreak = (chapIdx === 0) ? currentSectionBreakClass : ((!forPreview) ? pageBreakClass : "");
                            if (chapIdx === 0 && isFirstRenderedContentSection && !forPreview) chapBreak = "";

                            tempHtmlBody += `<div class="${chapBreak}"><h2 id="section-preview-${section.id}-chapter-${chapIdx}" style="${headingStyle}">${escapeXml(chap.title) || `Chapter ${chapIdx + 1}`}</h2><div>${markdownConverter.makeHtml(chap.content)}</div></div>`;
                            isFirstRenderedContentSection = false;
                        });
                    } else if (section.hasContentInput) {
                        if (isFirstRenderedContentSection && !forPreview) currentSectionBreakClass = "";
                        tempHtmlBody += `<div class="${currentSectionBreakClass}"><h2 id="section-preview-${section.id}" style="${headingStyle}">${escapeXml(section.title)}</h2><div>${markdownConverter.makeHtml(section.content)}</div></div>`;
                    }
                    isFirstRenderedContentSection = false;
                }
            });
            html += tempHtmlBody;
            html += `</div>`;

            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-99999px';
            tempContainer.style.width = '210mm';
            tempContainer.style.visibility = 'hidden';
            document.body.appendChild(tempContainer);
            tempContainer.innerHTML = html;

            const images = Array.from(tempContainer.getElementsByTagName('img'));
            if (images.length === 0) {
                document.body.removeChild(tempContainer);
                resolve(html);
                return;
            }

            let loadedImagesCount = 0;
            const totalImages = images.length;

            images.forEach(img => {
                if (img.complete && img.naturalHeight !== 0) {
                    loadedImagesCount++;
                } else {
                    img.onload = () => {
                        loadedImagesCount++;
                        if (loadedImagesCount === totalImages) {
                            document.body.removeChild(tempContainer);
                            resolve(html);
                        }
                    };
                    img.onerror = () => {
                        console.warn("An image failed to load for PDF generation:", img.src);
                        loadedImagesCount++;
                        if (loadedImagesCount === totalImages) {
                           document.body.removeChild(tempContainer);
                           resolve(html);
                        }
                    };
                }
            });

            if (loadedImagesCount === totalImages) {
                document.body.removeChild(tempContainer);
                resolve(html);
            }
        });
    }

    async function showPreview() {
        currentSectionManager.saveDataForCurrentStep();
        try {
            const htmlContent = await generateBookHTML(true);
            previewContentContainer.innerHTML = htmlContent;
            previewModal.classList.remove('hidden');
        } catch (error) {
            console.error("Error generating preview HTML:", error);
            showInfoModal("Preview Error", "Could not generate preview. See console for details.");
        }
    }
    function hidePreview() {
        previewModal.classList.add('hidden');
        previewContentContainer.innerHTML = '';
    }

    async function exportBook() {
        currentSectionManager.saveDataForCurrentStep();
        const formatRadio = document.querySelector('input[name="exportFormat"]:checked');
        if (!formatRadio) { showInfoModal("Export Error", "Please select an export format."); return; }
        const format = formatRadio.value;
        const bookTitle = ebookData.title || "Untitled E-book";
        const filenameBase = sanitizeFilename(bookTitle);

        setLoadingState(true, `Generating ${format.toUpperCase()}...`);
        try {
            if (format === 'txt') {
                let content = `Title: ${bookTitle}\n`;
                if (ebookData.authorNameForTitlePage && ebookData.authorNameForTitlePage.trim() !== "") {
                    content += `Author: ${ebookData.authorNameForTitlePage.trim()}\n`;
                }
                content += "\n";

                ebookData.structure.forEach(section => {
                    if (section.visible) {
                        content += `SECTION: ${escapeXml(section.title)}\n\n`;
                        if (section.type === 'toc') {
                            ebookData.structure.forEach(s_toc => {
                                if (s_toc.visible && s_toc.type !== 'toc') {
                                    if (s_toc.type === 'chapterGroup') {
                                        s_toc.chapters.forEach((ch, chi) => content += `  - ${escapeXml(ch.title) || `Chapter ${chi + 1}`}\n`);
                                    } else {
                                        content += `  - ${escapeXml(s_toc.title)}\n`;
                                    }
                                }
                            });
                            content += "\n";
                        } else if (section.type === 'chapterGroup') {
                            section.chapters.forEach((chap, idx) => {
                                content += `Chapter ${idx + 1}: ${escapeXml(chap.title)}\n\n${chap.content}\n\n---\n\n`;
                            });
                        } else if (section.hasContentInput) {
                            content += `${section.content}\n\n---\n\n`;
                        }
                    }
                });
                downloadFile(content, `${filenameBase}.txt`, 'text/plain');
                setLoadingState(false);
            } else if (format === 'html') {
                const htmlContentForFile = await generateBookHTML(false);
                const htmlExportContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeXml(bookTitle)}</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;margin:20px auto;max-width:800px;line-height:1.6;padding:1em;color:#334155}h1,h2,h3{color:#0f172a;text-align:center}h1{font-size:2.5em;margin-bottom:0.5em}h2{font-size:1.75em;margin-top:1.5em;border-bottom:1px solid #e2e8f0;padding-bottom:0.3em;margin-bottom:1em}img{max-width:100%;height:auto;display:block;margin-left:auto;margin-right:auto;border:1px solid #cbd5e1;border-radius:0.375rem;margin-top:1em;margin-bottom:1em}div{text-align:justify}ol{padding-left:20px;list-style-position:inside;text-align:left;margin-bottom:1em}ol li a{text-decoration:none;color:#0ea5e9}ol li a:hover{text-decoration:underline}.page-break-before{page-break-before:always}pre{background-color:#1e293b;color:#f8fafc;border:1px solid:#334155;padding:1em;border-radius:0.375rem;overflow-x:auto;font-family:Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:0.875em;white-space:pre-wrap;word-wrap:break-word;margin:1em 0}pre code{background-color:transparent;color:inherit;padding:0;font-size:inherit}blockquote{border-left:4px solid:#0ea5e9;background-color:#f0f9ff;padding:1em;margin:1.5em 0;font-style:italic;border-radius:0 0.375rem 0.375rem 0}blockquote p{margin-bottom:0.5em}blockquote p:last-child{margin-bottom:0}table{border-collapse:collapse;width:100%;margin-bottom:1em;border:1px solid:#cbd5e1}th,td{border:1px solid:#cbd5e1;padding:0.5em;text-align:left}th{background-color:#f1f5f9}</style></head><body class="prose prose-sm sm:prose-base max-w-none">${htmlContentForFile}</body></html>`;
                downloadFile(htmlExportContent, `${filenameBase}.html`, 'text/html');
                setLoadingState(false);
            } else if (format === 'pdf') {
                const pdfHtmlContent = await generateBookHTML(false);
                const pdfRenderElement = document.createElement('div');
                pdfRenderElement.id = "pdf-render-area";

                pdfRenderElement.style.position = 'absolute';
                pdfRenderElement.style.left = '-9999px';
                pdfRenderElement.style.top = '-9999px';
                pdfRenderElement.style.width = '210mm';
                pdfRenderElement.style.height = 'auto';
                pdfRenderElement.style.visibility = 'hidden';
                pdfRenderElement.style.overflow = 'visible';
                pdfRenderElement.style.backgroundColor = 'white';
                pdfRenderElement.style.boxSizing = 'border-box';

                document.body.appendChild(pdfRenderElement);

                // Define comprehensive CSS for PDF rendering
                const pdfSpecificCSS = `
                    <style>
                        /* Reset and Base Styles */
                        #pdf-content-for-render, #pdf-content-for-render * {
                            box-sizing: border-box !important;
                            margin: 0;
                            padding: 0;
                            font-family: 'Helvetica', Arial, sans-serif; /* PDF-safe font */
                            font-size: 10pt;
                            line-height: 1.4;
                            color: #333;
                            background-color: white !important; /* Ensure background is white */
                        }
                        #pdf-content-for-render { /* This is the direct child of pdfRenderElement */
                            width: 100%; /* Takes width from pdfRenderElement (210mm) */
                            height: auto;
                            padding: 15mm 10mm; /* Simulates PDF margins */
                        }

                        /* Headings */
                        #pdf-content-for-render h1,
                        #pdf-content-for-render h2,
                        #pdf-content-for-render h3,
                        #pdf-content-for-render h4,
                        #pdf-content-for-render h5,
                        #pdf-content-for-render h6 {
                            text-align: center;
                            color: #111;
                            margin-top: 1.2em;
                            margin-bottom: 0.6em;
                            font-weight: bold;
                            page-break-after: avoid;
                            page-break-inside: avoid;
                        }
                        #pdf-content-for-render h1 { font-size: 24pt; margin-top: 0; }
                        #pdf-content-for-render h2 { font-size: 18pt; }
                        #pdf-content-for-render h3 { font-size: 14pt; }
                        #pdf-content-for-render h4 { font-size: 12pt; }

                        /* Paragraphs and General Divs */
                        #pdf-content-for-render p { margin-bottom: 1em; text-align: justify; }
                        #pdf-content-for-render div { text-align: justify; margin-bottom: 1em; } /* For divs used as paragraphs */

                        /* Lists */
                        #pdf-content-for-render ol,
                        #pdf-content-for-render ul { padding-left: 25px; /* More distinct indent */ margin-bottom: 1em; text-align: left; }
                        #pdf-content-for-render ol li,
                        #pdf-content-for-render ul li { margin-bottom: 0.3em; }

                        /* Links */
                        #pdf-content-for-render a { color: #0056b3; text-decoration: none; }
                        #pdf-content-for-render a:hover { text-decoration: underline; }

                        /* Images */
                        #pdf-content-for-render img {
                            max-width: 100% !important; /* Ensure it fits within padded area */
                            height: auto !important;
                            display: block;
                            margin: 1em auto;
                            border: 1px solid #ccc;
                            page-break-inside: avoid !important;
                        }

                        /* Page Breaks */
                        .page-break-before { page-break-before: always !important; }

                        /* Tables */
                        #pdf-content-for-render table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1.5em 0;
                            border: 1px solid #999;
                            page-break-inside: avoid;
                        }
                        #pdf-content-for-render th,
                        #pdf-content-for-render td {
                            border: 1px solid #999;
                            padding: 0.4em 0.6em;
                            text-align: left;
                            vertical-align: top;
                        }
                        #pdf-content-for-render th { background-color: #f0f0f0; font-weight: bold; }

                        /* Preformatted Text (Code Blocks) */
                        #pdf-content-for-render pre {
                            background-color: #f4f4f4;
                            border: 1px solid #ddd;
                            padding: 0.8em;
                            border-radius: 3px;
                            overflow-x: auto;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 9pt;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            margin: 1em 0;
                            page-break-inside: avoid;
                        }
                         #pdf-content-for-render code { font-family: 'Courier New', Courier, monospace; font-size: 0.9em; background-color: #f0f0f0; padding: 0.1em 0.3em; border-radius: 2px; }
                         #pdf-content-for-render pre code { background-color: transparent; padding: 0; border-radius: 0; font-size: inherit; }


                        /* Blockquotes */
                        #pdf-content-for-render blockquote {
                            border-left: 3px solid #007bff;
                            background-color: #f8f9fa;
                            padding: 0.8em 1em;
                            margin: 1.5em 0;
                            font-style: italic;
                            page-break-inside: avoid;
                        }
                        #pdf-content-for-render blockquote p { margin-bottom: 0.5em; }
                        #pdf-content-for-render blockquote p:last-child { margin-bottom: 0; }
                    </style>`;
                
                // **FIX APPLIED HERE:** Wrap pdfHtmlContent and ensure pdfSpecificCSS is complete
                pdfRenderElement.innerHTML = `${pdfSpecificCSS}<div id="pdf-content-for-render">${pdfHtmlContent}</div>`;
                
                const contentToRender = pdfRenderElement.querySelector("#pdf-content-for-render");

                // It's crucial to trigger a reflow so html2pdf can calculate dimensions correctly.
                // Accessing offsetHeight or offsetWidth forces a reflow.
                void pdfRenderElement.offsetHeight; 
                if (contentToRender) { // Check if contentToRender is found
                    void contentToRender.offsetHeight;
                } else {
                    console.error("PDF Export Error: #pdf-content-for-render not found in DOM after setting innerHTML.");
                    showInfoModal("PDF Export Error", "Internal error: Could not find content wrapper for PDF generation.");
                    if (document.body.contains(pdfRenderElement)) document.body.removeChild(pdfRenderElement);
                    setLoadingState(false);
                    return; // Abort if the critical element isn't there
                }
                
                console.log("PDF Render Element (Outer) offsetWidth:", pdfRenderElement.offsetWidth, "offsetHeight:", pdfRenderElement.offsetHeight);
                if (contentToRender) {
                    console.log("PDF Content Wrapper (Inner) scrollWidth:", contentToRender.scrollWidth, "scrollHeight:", contentToRender.scrollHeight);
                }


                setTimeout(() => {
                    // Double check contentToRender again before using it in html2pdf
                    const finalContentToRender = pdfRenderElement.querySelector("#pdf-content-for-render");
                    if (!finalContentToRender || finalContentToRender.scrollHeight === 0 || finalContentToRender.scrollWidth === 0) {
                        console.error("PDF content wrapper has zero height or width, or is null. Aborting PDF generation.");
                        showInfoModal("PDF Export Error", "Content dimensions are zero or content wrapper not found. PDF cannot be generated.");
                        if (document.body.contains(pdfRenderElement)) document.body.removeChild(pdfRenderElement);
                        setLoadingState(false);
                        return;
                    }

                    const pdfOptions = {
                        margin: 0,
                        filename: `${filenameBase}.pdf`,
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: {
                            scale: 2,
                            logging: true,
                            useCORS: true,
                            width: pdfRenderElement.offsetWidth, // Use the outer element's width
                            height: pdfRenderElement.scrollHeight, // Use the outer element's scrollHeight
                            windowWidth: pdfRenderElement.offsetWidth,
                            windowHeight: pdfRenderElement.scrollHeight,
                            removeContainer: true
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['css', 'legacy', 'avoid-all'], before: '.page-break-before' }
                    };

                    html2pdf().from(pdfRenderElement).set(pdfOptions).toPdf().get('pdf').then(pdf => {
                        const totalPages = pdf.internal.getNumberOfPages();
                        for(let i=1; i<=totalPages; i++){
                            pdf.setPage(i);
                            pdf.setFontSize(9);
                            pdf.setTextColor(128);
                            pdf.text(`Page ${i} of ${totalPages}`, (210/2), (297-10),{align:'center'});
                        }
                    }).save().then(() => {
                        if(document.body.contains(pdfRenderElement))document.body.removeChild(pdfRenderElement);
                        setLoadingState(false);
                    })
                    .catch(err => {
                        console.error("PDF Export Error:",err);
                        if(document.body.contains(pdfRenderElement))document.body.removeChild(pdfRenderElement);
                        setLoadingState(false);
                        showInfoModal("PDF Export Error","Could not generate PDF. Check console for details. " + err.message);
                    });
                }, 2000); // Timeout allows images and styles to fully render
                return; // Prevent fall-through
            } else if (format === 'epub') {
                await generateEpub(filenameBase, bookTitle);
            } else if (format === 'mobi' || format === 'azw') {
                setLoadingState(false);
                showInfoModal(`Exporting to ${format.toUpperCase()}`, `Direct ${format.toUpperCase()} export not supported. Please export your e-book as .epub and use a conversion tool like Calibre to convert it to ${format.toUpperCase()} format.<br><br><strong>EPUB Image Notes:</strong> For best compatibility, images are processed to be linked within the EPUB.`);
            }
        } catch (error) {
            console.error("Export error:", error); setLoadingState(false);
            showInfoModal("Export Error", "An unexpected error occurred during export. Please check the console for more details.");
        }
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content],{type:mimeType}); const link=document.createElement('a');
        link.href=URL.createObjectURL(blob); link.download=filename; document.body.appendChild(link);
        link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
    }

    async function dataUrlToBlob(dataUrl) {
        const res = await fetch(dataUrl);
        return await res.blob();
    }

    async function processMarkdownForEpubImages(
        markdownContent,
        imageFolder,
        epubGlobalImageMap,
        epubGlobalManifestImageItems,
        epubGlobalImageIdCounter,
        converter
    ) {
        let htmlContent = converter.makeHtml(markdownContent);
        const imgRegex = /<img\s+[^>]*src="data:(image\/(jpeg|png|gif|svg\+xml));base64,([^"]+)"[^>]*>/g;
        const imageFileWritePromises = [];
        const replacements = [];

        let match;
        imgRegex.lastIndex = 0;
        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const fullMatch = match[0];
            const mimeType = match[1];
            const base64Data = match[3];
            const originalBase64Src = `data:${mimeType};base64,${base64Data}`;
            let newRelativePath;

            if (epubGlobalImageMap.has(originalBase64Src)) {
                newRelativePath = epubGlobalImageMap.get(originalBase64Src);
            } else {
                const extension = mimeType.split('/')[1].replace('+xml', '').toLowerCase();
                const newImageFilename = `image${epubGlobalImageIdCounter.id++}.${extension}`;
                newRelativePath = `images/${newImageFilename}`;

                epubGlobalImageMap.set(originalBase64Src, newRelativePath);

                const manifestItemId = `img-item-${newImageFilename.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, '')}`;
                if (!epubGlobalManifestImageItems.some(item => item.includes(`href="${newRelativePath}"`))) {
                     epubGlobalManifestImageItems.push(`<item id="${manifestItemId}" href="${newRelativePath}" media-type="${mimeType}"/>`);
                }

                imageFileWritePromises.push(
                    dataUrlToBlob(originalBase64Src)
                        .then(imageBlob => {
                            imageFolder.file(newImageFilename, imageBlob);
                        })
                        .catch(err => console.error(`Failed to process image ${newImageFilename} from base64:`, err))
                );
            }
            replacements.push({ originalTag: fullMatch, newSrc: newRelativePath, originalSrcAttrValue: originalBase64Src });
        }

        await Promise.all(imageFileWritePromises);

        replacements.forEach(rep => {
            const newImgTag = rep.originalTag.replace(rep.originalSrcAttrValue, rep.newSrc);
            htmlContent = htmlContent.replace(rep.originalTag, newImgTag);
        });

        return htmlContent;
    }

    const createXHTML_EPUB = (title, processedBodyContent, _filenameDebug) => {
        const escapedSectionTitle = escapeXml(title);
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>${escapedSectionTitle}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1 style="text-align:center;">${escapedSectionTitle}</h1>
  <div>
    ${processedBodyContent}
  </div>
</body>
</html>`;
    };

    const createCoverXHTML_EPUB = (coverImageFilename) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" style="margin:0; padding:0; height:100%;">
<head>
  <title>Cover</title>
  <style type="text/css">
    body { margin: 0; padding: 0; text-align: center; height:100%; background-color:black; }
    div#cover-container { width:100%; height:100%; display:flex; justify-content:center; align-items:center; }
    img#cover-image { max-width: 100%; max-height: 100%; vertical-align: middle; }
  </style>
</head>
<body style="margin:0; padding:0; height:100%;">
  <div id="cover-container">
    <img id="cover-image" src="images/${coverImageFilename}" alt="Cover Image"/>
  </div>
</body>
</html>`;
    };


    async function generateEpub(filenameBase, bookTitle) {
        if (typeof JSZip === 'undefined') {
            showInfoModal("EPUB Error", "JSZip library not found. EPUB export is unavailable.");
            setLoadingState(false); return;
        }
        console.log("EPUB generation (with linked images) for:", bookTitle);
        const zip = new JSZip();

        let epubGlobalImageMap = new Map();
        let epubGlobalManifestImageItems = [];
        let epubGlobalImageIdCounter = { id: 0 };

        const authorForMeta = (ebookData.authorNameForTitlePage && ebookData.authorNameForTitlePage.trim() !== "")
                       ? ebookData.authorNameForTitlePage.trim()
                       : "E-book Creator User";
        const aboutAuthorData = ebookData.structure.find(s => s.id === 'aboutAuthor' && s.visible && s.content);
        const finalAuthor = authorForMeta === "E-book Creator User" && aboutAuthorData
                            ? (aboutAuthorData.content.split('\n')[0].trim() || "E-book Creator User")
                            : authorForMeta;

        const uuid = `urn:uuid:${generateUUID()}`;
        const escapedBookTitle = escapeXml(bookTitle);
        const escapedAuthor = escapeXml(finalAuthor);

        zip.file("mimetype", "application/epub+zip", {compression: "STORE"});
        zip.folder("META-INF").file("container.xml",
            `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

        const oebps = zip.folder("OEBPS");
        const imageFolder = oebps.folder("images");
        let manifestItems = '', spineOrder = [], navPointsNcx = '';
        let playOrderNcx = 1;

        const cssContent = `body{font-family:serif;margin:5%;text-align:justify;line-height:1.5}h1,h2,h3,h4,h5,h6{text-align:center;font-family:sans-serif;margin-top:1.5em;margin-bottom:.8em;line-height:1.2}h1{font-size:2em}h2{font-size:1.6em}p{margin-bottom:1em}img{max-width:100%;height:auto;display:block;margin:1em auto;border:1px solid #ccc}table{border-collapse:collapse;margin:1em auto;width:auto;border:1px solid #ccc}th,td{border:1px solid #ccc;padding:.5em;text-align:left}th{background-color:#f0f0f0}ol li a,ul li a{text-decoration:none;color:#0056b3}ol li a:hover,ul li a:hover{text-decoration:underline}pre{background-color:#2d3748;color:#f7fafc;border:1px solid #4a5568;padding:1em;border-radius:.375rem;overflow-x:auto;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:.875em;white-space:pre-wrap;word-wrap:break-word;margin:1em 0}pre code{background-color:transparent;color:inherit;padding:0;font-size:inherit}blockquote{border-left:4px solid #3b82f6;background-color:#eff6ff;padding:1em;margin:1.5em 0;font-style:italic;border-radius:0 .375rem .375rem 0}blockquote p{margin-bottom:.5em}blockquote p:last-child{margin-bottom:0}`;
        oebps.file("style.css", cssContent);
        manifestItems += `<item id="css" href="style.css" media-type="text/css"/>\n`;

        // Handle Cover Image
        let coverImageFilenameForEpub = null;
        let coverImageMimeType = null;
        const coverImageManifestId = "cover-image";
        let coverXhtmlFileId = "cover";
        let coverXhtmlFilename = "cover.xhtml";

        if (ebookData.coverImage.dataUrl && ebookData.coverImage.type && ebookData.coverImage.filename) {
            try {
                const coverBlob = await dataUrlToBlob(ebookData.coverImage.dataUrl);
                const extension = ebookData.coverImage.filename.split('.').pop() || 'png'; // Default to png if no extension
                coverImageFilenameForEpub = `cover.${extension}`;
                coverImageMimeType = ebookData.coverImage.type;

                imageFolder.file(coverImageFilenameForEpub, coverBlob);
                manifestItems += `<item id="${coverImageManifestId}" href="images/${coverImageFilenameForEpub}" media-type="${coverImageMimeType}"/>\n`;

                // Create cover.xhtml
                oebps.file(coverXhtmlFilename, createCoverXHTML_EPUB(coverImageFilenameForEpub));
                manifestItems += `<item id="${coverXhtmlFileId}" href="${coverXhtmlFilename}" media-type="application/xhtml+xml"/>\n`;
                spineOrder.push(coverXhtmlFileId); // Cover page first in spine
                 navPointsNcx += `<navPoint id="navpoint-${playOrderNcx}" playOrder="${playOrderNcx++}"><navLabel><text>Cover</text></navLabel><content src="${coverXhtmlFilename}"/></navPoint>\n`;


            } catch (err) {
                console.error("Error processing cover image for EPUB:", err);
                showInfoModal("Cover Image Error", "Could not process the cover image for EPUB export.");
                coverImageFilenameForEpub = null; // Ensure it's null if processing failed
            }
        }


        const titlePageFilename = "titlepage.xhtml";
        const titlePageId = "titlepage";
        const titlePageBodyContent = (escapedAuthor && escapedAuthor !== "E-book Creator User") ? `<p style="text-align:center;font-style:italic;">By ${escapedAuthor}</p>` : "";
        oebps.file(titlePageFilename, createXHTML_EPUB(escapedBookTitle, titlePageBodyContent, titlePageFilename));
        manifestItems += `<item id="${titlePageId}" href="${titlePageFilename}" media-type="application/xhtml+xml"/>\n`;
        spineOrder.push(titlePageId);
        navPointsNcx += `<navPoint id="navpoint-${playOrderNcx}" playOrder="${playOrderNcx++}"><navLabel><text>${escapedBookTitle} (Title)</text></navLabel><content src="${titlePageFilename}"/></navPoint>\n`;

        let tocSectionFileId = null;
        let tocSectionFilename = null;

        for (const [index, section] of ebookData.structure.entries()) {
            if (section.visible) {
                const sectionFileId = `${(section.id || `s${index}`).replace(/[^a-zA-Z0-9-_]/g, '')}`;
                const sectionFilenameCurrent = `${sectionFileId}.xhtml`;
                let sectionContentProcessed;

                if (section.type === 'toc') {
                    sectionContentProcessed = generateTocContentHTML(ebookData.structure, section.id);
                    tocSectionFileId = sectionFileId;
                    tocSectionFilename = sectionFilenameCurrent;
                } else if (section.type === 'chapterGroup') {
                    let chapterPlayOrderStart = playOrderNcx;
                    let chapterNavPoints = "";
                    for (const [chapIdx, chap] of section.chapters.entries()) {
                        const chapFileId = `chap_${sectionFileId}_${chapIdx}`;
                        const chapFilename = `${chapFileId}.xhtml`;
                        const chapTitle = chap.title || `Chapter ${chapIdx + 1}`;
                        const processedChapContent = await processMarkdownForEpubImages(chap.content, imageFolder, epubGlobalImageMap, epubGlobalManifestImageItems, epubGlobalImageIdCounter, markdownConverter);
                        oebps.file(chapFilename, createXHTML_EPUB(chapTitle, processedChapContent, chapFilename));
                        manifestItems += `<item id="${chapFileId}" href="${chapFilename}" media-type="application/xhtml+xml"/>\n`;
                        spineOrder.push(chapFileId);
                        chapterNavPoints += `<navPoint id="navpoint-${playOrderNcx}" playOrder="${playOrderNcx++}"><navLabel><text>${escapeXml(chapTitle)}</text></navLabel><content src="${chapFilename}"/></navPoint>\n`;
                    }
                    if (section.chapters.length > 0) {
                         navPointsNcx += `<navPoint id="navpoint-group-${sectionFileId}" playOrder="${chapterPlayOrderStart}"><navLabel><text>${escapeXml(section.title)}</text></navLabel><content src="${`chap_${sectionFileId}_0.xhtml`}" />${chapterNavPoints}</navPoint>\n`;
                    }
                    continue;
                } else if (section.hasContentInput) {
                    sectionContentProcessed = await processMarkdownForEpubImages(section.content, imageFolder, epubGlobalImageMap, epubGlobalManifestImageItems, epubGlobalImageIdCounter, markdownConverter);
                } else {
                    sectionContentProcessed = "<p><i>This section is auto-generated or has no direct content.</i></p>";
                }

                oebps.file(sectionFilenameCurrent, createXHTML_EPUB(section.title, sectionContentProcessed, sectionFilenameCurrent));
                manifestItems += `<item id="${sectionFileId}" href="${sectionFilenameCurrent}" media-type="application/xhtml+xml"/>\n`;
                spineOrder.push(sectionFileId);
                if (section.type !== 'toc' || (section.type === 'toc' && !navPointsNcx.includes(`src="${sectionFilenameCurrent}"`))) {
                    navPointsNcx += `<navPoint id="navpoint-${playOrderNcx}" playOrder="${playOrderNcx++}"><navLabel><text>${escapeXml(section.title)}</text></navLabel><content src="${sectionFilenameCurrent}"/></navPoint>\n`;
                }
            }
        }

        const tocNcxContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapedBookTitle}</text></docTitle>
  <navMap>${navPointsNcx}</navMap>
</ncx>`;
        oebps.file("toc.ncx", tocNcxContent);
        manifestItems += `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n`;

        const allManifestItems = manifestItems + epubGlobalManifestImageItems.join('\n    ');
        const spineItems = spineOrder.map(idref => `<itemref idref="${idref}"/>`).join('\n    ');

        let opfMetaData = `<dc:title>${escapedBookTitle}</dc:title>
    <dc:creator opf:role="aut">${escapedAuthor}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId" opf:scheme="UUID">${uuid}</dc:identifier>`;
        if (coverImageFilenameForEpub) {
            opfMetaData += `\n    <meta name="cover" content="${coverImageManifestId}"/>`;
        }

        const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    ${opfMetaData}
  </metadata>
  <manifest>
    ${allManifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
  <guide>
    ${coverImageFilenameForEpub ? `<reference type="cover" title="Cover" href="${coverXhtmlFilename}"/>` : ''}
    ${tocSectionFilename ? `<reference type="toc" title="Table of Contents" href="${tocSectionFilename}"/>` : ''}
    <reference type="text" title="Beginning" href="${spineOrder.find(id => id !== coverXhtmlFileId) || titlePageId}.xhtml"/>
  </guide>
</package>`;
        oebps.file("content.opf", contentOpf);

        try {
            const epubBlob = await zip.generateAsync({type:"blob", mimeType:"application/epub+zip", compression: "DEFLATE"});
            downloadFile(epubBlob, `${filenameBase}.epub`, "application/epub+zip");
        } catch (err) {
            console.error("EPUB ZIP Generation Error:", err);
            showInfoModal("EPUB Export Error", "Could not generate EPUB file. " + (err.message || "Unknown error."));
        } finally {
            setLoadingState(false);
        }
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random()*16|0, v = c=='x'?r:(r&0x3|0x8); return v.toString(16);
        });
    }

    if(backBtn) backBtn.addEventListener('click', navigateBack);
    if(nextBtn) nextBtn.addEventListener('click', navigateNext);
    if(previewBookBtn) previewBookBtn.addEventListener('click', showPreview);
    if(goToExportBtn) goToExportBtn.addEventListener('click', navigateToExportPage);
    if(finalExportBtn) finalExportBtn.addEventListener('click', exportBook);
    if(closePreviewBtn) closePreviewBtn.addEventListener('click', hidePreview);
    if(closeInfoModalBtn&&okInfoModalBtn&&infoModal){
        closeInfoModalBtn.addEventListener('click',()=>infoModal.classList.add('hidden'));
        okInfoModalBtn.addEventListener('click',()=>infoModal.classList.add('hidden'));
    }
    if(showInstructionsBtn&&instructionsModal&&closeInstructionsBtn&&okInstructionsBtn){
        showInstructionsBtn.addEventListener('click',()=>instructionsModal.classList.remove('hidden'));
        closeInstructionsBtn.addEventListener('click',()=>instructionsModal.classList.add('hidden'));
        okInstructionsBtn.addEventListener('click',()=>instructionsModal.classList.add('hidden'));
    }

    updateUI();
});
