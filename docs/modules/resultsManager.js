/**
 * Results Manager - Generate structured output tables and export functionality
 * Manages processing results with advanced filtering, sorting, and export options
 */

class ResultsManager {
    constructor(tamilLanguageManager) {
        this.tamilLanguageManager = tamilLanguageManager;
        this.results = [];
        this.filteredResults = [];
        this.currentFilters = {};
        this.currentSort = { field: 'timestamp', direction: 'desc' };
        
        // Export formats configuration
        this.exportFormats = {
            json: {
                name: 'JSON',
                extension: '.json',
                mimeType: 'application/json'
            },
            csv: {
                name: 'CSV',
                extension: '.csv',
                mimeType: 'text/csv'
            },
            xlsx: {
                name: 'Excel',
                extension: '.xlsx',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            pdf: {
                name: 'PDF',
                extension: '.pdf',
                mimeType: 'application/pdf'
            },
            html: {
                name: 'HTML Report',
                extension: '.html',
                mimeType: 'text/html'
            }
        };
        
        // Table configuration
        this.tableConfig = {
            columns: [
                { key: 'fileName', label: { english: 'File Name', tamil: 'கோப்பு பெயர்' }, sortable: true, filterable: true },
                { key: 'fileSize', label: { english: 'Size', tamil: 'அளவு' }, sortable: true, filterable: false, formatter: 'fileSize' },
                { key: 'fileType', label: { english: 'Type', tamil: 'வகை' }, sortable: true, filterable: true },
                { key: 'classification', label: { english: 'Classification', tamil: 'வகைப்பாடு' }, sortable: true, filterable: true },
                { key: 'confidence', label: { english: 'Confidence', tamil: 'நம்பகத்தன்மை' }, sortable: true, filterable: false, formatter: 'percentage' },
                { key: 'summary', label: { english: 'Summary', tamil: 'சுருக்கம்' }, sortable: false, filterable: true, truncate: 100 },
                { key: 'processingTime', label: { english: 'Processing Time', tamil: 'செயலாக்க நேரம்' }, sortable: true, filterable: false, formatter: 'duration' },
                { key: 'timestamp', label: { english: 'Processed At', tamil: 'செயலாக்கப்பட்ட நேரம்' }, sortable: true, filterable: false, formatter: 'datetime' },
                { key: 'actions', label: { english: 'Actions', tamil: 'செயல்கள்' }, sortable: false, filterable: false }
            ],
            pageSize: 10,
            showPagination: true,
            showSearch: true,
            showFilters: true,
            showExport: true
        };
        
        // Statistics configuration
        this.statsConfig = {
            showOverview: true,
            showCategoryBreakdown: true,
            showProcessingStats: true,
            showFileTypeStats: true
        };
    }

    /**
     * Set processing results
     * @param {Array} results - Processing results
     */
    setResults(results) {
        this.results = this.normalizeResults(results);
        this.filteredResults = [...this.results];
        this.applyCurrentFilters();
    }

    /**
     * Add new result to the collection
     * @param {Object} result - Single processing result
     */
    addResult(result) {
        const normalizedResult = this.normalizeResult(result);
        this.results.push(normalizedResult);
        this.applyCurrentFilters();
    }

    /**
     * Normalize results to consistent format
     * @param {Array} results - Raw results
     * @returns {Array} Normalized results
     */
    normalizeResults(results) {
        return results.map(result => this.normalizeResult(result));
    }

    /**
     * Normalize single result
     * @param {Object} result - Raw result
     * @returns {Object} Normalized result
     */
    normalizeResult(result) {
        return {
            id: result.id || this.generateId(),
            fileName: result.file?.name || 'Unknown',
            fileSize: result.file?.size || 0,
            fileType: result.file?.type || 'unknown',
            classification: result.analysis?.classification?.category || 'other',
            classificationLabel: result.analysis?.classification?.categoryLabel || { english: 'Other', tamil: 'பிற' },
            confidence: result.analysis?.classification?.confidence || 0,
            summary: result.analysis?.summary || '',
            extractedData: result.analysis?.extractedData || {},
            ocrText: result.analysis?.ocrText || '',
            suggestedName: result.analysis?.suggestedName || '',
            processingTime: result.processing?.duration || 0,
            processingStatus: result.processing?.status || 'unknown',
            timestamp: result.processing?.endTime || Date.now(),
            error: result.processing?.error || null,
            rawResult: result
        };
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Apply filters to results
     * @param {Object} filters - Filter criteria
     */
    applyFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.applyCurrentFilters();
    }

    /**
     * Apply current filters
     */
    applyCurrentFilters() {
        this.filteredResults = this.results.filter(result => {
            return Object.entries(this.currentFilters).every(([key, value]) => {
                if (!value || value === '') {return true;}
                
                switch (key) {
                    case 'search':
                        return this.searchInResult(result, value);
                    case 'classification':
                        return result.classification === value;
                    case 'fileType':
                        return result.fileType.includes(value);
                    case 'status':
                        return result.processingStatus === value;
                    case 'dateRange':
                        return this.isInDateRange(result.timestamp, value);
                    default:
                        return true;
                }
            });
        });
        
        this.applySorting();
    }

    /**
     * Search in result fields
     * @param {Object} result - Result to search
     * @param {string} searchTerm - Search term
     * @returns {boolean} Match found
     */
    searchInResult(result, searchTerm) {
        const searchFields = ['fileName', 'summary', 'classification', 'ocrText'];
        const term = searchTerm.toLowerCase();
        
        return searchFields.some(field => {
            const value = result[field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(term);
            }
            return false;
        });
    }

    /**
     * Check if timestamp is in date range
     * @param {number} timestamp - Timestamp to check
     * @param {Object} dateRange - Date range object
     * @returns {boolean} In range
     */
    isInDateRange(timestamp, dateRange) {
        const date = new Date(timestamp);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (start && date < start) {return false;}
        if (end && date > end) {return false;}
        
        return true;
    }

    /**
     * Apply sorting to filtered results
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction (asc/desc)
     */
    applySorting(field = null, direction = null) {
        if (field) {
            this.currentSort = { field, direction: direction || 'asc' };
        }
        
        this.filteredResults.sort((a, b) => {
            const aValue = a[this.currentSort.field];
            const bValue = b[this.currentSort.field];
            
            let comparison = 0;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }
            
            return this.currentSort.direction === 'desc' ? -comparison : comparison;
        });
    }

    /**
     * Get paginated results
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Items per page
     * @returns {Object} Paginated results
     */
    getPaginatedResults(page = 1, pageSize = this.tableConfig.pageSize) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = this.filteredResults.slice(startIndex, endIndex);
        
        return {
            items,
            pagination: {
                currentPage: page,
                pageSize,
                totalItems: this.filteredResults.length,
                totalPages: Math.ceil(this.filteredResults.length / pageSize),
                hasNext: endIndex < this.filteredResults.length,
                hasPrev: page > 1
            }
        };
    }

    /**
     * Generate statistics from results
     * @returns {Object} Statistics
     */
    generateStatistics() {
        const stats = {
            overview: this.generateOverviewStats(),
            categoryBreakdown: this.generateCategoryStats(),
            processingStats: this.generateProcessingStats(),
            fileTypeStats: this.generateFileTypeStats()
        };
        
        return stats;
    }

    /**
     * Generate overview statistics
     * @returns {Object} Overview stats
     */
    generateOverviewStats() {
        const total = this.results.length;
        const successful = this.results.filter(r => r.processingStatus === 'completed').length;
        const failed = this.results.filter(r => r.processingStatus === 'failed').length;
        const avgConfidence = this.results.reduce((sum, r) => sum + r.confidence, 0) / total;
        const avgProcessingTime = this.results.reduce((sum, r) => sum + r.processingTime, 0) / total;
        
        return {
            totalFiles: total,
            successfulFiles: successful,
            failedFiles: failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            averageConfidence: avgConfidence || 0,
            averageProcessingTime: avgProcessingTime || 0
        };
    }

    /**
     * Generate category breakdown statistics
     * @returns {Object} Category stats
     */
    generateCategoryStats() {
        const categoryCount = {};
        const categoryConfidence = {};
        
        this.results.forEach(result => {
            const category = result.classification;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
            
            if (!categoryConfidence[category]) {
                categoryConfidence[category] = [];
            }
            categoryConfidence[category].push(result.confidence);
        });
        
        const categoryStats = {};
        Object.keys(categoryCount).forEach(category => {
            const confidences = categoryConfidence[category];
            const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
            
            categoryStats[category] = {
                count: categoryCount[category],
                percentage: (categoryCount[category] / this.results.length) * 100,
                averageConfidence: avgConfidence
            };
        });
        
        return categoryStats;
    }

    /**
     * Generate processing statistics
     * @returns {Object} Processing stats
     */
    generateProcessingStats() {
        const processingTimes = this.results.map(r => r.processingTime).filter(t => t > 0);
        const totalProcessingTime = processingTimes.reduce((sum, t) => sum + t, 0);
        
        return {
            totalProcessingTime,
            averageProcessingTime: processingTimes.length > 0 ? totalProcessingTime / processingTimes.length : 0,
            minProcessingTime: Math.min(...processingTimes) || 0,
            maxProcessingTime: Math.max(...processingTimes) || 0,
            medianProcessingTime: this.calculateMedian(processingTimes)
        };
    }

    /**
     * Generate file type statistics
     * @returns {Object} File type stats
     */
    generateFileTypeStats() {
        const typeCount = {};
        const typeSizes = {};
        
        this.results.forEach(result => {
            const type = result.fileType.split('/')[0]; // Get main type (image, application, text)
            typeCount[type] = (typeCount[type] || 0) + 1;
            
            if (!typeSizes[type]) {
                typeSizes[type] = [];
            }
            typeSizes[type].push(result.fileSize);
        });
        
        const typeStats = {};
        Object.keys(typeCount).forEach(type => {
            const sizes = typeSizes[type];
            const totalSize = sizes.reduce((sum, s) => sum + s, 0);
            
            typeStats[type] = {
                count: typeCount[type],
                percentage: (typeCount[type] / this.results.length) * 100,
                totalSize,
                averageSize: totalSize / sizes.length
            };
        });
        
        return typeStats;
    }

    /**
     * Calculate median value
     * @param {Array} values - Array of numbers
     * @returns {number} Median value
     */
    calculateMedian(values) {
        if (values.length === 0) {return 0;}
        
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0 ?
            (sorted[mid - 1] + sorted[mid]) / 2 :
            sorted[mid];
    }

    /**
     * Export results in specified format
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} Exported data
     */
    async exportResults(format = 'json', options = {}) {
        const exportOptions = {
            includeStatistics: true,
            includeRawData: false,
            language: 'tamil',
            ...options
        };
        
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportToJSON(exportOptions);
            case 'csv':
                return this.exportToCSV(exportOptions);
            case 'xlsx':
                return this.exportToExcel(exportOptions);
            case 'pdf':
                return this.exportToPDF(exportOptions);
            case 'html':
                return this.exportToHTML(exportOptions);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to JSON format
     * @param {Object} options - Export options
     * @returns {Blob} JSON blob
     */
    exportToJSON(options) {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                totalResults: this.results.length,
                filteredResults: this.filteredResults.length,
                format: 'json',
                language: options.language
            },
            results: options.includeRawData ? this.filteredResults : 
                this.filteredResults.map(r => this.sanitizeResultForExport(r)),
            statistics: options.includeStatistics ? this.generateStatistics() : null
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
    }

    /**
     * Export to CSV format
     * @param {Object} options - Export options
     * @returns {Blob} CSV blob
     */
    exportToCSV(options) {
        const headers = this.tableConfig.columns
            .filter(col => col.key !== 'actions')
            .map(col => col.label[options.language] || col.label.english);
        
        const rows = this.filteredResults.map(result => 
            this.tableConfig.columns
                .filter(col => col.key !== 'actions')
                .map(col => this.formatCellValue(result[col.key], col.formatter))
        );
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        return new Blob([csvContent], { type: 'text/csv' });
    }

    /**
     * Export to HTML format
     * @param {Object} options - Export options
     * @returns {Blob} HTML blob
     */
    exportToHTML(options) {
        const statistics = options.includeStatistics ? this.generateStatistics() : null;
        const language = options.language;
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="${language === 'tamil' ? 'ta' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${language === 'tamil' ? 'செயலாக்க முடிவுகள்' : 'Processing Results'}</title>
    <style>
        body { font-family: ${language === 'tamil' ? '"Noto Sans Tamil", ' : ''}Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .statistics { margin-bottom: 30px; }
        .stat-card { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .confidence { font-weight: bold; }
        .high-confidence { color: green; }
        .medium-confidence { color: orange; }
        .low-confidence { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${language === 'tamil' ? 'செயலாக்க முடிவுகள்' : 'Processing Results'}</h1>
        <p>${language === 'tamil' ? 'ஏற்றுமதி செய்யப்பட்ட நேரம்' : 'Exported at'}: ${new Date().toLocaleString()}</p>
    </div>
    
    ${statistics ? this.generateStatisticsHTML(statistics, language) : ''}
    
    <h2>${language === 'tamil' ? 'விரிவான முடிவுகள்' : 'Detailed Results'}</h2>
    ${this.generateResultsTableHTML(language)}
</body>
</html>`;
        
        return new Blob([htmlContent], { type: 'text/html' });
    }

    /**
     * Generate statistics HTML
     * @param {Object} statistics - Statistics data
     * @param {string} language - Language preference
     * @returns {string} HTML content
     */
    generateStatisticsHTML(statistics, language) {
        const overview = statistics.overview;
        
        return `
    <div class="statistics">
        <h2>${language === 'tamil' ? 'புள்ளிவிவரங்கள்' : 'Statistics'}</h2>
        <div class="stat-card">
            <h3>${language === 'tamil' ? 'மொத்த கோப்புகள்' : 'Total Files'}</h3>
            <p>${overview.totalFiles}</p>
        </div>
        <div class="stat-card">
            <h3>${language === 'tamil' ? 'வெற்றிகரமான கோப்புகள்' : 'Successful Files'}</h3>
            <p>${overview.successfulFiles}</p>
        </div>
        <div class="stat-card">
            <h3>${language === 'tamil' ? 'சராசரி நம்பகத்தன்மை' : 'Average Confidence'}</h3>
            <p>${(overview.averageConfidence * 100).toFixed(1)}%</p>
        </div>
        <div class="stat-card">
            <h3>${language === 'tamil' ? 'சராசரி செயலாக்க நேரம்' : 'Average Processing Time'}</h3>
            <p>${this.formatDuration(overview.averageProcessingTime)}</p>
        </div>
    </div>`;
    }

    /**
     * Generate results table HTML
     * @param {string} language - Language preference
     * @returns {string} HTML table
     */
    generateResultsTableHTML(language) {
        const headers = this.tableConfig.columns
            .filter(col => col.key !== 'actions')
            .map(col => `<th>${col.label[language] || col.label.english}</th>`)
            .join('');
        
        const rows = this.filteredResults.map(result => {
            const cells = this.tableConfig.columns
                .filter(col => col.key !== 'actions')
                .map(col => {
                    const value = this.formatCellValue(result[col.key], col.formatter);
                    let className = '';
                    
                    if (col.key === 'confidence') {
                        const confidence = result.confidence;
                        if (confidence >= 0.8) {className = 'high-confidence';}
                        else if (confidence >= 0.6) {className = 'medium-confidence';}
                        else {className = 'low-confidence';}
                    }
                    
                    return `<td class="${className}">${value}</td>`;
                })
                .join('');
            
            return `<tr>${cells}</tr>`;
        }).join('');
        
        return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }

    /**
     * Format cell value based on formatter
     * @param {*} value - Cell value
     * @param {string} formatter - Formatter type
     * @returns {string} Formatted value
     */
    formatCellValue(value, formatter) {
        if (value === null || value === undefined) {return '';}
        
        switch (formatter) {
            case 'fileSize':
                return this.formatFileSize(value);
            case 'percentage':
                return `${(value * 100).toFixed(1)}%`;
            case 'duration':
                return this.formatDuration(value);
            case 'datetime':
                return new Date(value).toLocaleString();
            default:
                return String(value);
        }
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
     * Format duration
     * @param {number} ms - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(ms) {
        if (ms < 1000) {return `${ms}ms`;}
        if (ms < 60000) {return `${(ms / 1000).toFixed(1)}s`;}
        return `${(ms / 60000).toFixed(1)}m`;
    }

    /**
     * Sanitize result for export
     * @param {Object} result - Result to sanitize
     * @returns {Object} Sanitized result
     */
    sanitizeResultForExport(result) {
        const { rawResult, ...sanitized } = result;
        return sanitized;
    }

    /**
     * Clear all results
     */
    clearResults() {
        this.results = [];
        this.filteredResults = [];
        this.currentFilters = {};
    }

    /**
     * Get current filters
     * @returns {Object} Current filters
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * Get current sort configuration
     * @returns {Object} Current sort
     */
    getCurrentSort() {
        return { ...this.currentSort };
    }

    /**
     * Get table configuration
     * @returns {Object} Table configuration
     */
    getTableConfig() {
        return { ...this.tableConfig };
    }

    /**
     * Update table configuration
     * @param {Object} newConfig - New configuration
     */
    updateTableConfig(newConfig) {
        this.tableConfig = { ...this.tableConfig, ...newConfig };
    }
}

// Export for use in other modules
export { ResultsManager };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsManager;
} else {
    window.ResultsManager = ResultsManager;
}

// Example usage:
// const resultsManager = new ResultsManager(tamilLanguageManager);
// resultsManager.setResults(processingResults);
// const paginatedResults = resultsManager.getPaginatedResults(1, 10);
// const statistics = resultsManager.generateStatistics();
// const exportBlob = await resultsManager.exportResults('csv', { language: 'tamil' });