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
        this.reconnectAttempts = this.config.reconnectAttempts;
        this.connectionState = 'disconnected'; // 'connecting', 'connected', 'disconnected', 'error'
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.heartbeatTimer = null;
        this.lastHeartbeat = null;
        
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
     * Initialize WebSocket connection with improved error handling
     * @returns {Promise<void>}
     */
    async initializeWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                // Check if already connecting or connected
                if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
                    resolve();
                    return;
                }
                
                this.connectionState = 'connecting';
                console.log(`Connecting to WebSocket: ${this.config.websocketUrl}`);
                
                // Close existing connection if any
                if (this.websocket) {
                    this.websocket.close();
                }
                
                this.websocket = new WebSocket(this.config.websocketUrl);
                
                // Set connection timeout
                const connectionTimeout = setTimeout(() => {
                    if (this.connectionState === 'connecting') {
                        this.websocket.close();
                        this.connectionState = 'error';
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000); // 10 second timeout
                
                this.websocket.onopen = () => {
                    clearTimeout(connectionTimeout);
                    this.connectionState = 'connected';
                    this.reconnectAttempts = this.config.reconnectAttempts; // Reset attempts
                    this.reconnectDelay = 1000; // Reset delay
                    
                    console.log('WebSocket connected successfully');
                    
                    // Send user online status
                    if (this.currentUser) {
                        this.sendMessage({
                            type: 'user_online',
                            user: this.currentUser,
                            timestamp: Date.now()
                        });
                    }
                    
                    // Process queued messages
                    this.processMessageQueue();
                    
                    // Start heartbeat
                    this.startHeartbeat();
                    
                    resolve();
                };
                
                this.websocket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        
                        // Handle heartbeat response
                        if (message.type === 'pong') {
                            this.lastHeartbeat = Date.now();
                            return;
                        }
                        
                        this.handleWebSocketMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
                
                this.websocket.onclose = (event) => {
                    clearTimeout(connectionTimeout);
                    this.stopHeartbeat();
                    
                    if (this.connectionState === 'connected') {
                        console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
                        this.connectionState = 'disconnected';
                        this.handleWebSocketReconnect();
                    }
                };
                
                this.websocket.onerror = (error) => {
                    clearTimeout(connectionTimeout);
                    this.connectionState = 'error';
                    console.error('WebSocket error:', error);
                    
                    // Don't reject immediately, let reconnection handle it
                    if (this.reconnectAttempts === this.config.reconnectAttempts) {
                        reject(error);
                    }
                };
                
            } catch (error) {
                this.connectionState = 'error';
                console.error('Failed to create WebSocket connection:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Handle WebSocket reconnection with exponential backoff
     */
    handleWebSocketReconnect() {
        if (this.reconnectAttempts > 0 && this.connectionState !== 'connecting') {
            this.reconnectAttempts--;
            
            console.log(`Attempting to reconnect WebSocket... (${this.config.reconnectAttempts - this.reconnectAttempts}/${this.config.reconnectAttempts})`);
            console.log(`Reconnecting in ${this.reconnectDelay}ms`);
            
            setTimeout(async () => {
                try {
                    await this.initializeWebSocket();
                    console.log('WebSocket reconnection successful');
                } catch (error) {
                    console.error('WebSocket reconnection failed:', error);
                    
                    // Exponential backoff
                    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
                    
                    if (this.reconnectAttempts === 0) {
                        console.error('Max reconnection attempts reached. WebSocket will remain disconnected.');
                        this.connectionState = 'error';
                        
                        // Enable fallback UI mode
                        this.enableFallbackUI();
                        
                        // Notify application about connection failure
                        this.handleRealTimeEvent({
                            type: 'connection_failed',
                            data: {
                                error: 'Max reconnection attempts reached',
                                timestamp: Date.now()
                            }
                        });
                    } else {
                        // Continue trying to reconnect
                        this.handleWebSocketReconnect();
                    }
                }
            }, this.reconnectDelay);
        }
    }
    
    /**
     * Start heartbeat to monitor connection health
     */
    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing heartbeat
        
        this.heartbeatTimer = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.sendMessage({
                    type: 'ping',
                    timestamp: Date.now()
                });
                
                // Check if last heartbeat was too long ago
                if (this.lastHeartbeat && (Date.now() - this.lastHeartbeat) > this.config.heartbeatInterval * 2) {
                    console.warn('Heartbeat timeout detected, forcing reconnection');
                    this.websocket.close();
                }
            }
        }, this.config.heartbeatInterval);
    }
    
    /**
     * Stop heartbeat timer
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    /**
     * Process queued messages after reconnection
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }
    
    /**
     * Get connection status
     * @returns {Object} Connection status information
     */
    getConnectionStatus() {
        return {
            state: this.connectionState,
            isConnected: this.websocket?.readyState === WebSocket.OPEN,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.config.reconnectAttempts,
            lastHeartbeat: this.lastHeartbeat,
            queuedMessages: this.messageQueue.length
        };
    }
    
    /**
     * Handle incoming WebSocket messages
     * @param {Object} message - WebSocket message
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'user_online':
                this.onlineUsers.add(message.user.id);
                break;
            case 'user_offline':
                this.onlineUsers.delete(message.user.id);
                break;
            case 'file_shared':
            case 'comment_added':
            case 'file_updated':
            case 'workspace_created':
            case 'user_joined':
                this.handleRealTimeEvent(message);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }
    
    /**
     * Handle real-time events
     * @param {Object} event - Real-time event
     */
    handleRealTimeEvent(event) {
        const handlers = this.eventHandlers.get(event.type) || [];
        handlers.forEach(handler => {
            try {
                handler(event);
            } catch (error) {
                console.error('Error handling real-time event:', error);
            }
        });
    }
    
    /**
     * Send message via WebSocket
     * @param {Object} message - Message to send
     */
    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }
    
    /**
     * Broadcast event to workspace members
     * @param {string} workspaceId - Workspace ID
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    broadcastToWorkspace(workspaceId, eventType, data) {
        this.sendMessage({
            type: 'broadcast_to_workspace',
            workspaceId: workspaceId,
            eventType: eventType,
            data: data
        });
    }
    
    /**
     * Broadcast event to file collaborators
     * @param {string} fileId - File ID
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    broadcastToFileCollaborators(fileId, eventType, data) {
        this.sendMessage({
            type: 'broadcast_to_file_collaborators',
            fileId: fileId,
            eventType: eventType,
            data: data
        });
    }
    
    /**
     * Broadcast event to all connected users
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    broadcastEvent(eventType, data) {
        this.sendMessage({
            type: 'broadcast_event',
            eventType: eventType,
            data: data
        });
    }
    
    /**
     * Notify specific users
     * @param {Array} userIds - User IDs to notify
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    notifyUsers(userIds, eventType, data) {
        this.sendMessage({
            type: 'notify_users',
            userIds: userIds,
            eventType: eventType,
            data: data
        });
    }
    
    /**
     * Initialize event handlers
     */
    initializeEventHandlers() {
        // Set up default event handlers
        this.eventHandlers.set('file_shared', [(event) => {
            console.log('File shared:', event.data.file.fileName);
        }]);
        
        this.eventHandlers.set('comment_added', [(event) => {
            console.log('Comment added to file:', event.data.comment.content);
        }]);
        
        this.eventHandlers.set('user_joined', [(event) => {
            console.log('User joined workspace:', event.data.user.name);
        }]);
    }
    
    /**
     * Load workspaces from storage
     * @returns {Promise<void>}
     */
    async loadWorkspaces() {
        // In a real implementation, this would load from a database or API
        // For now, we'll just initialize with empty data
        console.log('Loading workspaces...');
    }
    
    /**
     * Load shared files from storage
     * @returns {Promise<void>}
     */
    async loadSharedFiles() {
        // In a real implementation, this would load from a database or API
        // For now, we'll just initialize with empty data
        console.log('Loading shared files...');
    }
    
    /**
     * Set file permissions
     * @param {string} fileId - File ID
     * @param {Object} permissions - Permissions object
     */
    setFilePermissions(fileId, permissions) {
        this.filePermissions.set(fileId, permissions);
    }
    
    /**
     * Check if user has file permission
     * @param {string} fileId - File ID
     * @param {string} permission - Permission to check
     * @returns {boolean} Has permission
     */
    hasFilePermission(fileId, permission) {
        const file = this.sharedFiles.get(fileId);
        if (!file) return false;
        
        // Owner has all permissions
        if (file.owner === this.currentUser.id) return true;
        
        // Check specific permissions
        const permissions = this.filePermissions.get(fileId);
        return permissions && permissions[permission];
    }
    
    /**
     * Check if user has access to file
     * @param {string} fileId - File ID
     * @returns {boolean} Has access
     */
    hasFileAccess(fileId) {
        const file = this.sharedFiles.get(fileId);
        if (!file) return false;
        
        // Owner has access
        if (file.owner === this.currentUser.id) return true;
        
        // Check if shared with user
        if (file.sharedWith.includes(this.currentUser.id)) return true;
        
        // Check workspace access
        if (file.workspaceId) {
            const workspace = this.workspaces.get(file.workspaceId);
            return workspace && workspace.members.includes(this.currentUser.id);
        }
        
        // Check if public
        return file.settings.isPublic;
    }
    
    /**
     * Get file collaborators
     * @param {string} fileId - File ID
     * @returns {Array} Collaborators
     */
    getFileCollaborators(fileId) {
        const file = this.sharedFiles.get(fileId);
        if (!file) return [];
        
        const collaborators = [];
        
        // Add owner
        const owner = this.users.get(file.owner);
        if (owner) collaborators.push(owner);
        
        // Add shared users
        file.sharedWith.forEach(userId => {
            const user = this.users.get(userId);
            if (user && !collaborators.find(c => c.id === userId)) {
                collaborators.push(user);
            }
        });
        
        // Add workspace members
        if (file.workspaceId) {
            const workspace = this.workspaces.get(file.workspaceId);
            if (workspace) {
                workspace.members.forEach(userId => {
                    const user = this.users.get(userId);
                    if (user && !collaborators.find(c => c.id === userId)) {
                        collaborators.push(user);
                    }
                });
            }
        }
        
        return collaborators;
    }
    
    /**
     * Get last file activity
     * @param {string} fileId - File ID
     * @returns {Object|null} Last activity
     */
    getLastFileActivity(fileId) {
        return this.activityLog
            .filter(activity => activity.fileId === fileId)
            .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
    }
    
    /**
     * Check if file is being edited
     * @param {string} fileId - File ID
     * @returns {boolean} Is being edited
     */
    isFileBeingEdited(fileId) {
        // In a real implementation, this would track active editing sessions
        // For now, we'll just return false
        return false;
    }
    
    /**
     * Generate share URL
     * @param {string} shareId - Share ID
     * @returns {string} Share URL
     */
    generateShareUrl(shareId) {
        return `${window.location.origin}/share/${shareId}`;
    }
    
    /**
     * Calculate search relevance
     * @param {Object} item - Item to calculate relevance for
     * @param {string} query - Search query
     * @returns {number} Relevance score
     */
    calculateSearchRelevance(item, query) {
        const queryLower = query.toLowerCase();
        let score = 0;
        
        // Check different fields based on item type
        if (item.fileName) {
            if (item.fileName.toLowerCase().includes(queryLower)) score += 10;
        }
        if (item.name) {
            if (item.name.toLowerCase().includes(queryLower)) score += 10;
        }
        if (item.content) {
            if (item.content.toLowerCase().includes(queryLower)) score += 5;
        }
        if (item.description) {
            if (item.description.toLowerCase().includes(queryLower)) score += 3;
        }
        
        return score;
    }
    
    /**
     * Format time ago
     * @param {number} timestamp - Timestamp
     * @returns {string} Formatted time
     */
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    

    
    /**
     * Initialize WebSocket connection
     * @returns {Promise<void>}
     */
    async initializeWebSocket() {
        try {
            console.log('Initializing WebSocket connection...');
            
            // Check if WebSocket is supported
            if (typeof WebSocket === 'undefined') {
                console.warn('WebSocket not supported in this environment');
                return;
            }
            
            this.connectionState = 'connecting';
            
            // Create WebSocket connection with error handling
            this.websocket = new WebSocket(this.config.websocketUrl);
            
            // Set up event handlers
            this.websocket.onopen = (event) => {
                console.log('WebSocket connected successfully');
                this.connectionState = 'connected';
                this.reconnectAttempts = this.config.reconnectAttempts;
                this.reconnectDelay = 1000;
                
                // Start heartbeat
                this.startHeartbeat();
                
                // Send queued messages
                this.processMessageQueue();
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.websocket.onerror = (error) => {
                // Suppress error logging for expected connection failures
                if (this.config.websocketUrl.includes('localhost')) {
                    console.warn('WebSocket server not available on localhost. Real-time features disabled.');
                    this.connectionState = 'disconnected';
                    // Enable fallback UI for localhost errors
                    this.enableFallbackUI();
                    return;
                }
                
                console.warn('WebSocket connection error - attempting fallback mode');
                this.connectionState = 'error';
                
                // Only attempt reconnection if we have attempts left
                if (this.reconnectAttempts > 0) {
                    this.attemptReconnection();
                } else {
                    console.log('Max reconnection attempts reached. Enabling fallback UI.');
                    this.enableFallbackUI();
                }
            };
            
            this.websocket.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                this.connectionState = 'disconnected';
                this.stopHeartbeat();
                
                // Attempt reconnection if not intentionally closed
                if (event.code !== 1000) {
                    if (this.reconnectAttempts > 0) {
                        this.attemptReconnection();
                    } else {
                        console.log('Max reconnection attempts reached. Enabling fallback UI.');
                        this.enableFallbackUI();
                    }
                }
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.connectionState = 'error';
        }
    }
    
    /**
     * Handle WebSocket messages
     * @param {Object} message - Received message
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'heartbeat':
                this.lastHeartbeat = Date.now();
                break;
            case 'user_joined':
                this.onlineUsers.add(message.userId);
                break;
            case 'user_left':
                this.onlineUsers.delete(message.userId);
                break;
            case 'file_shared':
            case 'comment_added':
            case 'workspace_created':
                this.triggerEventHandlers(message.eventType, message);
                break;
            default:
                console.log('Unknown WebSocket message type:', message.type);
        }
    }
    
    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.sendMessage({ type: 'heartbeat', timestamp: Date.now() });
            }
        }, this.config.heartbeatInterval);
    }
    
    /**
     * Stop heartbeat timer
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    
    /**
     * Attempt to reconnect WebSocket
     */
    attemptReconnection() {
        if (this.reconnectAttempts <= 0) {
            console.log('Max reconnection attempts reached. Enabling fallback UI.');
            this.enableFallbackUI();
            return;
        }
        
        this.reconnectAttempts--;
        console.log(`Attempting to reconnect WebSocket in ${this.reconnectDelay}ms... (${this.reconnectAttempts} attempts left)`);
        
        setTimeout(() => {
            this.initializeWebSocket();
        }, this.reconnectDelay);
        
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }
    
    /**
     * Send message through WebSocket
     * @param {Object} message - Message to send
     */
    sendMessage(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }
    
    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }
    
    /**
     * Trigger event handlers
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    triggerEventHandlers(eventType, data) {
        const handlers = this.eventHandlers.get(eventType) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventType}:`, error);
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
     * Enable fallback UI mode when WebSocket connection fails
     */
    enableFallbackUI() {
        console.warn('Enabling fallback UI mode - Real-time features disabled');
        
        // Show user notification about offline mode
        if (typeof window !== 'undefined' && window.toastManager) {
            window.toastManager.warning('Real-time collaboration disabled. Working in offline mode.');
        }
        
        // Update UI elements to show offline status
        this.updateUIForOfflineMode();
        
        // Disable real-time dependent features
        this.disableRealTimeFeatures();
    }
    
    /**
     * Update UI elements to reflect offline mode
     */
    updateUIForOfflineMode() {
        const workspaceStatusEl = document.getElementById('workspaceStatus');
        if (workspaceStatusEl) {
            workspaceStatusEl.textContent = 'Offline Mode';
            workspaceStatusEl.className = 'status disconnected';
        }
        
        const collaborationTab = document.getElementById('collaboration-tab');
        if (collaborationTab) {
            const offlineNotice = document.createElement('div');
            offlineNotice.className = 'offline-notice';
            offlineNotice.innerHTML = `
                <div class="alert alert-warning">
                    <strong>⚠️ Offline Mode</strong><br>
                    Real-time collaboration features are temporarily unavailable.
                    You can continue working, and changes will sync when connection is restored.
                </div>
            `;
            collaborationTab.insertBefore(offlineNotice, collaborationTab.firstChild);
        }
    }
    
    /**
     * Disable real-time dependent features
     */
    disableRealTimeFeatures() {
        // Disable real-time buttons and features
        const realtimeButtons = document.querySelectorAll('[data-requires-realtime]');
        realtimeButtons.forEach(button => {
            button.disabled = true;
            button.title = 'This feature requires real-time connection';
        });
        
        // Show fallback messages for collaboration features
        const collaborationElements = document.querySelectorAll('.collaboration-feature');
        collaborationElements.forEach(element => {
            element.style.opacity = '0.5';
            element.style.pointerEvents = 'none';
        });
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