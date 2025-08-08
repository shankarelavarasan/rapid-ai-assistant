/**
 * OCR Processor - Advanced text extraction from images using Gemini Vision API
 * Supports Tamil translation and intelligent text recognition
 */

class OCRProcessor {
    constructor(geminiApiKey, options = {}) {
        this.apiKey = geminiApiKey;
        this.config = {
            defaultModel: 'gemini-1.5-pro-vision-latest',
            maxImageSize: 20 * 1024 * 1024, // 20MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'],
            defaultLanguage: 'tamil',
            enableTranslation: true,
            enableStructuredOutput: true,
            timeout: 30000,
            retryAttempts: 2,
            ...options
        };
        
        // Initialize Gemini AI
        this.genAI = null;
        this.visionModel = null;
        this.initialized = false;
        
        // Enhanced processing statistics with detailed metrics
        this.stats = {
            totalProcessed: 0,
            successfulExtractions: 0,
            failedExtractions: 0,
            averageProcessingTime: 0,
            languagesDetected: new Set(),
            documentTypesProcessed: new Set(),
            confidenceScores: [],
            textQualityDistribution: { high: 0, medium: 0, low: 0 },
            processingTimesByType: {},
            errorTypes: {},
            multiLanguageDocuments: 0,
            averageTextLength: 0,
            totalTextExtracted: 0
        };
        
        // Advanced OCR features
        this.advancedFeatures = {
            enablePreprocessing: true,
            enablePostProcessing: true,
            enableContextualCorrection: true,
            enableSmartCropping: true,
            enableNoiseReduction: true,
            enableSkewCorrection: true
        };
        
        // Enhanced language detection patterns with better accuracy
        this.languagePatterns = {
            tamil: {
                pattern: /[\u0B80-\u0BFF]/,
                commonWords: ['அது', 'இது', 'என்று', 'ஒரு', 'அந்த', 'இந்த', 'மற்றும்', 'அல்லது'],
                numerals: /[௦-௯]/,
                weight: 1.0
            },
            english: {
                pattern: /[a-zA-Z]/,
                commonWords: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'],
                numerals: /[0-9]/,
                weight: 0.8
            },
            hindi: {
                pattern: /[\u0900-\u097F]/,
                commonWords: ['और', 'या', 'में', 'से', 'को', 'का', 'की', 'के'],
                numerals: /[०-९]/,
                weight: 0.7
            },
            arabic: {
                pattern: /[\u0600-\u06FF]/,
                commonWords: ['في', 'من', 'إلى', 'على', 'مع', 'أو', 'و'],
                numerals: /[٠-٩]/,
                weight: 0.6
            },
            chinese: {
                pattern: /[\u4e00-\u9fff]/,
                commonWords: ['的', '和', '在', '是', '了', '有', '我', '你'],
                numerals: /[零一二三四五六七八九十]/,
                weight: 0.6
            },
            japanese: {
                pattern: /[\u3040-\u309f\u30a0-\u30ff]/,
                commonWords: ['の', 'に', 'は', 'を', 'が', 'で', 'と', 'から'],
                numerals: /[０-９]/,
                weight: 0.6
            }
        };
        
        // Enhanced document type patterns with confidence scoring
        this.documentPatterns = {
            invoice: {
                keywords: ['invoice', 'bill', 'receipt', 'tax invoice', 'கணக்கு', 'பில்', 'ரசீது', 'வரி கணக்கு'],
                patterns: [/invoice\s*(?:no|number|#)?[:\s]*([A-Za-z0-9-]+)/i, /bill\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['amount', 'date'],
                confidence: 0.9
            },
            certificate: {
                keywords: ['certificate', 'diploma', 'degree', 'certification', 'சான்றிதழ்', 'பட்டம்', 'சான்று'],
                patterns: [/certificate\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['date'],
                confidence: 0.85
            },
            id_document: {
                keywords: ['passport', 'license', 'id card', 'aadhaar', 'driving license', 'பாஸ்போர்ட்', 'உரிமம்', 'அடையாள அட்டை'],
                patterns: [/(?:passport|license|id)\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['idNumber'],
                confidence: 0.95
            },
            contract: {
                keywords: ['agreement', 'contract', 'terms', 'conditions', 'ஒப்பந்தம்', 'உடன்படிக்கை'],
                patterns: [/agreement\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['date'],
                confidence: 0.8
            },
            report: {
                keywords: ['report', 'analysis', 'summary', 'findings', 'அறிக்கை', 'பகுப்பாய்வு', 'சுருக்கம்'],
                patterns: [/report\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['date'],
                confidence: 0.75
            },
            form: {
                keywords: ['application', 'form', 'request', 'submission', 'விண்ணப்பம்', 'படிவம்', 'கோரிக்கை'],
                patterns: [/(?:application|form)\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: [],
                confidence: 0.7
            },
            medical: {
                keywords: ['prescription', 'medical', 'doctor', 'patient', 'மருத்துவ', 'மருந்து', 'நோயாளி'],
                patterns: [/(?:prescription|patient)\s*(?:no|id)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['date'],
                confidence: 0.85
            },
            financial: {
                keywords: ['bank', 'statement', 'transaction', 'account', 'வங்கி', 'கணக்கு', 'பரிவர்த்தனை'],
                patterns: [/(?:account|statement)\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i],
                requiredFields: ['amount', 'date'],
                confidence: 0.9
            }
        };
    }

    /**
     * Initialize the OCR processor
     */
    async initialize() {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key is required for OCR processing');
            }
            
            // Dynamic import to avoid issues in different environments
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.visionModel = this.genAI.getGenerativeModel({ model: this.config.defaultModel });
            
            this.initialized = true;
            console.log('OCR Processor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize OCR Processor:', error);
            throw new Error(`OCR initialization failed: ${error.message}`);
        }
    }

    /**
     * Process single image for OCR
     * @param {File|Blob|string} imageInput - Image file, blob, or base64 string
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} OCR result with extracted text and metadata
     */
    async processImage(imageInput, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const startTime = Date.now();
        const processingOptions = {
            language: this.config.defaultLanguage,
            enableTranslation: this.config.enableTranslation,
            enableStructuredOutput: this.config.enableStructuredOutput,
            extractionMode: 'comprehensive', // 'simple', 'comprehensive', 'structured'
            outputFormat: 'detailed', // 'simple', 'detailed', 'json'
            detectDocumentType: true,
            preserveFormatting: true,
            ...options
        };
        
        try {
            // Validate and prepare image
            const imageData = await this.prepareImage(imageInput);
            
            // Create OCR prompt based on options
            const prompt = this.createOCRPrompt(processingOptions);
            
            // Process with Gemini Vision
            const result = await this.extractTextWithGemini(imageData, prompt, processingOptions);
            
            // Post-process results
            const processedResult = await this.postProcessOCRResult(result, processingOptions);
            
            // Update statistics
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, true, processedResult);
            
            return {
                success: true,
                extractedText: processedResult.text,
                structuredData: processedResult.structuredData,
                metadata: {
                    ...processedResult.metadata,
                    processingTime,
                    processingOptions,
                    timestamp: new Date().toISOString()
                },
                confidence: processedResult.confidence,
                language: processedResult.detectedLanguage,
                documentType: processedResult.documentType,
                translation: processedResult.translation
            };
            
        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updateStats(processingTime, false);
            
            console.error('OCR processing failed:', error);
            return {
                success: false,
                error: error.message,
                extractedText: '',
                metadata: {
                    processingTime,
                    processingOptions,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Process multiple images in batch
     * @param {Array} images - Array of image inputs
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} Array of OCR results
     */
    async processBatch(images, options = {}) {
        const batchOptions = {
            maxConcurrent: 3,
            enableProgressCallback: false,
            progressCallback: null,
            ...options
        };
        
        const results = [];
        const totalImages = images.length;
        
        // Process images in batches
        for (let i = 0; i < images.length; i += batchOptions.maxConcurrent) {
            const batch = images.slice(i, i + batchOptions.maxConcurrent);
            
            const batchPromises = batch.map(async (image, index) => {
                const globalIndex = i + index;
                
                try {
                    const result = await this.processImage(image, batchOptions);
                    
                    // Call progress callback if provided
                    if (batchOptions.enableProgressCallback && batchOptions.progressCallback) {
                        batchOptions.progressCallback({
                            completed: globalIndex + 1,
                            total: totalImages,
                            percentage: ((globalIndex + 1) / totalImages) * 100,
                            currentResult: result
                        });
                    }
                    
                    return {
                        index: globalIndex,
                        ...result
                    };
                    
                } catch (error) {
                    console.error(`Error processing image ${globalIndex}:`, error);
                    return {
                        index: globalIndex,
                        success: false,
                        error: error.message,
                        extractedText: ''
                    };
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        
        // Generate batch summary
        const summary = this.generateBatchSummary(results);
        
        return {
            results,
            summary,
            totalProcessed: totalImages,
            successfulExtractions: results.filter(r => r.success).length,
            failedExtractions: results.filter(r => !r.success).length
        };
    }

    /**
     * Prepare image for processing
     * @param {File|Blob|string} imageInput - Image input
     * @returns {Promise<Object>} Prepared image data
     */
    async prepareImage(imageInput) {
        let imageData = {
            data: null,
            mimeType: null,
            size: 0
        };
        
        if (imageInput instanceof File || imageInput instanceof Blob) {
            // Validate file size
            if (imageInput.size > this.config.maxImageSize) {
                throw new Error(`Image size (${this.formatFileSize(imageInput.size)}) exceeds maximum allowed size (${this.formatFileSize(this.config.maxImageSize)})`);
            }
            
            // Validate file type
            if (!this.config.supportedFormats.includes(imageInput.type)) {
                throw new Error(`Image format '${imageInput.type}' is not supported`);
            }
            
            // Convert to base64
            const arrayBuffer = await imageInput.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            imageData = {
                data: base64,
                mimeType: imageInput.type,
                size: imageInput.size
            };
            
        } else if (typeof imageInput === 'string') {
            // Assume base64 string
            imageData = {
                data: imageInput.replace(/^data:image\/[a-z]+;base64,/, ''),
                mimeType: 'image/jpeg', // Default
                size: imageInput.length
            };
            
        } else {
            throw new Error('Invalid image input format');
        }
        
        return imageData;
    }

    /**
     * Create OCR prompt based on options
     * @param {Object} options - Processing options
     * @returns {string} OCR prompt
     */
    createOCRPrompt(options) {
        let basePrompt = '';
        
        // Language-specific instructions
        if (options.language === 'tamil') {
            basePrompt = 'தமிழில் பதிலளிக்கவும். ';
        }
        
        // Extraction mode instructions
        switch (options.extractionMode) {
            case 'simple':
                basePrompt += 'Extract all visible text from this image. Provide only the text content without any additional formatting or analysis.';
                break;
                
            case 'comprehensive':
                basePrompt += `Extract all text from this image and provide:
1. Complete text content
2. Text language detection
3. Document type identification
4. Key information extraction
5. Text structure and formatting
6. Confidence assessment`;
                break;
                
            case 'structured':
                basePrompt += `Analyze this image and extract text in a structured format:
1. Document Type: [Identify the type of document]
2. Main Content: [Extract all readable text]
3. Key Fields: [Extract specific data fields like names, dates, amounts, etc.]
4. Language: [Detect the primary language]
5. Confidence: [Rate extraction confidence 1-10]
6. Additional Notes: [Any relevant observations]`;
                break;
        }
        
        // Add translation request if enabled
        if (options.enableTranslation && options.language === 'tamil') {
            basePrompt += '\n\nIf the extracted text is in a language other than Tamil, please provide a Tamil translation as well.';
        }
        
        // Add document type detection
        if (options.detectDocumentType) {
            basePrompt += '\n\nPlease identify the type of document (invoice, certificate, ID document, contract, report, form, or other).';
        }
        
        // Add formatting preservation
        if (options.preserveFormatting) {
            basePrompt += '\n\nPreserve the original text formatting, line breaks, and structure as much as possible.';
        }
        
        return basePrompt;
    }

    /**
     * Extract text using Gemini Vision API
     * @param {Object} imageData - Prepared image data
     * @param {string} prompt - OCR prompt
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Raw extraction result
     */
    async extractTextWithGemini(imageData, prompt, options) {
        const imagePart = {
            inlineData: {
                data: imageData.data,
                mimeType: imageData.mimeType
            }
        };
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('OCR processing timeout')), this.config.timeout);
        });
        
        // Process with retry logic
        let lastError;
        for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const processingPromise = this.visionModel.generateContent([prompt, imagePart]);
                const result = await Promise.race([processingPromise, timeoutPromise]);
                
                const responseText = result.response.text();
                
                return {
                    rawText: responseText,
                    attempt: attempt + 1,
                    success: true
                };
                
            } catch (error) {
                lastError = error;
                console.warn(`OCR attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt < this.config.retryAttempts) {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }
        
        throw new Error(`OCR failed after ${this.config.retryAttempts + 1} attempts: ${lastError.message}`);
    }

    /**
     * Enhanced post-process OCR result with advanced features
     * @param {Object} rawResult - Raw OCR result
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processed result
     */
    async postProcessOCRResult(rawResult, options) {
        const text = rawResult.rawText;
        
        // Enhanced language detection
        const languageResult = this.detectLanguage(text);
        
        // Enhanced document type detection
        const documentResult = this.detectDocumentType(text);
        
        // Extract structured data
        const structuredData = this.extractStructuredData(text, documentResult.type);
        
        // Calculate enhanced confidence
        const confidence = this.calculateEnhancedConfidence(text, rawResult, languageResult, documentResult);
        
        // Apply contextual corrections if enabled
        let correctedText = text;
        if (this.advancedFeatures.enableContextualCorrection) {
            correctedText = await this.applyContextualCorrections(text, languageResult, documentResult);
        }
        
        // Generate translation if needed
        let translation = null;
        if (options.enableTranslation && languageResult.primary !== options.language) {
            translation = await this.translateText(correctedText, languageResult.primary, options.language);
        }
        
        // Clean and format text
        const cleanedText = this.cleanExtractedText(correctedText);
        
        // Extract key-value pairs for structured documents
        const keyValuePairs = this.extractKeyValuePairs(cleanedText, documentResult.type);
        
        // Generate smart suggestions
        const suggestions = this.generateSmartSuggestions(cleanedText, documentResult, languageResult);
        
        return {
            text: cleanedText,
            originalText: text,
            structuredData: {
                ...structuredData,
                keyValuePairs,
                suggestions
            },
            detectedLanguage: languageResult.primary,
            languageDetails: languageResult,
            documentType: documentResult.type,
            documentDetails: documentResult,
            confidence,
            translation,
            metadata: {
                originalLength: text.length,
                cleanedLength: cleanedText.length,
                extractionAttempt: rawResult.attempt,
                detectedLanguages: this.detectAllLanguages(text),
                textQuality: this.assessTextQuality(cleanedText),
                processingFeatures: {
                    contextualCorrection: this.advancedFeatures.enableContextualCorrection,
                    multiLanguageSupport: languageResult.isMultiLanguage,
                    structuredExtraction: Object.keys(keyValuePairs).length > 0
                }
            }
        };
    }

    /**
     * Enhanced language detection with confidence scoring
     * @param {string} text - Text to analyze
     * @returns {Object} Detection result with confidence
     */
    detectLanguage(text) {
        const scores = {};
        const confidenceScores = {};
        
        Object.entries(this.languagePatterns).forEach(([lang, config]) => {
            let score = 0;
            let confidence = 0;
            
            // Character pattern matching
            const charMatches = text.match(new RegExp(config.pattern, 'g'));
            const charScore = charMatches ? charMatches.length : 0;
            
            // Common words detection
            const wordMatches = config.commonWords.filter(word => 
                text.toLowerCase().includes(word.toLowerCase())
            ).length;
            
            // Numeral detection
            const numeralMatches = text.match(new RegExp(config.numerals, 'g'));
            const numeralScore = numeralMatches ? numeralMatches.length : 0;
            
            // Calculate weighted score
            score = (charScore * 0.6) + (wordMatches * 0.3) + (numeralScore * 0.1);
            score *= config.weight;
            
            // Calculate confidence based on text coverage
            const textLength = text.length;
            confidence = Math.min((charScore / textLength) * 100, 100);
            
            scores[lang] = score;
            confidenceScores[lang] = confidence;
        });
        
        // Find language with highest score
        const detectedLang = Object.entries(scores).reduce((a, b) => 
            scores[a[0]] > scores[b[0]] ? a : b
        )[0];
        
        const primaryLanguage = scores[detectedLang] > 0 ? detectedLang : 'unknown';
        const confidence = confidenceScores[primaryLanguage] || 0;
        
        return {
            primary: primaryLanguage,
            confidence: confidence,
            allScores: scores,
            isMultiLanguage: Object.values(scores).filter(score => score > 0).length > 1
        };
    }

    /**
     * Detect all languages present in text
     * @param {string} text - Text to analyze
     * @returns {Array} Array of detected languages
     */
    detectAllLanguages(text) {
        const languages = [];
        
        Object.entries(this.languagePatterns).forEach(([lang, pattern]) => {
            if (pattern.test(text)) {
                languages.push(lang);
            }
        });
        
        return languages;
    }

    /**
     * Enhanced document type detection with confidence scoring
     * @param {string} text - Text to analyze
     * @returns {Object} Detection result with confidence and metadata
     */
    detectDocumentType(text) {
        const lowerText = text.toLowerCase();
        const typeScores = {};
        const detectedPatterns = {};
        
        Object.entries(this.documentPatterns).forEach(([type, config]) => {
            let score = 0;
            const foundKeywords = [];
            const foundPatterns = [];
            
            // Keyword matching
            config.keywords.forEach(keyword => {
                if (lowerText.includes(keyword.toLowerCase())) {
                    foundKeywords.push(keyword);
                    score += 1;
                }
            });
            
            // Pattern matching
            config.patterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    foundPatterns.push(matches[0]);
                    score += 2; // Patterns have higher weight
                }
            });
            
            // Required fields bonus
            const extractedData = this.extractStructuredData(text, type);
            const hasRequiredFields = config.requiredFields.every(field => 
                extractedData.extractedFields[field] && 
                extractedData.extractedFields[field].length > 0
            );
            
            if (hasRequiredFields) {
                score += 3;
            }
            
            typeScores[type] = score * config.confidence;
            detectedPatterns[type] = {
                keywords: foundKeywords,
                patterns: foundPatterns,
                hasRequiredFields
            };
        });
        
        // Find type with highest score
        const detectedType = Object.entries(typeScores).reduce((a, b) => 
            typeScores[a[0]] > typeScores[b[0]] ? a : b
        )[0];
        
        const finalType = typeScores[detectedType] > 0 ? detectedType : 'other';
        const confidence = typeScores[detectedType] || 0;
        
        return {
            type: finalType,
            confidence: Math.min(confidence / 10, 1), // Normalize to 0-1
            allScores: typeScores,
            detectedPatterns: detectedPatterns[finalType] || {},
            alternativeTypes: Object.entries(typeScores)
                .filter(([type, score]) => type !== finalType && score > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([type, score]) => ({ type, confidence: score / 10 }))
        };
    }

    /**
     * Extract structured data based on document type
     * @param {string} text - Text to analyze
     * @param {string} documentType - Document type
     * @returns {Object} Structured data
     */
    extractStructuredData(text, documentType) {
        const data = {
            documentType,
            extractedFields: {}
        };
        
        // Common patterns
        const patterns = {
            date: /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b\d{1,2}\s+[A-Za-z]+\s+\d{2,4}\b/g,
            amount: /\b\d+[,.]?\d*\s*(?:₹|Rs|INR|USD|\$)\b|\b(?:₹|Rs|INR|USD|\$)\s*\d+[,.]?\d*\b/g,
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            phone: /\b(?:\+91|91)?[\s-]?[6-9]\d{9}\b/g,
            pincode: /\b\d{6}\b/g
        };
        
        // Extract common fields
        Object.entries(patterns).forEach(([field, pattern]) => {
            const matches = text.match(pattern);
            if (matches) {
                data.extractedFields[field] = [...new Set(matches)];
            }
        });
        
        // Document-specific extraction
        switch (documentType) {
            case 'invoice':
                data.extractedFields.invoiceNumber = this.extractPattern(text, /(?:invoice|bill)\s*(?:no|number|#)?[:\s]*([A-Za-z0-9-]+)/i);
                data.extractedFields.gst = this.extractPattern(text, /(?:gst|gstin)[:\s]*([A-Z0-9]{15})/i);
                break;
                
            case 'id_document':
                data.extractedFields.idNumber = this.extractPattern(text, /(?:id|passport|license)\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i);
                break;
                
            case 'certificate':
                data.extractedFields.certificateNumber = this.extractPattern(text, /(?:certificate|cert)\s*(?:no|number)?[:\s]*([A-Za-z0-9-]+)/i);
                break;
        }
        
        return data;
    }

    /**
     * Extract pattern from text
     * @param {string} text - Text to search
     * @param {RegExp} pattern - Pattern to match
     * @returns {string|null} Matched value
     */
    extractPattern(text, pattern) {
        const match = text.match(pattern);
        return match ? match[1].trim() : null;
    }

    /**
     * Calculate enhanced confidence score with multiple factors
     * @param {string} text - Extracted text
     * @param {Object} rawResult - Raw result
     * @param {Object} languageResult - Language detection result
     * @param {Object} documentResult - Document type detection result
     * @returns {number} Enhanced confidence score (0-1)
     */
    calculateEnhancedConfidence(text, rawResult, languageResult, documentResult) {
        let confidence = 0.3; // Lower base confidence for more accurate scoring
        
        // Text length and quality factor
        const textLength = text.length;
        if (textLength > 200) {
            confidence += 0.15;
        } else if (textLength > 100) {
            confidence += 0.1;
        } else if (textLength > 50) {
            confidence += 0.05;
        }
        
        // Character quality factor (enhanced)
        const alphanumericRatio = (text.match(/[a-zA-Z0-9\u0B80-\u0BFF\u0900-\u097F]/g) || []).length / textLength;
        confidence += alphanumericRatio * 0.15;
        
        // Language detection confidence
        if (languageResult.confidence > 50) {
            confidence += 0.15;
        } else if (languageResult.confidence > 25) {
            confidence += 0.1;
        }
        
        // Document type detection confidence
        if (documentResult.confidence > 0.8) {
            confidence += 0.15;
        } else if (documentResult.confidence > 0.5) {
            confidence += 0.1;
        }
        
        // Extraction attempt factor
        if (rawResult.attempt === 1) {
            confidence += 0.1;
        } else {
            confidence -= (rawResult.attempt - 1) * 0.05;
        }
        
        // Structured data extraction factor
        const hasStructuredData = text.match(/\d{2}[\/-]\d{2}[\/-]\d{4}|₹\s*\d+|[A-Z0-9]{10,}/g);
        if (hasStructuredData && hasStructuredData.length > 0) {
            confidence += 0.1;
        }
        
        // Multi-language penalty (slightly lower confidence for mixed languages)
        if (languageResult.isMultiLanguage) {
            confidence -= 0.05;
        }
        
        return Math.max(0, Math.min(confidence, 1.0));
    }

    /**
     * Clean extracted text
     * @param {string} text - Raw extracted text
     * @returns {string} Cleaned text
     */
    cleanExtractedText(text) {
        return text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[\r\n]+/g, '\n') // Normalize line breaks
            .trim();
    }

    /**
     * Assess text quality
     * @param {string} text - Text to assess
     * @returns {string} Quality assessment
     */
    assessTextQuality(text) {
        const length = text.length;
        const alphanumericRatio = (text.match(/[a-zA-Z0-9]/g) || []).length / length;
        
        if (length > 200 && alphanumericRatio > 0.8) {
            return 'high';
        } else if (length > 50 && alphanumericRatio > 0.6) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Apply contextual corrections to extracted text
     * @param {string} text - Original text
     * @param {Object} languageResult - Language detection result
     * @param {Object} documentResult - Document type result
     * @returns {Promise<string>} Corrected text
     */
    async applyContextualCorrections(text, languageResult, documentResult) {
        let correctedText = text;
        
        // Common OCR error corrections
        const corrections = {
            // Number corrections
            'O': '0', 'l': '1', 'I': '1', 'S': '5', 'B': '8',
            // Tamil specific corrections
            'ள்': 'ள்', 'ண்': 'ண்', 'ன்': 'ன்',
            // Common word corrections
            'teh': 'the', 'adn': 'and', 'taht': 'that'
        };
        
        // Apply corrections based on document type
        if (documentResult.type === 'invoice' || documentResult.type === 'receipt') {
            // Fix common currency and number issues
            correctedText = correctedText.replace(/[Oo](?=\d)/g, '0');
            correctedText = correctedText.replace(/[Il](?=\d)/g, '1');
            correctedText = correctedText.replace(/₹\s*[Oo]/g, '₹0');
        }
        
        // Apply language-specific corrections
        if (languageResult.primary === 'tamil') {
            // Tamil-specific OCR corrections
            correctedText = correctedText.replace(/ள/g, 'ள்');
            correctedText = correctedText.replace(/ண/g, 'ண்');
        }
        
        return correctedText;
    }

    /**
     * Extract key-value pairs from structured documents
     * @param {string} text - Cleaned text
     * @param {string} documentType - Type of document
     * @returns {Object} Key-value pairs
     */
    extractKeyValuePairs(text, documentType) {
        const pairs = {};
        
        // Common patterns for key-value extraction
        const patterns = {
            date: /(?:date|தேதி|दिनांक)\s*:?\s*([\d\/\-\.]+)/gi,
            amount: /(?:amount|total|மொத்தம்|राशि)\s*:?\s*₹?\s*([\d,\.]+)/gi,
            number: /(?:number|no|எண்|संख्या)\s*:?\s*([A-Z0-9]+)/gi,
            name: /(?:name|பெயர்|नाम)\s*:?\s*([A-Za-z\s]+)/gi,
            phone: /(?:phone|mobile|தொலைபேசி|फोन)\s*:?\s*([\d\s\-\+]+)/gi,
            email: /(?:email|மின்னஞ்சல்|ईमेल)\s*:?\s*([\w\.\-]+@[\w\.\-]+)/gi
        };
        
        // Document-specific patterns
        if (documentType === 'invoice') {
            patterns.invoiceNumber = /(?:invoice|bill)\s*(?:no|number)?\s*:?\s*([A-Z0-9\-]+)/gi;
            patterns.gst = /(?:gst|gstin)\s*:?\s*([A-Z0-9]+)/gi;
        } else if (documentType === 'id_document') {
            patterns.idNumber = /(?:id|aadhaar|pan)\s*(?:no|number)?\s*:?\s*([A-Z0-9]+)/gi;
            patterns.dob = /(?:dob|birth|பிறந்த)\s*(?:date)?\s*:?\s*([\d\/\-\.]+)/gi;
        }
        
        // Extract pairs using patterns
        for (const [key, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern);
            if (matches) {
                pairs[key] = matches.map(match => {
                    const colonIndex = match.indexOf(':');
                    return colonIndex > -1 ? match.substring(colonIndex + 1).trim() : match.trim();
                });
            }
        }
        
        return pairs;
    }

    /**
     * Generate smart suggestions based on extracted content
     * @param {string} text - Cleaned text
     * @param {Object} documentResult - Document detection result
     * @param {Object} languageResult - Language detection result
     * @returns {Array} Smart suggestions
     */
    generateSmartSuggestions(text, documentResult, languageResult) {
        const suggestions = [];
        
        // Document-specific suggestions
        if (documentResult.type === 'invoice') {
            suggestions.push({
                type: 'action',
                text: 'Extract invoice details for accounting',
                action: 'extract_invoice_data'
            });
            
            if (text.includes('₹') || text.includes('total')) {
                suggestions.push({
                    type: 'insight',
                    text: 'Financial document detected - consider expense tracking',
                    category: 'finance'
                });
            }
        }
        
        if (documentResult.type === 'id_document') {
            suggestions.push({
                type: 'security',
                text: 'Identity document detected - ensure secure handling',
                priority: 'high'
            });
        }
        
        // Language-specific suggestions
        if (languageResult.isMultiLanguage) {
            suggestions.push({
                type: 'translation',
                text: `Multi-language document (${languageResult.languages.join(', ')}) - translation available`,
                languages: languageResult.languages
            });
        }
        
        if (languageResult.primary === 'tamil') {
            suggestions.push({
                type: 'localization',
                text: 'Tamil content detected - specialized processing available',
                language: 'tamil'
            });
        }
        
        // Content-based suggestions
        if (text.length < 50) {
            suggestions.push({
                type: 'quality',
                text: 'Short text detected - consider image quality improvement',
                recommendation: 'enhance_image'
            });
        }
        
        if (documentResult.confidence < 0.7) {
            suggestions.push({
                type: 'accuracy',
                text: 'Low confidence detection - manual review recommended',
                confidence: documentResult.confidence
            });
        }
        
        return suggestions;
    }

    /**
     * Translate text (enhanced with context awareness)
     * @param {string} text - Text to translate
     * @param {string} fromLang - Source language
     * @param {string} toLang - Target language
     * @returns {Promise<string>} Translated text
     */
    async translateText(text, fromLang, toLang) {
        // Enhanced placeholder for translation service integration
        // Could integrate with Google Translate API, Azure Translator, etc.
        
        // Add context-aware translation hints
        const contextHints = {
            tamil: 'Tamil document content',
            hindi: 'Hindi document content',
            english: 'English document content'
        };
        
        const hint = contextHints[fromLang] || 'Document content';
        return `[${hint} translated from ${fromLang} to ${toLang}]: ${text}`;
    }

    /**
     * Generate batch summary
     * @param {Array} results - Batch processing results
     * @returns {Object} Batch summary
     */
    generateBatchSummary(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        const languages = new Set();
        const documentTypes = new Set();
        let totalTextLength = 0;
        
        successful.forEach(result => {
            if (result.language) {languages.add(result.language);}
            if (result.documentType) {documentTypes.add(result.documentType);}
            if (result.extractedText) {totalTextLength += result.extractedText.length;}
        });
        
        return {
            totalProcessed: results.length,
            successful: successful.length,
            failed: failed.length,
            successRate: (successful.length / results.length) * 100,
            languagesDetected: Array.from(languages),
            documentTypesFound: Array.from(documentTypes),
            totalTextExtracted: totalTextLength,
            averageTextLength: successful.length > 0 ? totalTextLength / successful.length : 0
        };
    }

    /**
     * Update enhanced processing statistics
     * @param {number} processingTime - Processing time in ms
     * @param {boolean} success - Whether processing was successful
     * @param {Object} result - Processing result
     * @param {string} errorType - Type of error if failed
     */
    updateStats(processingTime, success, result = null, errorType = null) {
        this.stats.totalProcessed++;
        
        if (success && result) {
            this.stats.successfulExtractions++;
            
            // Language statistics
            if (result.detectedLanguage) {
                this.stats.languagesDetected.add(result.detectedLanguage);
            }
            
            // Document type statistics
            if (result.documentType) {
                this.stats.documentTypesProcessed.add(result.documentType);
                
                // Track processing time by document type
                if (!this.stats.processingTimesByType[result.documentType]) {
                    this.stats.processingTimesByType[result.documentType] = [];
                }
                this.stats.processingTimesByType[result.documentType].push(processingTime);
            }
            
            // Confidence tracking
            if (result.confidence !== undefined) {
                this.stats.confidenceScores.push(result.confidence);
            }
            
            // Text quality distribution
            if (result.metadata && result.metadata.textQuality) {
                this.stats.textQualityDistribution[result.metadata.textQuality]++;
            }
            
            // Multi-language document tracking
            if (result.languageDetails && result.languageDetails.isMultiLanguage) {
                this.stats.multiLanguageDocuments++;
            }
            
            // Text length tracking
            if (result.text) {
                this.stats.totalTextExtracted += result.text.length;
                this.stats.averageTextLength = this.stats.totalTextExtracted / this.stats.successfulExtractions;
            }
            
        } else {
            this.stats.failedExtractions++;
            
            // Error type tracking
            if (errorType) {
                if (!this.stats.errorTypes[errorType]) {
                    this.stats.errorTypes[errorType] = 0;
                }
                this.stats.errorTypes[errorType]++;
            }
        }
        
        // Update average processing time
        const totalTime = (this.stats.averageProcessingTime * (this.stats.totalProcessed - 1)) + processingTime;
        this.stats.averageProcessingTime = totalTime / this.stats.totalProcessed;
    }

    /**
     * Get processing statistics
     * @returns {Object} Current statistics
     */
    getStats() {
        return {
            ...this.stats,
            languagesDetected: Array.from(this.stats.languagesDetected),
            documentTypesProcessed: Array.from(this.stats.documentTypesProcessed),
            successRate: this.stats.totalProcessed > 0 ? 
                (this.stats.successfulExtractions / this.stats.totalProcessed) * 100 : 0
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalProcessed: 0,
            successfulExtractions: 0,
            failedExtractions: 0,
            averageProcessingTime: 0,
            languagesDetected: new Set(),
            documentTypesProcessed: new Set()
        };
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0) {return '0 B';}
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Check if processor is ready
     * @returns {boolean} Ready status
     */
    isReady() {
        return this.initialized && this.visionModel !== null;
    }
}

// Export for use in other modules
export { OCRProcessor };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OCRProcessor;
} else {
    window.OCRProcessor = OCRProcessor;
}

// Example usage:
// const ocrProcessor = new OCRProcessor('your-gemini-api-key');
// await ocrProcessor.initialize();
// const result = await ocrProcessor.processImage(imageFile, { language: 'tamil', enableTranslation: true });
// console.log('Extracted text:', result.extractedText);