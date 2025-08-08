/**
 * Enhanced Folder Manager with File System Access API
 * Enables bulk folder processing for intelligent document management
 */

class FolderManager {
    constructor() {
        this.supportedFileTypes = [
            '.pdf', '.doc', '.docx', '.txt', '.rtf',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp',
            '.xls', '.xlsx', '.csv',
            '.ppt', '.pptx'
        ];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB limit
        this.selectedFiles = [];
        this.folderHandle = null;
    }

    /**
     * Check if File System Access API is supported
     */
    isSupported() {
        return 'showDirectoryPicker' in window;
    }

    /**
     * Select folder using File System Access API
     */
    async selectFolder() {
        try {
            if (!this.isSupported()) {
                throw new Error('File System Access API not supported in this browser');
            }

            // Show directory picker
            this.folderHandle = await window.showDirectoryPicker({
                mode: 'read',
                startIn: 'documents'
            });

            // Process the selected folder
            const files = await this.processFolder(this.folderHandle);
            this.selectedFiles = files;

            return {
                success: true,
                folderName: this.folderHandle.name,
                fileCount: files.length,
                files: files,
                totalSize: this.calculateTotalSize(files)
            };

        } catch (error) {
            console.error('Folder selection error:', error);
            
            if (error.name === 'AbortError') {
                return { success: false, error: 'Folder selection cancelled by user' };
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Process folder and extract file information
     */
    async processFolder(dirHandle) {
        const files = [];
        const processedFiles = new Set();

        try {
            for await (const [name, handle] of dirHandle.entries()) {
                if (handle.kind === 'file') {
                    // Avoid duplicate processing
                    if (processedFiles.has(name)) {continue;}
                    processedFiles.add(name);

                    const fileInfo = await this.processFile(handle, name);
                    if (fileInfo) {
                        files.push(fileInfo);
                    }
                }
            }

            // Sort files by type and name
            return files.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                return a.name.localeCompare(b.name);
            });

        } catch (error) {
            console.error('Error processing folder:', error);
            throw new Error(`Failed to process folder: ${error.message}`);
        }
    }

    /**
     * Process individual file
     */
    async processFile(fileHandle, fileName) {
        try {
            const file = await fileHandle.getFile();
            
            // Check file type
            const fileType = this.detectFileType(file);
            if (!this.isSupportedFileType(fileName)) {
                console.warn(`Unsupported file type: ${fileName}`);
                return null;
            }

            // Check file size
            if (file.size > this.maxFileSize) {
                console.warn(`File too large: ${fileName} (${this.formatFileSize(file.size)})`);
                return null;
            }

            return {
                name: fileName,
                file: file,
                handle: fileHandle,
                type: fileType,
                size: file.size,
                formattedSize: this.formatFileSize(file.size),
                lastModified: new Date(file.lastModified),
                extension: this.getFileExtension(fileName),
                category: this.categorizeFile(fileName, fileType)
            };

        } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
            return null;
        }
    }

    /**
     * Detect file type based on file properties
     */
    detectFileType(file) {
        const mimeType = file.type;
        
        if (mimeType.startsWith('image/')) {return 'image';}
        if (mimeType.includes('pdf')) {return 'pdf';}
        if (mimeType.includes('word') || mimeType.includes('document')) {return 'document';}
        if (mimeType.includes('sheet') || mimeType.includes('excel')) {return 'spreadsheet';}
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {return 'presentation';}
        if (mimeType.startsWith('text/')) {return 'text';}
        
        return 'unknown';
    }

    /**
     * Check if file type is supported
     */
    isSupportedFileType(fileName) {
        const extension = this.getFileExtension(fileName).toLowerCase();
        return this.supportedFileTypes.includes(extension);
    }

    /**
     * Get file extension
     */
    getFileExtension(fileName) {
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    /**
     * Categorize file for better organization
     */
    categorizeFile(fileName, fileType) {
        const name = fileName.toLowerCase();
        
        // Document categories
        if (name.includes('bill') || name.includes('invoice')) {return 'billing';}
        if (name.includes('report') || name.includes('summary')) {return 'reports';}
        if (name.includes('contract') || name.includes('agreement')) {return 'contracts';}
        if (name.includes('receipt') || name.includes('payment')) {return 'receipts';}
        
        // File type categories
        switch (fileType) {
            case 'image': return 'images';
            case 'pdf': return 'documents';
            case 'spreadsheet': return 'data';
            case 'presentation': return 'presentations';
            default: return 'others';
        }
    }

    /**
     * Calculate total size of selected files
     */
    calculateTotalSize(files) {
        return files.reduce((total, file) => total + file.size, 0);
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) {return '0 Bytes';}
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get folder statistics
     */
    getFolderStats() {
        if (!this.selectedFiles.length) {
            return null;
        }

        const stats = {
            totalFiles: this.selectedFiles.length,
            totalSize: this.calculateTotalSize(this.selectedFiles),
            categories: {},
            fileTypes: {},
            largestFile: null,
            oldestFile: null,
            newestFile: null
        };

        // Calculate statistics
        this.selectedFiles.forEach(file => {
            // Categories
            stats.categories[file.category] = (stats.categories[file.category] || 0) + 1;
            
            // File types
            stats.fileTypes[file.type] = (stats.fileTypes[file.type] || 0) + 1;
            
            // Largest file
            if (!stats.largestFile || file.size > stats.largestFile.size) {
                stats.largestFile = file;
            }
            
            // Oldest file
            if (!stats.oldestFile || file.lastModified < stats.oldestFile.lastModified) {
                stats.oldestFile = file;
            }
            
            // Newest file
            if (!stats.newestFile || file.lastModified > stats.newestFile.lastModified) {
                stats.newestFile = file;
            }
        });

        stats.formattedTotalSize = this.formatFileSize(stats.totalSize);
        return stats;
    }

    /**
     * Filter files by criteria
     */
    filterFiles(criteria) {
        return this.selectedFiles.filter(file => {
            if (criteria.type && file.type !== criteria.type) {return false;}
            if (criteria.category && file.category !== criteria.category) {return false;}
            if (criteria.minSize && file.size < criteria.minSize) {return false;}
            if (criteria.maxSize && file.size > criteria.maxSize) {return false;}
            if (criteria.extension && !file.name.toLowerCase().endsWith(criteria.extension.toLowerCase())) {return false;}
            
            return true;
        });
    }

    /**
     * Get files ready for processing
     */
    getFilesForProcessing() {
        return this.selectedFiles.map(fileInfo => ({
            name: fileInfo.name,
            file: fileInfo.file,
            type: fileInfo.type,
            size: fileInfo.size,
            category: fileInfo.category,
            extension: fileInfo.extension
        }));
    }

    /**
     * Clear selected files
     */
    clearSelection() {
        this.selectedFiles = [];
        this.folderHandle = null;
    }

    /**
     * Fallback method for browsers without File System Access API
     */
    async selectFolderFallback() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            
            input.onchange = async (event) => {
                const files = Array.from(event.target.files);
                const processedFiles = [];
                
                for (const file of files) {
                    if (this.isSupportedFileType(file.name) && file.size <= this.maxFileSize) {
                        processedFiles.push({
                            name: file.name,
                            file: file,
                            type: this.detectFileType(file),
                            size: file.size,
                            formattedSize: this.formatFileSize(file.size),
                            lastModified: new Date(file.lastModified),
                            extension: this.getFileExtension(file.name),
                            category: this.categorizeFile(file.name, this.detectFileType(file))
                        });
                    }
                }
                
                this.selectedFiles = processedFiles;
                
                resolve({
                    success: true,
                    folderName: 'Selected Folder',
                    fileCount: processedFiles.length,
                    files: processedFiles,
                    totalSize: this.calculateTotalSize(processedFiles)
                });
            };
            
            input.click();
        });
    }
}

// Export for use in other modules
export { FolderManager };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FolderManager;
} else {
    window.FolderManager = FolderManager;
}