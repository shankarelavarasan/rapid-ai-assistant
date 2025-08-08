/**
 * Tamil Prompt Helper - Smart Tamil prompt templates for Gemini AI
 * Provides context-aware prompts for file processing in Tamil
 */

class TamilPromptHelper {
    constructor() {
        this.promptTemplates = {
            fileNaming: {
                document: {
                    tamil: "இந்த ஆவணத்தின் உள்ளடக்கத்தை அடிப்படையாகக் கொண்டு, தமிழில் ஒரு பொருத்தமான கோப்பு பெயரை பரிந்துரைக்கவும். பெயர் 3-5 வார்த்தைகளில் இருக்க வேண்டும் மற்றும் ஆவணத்தின் முக்கிய நோக்கத்தை பிரதிபலிக்க வேண்டும்:",
                    english: "Based on the content of this document, suggest an appropriate file name in Tamil. The name should be 3-5 words and reflect the main purpose of the document:"
                },
                image: {
                    tamil: "இந்த படத்தில் உள்ள உள்ளடக்கத்தை பகுப்பாய்வு செய்து, தமிழில் ஒரு விளக்கமான கோப்பு பெயரை பரிந்துரைக்கவும். பெயர் படத்தின் முக்கிய விஷயத்தை தெளிவாக குறிப்பிட வேண்டும்:",
                    english: "Analyze the content in this image and suggest a descriptive file name in Tamil. The name should clearly indicate the main subject of the image:"
                }
            },
            summarization: {
                short: {
                    tamil: "இந்த ஆவணத்தின் முக்கிய புள்ளிகளை 2-3 வாக்கியங்களில் தமிழில் சுருக்கமாக கூறவும். முக்கியமான தகவல்கள் மற்றும் முடிவுகளை மட்டும் உள்ளடக்கவும்:",
                    english: "Summarize the key points of this document in 2-3 sentences in Tamil. Include only the most important information and conclusions:"
                },
                detailed: {
                    tamil: "இந்த ஆவணத்தின் விரிவான சுருக்கத்தை தமிழில் வழங்கவும். பின்வரும் அம்சங்களை உள்ளடக்கவும்:\n1. முக்கிய நோக்கம்\n2. முக்கிய கண்டுபிடிப்புகள்\n3. முக்கியமான தரவு/எண்கள்\n4. முடிவுகள் மற்றும் பரிந்துரைகள்:",
                    english: "Provide a detailed summary of this document in Tamil. Include the following aspects:\n1. Main purpose\n2. Key findings\n3. Important data/numbers\n4. Conclusions and recommendations:"
                }
            },
            classification: {
                document: {
                    tamil: "இந்த ஆவணத்தை பின்வரும் வகைகளில் ஒன்றாக வகைப்படுத்தவும்:\n- பில் (Bill)\n- விலைப்பட்டியல் (Invoice)\n- டெலிவரி சலான் (Delivery Challan)\n- அறிக்கை (Report)\n- ஸ்கேன் நகல் (Scanned Copy)\n- கடிதம் (Letter)\n- ஒப்பந்தம் (Contract)\n- பிற (Other)\n\nவகைப்பாடு மற்றும் காரணத்தை தமிழில் வழங்கவும்:",
                    english: "Classify this document into one of the following categories:\n- Bill\n- Invoice\n- Delivery Challan\n- Report\n- Scanned Copy\n- Letter\n- Contract\n- Other\n\nProvide the classification and reason in Tamil:"
                },
                confidence: {
                    tamil: "மேலே உள்ள வகைப்பாட்டின் நம்பகத்தன்மை சதவீதத்தை (0-100%) மற்றும் காரணத்தை தமிழில் வழங்கவும்:",
                    english: "Provide the confidence percentage (0-100%) for the above classification and reason in Tamil:"
                }
            },
            dataExtraction: {
                structured: {
                    tamil: "இந்த ஆவணத்திலிருந்து பின்வரும் தகவல்களை JSON வடிவத்தில் பிரித்தெடுக்கவும்:\n- தேதி (date)\n- தொகை (amount)\n- நிறுவனம்/நபர் பெயர் (company/person)\n- முகவரி (address)\n- தொலைபேசி எண் (phone)\n- மின்னஞ்சல் (email)\n- குறிப்பு எண் (reference_number)\n\nகிடைக்காத தகவல்களுக்கு null பயன்படுத்தவும்:",
                    english: "Extract the following information from this document in JSON format:\n- date\n- amount\n- company/person name\n- address\n- phone\n- email\n- reference_number\n\nUse null for unavailable information:"
                },
                financial: {
                    tamil: "இந்த நிதி ஆவணத்திலிருந்து பின்வரும் விவரங்களை பிரித்தெடுக்கவும்:\n- மொத்த தொகை (total_amount)\n- வரி தொகை (tax_amount)\n- தள்ளுபடி (discount)\n- பணம் செலுத்தும் முறை (payment_method)\n- நிலுவை தொகை (due_amount)\n- கடைசி தேதி (due_date)\n\nJSON வடிவத்தில் தமிழ் லேபல்களுடன் வழங்கவும்:",
                    english: "Extract the following financial details from this document:\n- total_amount\n- tax_amount\n- discount\n- payment_method\n- due_amount\n- due_date\n\nProvide in JSON format with Tamil labels:"
                }
            },
            analysis: {
                sentiment: {
                    tamil: "இந்த ஆவணத்தின் உணர்வு நிலையை பகுப்பாய்வு செய்து தமிழில் விளக்கவும் (நேர்மறை/எதிர்மறை/நடுநிலை):",
                    english: "Analyze the sentiment of this document and explain in Tamil (positive/negative/neutral):"
                },
                importance: {
                    tamil: "இந்த ஆவணத்தின் முக்கியத்துவத்தை 1-10 அளவில் மதிப்பிட்டு காரணத்தை தமிழில் விளக்கவும்:",
                    english: "Rate the importance of this document on a scale of 1-10 and explain the reason in Tamil:"
                }
            },
            ocr: {
                tamil: {
                    tamil: "இந்த படத்தில் உள்ள தமிழ் உரையை துல்லியமாக பிரித்தெடுத்து, வாசிக்கக்கூடிய வடிவத்தில் வழங்கவும். எழுத்துப்பிழைகள் இருந்தால் சரிசெய்யவும்:",
                    english: "Accurately extract the Tamil text from this image and provide it in readable format. Correct any spelling errors if present:"
                },
                mixed: {
                    tamil: "இந்த படத்தில் உள்ள அனைத்து உரையையும் (தமிழ் மற்றும் ஆங்கிலம்) பிரித்தெடுத்து, மொழி அடிப்படையில் பிரித்து வழங்கவும்:",
                    english: "Extract all text (Tamil and English) from this image and provide it separated by language:"
                }
            }
        };

        this.contextualPrompts = {
            businessDocument: {
                tamil: "இது ஒரு வணிக ஆவணம் என்பதை கருத்தில் கொண்டு, ",
                english: "Considering this is a business document, "
            },
            personalDocument: {
                tamil: "இது ஒரு தனிப்பட்ட ஆவணம் என்பதை கருத்தில் கொண்டு, ",
                english: "Considering this is a personal document, "
            },
            legalDocument: {
                tamil: "இது ஒரு சட்ட ஆவணம் என்பதை கருத்தில் கொண்டு, ",
                english: "Considering this is a legal document, "
            },
            technicalDocument: {
                tamil: "இது ஒரு தொழில்நுட்ப ஆவணம் என்பதை கருத்தில் கொண்டு, ",
                english: "Considering this is a technical document, "
            }
        };

        this.outputFormats = {
            json: {
                tamil: "\n\nபதிலை JSON வடிவத்தில் மட்டும் வழங்கவும், கூடுதல் விளக்கம் வேண்டாம்.",
                english: "\n\nProvide the response in JSON format only, no additional explanation needed."
            },
            structured: {
                tamil: "\n\nபதிலை கட்டமைக்கப்பட்ட வடிவத்தில் தெளிவான தலைப்புகளுடன் வழங்கவும்.",
                english: "\n\nProvide the response in structured format with clear headings."
            },
            bullet: {
                tamil: "\n\nபதிலை புள்ளி வடிவத்தில் (bullet points) வழங்கவும்.",
                english: "\n\nProvide the response in bullet point format."
            }
        };
    }

    /**
     * Generate a smart prompt based on task type and context
     * @param {string} taskType - Type of task (naming, summary, classification, etc.)
     * @param {string} subType - Sub-type of task
     * @param {string} language - Preferred language (tamil/english)
     * @param {string} context - Document context (business, personal, legal, technical)
     * @param {string} outputFormat - Desired output format (json, structured, bullet)
     * @param {Object} customParams - Additional parameters
     * @returns {string} Generated prompt
     */
    generatePrompt(taskType, subType = 'default', language = 'tamil', context = null, outputFormat = null, customParams = {}) {
        let prompt = '';

        // Add contextual prefix if provided
        if (context && this.contextualPrompts[context]) {
            prompt += this.contextualPrompts[context][language] || this.contextualPrompts[context]['english'];
        }

        // Add main prompt
        const mainPrompt = this.getMainPrompt(taskType, subType, language);
        prompt += mainPrompt;

        // Add custom parameters
        if (customParams.fileType) {
            const fileTypeText = language === 'tamil' ? 
                `\n\nகோப்பு வகை: ${customParams.fileType}` : 
                `\n\nFile type: ${customParams.fileType}`;
            prompt += fileTypeText;
        }

        if (customParams.fileSize) {
            const fileSizeText = language === 'tamil' ? 
                `\nகோப்பு அளவு: ${customParams.fileSize}` : 
                `\nFile size: ${customParams.fileSize}`;
            prompt += fileSizeText;
        }

        // Add output format instruction
        if (outputFormat && this.outputFormats[outputFormat]) {
            prompt += this.outputFormats[outputFormat][language] || this.outputFormats[outputFormat]['english'];
        }

        return prompt;
    }

    /**
     * Get main prompt template
     * @param {string} taskType - Task type
     * @param {string} subType - Sub-type
     * @param {string} language - Language preference
     * @returns {string} Main prompt
     */
    getMainPrompt(taskType, subType, language) {
        const templates = this.promptTemplates[taskType];
        if (!templates) {
            return language === 'tamil' ? 
                'இந்த ஆவணத்தை பகுப்பாய்வு செய்து தமிழில் விளக்கவும்:' : 
                'Analyze this document and explain in Tamil:';
        }

        const subTemplate = templates[subType] || templates['default'] || Object.values(templates)[0];
        return subTemplate[language] || subTemplate['english'] || subTemplate;
    }

    /**
     * Generate file naming prompt
     * @param {string} fileType - Type of file (document, image, etc.)
     * @param {string} language - Language preference
     * @returns {string} File naming prompt
     */
    getFileNamingPrompt(fileType = 'document', language = 'tamil') {
        return this.generatePrompt('fileNaming', fileType, language);
    }

    /**
     * Generate summarization prompt
     * @param {string} length - Summary length (short, detailed)
     * @param {string} language - Language preference
     * @param {string} context - Document context
     * @returns {string} Summarization prompt
     */
    getSummarizationPrompt(length = 'short', language = 'tamil', context = null) {
        return this.generatePrompt('summarization', length, language, context, 'structured');
    }

    /**
     * Generate classification prompt
     * @param {string} language - Language preference
     * @param {boolean} includeConfidence - Include confidence rating
     * @returns {string} Classification prompt
     */
    getClassificationPrompt(language = 'tamil', includeConfidence = true) {
        let prompt = this.generatePrompt('classification', 'document', language, null, 'structured');
        
        if (includeConfidence) {
            prompt += '\n\n' + this.getMainPrompt('classification', 'confidence', language);
        }
        
        return prompt;
    }

    /**
     * Generate data extraction prompt
     * @param {string} extractionType - Type of extraction (structured, financial)
     * @param {string} language - Language preference
     * @returns {string} Data extraction prompt
     */
    getDataExtractionPrompt(extractionType = 'structured', language = 'tamil') {
        return this.generatePrompt('dataExtraction', extractionType, language, null, 'json');
    }

    /**
     * Generate OCR prompt for text extraction
     * @param {string} textType - Type of text (tamil, mixed)
     * @param {string} language - Language preference
     * @returns {string} OCR prompt
     */
    getOCRPrompt(textType = 'mixed', language = 'tamil') {
        return this.generatePrompt('ocr', textType, language);
    }

    /**
     * Generate analysis prompt
     * @param {string} analysisType - Type of analysis (sentiment, importance)
     * @param {string} language - Language preference
     * @returns {string} Analysis prompt
     */
    getAnalysisPrompt(analysisType = 'sentiment', language = 'tamil') {
        return this.generatePrompt('analysis', analysisType, language, null, 'structured');
    }

    /**
     * Generate batch processing prompt for multiple files
     * @param {number} fileCount - Number of files
     * @param {string} language - Language preference
     * @returns {string} Batch processing prompt
     */
    getBatchProcessingPrompt(fileCount, language = 'tamil') {
        const batchText = language === 'tamil' ? 
            `${fileCount} கோப்புகளை ஒரே நேரத்தில் பகுப்பாய்வு செய்து, ஒவ்வொன்றுக்கும் தனித்தனியாக சுருக்கம், வகைப்பாடு மற்றும் முக்கிய தகவல்களை வழங்கவும். இறுதியில் அனைத்து கோப்புகளின் ஒட்டுமொத்த சுருக்கத்தையும் வழங்கவும்:` :
            `Analyze ${fileCount} files simultaneously and provide summary, classification, and key information for each file separately. Finally, provide an overall summary of all files:`;
        
        return batchText;
    }

    /**
     * Get available prompt templates
     * @returns {Object} Available templates
     */
    getAvailableTemplates() {
        return {
            taskTypes: Object.keys(this.promptTemplates),
            contexts: Object.keys(this.contextualPrompts),
            outputFormats: Object.keys(this.outputFormats)
        };
    }

    /**
     * Validate prompt parameters
     * @param {string} taskType - Task type
     * @param {string} subType - Sub-type
     * @returns {boolean} Validation result
     */
    validatePromptParams(taskType, subType) {
        if (!this.promptTemplates[taskType]) {
            console.warn(`Unknown task type: ${taskType}`);
            return false;
        }

        if (subType && !this.promptTemplates[taskType][subType]) {
            console.warn(`Unknown sub-type '${subType}' for task '${taskType}'`);
            return false;
        }

        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TamilPromptHelper;
} else {
    window.TamilPromptHelper = TamilPromptHelper;
}

// Example usage:
// const promptHelper = new TamilPromptHelper();
// const namingPrompt = promptHelper.getFileNamingPrompt('document', 'tamil');
// const summaryPrompt = promptHelper.getSummarizationPrompt('detailed', 'tamil', 'business');
// const classificationPrompt = promptHelper.getClassificationPrompt('tamil', true);
// const extractionPrompt = promptHelper.getDataExtractionPrompt('financial', 'tamil')