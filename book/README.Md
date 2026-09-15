E-book Creator Application
Overview
The E-book Creator is a browser-based JavaScript application designed to help users create simple e-books directly in their web browser. It requires no backend server and allows users to input content section by section, manage chapters and custom text sections, format content using Markdown, and export their work in various formats including TXT, HTML, PDF, and EPUB.

This application is built using plain HTML, CSS (custom styles, no Tailwind CSS), and JavaScript. It leverages client-side libraries like Showdown.js for Markdown-to-HTML conversion, html2pdf.js for PDF generation, and JSZip for creating EPUB packages.

Features
Client-Side Operation: Runs entirely in the browser. No server-side processing or installation is required.

Step-by-Step Content Entry: Guides users through predefined sections:

Book Title

Preface (Optional)

About the Author (Optional)

Chapters (add as many as needed)

Custom Text Sections (user-defined)

Appendix (Optional)

Index (Optional)

Dynamic Section Management:

Add new custom text-based sections.

Clear content from and hide/show predefined optional sections (Preface, About Author, Appendix, Index).

Delete custom-added text sections.

Chapter Management:

Easily add new chapters.

Edit chapter titles and content.

Markdown Formatting:

Supports standard Markdown syntax for rich text formatting (headings, bold, italic, lists, links, tables, code blocks, blockquotes/prompts).

Formatting Assistant: A panel provides buttons to quickly insert common Markdown syntax templates into the active content area.

Image Upload:

"Add Image" buttons in content sections allow users to browse and upload local image files (JPEG/PNG).

Images are embedded as Base64 data URLs directly into the content.

Client-side validation for image pixel dimensions (max 5.6 million pixels) and file size (suggestion: under 2MB before encoding) to improve compatibility, especially with Apple Books.

Content Preview:

A "Preview E-book" modal shows a live HTML preview of the formatted content.

Multi-Format Export:

.txt: Plain text dump of the content.

.html: A single, self-contained HTML file with basic styling.

.pdf: PDF document generated using html2pdf.js. Each major section and chapter starts on a new page. Page numbers are included.

.epub: EPUB (version 2) file generated using JSZip. Includes a linked HTML Table of Contents page and an NCX Table of Contents. Uploaded images are embedded.

.mobi / .azw (Informational): Provides guidance on using external tools like Calibre to convert the generated EPUB or HTML to these formats.

Autosave to LocalStorage:

Work is automatically saved to the browser's local storage as the user navigates or makes changes.

Data is reloaded when the page is opened.

Option to "Clear Saved Data" is available in the Export section.

Responsive Design: The UI is designed to be usable across different screen sizes (though optimized for desktop).

User Instructions: A detailed "Instructions" modal explains all features and how to use them.

How to Use
Open index.html: Simply open the index.html file in a modern web browser (Chrome, Firefox, Edge, Safari recommended).

Instructions: Click the "Instructions" button in the header for a detailed guide on all features.

Navigate Sections: Use the "Next" and "Back" buttons to move between e-book sections. The "Current Step" indicator shows your location.

Enter Content:

Type or paste your text into the provided input fields for each section (Title, Preface, Chapter Content, etc.).

Use the "Formatting Assistant" (toggle with the button in the header) to insert Markdown syntax templates. Click into a textarea first, then click a format button.

Add Images:

Click the "Add Image" button available above content textareas.

Select a JPEG or PNG image from your computer. It will be embedded as Markdown.

Alternatively, use Markdown syntax ![Alt Text](image_url) for externally hosted images.

Manage Chapters:

In the "Chapter" section, enter the chapter title and content.

Click "Save and Add Another Chapter" to create more chapters.

Manage Book Structure:

Go to the "Book Structure" section.

Click "Add Custom Text Section" to add new sections.

For predefined optional sections (Preface, Appendix, etc.), click their action button to clear content and hide them, or to re-enable them.

Delete custom sections using their "Delete" button.

Preview: Click "Preview E-book" at any time to see an HTML preview of your work.

Export:

Navigate to the "Finish & Export" section.

Select your desired output format (.txt, .html, .pdf, .epub).

Click "Export E-book". The file will be generated and downloaded by your browser.

For .mobi or .azw, follow the on-screen instructions after selecting the format.

Autosave & Clearing Data:

Your work is saved automatically in your browser.

If you want to start completely fresh, go to the "Export" section and click "Clear Saved Data".

Technical Details
HTML: Provides the basic structure and semantic markup.

CSS (styles.css): Custom styles for the application's appearance and layout. No external CSS frameworks like Tailwind are used in this version.

JavaScript (script.js): Handles all application logic:

UI updates and navigation.

Dynamic HTML rendering for sections.

Data storage in a JavaScript object (ebookData).

Autosave to localStorage.

Markdown to HTML conversion using Showdown.js.

Image uploading and Base64 encoding.

TXT, HTML, PDF, and EPUB export generation.

EPUB packaging using JSZip.

PDF generation using html2pdf.js.

Libraries Used (via CDN):

Showdown.js: For Markdown to HTML conversion.

html2pdf.js: For PDF generation from HTML.

JSZip: For creating EPUB (ZIP) archives.

Notes on EPUB and Apple Books Compatibility
Image Embedding: Uploaded images are embedded as Base64 data URLs. This makes the EPUB self-contained but can increase file size.

Apple Books:

Apple Books can be very strict about EPUB validation and rendering.

Very large Base64 embedded images (e.g., exceeding 5.6 million total pixels per image, or resulting in very large XHTML files) may not display correctly.

It's recommended to optimize images (reduce dimensions and file size) before uploading for best results.

For maximum compatibility with Apple Books, especially with many images, consider using a tool like Calibre after exporting the EPUB. Calibre can help convert embedded images to linked image files within the EPUB package, which is often preferred by Apple Books.

Validation: While this tool aims to create valid EPUBs, always validate your final EPUB file using an official validator like EPUBCheck before distribution, especially if targeting platforms like Apple Books.

Future Enhancements (Potential)
Reordering of custom sections and chapters.

Renaming custom sections.

More advanced rich text editing features.

Support for embedding images as separate files within the EPUB package (rather than only Base64).

User-configurable styling options for exports.

Saving/Loading e-book projects as a single file (e.g., JSON).