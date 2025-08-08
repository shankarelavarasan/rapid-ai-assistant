/**
 * Document Classifier - Intelligent document categorization
 * Auto-categorizes documents with confidence scores and pattern recognition
 */

class DocumentClassifier {
    constructor(geminiProcessor, tamilPromptHelper) {
        this.geminiProcessor = geminiProcessor;
        this.tamilPromptHelper = tamilPromptHelper;
        
        // Document categories with Tamil translations
        this.categories = {
            bill: {
                english: 'Bill',
                tamil: 'பில்',
                keywords: ['bill', 'billing', 'charges', 'amount due', 'payment', 'பில்', 'கட்டணம்', 'செலுத்த வேண்டிய தொகை'],
                patterns: [/bill\s*no/i, /invoice\s*no/i, /amount\s*due/i, /total\s*amount/i],
                confidence: 0.8
            },
            invoice: {
                english: 'Invoice',
                tamil: 'விலைப்பட்டியல்',
                keywords: ['invoice', 'tax invoice', 'gst', 'cgst', 'sgst', 'igst', 'விலைப்பட்டியல்', 'வரி', 'ஜிஎஸ்டி'],
                patterns: [/invoice/i, /tax\s*invoice/i, /gst/i, /cgst/i, /sgst/i, /igst/i],
                confidence: 0.85
            },
            delivery_challan: {
                english: 'Delivery Challan',
                tamil: 'டெலிவரி சலான்',
                keywords: ['delivery challan', 'challan', 'dc', 'delivery note', 'டெலிவரி', 'சலான்', 'டிசி'],
                patterns: [/delivery\s*challan/i, /challan/i, /\bdc\b/i, /delivery\s*note/i],
                confidence: 0.8
            },
            report: {
                english: 'Report',
                tamil: 'அறிக்கை',
                keywords: ['report', 'analysis', 'summary', 'findings', 'conclusion', 'அறிக்கை', 'பகுப்பாய்வு', 'சுருக்கம்'],
                patterns: [/report/i, /analysis/i, /summary/i, /findings/i, /conclusion/i],
                confidence: 0.75
            },
            scanned_copy: {
                english: 'Scanned Copy',
                tamil: 'ஸ்கேன் நகல்',
                keywords: ['scanned', 'copy', 'scan', 'photocopy', 'ஸ்கேன்', 'நகல்', 'போட்டோகாப்பி'],
                patterns: [/scanned/i, /scan/i, /copy/i, /photocopy/i],
                confidence: 0.7
            },
            letter: {
                english: 'Letter',
                tamil: 'கடிதம்',
                keywords: ['letter', 'correspondence', 'communication', 'memo', 'கடிதம்', 'கடிதப் பரிமாற்றம்'],
                patterns: [/dear\s+sir/i, /yours\s+sincerely/i, /yours\s+faithfully/i, /letter/i],
                confidence: 0.75
            },
            contract: {
                english: 'Contract',
                tamil: 'ஒப்பந்தம்',
                keywords: ['contract', 'agreement', 'terms', 'conditions', 'ஒப்பந்தம்', 'உடன்படிக்கை', 'நிபந்தனைகள்'],
                patterns: [/contract/i, /agreement/i, /terms\s+and\s+conditions/i, /whereas/i],
                confidence: 0.8
            },
            certificate: {
                english: 'Certificate',
                tamil: 'சான்றிதழ்',
                keywords: ['certificate', 'certification', 'certified', 'சான்றிதழ்', 'சான்று', 'சான்றளிக்கப்பட்ட'],
                patterns: [/certificate/i, /certification/i, /certified/i, /this\s+is\s+to\s+certify/i],
                confidence: 0.8
            },
            receipt: {
                english: 'Receipt',
                tamil: 'ரசீது',
                keywords: ['receipt', 'received', 'payment received', 'ரசீது', 'பெறப்பட்டது', 'பணம் பெறப்பட்டது'],
                patterns: [/receipt/i, /received/i, /payment\s+received/i, /acknowledgment/i],
                confidence: 0.8
            },
            other: {
                english: 'Other',
                tamil: 'பிற',
                keywords: [],
                patterns: [],
                confidence: 0.5
            }
        };
        
        // Classification rules and weights
        this.classificationRules = {
            keywordWeight: 0.3,
            patternWeight: 0.4,
            aiAnalysisWeight: 0.3,
            minimumConfidence: 0.6
        };
        
        // Cache for classification results
        this.classificationCache = new Map();
    }

    /**
     * Classify a document with confidence score
     * @param {File|string} document - Document to classify
     * @param {string} language - Language preference
     * @param {Object} options - Classification options
     * @returns {Promise<Object>} Classification result
     */
    async classifyDocument(document, language = 'tamil', options = {}) {
        const startTime = Date.now();
        
        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey(document);
            
            // Check cache first
            if (this.classificationCache.has(cacheKey) && !options.forceRefresh) {
                return this.classificationCache.get(cacheKey);
            }
            
            // Extract text content
            const textContent = await this.extractTextContent(document);
            
            // Perform multi-level classification
            const keywordAnalysis = this.analyzeKeywords(textContent);
            const patternAnalysis = this.analyzePatterns(textContent);
            const aiAnalysis = await this.performAIAnalysis(document, language);
            
            // Combine results with weighted scoring
            const finalClassification = this.combineAnalysisResults(
                keywordAnalysis,
                patternAnalysis,
                aiAnalysis
            );
            
            // Add metadata
            const result = {
                ...finalClassification,
                metadata: {
                    processingTime: Date.now() - startTime,
                    language,
                    analysisMethod: 'hybrid',
                    cacheKey,
                    timestamp: new Date().toISOString()
                },
                details: {
                    keywordAnalysis,
                    patternAnalysis,
                    aiAnalysis
                }
            };
            
            // Cache the result
            this.classificationCache.set(cacheKey, result);
            
            return result;
            
        } catch (error) {
            console.error('Document classification error:', error);
            return {
                category: 'other',
                categoryLabel: {
                    english: 'Other',
                    tamil: 'பிற'
                },
                confidence: 0.1,
                reason: `Classification failed: ${error.message}`,
                error: true,
                metadata: {
                    processingTime: Date.now() - startTime,
                    language,
                    error: error.message
                }
            };
        }
    }

    /**
     * Analyze keywords in text content
     * @param {string} textContent - Text to analyze
     * @returns {Object} Keyword analysis result
     */
    analyzeKeywords(textContent) {
        const text = textContent.toLowerCase();
        const results = {};
        
        for (const [categoryKey, category] of Object.entries(this.categories)) {
            let score = 0;
            const foundKeywords = [];
            
            for (const keyword of category.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score += 1;
                    foundKeywords.push(keyword);
                }
            }
            
            // Normalize score
            const normalizedScore = category.keywords.length > 0 ? 
                score / category.keywords.length : 0;
            
            results[categoryKey] = {
                score: normalizedScore,
                foundKeywords,
                weight: this.classificationRules.keywordWeight
            };
        }
        
        return results;
    }

    /**
     * Analyze patterns in text content
     * @param {string} textContent - Text to analyze
     * @returns {Object} Pattern analysis result
     */
    analyzePatterns(textContent) {
        const results = {};
        
        for (const [categoryKey, category] of Object.entries(this.categories)) {
            let score = 0;
            const foundPatterns = [];
            
            for (const pattern of category.patterns) {
                if (pattern.test(textContent)) {
                    score += 1;
                    foundPatterns.push(pattern.source);
                }
            }
            
            // Normalize score
            const normalizedScore = category.patterns.length > 0 ? 
                score / category.patterns.length : 0;
            
            results[categoryKey] = {
                score: normalizedScore,
                foundPatterns,
                weight: this.classificationRules.patternWeight
            };
        }
        
        return results;
    }

    /**
     * Perform AI-based classification analysis
     * @param {File|string} document - Document to analyze
     * @param {string} language - Language preference
     * @returns {Promise<Object>} AI analysis result
     */
    async performAIAnalysis(document, language) {
        try {
            const prompt = this.tamilPromptHelper.getClassificationPrompt(language, true);
            const aiResponse = await this.geminiProcessor.processDocument(document, prompt);
            
            // Parse AI response
            const parsedResponse = this.parseAIResponse(aiResponse);
            
            return {
                category: parsedResponse.category,
                confidence: parsedResponse.confidence,
                reason: parsedResponse.reason,
                weight: this.classificationRules.aiAnalysisWeight,
                rawResponse: aiResponse
            };
            
        } catch (error) {
            console.error('AI analysis failed:', error);
            return {
                category: 'other',
                confidence: 0.1,
                reason: 'AI analysis failed',
                weight: this.classificationRules.aiAnalysisWeight,
                error: error.message
            };
        }
    }

    /**
     * Combine analysis results with weighted scoring
     * @param {Object} keywordAnalysis - Keyword analysis results
     * @param {Object} patternAnalysis - Pattern analysis results
     * @param {Object} aiAnalysis - AI analysis results
     * @returns {Object} Combined classification result
     */
    combineAnalysisResults(keywordAnalysis, patternAnalysis, aiAnalysis) {
        const combinedScores = {};
        
        // Calculate weighted scores for each category
        for (const categoryKey of Object.keys(this.categories)) {
            const keywordScore = (keywordAnalysis[categoryKey]?.score || 0) * 
                this.classificationRules.keywordWeight;
            const patternScore = (patternAnalysis[categoryKey]?.score || 0) * 
                this.classificationRules.patternWeight;
            const aiScore = (aiAnalysis.category === categoryKey ? aiAnalysis.confidence : 0) * 
                this.classificationRules.aiAnalysisWeight;
            
            combinedScores[categoryKey] = keywordScore + patternScore + aiScore;
        }
        
        // Find the category with highest score
        const bestCategory = Object.entries(combinedScores)
            .reduce((best, [category, score]) => 
                score > best.score ? { category, score } : best,
                { category: 'other', score: 0 }
            );
        
        // Check if confidence meets minimum threshold
        const finalCategory = bestCategory.score >= this.classificationRules.minimumConfidence ? 
            bestCategory.category : 'other';
        
        const categoryInfo = this.categories[finalCategory];
        
        return {
            category: finalCategory,
            categoryLabel: {
                english: categoryInfo.english,
                tamil: categoryInfo.tamil
            },
            confidence: Math.min(bestCategory.score, 1.0),
            reason: this.generateClassificationReason(finalCategory, keywordAnalysis, patternAnalysis, aiAnalysis),
            alternativeCategories: this.getAlternativeCategories(combinedScores, finalCategory),
            scores: combinedScores
        };
    }

    /**
     * Generate classification reason
     * @param {string} category - Selected category
     * @param {Object} keywordAnalysis - Keyword analysis
     * @param {Object} patternAnalysis - Pattern analysis
     * @param {Object} aiAnalysis - AI analysis
     * @returns {string} Classification reason
     */
    generateClassificationReason(category, keywordAnalysis, patternAnalysis, aiAnalysis) {
        const reasons = [];
        
        if (keywordAnalysis[category]?.foundKeywords.length > 0) {
            reasons.push(`Keywords found: ${keywordAnalysis[category].foundKeywords.join(', ')}`);
        }
        
        if (patternAnalysis[category]?.foundPatterns.length > 0) {
            reasons.push(`Patterns matched: ${patternAnalysis[category].foundPatterns.length}`);
        }
        
        if (aiAnalysis.category === category && aiAnalysis.reason) {
            reasons.push(`AI analysis: ${aiAnalysis.reason}`);
        }
        
        return reasons.length > 0 ? reasons.join('; ') : 'Default classification';
    }

    /**
     * Get alternative categories with scores
     * @param {Object} scores - All category scores
     * @param {string} selectedCategory - Selected category
     * @returns {Array} Alternative categories
     */
    getAlternativeCategories(scores, selectedCategory) {
        return Object.entries(scores)
            .filter(([category]) => category !== selectedCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category, score]) => ({
                category,
                categoryLabel: {
                    english: this.categories[category].english,
                    tamil: this.categories[category].tamil
                },
                confidence: Math.min(score, 1.0)
            }));
    }

    /**
     * Extract text content from document
     * @param {File|string} document - Document to extract text from
     * @returns {Promise<string>} Extracted text
     */
    async extractTextContent(document) {
        if (typeof document === 'string') {
            return document;
        }
        
        if (document instanceof File) {
            if (document.type === 'text/plain') {
                return await document.text();
            } else if (document.type === 'application/pdf') {
                // For PDF files, we'll rely on AI analysis
                return '';
            } else if (document.type.startsWith('image/')) {
                // For images, we'll rely on OCR through AI
                return '';
            }
        }
        
        return '';
    }

    /**
     * Parse AI response for classification
     * @param {string} aiResponse - AI response text
     * @returns {Object} Parsed classification
     */
    parseAIResponse(aiResponse) {
        try {
            // Try to parse as JSON first
            const jsonMatch = aiResponse.match(/\{[^}]+\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    category: this.mapCategoryFromAI(parsed.category || parsed.classification),
                    confidence: parsed.confidence || 0.7,
                    reason: parsed.reason || parsed.explanation || 'AI classification'
                };
            }
            
            // Fallback to text parsing
            const categoryMatch = aiResponse.match(/(?:category|classification):\s*([^\n,]+)/i);
            const confidenceMatch = aiResponse.match(/(?:confidence|certainty):\s*(\d+(?:\.\d+)?)/i);
            
            return {
                category: this.mapCategoryFromAI(categoryMatch ? categoryMatch[1].trim() : 'other'),
                confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) / 100 : 0.7,
                reason: 'AI text analysis'
            };
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                category: 'other',
                confidence: 0.5,
                reason: 'Failed to parse AI response'
            };
        }
    }

    /**
     * Map AI category response to internal categories
     * @param {string} aiCategory - Category from AI
     * @returns {string} Mapped category
     */
    mapCategoryFromAI(aiCategory) {
        if (!aiCategory) {return 'other';}
        
        const normalized = aiCategory.toLowerCase().trim();
        
        // Direct mapping
        const mappings = {
            'bill': 'bill',
            'invoice': 'invoice',
            'delivery challan': 'delivery_challan',
            'challan': 'delivery_challan',
            'report': 'report',
            'scanned copy': 'scanned_copy',
            'letter': 'letter',
            'contract': 'contract',
            'certificate': 'certificate',
            'receipt': 'receipt',
            'பில்': 'bill',
            'விலைப்பட்டியல்': 'invoice',
            'டெலிவரி சலான்': 'delivery_challan',
            'அறிக்கை': 'report',
            'ஸ்கேன் நகல்': 'scanned_copy',
            'கடிதம்': 'letter',
            'ஒப்பந்தம்': 'contract',
            'சான்றிதழ்': 'certificate',
            'ரசீது': 'receipt'
        };
        
        return mappings[normalized] || 'other';
    }

    /**
     * Generate cache key for document
     * @param {File|string} document - Document
     * @returns {string} Cache key
     */
    generateCacheKey(document) {
        if (typeof document === 'string') {
            return `text_${this.hashString(document)}`;
        }
        
        if (document instanceof File) {
            return `file_${document.name}_${document.size}_${document.lastModified}`;
        }
        
        return `unknown_${Date.now()}`;
    }

    /**
     * Simple string hashing function
     * @param {string} str - String to hash
     * @returns {string} Hash
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    /**
     * Clear classification cache
     */
    clearCache() {
        this.classificationCache.clear();
    }

    /**
     * Get classification statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        return {
            cacheSize: this.classificationCache.size,
            categories: Object.keys(this.categories),
            totalCategories: Object.keys(this.categories).length,
            classificationRules: this.classificationRules
        };
    }

    /**
     * Update classification rules
     * @param {Object} newRules - New rules
     */
    updateClassificationRules(newRules) {
        this.classificationRules = { ...this.classificationRules, ...newRules };
    }

    /**
     * Add custom category
     * @param {string} key - Category key
     * @param {Object} categoryData - Category data
     */
    addCustomCategory(key, categoryData) {
        this.categories[key] = {
            english: categoryData.english,
            tamil: categoryData.tamil,
            keywords: categoryData.keywords || [],
            patterns: categoryData.patterns || [],
            confidence: categoryData.confidence || 0.7
        };
    }
}

// Export for use in other modules
export { DocumentClassifier };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentClassifier;
} else {
    window.DocumentClassifier = DocumentClassifier;
}

// Example usage:
// const classifier = new DocumentClassifier(geminiProcessor, tamilPromptHelper);
// const result = await classifier.classifyDocument(file, 'tamil');
// console.log('Classification:', result.category, 'Confidence:', result.confidence);