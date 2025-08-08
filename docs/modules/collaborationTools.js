/**
 * CollaborationTools Module - Team Collaboration and File Sharing
 * Provides file sharing, team workspaces, and real-time collaboration features
 * Part of Phase 3: Advanced Features Implementation
 */

class CollaborationTools {
    constructor(options = {}) {
        this.config = {
            // Collaboration settings
            enableRealTimeUpdates: options.enableRealTimeUpdates !== false,
            enableFileSharing: options.enableFileSharing !== false,
            enableTeamWorkspaces: options.enableTeamWorkspaces !== false,
            enableComments: options.enableComments !== false,
            enableVersionControl: options.enableVersionControl !== false,
            
            // Security settings
            requireAuthentication: options.requireAuthentication !== false,
            enablePermissionControl: options.enablePermissionControl !== false,
            enableAuditLog: options.enableAuditLog !== false,
            
            // Workspace settings
            maxWorkspaceMembers: options.maxWorkspaceMembers || 50,
            maxFileSize: options.maxFileSize || 100 * 1024 * 1024, // 100MB
            allowedFileTypes: options.allowedFileTypes || ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
            
            // Real-time settings
            websocketUrl: options.websocketUrl || 'ws://localhost:8080/ws',
            heartbeatInterval: options.heartbeatInterval || 30000,
            reconnectAttempts: options.reconnectAttempts || 5
        };
        
        // User management
        this.users = new Map();
        this.currentUser = null;
        this.onlineUsers = new Set();
        
        // Workspace management
        this.workspaces = new Map();
        this.currentWorkspace = null;
        
        // File sharing
        this.sharedFiles = new Map();
        this.filePermissions = new Map();
        this.fileVersions = new Map();
        
        // Comments and annotations
        this.comments = new Map();
        this.annotations = new Map();
        
        // Real-time communication
        this.websocket = null;
        this.eventHandlers = new Map();
        this.messageQueue = [];
        
        // Activity tracking
        this.activityLog = [];
        this.auditLog = [];
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the Collaboration Tools
     * @param {Object} user - Current user information
     * @returns {Promise<boolean>} Success status
     */
    async initialize(user = null) {
        try {
            console.log('Initializing CollaborationTools...');
            
            // Set current user
            if (user) {
                this.currentUser = user;
                this.users.set(user.id, user);
            }
            
            // Initialize WebSocket connection for real-time updates
            if (this.config.enableRealTimeUpdates) {
                await this.initializeWebSocket();
            }
            
            // Load existing workspaces and shared files
            await this.loadWorkspaces();
            await this.loadSharedFiles();
            
            // Initialize event handlers
            this.initializeEventHandlers();
            
            this.isInitialized = true;
            console.log('CollaborationTools initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize CollaborationTools:', error);
            return false;
        }
    }
    
    /**
     * Create a new workspace
     * @param {Object} workspaceData - Workspace configuration
     * @returns {Promise<Object>} Created workspace
     */
    async createWorkspace(workspaceData) {
        if (!this.config.enableTeamWorkspaces) {
            throw new Error('Team workspaces are not enabled');
        }
        
        const workspace = {
            id: this.generateId(),
            name: workspaceData.name,
            description: workspaceData.description || '',
            owner: this.currentUser.id,
            members: [this.currentUser.id],
            permissions: {
                [this.currentUser.id]: 'admin'
            },
            settings: {
                isPublic: workspaceData.isPublic || false,
                allowInvites: workspaceData.allowInvites !== false,
                enableComments: workspaceData.enableComments !== false,
                enableVersionControl: workspaceData.enableVersionControl !== false
            },
            files: [],
            folders: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.workspaces.set(workspace.id, workspace);
        
        // Log activity
        this.logActivity({
            type: 'workspace_created',
            workspaceId: workspace.id,
            userId: this.currentUser.id,
            details: { name: workspace.name }
        });
        
        // Broadcast to real-time subscribers
        this.broadcastEvent('workspace_created', {
            workspace: workspace,
            user: this.currentUser
        });
        
        return workspace;
    }
    
    /**
     * Join a workspace
     * @param {string} workspaceId - Workspace ID
     * @param {string} inviteCode - Optional invite code
     * @returns {Promise<Object>} Workspace data
     */
    async joinWorkspace(workspaceId, inviteCode = null) {
        const workspace = this.workspaces.get(workspaceId);
        
        if (!workspace) {
            throw new Error('Workspace not found');
        }
        
        // Check permissions
        if (!workspace.settings.isPublic && !workspace.settings.allowInvites) {
            throw new Error('Workspace is private and invites are disabled');
        }
        
        // Add user to workspace
        if (!workspace.members.includes(this.currentUser.id)) {
            workspace.members.push(this.currentUser.id);
            workspace.permissions[this.currentUser.id] = 'member';
            workspace.updatedAt = Date.now();
        }
        
        this.currentWorkspace = workspace;
        
        // Log activity
        this.logActivity({
            type: 'workspace_joined',
            workspaceId: workspaceId,
            userId: this.currentUser.id
        });
        
        // Broadcast to workspace members
        this.broadcastToWorkspace(workspaceId, 'user_joined', {
            user: this.currentUser,
            workspace: workspace
        });
        
        return workspace;
    }
    
    /**
     * Share a file with users or workspace
     * @param {Object} file - File to share
     * @param {Object} shareOptions - Sharing options
     * @returns {Promise<Object>} Share result
     */
    async shareFile(file, shareOptions) {
        if (!this.config.enableFileSharing) {
            throw new Error('File sharing is not enabled');
        }
        
        const shareId = this.generateId();
        const sharedFile = {
            id: shareId,
            fileId: file.id || this.generateId(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            owner: this.currentUser.id,
            sharedWith: shareOptions.users || [],
            workspaceId: shareOptions.workspaceId || null,
            permissions: {
                canView: shareOptions.canView !== false,
                canEdit: shareOptions.canEdit || false,
                canComment: shareOptions.canComment !== false,
                canDownload: shareOptions.canDownload !== false,
                canShare: shareOptions.canShare || false
            },
            settings: {
                isPublic: shareOptions.isPublic || false,
                requireAuth: shareOptions.requireAuth !== false,
                expiresAt: shareOptions.expiresAt || null,
                password: shareOptions.password || null
            },
            metadata: {
                originalPath: file.path || '',
                uploadedAt: Date.now(),
                sharedAt: Date.now(),
                lastAccessed: null,
                accessCount: 0
            },
            versions: [{
                id: this.generateId(),
                version: 1,
                uploadedBy: this.currentUser.id,
                uploadedAt: Date.now(),
                changes: 'Initial version',
                fileData: file
            }]
        };
        
        this.sharedFiles.set(shareId, sharedFile);
        
        // Set file permissions
        this.setFilePermissions(shareId, sharedFile.permissions);
        
        // Log activity
        this.logActivity({
            type: 'file_shared',
            fileId: shareId,
            userId: this.currentUser.id,
            details: {
                fileName: file.name,
                sharedWith: shareOptions.users,
                workspaceId: shareOptions.workspaceId
            }
        });
        
        // Notify shared users
        if (shareOptions.users && shareOptions.users.length > 0) {
            this.notifyUsers(shareOptions.users, 'file_shared', {
                file: sharedFile,
                sharedBy: this.currentUser
            });
        }
        
        // Broadcast to workspace if applicable
        if (shareOptions.workspaceId) {
            this.broadcastToWorkspace(shareOptions.workspaceId, 'file_shared', {
                file: sharedFile,
                sharedBy: this.currentUser
            });
        }
        
        return {
            shareId: shareId,
            shareUrl: this.generateShareUrl(shareId),
            sharedFile: sharedFile
        };
    }
    
    /**
     * Add comment to a file
     * @param {string} fileId - File ID
     * @param {Object} commentData - Comment data
     * @returns {Promise<Object>} Created comment
     */
    async addComment(fileId, commentData) {
        if (!this.config.enableComments) {
            throw new Error('Comments are not enabled');
        }
        
        const comment = {
            id: this.generateId(),
            fileId: fileId,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            content: commentData.content,
            position: commentData.position || null, // For annotations
            parentId: commentData.parentId || null, // For replies
            mentions: commentData.mentions || [],
            attachments: commentData.attachments || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isResolved: false,
            reactions: {}
        };
        
        // Store comment
        if (!this.comments.has(fileId)) {
            this.comments.set(fileId, []);
        }
        this.comments.get(fileId).push(comment);
        
        // Log activity
        this.logActivity({
            type: 'comment_added',
            fileId: fileId,
            commentId: comment.id,
            userId: this.currentUser.id
        });
        
        // Notify mentioned users
        if (comment.mentions.length > 0) {
            this.notifyUsers(comment.mentions, 'comment_mention', {
                comment: comment,
                file: this.sharedFiles.get(fileId),
                mentionedBy: this.currentUser
            });
        }
        
        // Broadcast to file collaborators
        this.broadcastToFileCollaborators(fileId, 'comment_added', {
            comment: comment,
            user: this.currentUser
        });
        
        return comment;
    }
    
    /**
     * Upload new version of a file
     * @param {string} fileId - File ID
     * @param {Object} newFile - New file version
     * @param {string} changes - Description of changes
     * @returns {Promise<Object>} Version result
     */
    async uploadFileVersion(fileId, newFile, changes = '') {
        if (!this.config.enableVersionControl) {
            throw new Error('Version control is not enabled');
        }
        
        const sharedFile = this.sharedFiles.get(fileId);
        if (!sharedFile) {
            throw new Error('File not found');
        }
        
        // Check permissions
        if (!this.hasFilePermission(fileId, 'canEdit')) {
            throw new Error('Insufficient permissions to edit file');
        }
        
        const newVersion = {
            id: this.generateId(),
            version: sharedFile.versions.length + 1,
            uploadedBy: this.currentUser.id,
            uploadedAt: Date.now(),
            changes: changes,
            fileData: newFile
        };
        
        sharedFile.versions.push(newVersion);
        sharedFile.metadata.lastAccessed = Date.now();
        
        // Log activity
        this.logActivity({
            type: 'file_version_uploaded',
            fileId: fileId,
            versionId: newVersion.id,
            userId: this.currentUser.id,
            details: { changes: changes }
        });
        
        // Broadcast to file collaborators
        this.broadcastToFileCollaborators(fileId, 'file_updated', {
            file: sharedFile,
            newVersion: newVersion,
            updatedBy: this.currentUser
        });
        
        return {
            success: true,
            version: newVersion,
            file: sharedFile
        };
    }
    
    /**
     * Get real-time collaboration status
     * @param {string} fileId - File ID
     * @returns {Object} Collaboration status
     */
    getCollaborationStatus(fileId) {
        const sharedFile = this.sharedFiles.get(fileId);
        if (!sharedFile) {
            return null;
        }
        
        const collaborators = this.getFileCollaborators(fileId);
        const onlineCollaborators = collaborators.filter(user => this.onlineUsers.has(user.id));
        const comments = this.comments.get(fileId) || [];
        const unresolvedComments = comments.filter(comment => !comment.isResolved);
        
        return {
            fileId: fileId,
            totalCollaborators: collaborators.length,
            onlineCollaborators: onlineCollaborators.length,
            activeUsers: onlineCollaborators,
            totalComments: comments.length,
            unresolvedComments: unresolvedComments.length,
            lastActivity: this.getLastFileActivity(fileId),
            currentVersion: sharedFile.versions[sharedFile.versions.length - 1],
            isBeingEdited: this.isFileBeingEdited(fileId)
        };
    }
    
    /**
     * Get workspace activity feed
     * @param {string} workspaceId - Workspace ID
     * @param {Object} options - Feed options
     * @returns {Array} Activity feed
     */
    getWorkspaceActivity(workspaceId, options = {}) {
        const limit = options.limit || 50;
        const since = options.since || 0;
        
        return this.activityLog
            .filter(activity => 
                activity.workspaceId === workspaceId && 
                activity.timestamp >= since
            )
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit)
            .map(activity => ({
                ...activity,
                user: this.users.get(activity.userId),
                timeAgo: this.formatTimeAgo(activity.timestamp)
            }));
    }
    
    /**
     * Search shared files and workspaces
     * @param {string} query - Search query
     * @param {Object} filters - Search filters
     * @returns {Object} Search results
     */
    search(query, filters = {}) {
        const results = {
            files: [],
            workspaces: [],
            comments: []
        };
        
        const queryLower = query.toLowerCase();
        
        // Search files
        for (const [fileId, file] of this.sharedFiles) {
            if (this.hasFileAccess(fileId) && 
                (file.fileName.toLowerCase().includes(queryLower) ||
                 file.metadata.originalPath.toLowerCase().includes(queryLower))) {
                results.files.push({
                    ...file,
                    relevance: this.calculateSearchRelevance(file, query)
                });
            }
        }
        
        // Search workspaces
        for (const [workspaceId, workspace] of this.workspaces) {
            if (workspace.members.includes(this.currentUser.id) &&
                (workspace.name.toLowerCase().includes(queryLower) ||
                 workspace.description.toLowerCase().includes(queryLower))) {
                results.workspaces.push({
                    ...workspace,
                    relevance: this.calculateSearchRelevance(workspace, query)
                });
            }
        }
        
        // Search comments
        for (const [fileId, comments] of this.comments) {
            if (this.hasFileAccess(fileId)) {
                const matchingComments = comments.filter(comment => 
                    comment.content.toLowerCase().includes(queryLower)
                );
                results.comments.push(...matchingComments.map(comment => ({
                    ...comment,
                    file: this.sharedFiles.get(fileId),
                    relevance: this.calculateSearchRelevance(comment, query)
                })));
            }
        }
        
        // Sort by relevance
        results.files.sort((a, b) => b.relevance - a.relevance);
        results.workspaces.sort((a, b) => b.relevance - a.relevance);
        results.comments.sort((a, b) => b.relevance - a.relevance);
        
        return results;
    }
    
    // Helper methods
    
    /**
     * Initialize WebSocket connection
     * @returns {Promise<void>}
     */
    async initializeWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                this.websocket = new WebSocket(this.config.websocketUrl);
                
                this.websocket.onopen = () => {
                    console.log('WebSocket connected');
                    this.sendMessage({
                        type: 'user_online',
                        user: this.currentUser
                    });
                    resolve();
                };
                
                this.websocket.onmessage = (event) => {
                    this.handleWebSocketMessage(JSON.parse(event.data));
                };
                
                this.websocket.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.handleWebSocketReconnect();
                };
                
                this.websocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Log activity
     * @param {Object} activity - Activity data
     */
    logActivity(activity) {
        const logEntry = {
            ...activity,
            id: this.generateId(),
            timestamp: Date.now(),
            workspaceId: this.currentWorkspace?.id || null
        };
        
        this.activityLog.push(logEntry);
        
        // Keep only recent activities (last 1000)
        if (this.activityLog.length > 1000) {
            this.activityLog = this.activityLog.slice(-1000);
        }
        
        // Add to audit log if enabled
        if (this.config.enableAuditLog) {
            this.auditLog.push(logEntry);
        }
    }
    
    /**
     * Get current statistics
     * @returns {Object} Current statistics
     */
    getStats() {
        return {
            totalWorkspaces: this.workspaces.size,
            totalSharedFiles: this.sharedFiles.size,
            totalUsers: this.users.size,
            onlineUsers: this.onlineUsers.size,
            totalComments: Array.from(this.comments.values()).reduce((sum, comments) => sum + comments.length, 0),
            totalActivities: this.activityLog.length,
            currentWorkspace: this.currentWorkspace?.name || null,
            isConnected: this.websocket?.readyState === WebSocket.OPEN
        };
    }
    
    /**
     * Check if Collaboration Tools is ready
     * @returns {boolean} Ready status
     */
    isReady() {
        return this.isInitialized;
    }
}

// Export the CollaborationTools class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollaborationTools;
} else if (typeof window !== 'undefined') {
    window.CollaborationTools = CollaborationTools;
}

// Export the class
export { CollaborationTools };

// Example usage:
/*
const collaboration = new CollaborationTools({
    enableRealTimeUpdates: true,
    enableFileSharing: true,
    enableTeamWorkspaces: true,
    enableComments: true,
    enableVersionControl: true
});

const user = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com'
};

await collaboration.initialize(user);

// Create workspace
const workspace = await collaboration.createWorkspace({
    name: 'AI Document Processing Team',
    description: 'Collaborative workspace for document processing',
    isPublic: false,
    allowInvites: true
});

// Share file
const shareResult = await collaboration.shareFile(file, {
    users: ['user456', 'user789'],
    workspaceId: workspace.id,
    canEdit: true,
    canComment: true
});

console.log('Collaboration Stats:', collaboration.getStats());
*/