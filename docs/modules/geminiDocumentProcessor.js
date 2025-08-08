/**
 * Enhanced Gemini Document Processor
 * Provides intelligent document analysis with vision model support
 */

class GeminiDocumentProcessor {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.genAI = null;
        this.textModel = null;
        this.visionModel = null;
        this.initialized = false;
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxFileSize = 20 * 1024 * 1024; // 20MB for vision model
    }

    /**
     * Initialize Gemini AI models
     */
    async initialize() {
        try {
            if (!this.apiKey) {
                throw new Error('Gemini API key is required');
            }

            // Import GoogleGenerativeAI dynamically
            const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
            
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            
            // Initialize models
            this.textModel = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro",
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            });
            
            this.visionModel = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro-vision-latest",
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 0.9,
                    maxOutputTokens: 4096,
                }
            });

            this.initialized = true;
            console.log('Gemini Document Processor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Gemini Document Processor:', error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }

    /**
     * Process a single document with intelligent analysis
     */
    async processDocument(file, prompt, language = 'en', options = {}) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const fileContent = await this.extractContent(file);
            const model = this.selectModel(file.type);
            
            const enhancedPrompt = this.buildEnhancedPrompt({
                content: fileContent,
                prompt: prompt,
                language: language,
                fileName: file.name,
                fileType: file.type,
                options: options
            });

            const result = await model.generateContent(enhancedPrompt);
            const responseText = result.response.text();
            
            return this.parseResponse(responseText, file.name);

        } catch (error) {
            console.error(`Error processing document ${file.name}:`, error);
            return {
                success: false,
                fileName: file.name,
                error: error.message,
                summary: 'Failed to process document',
                suggestedName: file.name,
                classification: 'unknown',
                extractedData: {},
                tags: [],
                confidence: 0
            };
        }
    }

    /**
     * Process multiple documents with collective analysis
     */
    async processMultipleDocuments(files, prompt, language = 'en', options = {}) {
        const results = [];
        const batchSize = options.batchSize || 3;
        
        try {
            // Process files in batches
            for (let i = 0; i < files.length; i += batchSize) {
                const batch = files.slice(i, i + batchSize);
                const batchPromises = batch.map(file => 
                    this.processDocument(file, prompt, language, options)
                );
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        results.push({
                            success: false,
                            fileName: batch[index].name,
                            error: result.reason.message,
                            summary: 'Processing failed',
                            suggestedName: batch[index].name,
                            classification: 'unknown',
                            extractedData: {},
                            tags: [],
                            confidence: 0
                        });
                    }
                });
                
                // Add delay between batches to respect rate limits
                if (i + batchSize < files.length) {
                    await this.delay(1000);
                }
            }

            // Generate collective analysis
            const collectiveAnalysis = await this.generateCollectiveInsights(results, prompt, language);
            
            return {
                individualResults: results,
                collectiveAnalysis: collectiveAnalysis,
                summary: this.generateProcessingSummary(results),
                totalProcessed: results.length,
                successCount: results.filter(r => r.success).length,
                failureCount: results.filter(r => !r.success).length
            };

        } catch (error) {
            console.error('Error in batch processing:', error);
            throw new Error(`Batch processing failed: ${error.message}`);
        }
    }

    /**
     * Extract content from file based on type
     */
    async extractContent(file) {
        try {
            if (this.supportedImageTypes.includes(file.type)) {
                // For images, return base64 data for vision model
                return await this.fileToBase64(file);
            } else if (file.type === 'application/pdf') {
                // For PDFs, extract text or use vision model
                return await this.extractPDFContent(file);
            } else if (file.type.startsWith('text/') || 
                       file.type.includes('document') || 
                       file.type.includes('word')) {
                // For text-based files
                return await this.extractTextContent(file);
            } else {
                // Fallback: try to read as text
                return await this.extractTextContent(file);
            }
        } catch (error) {
            console.error('Content extraction error:', error);
            return `[Content extraction failed: ${error.message}]`;
        }
    }

    /**
     * Select appropriate model based on file type
     */
    selectModel(fileType) {
        if (this.supportedImageTypes.includes(fileType) || fileType === 'application/pdf') {
            return this.visionModel;
        }
        return this.textModel;
    }

    /**
     * Build enhanced prompt for intelligent processing
     */
    buildEnhancedPrompt({ content, prompt, language, fileName, fileType, options }) {
        const isImage = this.supportedImageTypes.includes(fileType);
        const languageInstruction = language === 'ta' ? 'தமிழில்' : 'in English';
        
        let enhancedPrompt = `
Document Analysis Task:
File: ${fileName}
Type: ${fileType}
Language: ${language === 'ta' ? 'Tamil' : 'English'}
User Request: ${prompt}

Please analyze this document and provide a comprehensive response ${languageInstruction} with the following structure:

1. Document Summary (${languageInstruction})
2. Suggested Filename (descriptive and organized)
3. Document Type Classification (BILL, INVOICE, DELIVERY_CHALLAN, REPORT, SCANNED_COPY, CONTRACT, RECEIPT, OTHER)
4. Key Data Extraction (important information, dates, amounts, names, etc.)
5. Organization Tags (for categorization and search)
6. Confidence Score (0-100 for classification accuracy)
7. Processing Notes (any observations or recommendations)

Format your response as valid JSON:
{
  "summary": "...",
  "suggestedName": "...",
  "classification": "...",
  "extractedData": {
    "dates": [],
    "amounts": [],
    "entities": [],
    "keyInfo": {}
  },
  "tags": [],
  "confidence": 0,
  "processingNotes": "...",
  "language": "${language}"
}

`;

        if (isImage) {
            // For images, the content will be passed separately
            enhancedPrompt += "Please analyze the image content and extract all visible text and information.";
        } else {
            enhancedPrompt += `Document Content:\n${content}`;
        }

        return enhancedPrompt;
    }

    /**
     * Parse and validate response from Gemini
     */
    parseResponse(responseText, fileName) {
        try {
            // Clean the response text
            let cleanedResponse = responseText.trim();
            
            // Remove markdown code blocks if present
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            // Try to parse JSON
            const parsed = JSON.parse(cleanedResponse);
            
            // Validate and set defaults
            return {
                success: true,
                fileName: fileName,
                summary: parsed.summary || 'No summary available',
                suggestedName: parsed.suggestedName || fileName,
                classification: parsed.classification || 'OTHER',
                extractedData: parsed.extractedData || {},
                tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
                processingNotes: parsed.processingNotes || '',
                language: parsed.language || 'en',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Response parsing error:', error);
            
            // Fallback: extract information from raw text
            return {
                success: true,
                fileName: fileName,
                summary: responseText.substring(0, 500) + '...',
                suggestedName: fileName,
                classification: 'OTHER',
                extractedData: {},
                tags: ['processed'],
                confidence: 30,
                processingNotes: 'Response parsing failed, using raw text',
                language: 'en',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Generate collective insights from multiple processed documents
     */
    async generateCollectiveInsights(results, originalPrompt, language) {
        try {
            const successfulResults = results.filter(r => r.success);
            
            if (successfulResults.length === 0) {
                return {
                    overview: 'No documents were successfully processed',
                    patterns: [],
                    recommendations: [],
                    summary: 'Processing failed for all documents'
                };
            }

            const insightPrompt = `
Analyze the following processed documents and provide collective insights ${language === 'ta' ? 'தமிழில்' : 'in English'}:

Original Request: ${originalPrompt}
Processed Documents: ${successfulResults.length}

Document Summaries:
${successfulResults.map((r, i) => `${i + 1}. ${r.fileName}: ${r.summary}`).join('\n')}

Classifications:
${successfulResults.map(r => `- ${r.fileName}: ${r.classification}`).join('\n')}

Provide insights in JSON format:
{
  "overview": "Overall analysis of the document collection",
  "patterns": ["Pattern 1", "Pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "summary": "Brief summary of findings",
  "organizationSuggestions": {
    "folderStructure": {},
    "namingConventions": []
  }
}
`;

            const result = await this.textModel.generateContent(insightPrompt);
            const responseText = result.response.text();
            
            return this.parseCollectiveInsights(responseText);
            
        } catch (error) {
            console.error('Error generating collective insights:', error);
            return {
                overview: 'Failed to generate collective insights',
                patterns: [],
                recommendations: [],
                summary: `Error: ${error.message}`
            };
        }
    }

    /**
     * Parse collective insights response
     */
    parseCollectiveInsights(responseText) {
        try {
            let cleanedResponse = responseText.trim();
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            const parsed = JSON.parse(cleanedResponse);
            
            return {
                overview: parsed.overview || 'No overview available',
                patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
                summary: parsed.summary || 'No summary available',
                organizationSuggestions: parsed.organizationSuggestions || {}
            };
            
        } catch (error) {
            return {
                overview: responseText.substring(0, 300),
                patterns: [],
                recommendations: [],
                summary: 'Insights parsing failed'
            };
        }
    }

    /**
     * Generate processing summary
     */
    generateProcessingSummary(results) {
        const total = results.length;
        const successful = results.filter(r => r.success).length;
        const failed = total - successful;
        
        const classifications = {};
        results.forEach(r => {
            if (r.success) {
                classifications[r.classification] = (classifications[r.classification] || 0) + 1;
            }
        });
        
        return {
            totalFiles: total,
            successfullyProcessed: successful,
            failed: failed,
            successRate: Math.round((successful / total) * 100),
            classifications: classifications,
            averageConfidence: Math.round(
                results.filter(r => r.success)
                       .reduce((sum, r) => sum + r.confidence, 0) / successful
            ) || 0
        };
    }

    /**
     * Utility: Convert file to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Utility: Extract text content from file
     */
    async extractTextContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Utility: Extract PDF content (simplified)
     */
    async extractPDFContent(file) {
        // For now, return base64 for vision model processing
        // In a full implementation, you might use PDF.js
        return await this.fileToBase64(file);
    }

    /**
     * Utility: Add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get processing statistics
     */
    getProcessingStats() {
        return {
            initialized: this.initialized,
            modelsAvailable: {
                text: !!this.textModel,
                vision: !!this.visionModel
            },
            supportedImageTypes: this.supportedImageTypes,
            maxFileSize: this.maxFileSize
        };
    }
}

// Export for use in other modules
export { GeminiDocumentProcessor };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiDocumentProcessor;
} else {
    window.GeminiDocumentProcessor = GeminiDocumentProcessor;
}