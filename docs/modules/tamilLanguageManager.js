/**
 * Tamil Language Manager
 * Provides comprehensive Tamil UI translations and language support
 */

class TamilLanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: this.getEnglishTranslations(),
            ta: this.getTamilTranslations()
        };
        this.initialized = false;
    }

    /**
     * Initialize Tamil language support
     */
    async initialize() {
        try {
            // Load Tamil fonts
            await this.loadTamilFonts();
            
            // Set up language detection
            this.detectUserLanguage();
            
            // Apply initial language
            this.applyLanguage(this.currentLanguage);
            
            this.initialized = true;
            console.log('Tamil Language Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Tamil Language Manager:', error);
        }
    }

    /**
     * Get English translations
     */
    getEnglishTranslations() {
        return {
            // Navigation
            dashboard: 'Dashboard',
            workspace: 'Workspace',
            templates: 'Templates',
            settings: 'Settings',
            help: 'Help',
            
            // File Operations
            selectFolder: 'Select Folder',
            selectFiles: 'Select Files',
            uploadFiles: 'Upload Files',
            processFiles: 'Process Files',
            downloadResults: 'Download Results',
            clearSelection: 'Clear Selection',
            
            // Processing
            enterPrompt: 'Enter your request',
            processing: 'Processing...',
            completed: 'Completed',
            failed: 'Failed',
            retry: 'Retry',
            
            // Results
            results: 'Results',
            summary: 'Summary',
            details: 'Details',
            export: 'Export',
            
            // File Types
            documents: 'Documents',
            images: 'Images',
            spreadsheets: 'Spreadsheets',
            presentations: 'Presentations',
            
            // Classifications
            bill: 'Bill',
            invoice: 'Invoice',
            deliveryChallan: 'Delivery Challan',
            report: 'Report',
            scannedCopy: 'Scanned Copy',
            contract: 'Contract',
            receipt: 'Receipt',
            other: 'Other',
            
            // Actions
            rename: 'Rename',
            organize: 'Organize',
            classify: 'Classify',
            extract: 'Extract',
            summarize: 'Summarize',
            
            // Status Messages
            noFilesSelected: 'No files selected',
            processingComplete: 'Processing complete',
            errorOccurred: 'An error occurred',
            tryAgain: 'Please try again',
            
            // Prompts
            promptPlaceholder: 'Describe what you want to do with these files...',
            
            // Statistics
            totalFiles: 'Total Files',
            successfullyProcessed: 'Successfully Processed',
            failed: 'Failed',
            averageConfidence: 'Average Confidence',
            
            // Buttons
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            close: 'Close',
            next: 'Next',
            previous: 'Previous',
            finish: 'Finish'
        };
    }

    /**
     * Get Tamil translations
     */
    getTamilTranslations() {
        return {
            // Navigation
            dashboard: 'முகப்பு',
            workspace: 'பணியிடம்',
            templates: 'வார்ப்புருக்கள்',
            settings: 'அமைப்புகள்',
            help: 'உதவி',
            
            // File Operations
            selectFolder: 'கோப்புறையைத் தேர்ந்தெடுக்கவும்',
            selectFiles: 'கோப்புகளைத் தேர்ந்தெடுக்கவும்',
            uploadFiles: 'கோப்புகளை பதிவேற்றவும்',
            processFiles: 'கோப்புகளை செயலாக்கவும்',
            downloadResults: 'முடிவுகளை பதிவிறக்கவும்',
            clearSelection: 'தேர்வை அழிக்கவும்',
            
            // Processing
            enterPrompt: 'உங்கள் கோரிக்கையை உள்ளிடவும்',
            processing: 'செயலாக்கப்படுகிறது...',
            completed: 'முடிந்தது',
            failed: 'தோல்வியடைந்தது',
            retry: 'மீண்டும் முயற்சிக்கவும்',
            
            // Results
            results: 'முடிவுகள்',
            summary: 'சுருக்கம்',
            details: 'விவரங்கள்',
            export: 'ஏற்றுமதி',
            
            // File Types
            documents: 'ஆவணங்கள்',
            images: 'படங்கள்',
            spreadsheets: 'விரிதாள்கள்',
            presentations: 'விளக்கக்காட்சிகள்',
            
            // Classifications
            bill: 'பில்',
            invoice: 'இன்வாய்ஸ்',
            deliveryChallan: 'டெலிவரி சலான்',
            report: 'அறிக்கை',
            scannedCopy: 'ஸ்கேன் நகல்',
            contract: 'ஒப்பந்தம்',
            receipt: 'ரசீது',
            other: 'மற்றவை',
            
            // Actions
            rename: 'பெயர் மாற்றவும்',
            organize: 'ஒழுங்கமைக்கவும்',
            classify: 'வகைப்படுத்தவும்',
            extract: 'எடுக்கவும்',
            summarize: 'சுருக்கவும்',
            
            // Status Messages
            noFilesSelected: 'கோப்புகள் எதுவும் தேர்ந்தெடுக்கப்படவில்லை',
            processingComplete: 'செயலாக்கம் முடிந்தது',
            errorOccurred: 'ஒரு பிழை ஏற்பட்டது',
            tryAgain: 'தயவுசெய்து மீண்டும் முயற்சிக்கவும்',
            
            // Prompts
            promptPlaceholder: 'இந்த கோப்புகளுடன் நீங்கள் என்ன செய்ய விரும்புகிறீர்கள் என்பதை விவரிக்கவும்...',
            
            // Statistics
            totalFiles: 'மொத்த கோப்புகள்',
            successfullyProcessed: 'வெற்றிகரமாக செயலாக்கப்பட்டது',
            failed: 'தோல்வியடைந்தது',
            averageConfidence: 'சராசரி நம்பிக்கை',
            
            // Buttons
            cancel: 'ரத்து செய்',
            confirm: 'உறுதிப்படுத்து',
            save: 'சேமி',
            close: 'மூடு',
            next: 'அடுத்து',
            previous: 'முந்தைய',
            finish: 'முடி'
        };
    }

    /**
     * Load Tamil fonts
     */
    async loadTamilFonts() {
        try {
            // Load Noto Sans Tamil font
            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@300;400;500;600;700&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
            
            // Add Tamil typography CSS
            const tamilCSS = `
                .tamil-text {
                    font-family: 'Noto Sans Tamil', 'Latha', 'Vijaya', sans-serif;
                    font-size: 1.1em;
                    line-height: 1.6;
                    letter-spacing: 0.02em;
                    font-feature-settings: "kern" 1, "liga" 1;
                }
                
                .tamil-input {
                    font-family: 'Noto Sans Tamil', 'Latha', sans-serif;
                    direction: ltr;
                    text-align: left;
                    font-size: 1.2em;
                    line-height: 1.5;
                }
                
                .tamil-button {
                    font-family: 'Noto Sans Tamil', 'Latha', sans-serif;
                    padding: 12px 24px;
                    font-size: 1.1em;
                    font-weight: 500;
                    border-radius: 8px;
                }
                
                .tamil-heading {
                    font-family: 'Noto Sans Tamil', 'Latha', sans-serif;
                    font-weight: 600;
                    line-height: 1.4;
                }
                
                .tamil-body {
                    font-family: 'Noto Sans Tamil', 'Latha', sans-serif;
                    font-weight: 400;
                    line-height: 1.6;
                }
                
                /* Language-specific adjustments */
                [data-language="ta"] {
                    font-family: 'Noto Sans Tamil', 'Latha', sans-serif;
                }
                
                [data-language="ta"] .btn {
                    font-size: 1.05em;
                    padding: 10px 20px;
                }
                
                [data-language="ta"] .form-control {
                    font-size: 1.1em;
                    line-height: 1.5;
                }
                
                [data-language="ta"] h1, [data-language="ta"] h2, [data-language="ta"] h3 {
                    font-weight: 600;
                    line-height: 1.3;
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = tamilCSS;
            document.head.appendChild(styleSheet);
            
        } catch (error) {
            console.error('Error loading Tamil fonts:', error);
        }
    }

    /**
     * Detect user's preferred language
     */
    detectUserLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            return;
        }
        
        // Check browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage.startsWith('ta')) {
            this.currentLanguage = 'ta';
        } else {
            this.currentLanguage = 'en';
        }
    }

    /**
     * Set language
     */
    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language '${language}' not supported`);
            return false;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('preferredLanguage', language);
        this.applyLanguage(language);
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: language }
        }));
        
        return true;
    }

    /**
     * Apply language to the UI
     */
    applyLanguage(language) {
        // Set document language attribute
        document.documentElement.setAttribute('data-language', language);
        document.documentElement.setAttribute('lang', language);
        
        // Update all elements with data-translate attribute
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && element.type !== 'button') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Apply language-specific CSS classes
        document.body.className = document.body.className.replace(/\blang-\w+\b/g, '');
        document.body.classList.add(`lang-${language}`);
        
        if (language === 'ta') {
            document.body.classList.add('tamil-text');
        } else {
            document.body.classList.remove('tamil-text');
        }
    }

    /**
     * Translate a key
     */
    translate(key, language = null) {
        const lang = language || this.currentLanguage;
        const translation = this.translations[lang] && this.translations[lang][key];
        
        if (!translation) {
            console.warn(`Translation missing for key '${key}' in language '${lang}'`);
            return this.translations.en[key] || key;
        }
        
        return translation;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if current language is Tamil
     */
    isTamil() {
        return this.currentLanguage === 'ta';
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
        ];
    }

    /**
     * Format text for Tamil display
     */
    formatTamilText(text) {
        if (!text || this.currentLanguage !== 'ta') {
            return text;
        }
        
        // Add proper spacing and formatting for Tamil text
        return text
            .replace(/([\u0B80-\u0BFF])([a-zA-Z])/g, '$1 $2') // Space between Tamil and English
            .replace(/([a-zA-Z])([\u0B80-\u0BFF])/g, '$1 $2') // Space between English and Tamil
            .trim();
    }

    /**
     * Create language switcher UI
     */
    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <select id="languageSelect" class="form-select">
                <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>English</option>
                <option value="ta" ${this.currentLanguage === 'ta' ? 'selected' : ''}>தமிழ்</option>
            </select>
        `;
        
        const select = switcher.querySelector('#languageSelect');
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
        
        return switcher;
    }

    /**
     * Update element text with translation
     */
    updateElementText(element, key, language = null) {
        const translation = this.translate(key, language);
        
        if (element.tagName === 'INPUT' && element.type !== 'button') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
        
        // Add data-translate attribute for future updates
        element.setAttribute('data-translate', key);
    }

    /**
     * Get direction for text (LTR for both English and Tamil)
     */
    getTextDirection() {
        return 'ltr'; // Both English and Tamil are LTR
    }

    /**
     * Get font family for current language
     */
    getFontFamily() {
        if (this.currentLanguage === 'ta') {
            return "'Noto Sans Tamil', 'Latha', 'Vijaya', sans-serif";
        }
        return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    }

    /**
     * Initialize language switcher in navigation
     */
    initializeLanguageSwitcher() {
        const nav = document.querySelector('.navbar, .header, nav');
        if (nav) {
            const switcher = this.createLanguageSwitcher();
            switcher.style.marginLeft = 'auto';
            nav.appendChild(switcher);
        }
    }

    /**
     * Get localized date format
     */
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'ta' ? 'ta-IN' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    /**
     * Get localized number format
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'ta' ? 'ta-IN' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }
}

// Export for use in other modules
export { TamilLanguageManager };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TamilLanguageManager;
} else {
    window.TamilLanguageManager = TamilLanguageManager;
}