/**
 * Batch Processor - Handle multiple files with progress tracking
 * Provides efficient batch processing with real-time progress updates
 */

class BatchProcessor {
    constructor(geminiProcessor, tamilPromptHelper, documentClassifier) {
        this.geminiProcessor = geminiProcessor;
        this.tamilPromptHelper = tamilPromptHelper;
        this.documentClassifier = documentClassifier;
        
        this.processingQueue = [];
        this.results = [];
        this.isProcessing = false;
        this.currentBatch = null;
        
        // Processing configuration
        this.config = {
            maxConcurrentFiles: 3,
            batchSize: 10,
            retryAttempts: 2,
            timeoutMs: 30000,
            progressUpdateInterval: 500
        };
        
        // Event listeners for progress updates
        this.eventListeners = {
            progress: [],
            complete: [],
            error: [],
            fileComplete: []
        };
        
        // Processing statistics
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            successfulFiles: 0,
            failedFiles: 0,
            startTime: null,
            endTime: null,
            averageProcessingTime: 0
        };
    }

    /**
     * Add event listener for batch processing events
     * @param {string} event - Event type (progress, complete, error, fileComplete)
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function to remove
     */
    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Process multiple files in batches
     * @param {Array} files - Array of File objects
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processing results
     */
    async processBatch(files, options = {}) {
        if (this.isProcessing) {
            throw new Error('Batch processing already in progress');
        }

        this.isProcessing = true;
        this.resetStats();
        this.stats.totalFiles = files.length;
        this.stats.startTime = Date.now();

        const processingOptions = {
            language: 'tamil',
            includeClassification: true,
            includeSummary: true,
            includeDataExtraction: true,
            generateCollectiveInsights: true,
            ...options
        };

        try {
            // Validate files
            const validatedFiles = await this.validateFiles(files);
            
            // Split into batches
            const batches = this.createBatches(validatedFiles, this.config.batchSize);
            
            // Process each batch
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                this.currentBatch = {
                    index: i,
                    total: batches.length,
                    files: batch
                };
                
                await this.processSingleBatch(batch, processingOptions);
                
                // Update progress
                this.emit('progress', {
                    batchIndex: i + 1,
                    totalBatches: batches.length,
                    processedFiles: this.stats.processedFiles,
                    totalFiles: this.stats.totalFiles,
                    percentage: Math.round((this.stats.processedFiles / this.stats.totalFiles) * 100)
                });
            }

            // Generate collective insights if requested
            let collectiveInsights = null;
            if (processingOptions.generateCollectiveInsights && this.results.length > 1) {
                collectiveInsights = await this.generateCollectiveInsights(this.results, processingOptions.language);
            }

            this.stats.endTime = Date.now();
            this.stats.averageProcessingTime = (this.stats.endTime - this.stats.startTime) / this.stats.processedFiles;

            const finalResults = {
                results: this.results,
                collectiveInsights,
                statistics: { ...this.stats },
                processingTime: this.stats.endTime - this.stats.startTime
            };

            this.emit('complete', finalResults);
            return finalResults;

        } catch (error) {
            this.emit('error', {
                error: error.message,
                processedFiles: this.stats.processedFiles,
                totalFiles: this.stats.totalFiles
            });
            throw error;
        } finally {
            this.isProcessing = false;
            this.currentBatch = null;
        }
    }

    /**
     * Process a single batch of files
     * @param {Array} batch - Batch of files
     * @param {Object} options - Processing options
     */
    async processSingleBatch(batch, options) {
        const promises = batch.map(file => this.processFile(file, options));
        
        // Process files concurrently with limit
        const results = await this.processConcurrently(promises, this.config.maxConcurrentFiles);
        
        // Add results to main results array
        this.results.push(...results.filter(result => result !== null));
    }

    /**
     * Process files concurrently with a limit
     * @param {Array} promises - Array of promises
     * @param {number} limit - Concurrent limit
     * @returns {Promise<Array>} Results
     */
    async processConcurrently(promises, limit) {
        const results = [];
        
        for (let i = 0; i < promises.length; i += limit) {
            const batch = promises.slice(i, i + limit);
            const batchResults = await Promise.allSettled(batch);
            
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    console.error(`File processing failed:`, result.reason);
                    results.push(null);
                    this.stats.failedFiles++;
                }
            });
        }
        
        return results;
    }

    /**
     * Process a single file
     * @param {File} file - File to process
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processing result
     */
    async processFile(file, options) {
        const startTime = Date.now();
        
        try {
            const result = {
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                },
                processing: {
                    startTime,
                    endTime: null,
                    duration: null,
                    status: 'processing'
                },
                analysis: {}
            };

            // File naming suggestion
            if (options.includeNaming) {
                const namingPrompt = this.tamilPromptHelper.getFileNamingPrompt(
                    file.type.startsWith('image/') ? 'image' : 'document',
                    options.language
                );
                result.analysis.suggestedName = await this.geminiProcessor.processDocument(
                    file, namingPrompt
                );
            }

            // Document classification
            if (options.includeClassification) {
                const classificationPrompt = this.tamilPromptHelper.getClassificationPrompt(
                    options.language, true
                );
                result.analysis.classification = await this.geminiProcessor.processDocument(
                    file, classificationPrompt
                );
            }

            // Summary generation
            if (options.includeSummary) {
                const summaryPrompt = this.tamilPromptHelper.getSummarizationPrompt(
                    'detailed', options.language
                );
                result.analysis.summary = await this.geminiProcessor.processDocument(
                    file, summaryPrompt
                );
            }

            // Data extraction
            if (options.includeDataExtraction) {
                const extractionPrompt = this.tamilPromptHelper.getDataExtractionPrompt(
                    'structured', options.language
                );
                result.analysis.extractedData = await this.geminiProcessor.processDocument(
                    file, extractionPrompt
                );
            }

            // OCR for images
            if (file.type.startsWith('image/')) {
                const ocrPrompt = this.tamilPromptHelper.getOCRPrompt('mixed', options.language);
                result.analysis.ocrText = await this.geminiProcessor.processDocument(
                    file, ocrPrompt
                );
            }

            const endTime = Date.now();
            result.processing.endTime = endTime;
            result.processing.duration = endTime - startTime;
            result.processing.status = 'completed';

            this.stats.processedFiles++;
            this.stats.successfulFiles++;

            // Emit file completion event
            this.emit('fileComplete', {
                file: result.file,
                result,
                progress: {
                    processed: this.stats.processedFiles,
                    total: this.stats.totalFiles,
                    percentage: Math.round((this.stats.processedFiles / this.stats.totalFiles) * 100)
                }
            });

            return result;

        } catch (error) {
            const endTime = Date.now();
            this.stats.processedFiles++;
            this.stats.failedFiles++;

            const errorResult = {
                file: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                },
                processing: {
                    startTime,
                    endTime,
                    duration: endTime - startTime,
                    status: 'failed',
                    error: error.message
                },
                analysis: null
            };

            this.emit('fileComplete', {
                file: errorResult.file,
                result: errorResult,
                error: error.message
            });

            return errorResult;
        }
    }

    /**
     * Generate collective insights from all processed files
     * @param {Array} results - Processing results
     * @param {string} language - Language preference
     * @returns {Promise<Object>} Collective insights
     */
    async generateCollectiveInsights(results, language = 'tamil') {
        try {
            const prompt = this.tamilPromptHelper.getBatchProcessingPrompt(results.length, language);
            
            // Prepare summary data for collective analysis
            const summaryData = results.map(result => ({
                fileName: result.file.name,
                classification: result.analysis.classification,
                summary: result.analysis.summary,
                extractedData: result.analysis.extractedData
            }));

            const collectiveAnalysis = await this.geminiProcessor.processMultipleDocuments(
                summaryData, prompt
            );

            return {
                totalFiles: results.length,
                successfulFiles: results.filter(r => r.processing.status === 'completed').length,
                failedFiles: results.filter(r => r.processing.status === 'failed').length,
                analysis: collectiveAnalysis,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error generating collective insights:', error);
            return {
                error: 'Failed to generate collective insights',
                details: error.message
            };
        }
    }

    /**
     * Validate files before processing
     * @param {Array} files - Files to validate
     * @returns {Promise<Array>} Validated files
     */
    async validateFiles(files) {
        const validFiles = [];
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const supportedTypes = [
            'application/pdf',
            'text/plain',
            'text/csv',
            'application/json',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        for (const file of files) {
            if (file.size > maxFileSize) {
                console.warn(`File ${file.name} exceeds maximum size limit`);
                continue;
            }

            if (!supportedTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
                console.warn(`File ${file.name} has unsupported type: ${file.type}`);
                continue;
            }

            validFiles.push(file);
        }

        return validFiles;
    }

    /**
     * Create batches from files array
     * @param {Array} files - Files to batch
     * @param {number} batchSize - Size of each batch
     * @returns {Array} Array of batches
     */
    createBatches(files, batchSize) {
        const batches = [];
        for (let i = 0; i < files.length; i += batchSize) {
            batches.push(files.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Reset processing statistics
     */
    resetStats() {
        this.stats = {
            totalFiles: 0,
            processedFiles: 0,
            successfulFiles: 0,
            failedFiles: 0,
            startTime: null,
            endTime: null,
            averageProcessingTime: 0
        };
        this.results = [];
    }

    /**
     * Get current processing status
     * @returns {Object} Current status
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            currentBatch: this.currentBatch,
            statistics: { ...this.stats },
            queueLength: this.processingQueue.length
        };
    }

    /**
     * Cancel current batch processing
     */
    cancel() {
        if (this.isProcessing) {
            this.isProcessing = false;
            this.emit('error', {
                error: 'Processing cancelled by user',
                processedFiles: this.stats.processedFiles,
                totalFiles: this.stats.totalFiles
            });
        }
    }

    /**
     * Update processing configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get processing results
     * @returns {Array} Current results
     */
    getResults() {
        return [...this.results];
    }

    /**
     * Export results to different formats
     * @param {string} format - Export format (json, csv, xlsx)
     * @returns {string|Blob} Exported data
     */
    exportResults(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify({
                    results: this.results,
                    statistics: this.stats,
                    exportedAt: new Date().toISOString()
                }, null, 2);
            
            case 'csv':
                return this.exportToCSV();
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export results to CSV format
     * @returns {string} CSV data
     */
    exportToCSV() {
        const headers = ['File Name', 'File Size', 'Classification', 'Summary', 'Processing Time', 'Status'];
        const rows = this.results.map(result => [
            result.file.name,
            result.file.size,
            result.analysis?.classification || 'N/A',
            result.analysis?.summary || 'N/A',
            result.processing.duration || 'N/A',
            result.processing.status
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
}

// Export for use in other modules
export { BatchProcessor };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchProcessor;
} else {
    window.BatchProcessor = BatchProcessor;
}

// Example usage:
// const batchProcessor = new BatchProcessor(geminiProcessor, tamilPromptHelper, documentClassifier);
// batchProcessor.addEventListener('progress', (data) => console.log('Progress:', data));
// batchProcessor.addEventListener('fileComplete', (data) => console.log('File completed:', data));
// const results = await batchProcessor.processBatch(files, { language: 'tamil' });