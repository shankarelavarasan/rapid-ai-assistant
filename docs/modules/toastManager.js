/**
 * Toast Notification Manager
 * Provides user feedback through toast notifications
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        this.container = document.querySelector('.toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type of toast (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (default: 5000)
     * @param {Object} options - Additional options
     */
    show(message, type = 'info', duration = 5000, options = {}) {
        const toastId = this.generateId();
        const toast = this.createToast(toastId, message, type, options);
        
        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * Create toast element
     */
    createToast(id, message, type, options) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', id);
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        const icon = this.getIcon(type);
        const closeButton = options.closable !== false ? this.createCloseButton(id) : '';

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
                ${closeButton}
            </div>
        `;

        // Add click handler for close button
        if (options.closable !== false) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.remove(id));
        }

        return toast;
    }

    /**
     * Create close button
     */
    createCloseButton(id) {
        return `
            <button class="toast-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
    }

    /**
     * Get icon for toast type
     */
    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="12" y1="16" x2="12" y2="12"></line>
                     <line x1="12" y1="8" x2="12.01" y2="8"></line>
                   </svg>`
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove a toast
     */
    remove(toastId) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(toastId);
            }, 300);
        }
    }

    /**
     * Clear all toasts
     */
    clear() {
        this.toasts.forEach((toast, id) => {
            this.remove(id);
        });
    }

    /**
     * Convenience methods
     */
    success(message, duration = 4000, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    error(message, duration = 6000, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    warning(message, duration = 5000, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    info(message, duration = 4000, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    /**
     * Show loading toast
     */
    loading(message = 'Processing...', options = {}) {
        const loadingToast = this.show(message, 'info', 0, { 
            ...options, 
            closable: false 
        });
        
        // Add loading animation
        const toast = this.toasts.get(loadingToast);
        if (toast) {
            toast.classList.add('loading');
            const icon = toast.querySelector('.toast-icon');
            icon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            `;
        }
        
        return loadingToast;
    }

    /**
     * Update loading toast to success/error
     */
    updateLoading(toastId, message, type = 'success', duration = 4000) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.classList.remove('loading');
            toast.className = `toast ${type}`;
            
            const messageEl = toast.querySelector('.toast-message');
            const iconEl = toast.querySelector('.toast-icon');
            
            if (messageEl) messageEl.textContent = message;
            if (iconEl) iconEl.innerHTML = this.getIcon(type);
            
            // Add close button if it doesn't exist
            if (!toast.querySelector('.toast-close')) {
                const content = toast.querySelector('.toast-content');
                content.insertAdjacentHTML('beforeend', this.createCloseButton(toastId));
                const closeBtn = toast.querySelector('.toast-close');
                closeBtn.addEventListener('click', () => this.remove(toastId));
            }
            
            // Auto-remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    this.remove(toastId);
                }, duration);
            }
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const toastManager = new ToastManager();

// Export for module usage
export { toastManager };

// Also make it globally available
window.toastManager = toastManager;

// Add additional CSS for toast animations
const additionalStyles = `
.toast-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.toast-message {
    flex: 1;
    font-weight: 500;
}

.toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: opacity 0.2s ease-in-out;
    min-height: auto;
}

.toast-close:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
    transform: none;
    box-shadow: none;
}

.toast.removing {
    animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideOut {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Responsive toast positioning */
@media (max-width: 768px) {
    .toast-container {
        top: var(--space-2);
        left: var(--space-2);
        right: var(--space-2);
    }
    
    .toast {
        min-width: auto;
        max-width: none;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);