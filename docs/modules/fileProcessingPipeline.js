/**
 * File Processing Pipeline - Comprehensive file processing workflow
 * Handles validation, extraction, processing, formatting, and output generation
 */

class FileProcessingPipeline {
    constructor(geminiProcessor, tamilPromptHelper, documentClassifier, resultsManager) {
        this.geminiProcessor = geminiProcessor;
        this.tamilPromptHelper = tamilPromptHelper;
        this.documentClassifier = documentClassifier;
        this.resultsManager = resultsManager;
        
        // Pipeline stages configuration
        this.stages = {
            validation: {
                name: 'File Validation',
                enabled: true,
                timeout: 5000
            },
            extraction: {
                name: 'Content Extraction',
                enabled: true,
                timeout: 15000
            },
            processing: {
                name: 'AI Processing',
                enabled: true,
                timeout: 30000
            },
            classification: {
                name: 'Document Classification',
                enabled: true,
                timeout: 10000
            },
            formatting: {
                name: 'Result Formatting',
                enabled: true,
                timeout: 5000
            },
            output: {
                name: 'Output Generation',
                enabled: true,
                timeout: 10000
            }
        };
        
        // Processing configuration
        this.config = {
            maxFileSize: 50 * 1024 * 1024, // 50MB
            supportedTypes: [
                'application/pdf',
                'text/plain',
                'text/csv',
                'application/json',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/bmp',
                'image/tiff'
            ],
            defaultLanguage: 'tamil',
            enableParallelProcessing: true,
            retryAttempts: 2,
            enableCaching: true
        };
        
        // Event handlers
        this.eventHandlers = {
            stageStart: [],
            stageComplete: [],
            stageError: [],
            pipelineComplete: [],
            pipelineError: []
        };
        
        // Processing cache
        this.cache = new Map();
        
        // Performance metrics
        this.metrics = {
            totalProcessed: 0,
            successfulProcessed: 0,
            failedProcessed: 0,
            averageProcessingTime: 0,
            stageMetrics: {}
        };
    }

    /**
     * Add event listener
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    addEventListener(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].push(handler);
        }
    }

    /**
     * Emit event
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Process single file through the pipeline
     * @param {File} file - File to process
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processing result
     */
    async processFile(file, options = {}) {
        const startTime = Date.now();
        const processingId = this.generateProcessingId();
        
        const processingOptions = {
            language: this.config.defaultLanguage,
            enableClassification: true,
            enableSummary: true,
            enableDataExtraction: true,
            enableOCR: true,
            enableNaming: true,
            outputFormat: 'structured',
            ...options
        };
        
        const context = {
            processingId,
            file,
            options: processingOptions,
            startTime,
            currentStage: null,
            stageResults: {},
            errors: [],
            warnings: []
        };
        
        try {
            // Execute pipeline stages
            await this.executeStage('validation', context);
            await this.executeStage('extraction', context);
            await this.executeStage('processing', context);
            await this.executeStage('classification', context);
            await this.executeStage('formatting', context);
            await this.executeStage('output', context);
            
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            // Update metrics
            this.updateMetrics(processingTime, true);
            
            const result = {
                processingId,
                success: true,
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                },
                processing: {
                    startTime,
                    endTime,
                    duration: processingTime,
                    language: processingOptions.language,
                    stages: Object.keys(context.stageResults)
                },
                results: context.stageResults.output,
                metadata: {
                    warnings: context.warnings,
                    stageMetrics: this.calculateStageMetrics(context)
                }
            };
            
            this.emit('pipelineComplete', result);
            return result;
            
        } catch (error) {
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            // Update metrics
            this.updateMetrics(processingTime, false);
            
            const errorResult = {
                processingId,
                success: false,
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                processing: {
                    startTime,
                    endTime,
                    duration: processingTime,
                    failedStage: context.currentStage
                },
                error: {
                    message: error.message,
                    stage: context.currentStage,
                    details: error.details || null
                },
                partialResults: context.stageResults
            };
            
            this.emit('pipelineError', errorResult);
            return errorResult;
        }
    }

    /**
     * Execute a pipeline stage
     * @param {string} stageName - Stage name
     * @param {Object} context - Processing context
     */
    async executeStage(stageName, context) {
        const stage = this.stages[stageName];
        if (!stage || !stage.enabled) {
            return;
        }
        
        context.currentStage = stageName;
        const stageStartTime = Date.now();
        
        this.emit('stageStart', {
            processingId: context.processingId,
            stage: stageName,
            file: context.file.name
        });
        
        try {
            let result;
            
            // Execute stage with timeout
            const stagePromise = this.executeStageLogic(stageName, context);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Stage ${stageName} timeout`)), stage.timeout);
            });
            
            result = await Promise.race([stagePromise, timeoutPromise]);
            
            const stageEndTime = Date.now();
            const stageDuration = stageEndTime - stageStartTime;
            
            context.stageResults[stageName] = {
                result,
                duration: stageDuration,
                success: true
            };
            
            this.emit('stageComplete', {
                processingId: context.processingId,
                stage: stageName,
                duration: stageDuration,
                result
            });
            
        } catch (error) {
            const stageEndTime = Date.now();
            const stageDuration = stageEndTime - stageStartTime;
            
            context.stageResults[stageName] = {
                error: error.message,
                duration: stageDuration,
                success: false
            };
            
            this.emit('stageError', {
                processingId: context.processingId,
                stage: stageName,
                error: error.message,
                duration: stageDuration
            });
            
            throw new Error(`Stage ${stageName} failed: ${error.message}`);
        }
    }

    /**
     * Execute stage-specific logic
     * @param {string} stageName - Stage name
     * @param {Object} context - Processing context
     * @returns {Promise<*>} Stage result
     */
    async executeStageLogic(stageName, context) {
        switch (stageName) {
            case 'validation':
                return await this.validateFile(context.file, context.options);
            
            case 'extraction':
                return await this.extractContent(context.file, context.options);
            
            case 'processing':
                return await this.processContent(context.file, context.stageResults.extraction.result, context.options);
            
            case 'classification':
                return await this.classifyDocument(context.file, context.options);
            
            case 'formatting':
                return await this.formatResults(context.stageResults, context.options);
            
            case 'output':
                return await this.generateOutput(context.stageResults, context.options);
            
            default:
                throw new Error(`Unknown stage: ${stageName}`);
        }
    }

    /**
     * Validate file
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Validation result
     */
    async validateFile(file, options) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            }
        };
        
        // Check file size
        if (file.size > this.config.maxFileSize) {
            validation.errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.config.maxFileSize)})`);
            validation.isValid = false;
        }
        
        if (file.size === 0) {
            validation.errors.push('File is empty');
            validation.isValid = false;
        }
        
        // Check file type
        const isTypeSupported = this.config.supportedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -1));
            }
            return file.type === type;
        });
        
        if (!isTypeSupported) {
            validation.errors.push(`File type '${file.type}' is not supported`);
            validation.isValid = false;
        }
        
        // Check file name
        if (file.name.length > 255) {
            validation.warnings.push('File name is very long');
        }
        
        // Additional validations based on file type
        if (file.type.startsWith('image/')) {
            validation.fileCategory = 'image';
        } else if (file.type.includes('pdf')) {
            validation.fileCategory = 'pdf';
        } else if (file.type.startsWith('text/')) {
            validation.fileCategory = 'text';
        } else {
            validation.fileCategory = 'document';
        }
        
        if (!validation.isValid) {
            throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
        }
        
        return validation;
    }

    /**
     * Extract content from file
     * @param {File} file - File to extract content from
     * @param {Object} options - Extraction options
     * @returns {Promise<Object>} Extracted content
     */
    async extractContent(file, options) {
        const extraction = {
            textContent: '',
            metadata: {},
            extractionMethod: 'unknown'
        };
        
        try {
            if (file.type === 'text/plain') {
                extraction.textContent = await file.text();
                extraction.extractionMethod = 'direct';
            } else if (file.type === 'application/json') {
                const jsonContent = await file.text();
                extraction.textContent = jsonContent;
                extraction.metadata.parsedJson = JSON.parse(jsonContent);
                extraction.extractionMethod = 'json';
            } else if (file.type.startsWith('image/')) {
                // For images, we'll extract text using OCR in the processing stage
                extraction.textContent = '';
                extraction.extractionMethod = 'ocr_pending';
                extraction.metadata.isImage = true;
            } else if (file.type === 'application/pdf') {
                // For PDFs, we'll use AI processing
                extraction.textContent = '';
                extraction.extractionMethod = 'ai_pending';
                extraction.metadata.isPdf = true;
            } else {
                // For other document types, try to read as text
                try {
                    extraction.textContent = await file.text();
                    extraction.extractionMethod = 'text_fallback';
                } catch (error) {
                    extraction.extractionMethod = 'ai_pending';
                    extraction.metadata.extractionError = error.message;
                }
            }
            
            // Add file metadata
            extraction.metadata.fileSize = file.size;
            extraction.metadata.fileType = file.type;
            extraction.metadata.fileName = file.name;
            
            return extraction;
            
        } catch (error) {
            throw new Error(`Content extraction failed: ${error.message}`);
        }
    }

    /**
     * Process content using AI
     * @param {File} file - Original file
     * @param {Object} extractedContent - Extracted content
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processing results
     */
    async processContent(file, extractedContent, options) {
        const processing = {
            summary: null,
            suggestedName: null,
            extractedData: null,
            ocrText: null,
            analysis: null
        };
        
        try {
            // Generate summary
            if (options.enableSummary) {
                const summaryPrompt = this.tamilPromptHelper.getSummarizationPrompt(
                    'detailed', options.language
                );
                processing.summary = await this.geminiProcessor.processDocument(file, summaryPrompt);
            }
            
            // Generate suggested name
            if (options.enableNaming) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'document';
                const namingPrompt = this.tamilPromptHelper.getFileNamingPrompt(
                    fileType, options.language
                );
                processing.suggestedName = await this.geminiProcessor.processDocument(file, namingPrompt);
            }
            
            // Extract structured data
            if (options.enableDataExtraction) {
                const extractionPrompt = this.tamilPromptHelper.getDataExtractionPrompt(
                    'structured', options.language
                );
                const extractedDataRaw = await this.geminiProcessor.processDocument(file, extractionPrompt);
                processing.extractedData = this.parseExtractedData(extractedDataRaw);
            }
            
            // OCR for images
            if (options.enableOCR && file.type.startsWith('image/')) {
                const ocrPrompt = this.tamilPromptHelper.getOCRPrompt('mixed', options.language);
                processing.ocrText = await this.geminiProcessor.processDocument(file, ocrPrompt);
            }
            
            // General analysis
            const analysisPrompt = this.tamilPromptHelper.getAnalysisPrompt(
                'importance', options.language
            );
            processing.analysis = await this.geminiProcessor.processDocument(file, analysisPrompt);
            
            return processing;
            
        } catch (error) {
            throw new Error(`AI processing failed: ${error.message}`);
        }
    }

    /**
     * Classify document
     * @param {File} file - File to classify
     * @param {Object} options - Classification options
     * @returns {Promise<Object>} Classification result
     */
    async classifyDocument(file, options) {
        if (!options.enableClassification) {
            return {
                category: 'other',
                confidence: 0.5,
                reason: 'Classification disabled'
            };
        }
        
        try {
            return await this.documentClassifier.classifyDocument(file, options.language);
        } catch (error) {
            throw new Error(`Document classification failed: ${error.message}`);
        }
    }

    /**
     * Format processing results
     * @param {Object} stageResults - Results from all stages
     * @param {Object} options - Formatting options
     * @returns {Promise<Object>} Formatted results
     */
    async formatResults(stageResults, options) {
        const formatted = {
            file: stageResults.validation.result.fileInfo,
            classification: stageResults.classification.result,
            analysis: {
                summary: stageResults.processing.result.summary,
                suggestedName: stageResults.processing.result.suggestedName,
                extractedData: stageResults.processing.result.extractedData,
                ocrText: stageResults.processing.result.ocrText,
                generalAnalysis: stageResults.processing.result.analysis
            },
            metadata: {
                extraction: stageResults.extraction.result.metadata,
                processingLanguage: options.language,
                enabledFeatures: {
                    classification: options.enableClassification,
                    summary: options.enableSummary,
                    dataExtraction: options.enableDataExtraction,
                    ocr: options.enableOCR,
                    naming: options.enableNaming
                }
            },
            performance: {
                validationTime: stageResults.validation.duration,
                extractionTime: stageResults.extraction.duration,
                processingTime: stageResults.processing.duration,
                classificationTime: stageResults.classification.duration
            }
        };
        
        // Apply output format
        if (options.outputFormat === 'compact') {
            return this.compactFormat(formatted);
        } else if (options.outputFormat === 'detailed') {
            return this.detailedFormat(formatted);
        }
        
        return formatted;
    }

    /**
     * Generate final output
     * @param {Object} stageResults - Results from all stages
     * @param {Object} options - Output options
     * @returns {Promise<Object>} Final output
     */
    async generateOutput(stageResults, options) {
        const formattedResults = stageResults.formatting.result;
        
        const output = {
            ...formattedResults,
            generatedAt: new Date().toISOString(),
            processingPipeline: {
                version: '1.0.0',
                stages: Object.keys(stageResults),
                totalDuration: Object.values(stageResults).reduce((sum, stage) => sum + stage.duration, 0)
            }
        };
        
        // Add quality score
        output.qualityScore = this.calculateQualityScore(output);
        
        return output;
    }

    /**
     * Parse extracted data from AI response
     * @param {string} rawData - Raw extracted data
     * @returns {Object} Parsed data
     */
    parseExtractedData(rawData) {
        try {
            // Try to parse as JSON
            const jsonMatch = rawData.match(/\{[^}]+\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback to structured parsing
            const lines = rawData.split('\n');
            const data = {};
            
            lines.forEach(line => {
                const match = line.match(/^([^:]+):\s*(.+)$/);
                if (match) {
                    const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
                    const value = match[2].trim();
                    data[key] = value;
                }
            });
            
            return data;
            
        } catch (error) {
            console.error('Error parsing extracted data:', error);
            return { raw: rawData, parseError: error.message };
        }
    }

    /**
     * Calculate quality score for processing result
     * @param {Object} result - Processing result
     * @returns {number} Quality score (0-1)
     */
    calculateQualityScore(result) {
        let score = 0;
        let factors = 0;
        
        // Classification confidence
        if (result.classification && result.classification.confidence) {
            score += result.classification.confidence;
            factors++;
        }
        
        // Summary quality (based on length and content)
        if (result.analysis.summary) {
            const summaryLength = result.analysis.summary.length;
            if (summaryLength > 50 && summaryLength < 1000) {
                score += 0.8;
            } else if (summaryLength > 20) {
                score += 0.6;
            } else {
                score += 0.3;
            }
            factors++;
        }
        
        // Data extraction completeness
        if (result.analysis.extractedData) {
            const dataFields = Object.keys(result.analysis.extractedData).length;
            if (dataFields > 5) {
                score += 0.9;
            } else if (dataFields > 2) {
                score += 0.7;
            } else {
                score += 0.4;
            }
            factors++;
        }
        
        // Processing time factor
        const totalTime = result.performance.validationTime + 
                         result.performance.extractionTime + 
                         result.performance.processingTime + 
                         result.performance.classificationTime;
        
        if (totalTime < 10000) { // Less than 10 seconds
            score += 0.8;
        } else if (totalTime < 30000) { // Less than 30 seconds
            score += 0.6;
        } else {
            score += 0.3;
        }
        factors++;
        
        return factors > 0 ? score / factors : 0.5;
    }

    /**
     * Generate compact format
     * @param {Object} formatted - Formatted results
     * @returns {Object} Compact format
     */
    compactFormat(formatted) {
        return {
            file: formatted.file.name,
            type: formatted.classification.category,
            confidence: formatted.classification.confidence,
            summary: formatted.analysis.summary?.substring(0, 200) + '...',
            processingTime: formatted.performance.processingTime
        };
    }

    /**
     * Generate detailed format
     * @param {Object} formatted - Formatted results
     * @returns {Object} Detailed format
     */
    detailedFormat(formatted) {
        return {
            ...formatted,
            additionalMetadata: {
                pipelineVersion: '1.0.0',
                processingTimestamp: new Date().toISOString(),
                systemInfo: {
                    userAgent: navigator.userAgent,
                    language: navigator.language
                }
            }
        };
    }

    /**
     * Update processing metrics
     * @param {number} processingTime - Processing time in ms
     * @param {boolean} success - Whether processing was successful
     */
    updateMetrics(processingTime, success) {
        this.metrics.totalProcessed++;
        
        if (success) {
            this.metrics.successfulProcessed++;
        } else {
            this.metrics.failedProcessed++;
        }
        
        // Update average processing time
        const totalTime = (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1)) + processingTime;
        this.metrics.averageProcessingTime = totalTime / this.metrics.totalProcessed;
    }

    /**
     * Calculate stage metrics
     * @param {Object} context - Processing context
     * @returns {Object} Stage metrics
     */
    calculateStageMetrics(context) {
        const metrics = {};
        
        Object.entries(context.stageResults).forEach(([stage, result]) => {
            metrics[stage] = {
                duration: result.duration,
                success: result.success,
                efficiency: result.duration < 5000 ? 'high' : result.duration < 15000 ? 'medium' : 'low'
            };
        });
        
        return metrics;
    }

    /**
     * Generate processing ID
     * @returns {string} Unique processing ID
     */
    generateProcessingId() {
        return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
     * Get pipeline configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update pipeline configuration
     * @param {Object} newConfig - New configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get processing metrics
     * @returns {Object} Current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalProcessed: 0,
            successfulProcessed: 0,
            failedProcessed: 0,
            averageProcessingTime: 0,
            stageMetrics: {}
        };
    }

    /**
     * Enable or disable pipeline stage
     * @param {string} stageName - Stage name
     * @param {boolean} enabled - Enable/disable
     */
    setStageEnabled(stageName, enabled) {
        if (this.stages[stageName]) {
            this.stages[stageName].enabled = enabled;
        }
    }

    /**
     * Get pipeline status
     * @returns {Object} Pipeline status
     */
    getStatus() {
        return {
            stages: this.stages,
            config: this.config,
            metrics: this.metrics,
            cacheSize: this.cache.size
        };
    }
}

// Export for use in other modules
export { FileProcessingPipeline };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileProcessingPipeline;
} else {
    window.FileProcessingPipeline = FileProcessingPipeline;
}

// Example usage:
// const pipeline = new FileProcessingPipeline(geminiProcessor, tamilPromptHelper, documentClassifier, resultsManager);
// pipeline.addEventListener('stageComplete', (data) => console.log('Stage completed:', data));
// const result = await pipeline.processFile(file, { language: 'tamil', enableOCR: true });