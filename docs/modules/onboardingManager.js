/**
 * Onboarding Manager
 * Provides guided tours and tooltips for new users
 */

import { toastManager } from './toastManager.js';

class OnboardingManager {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
        this.steps = [];
        this.onboardingKey = 'rapid_ai_onboarding_completed';
        this.init();
    }

    init() {
        // Check if onboarding has been completed
        if (!this.hasCompletedOnboarding()) {
            // Start onboarding after a short delay
            setTimeout(() => {
                this.startOnboarding();
            }, 1000);
        }

        // Add keyboard event listener for ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.skipOnboarding();
            }
        });
    }

    /**
     * Define onboarding steps
     */
    defineSteps() {
        this.steps = [
            {
                target: '.mobile-header',
                title: 'Welcome to Rapid AI Assistant! 🚀',
                content: 'This is your modern AI assistant interface. On mobile, use the hamburger menu to access controls. Choose between Work and Chat.',
                position: 'bottom',
                highlight: true
            },
            {
                target: '.hamburger-menu',
                title: 'Mobile Navigation',
                content: 'On mobile devices, tap this menu to open the control panel with all your tools and options.',
                position: 'bottom',
                highlight: true
            },
            {
                target: '.left-panel',
                title: 'Control Panel',
                content: 'This is your control center. Upload files, select templates, and configure processing options here. On mobile, it slides out from the side.',
                position: 'right',
                highlight: true
            },
            {
                target: '#fileInput',
                title: 'File Upload',
                content: 'Start by uploading your documents here. Supports PDF, DOCX, TXT and more file formats.',
                position: 'right',
                highlight: true
            },
            {
                target: '#promptTextarea',
                title: 'Custom Instructions',
                content: 'Add specific instructions for how you want your files processed. Be as detailed as you need!',
                position: 'top',
                highlight: true
            },
            {
                target: '#processBtn',
                title: 'Process Files',
                content: 'Click here to start processing your uploaded files with AI. Results will appear in the chat area.',
                position: 'top',
                highlight: true
            },
            {
                target: '.chat-container',
                title: 'Results & Chat',
                content: 'Your processed results and AI responses will appear here. You can interact with the AI for follow-up questions.',
                position: 'left',
                highlight: true
            },
            {
                target: '#helpBtn',
                title: 'Need Help?',
                content: 'Click the help button anytime to restart this tour. You\'re all set to start using Rapid AI Assistant!',
                position: 'left',
                highlight: true
            }
        ];
    }

    /**
     * Start the onboarding process
     */
    startOnboarding() {
        if (this.isActive) {return;}
        
        this.defineSteps();
        this.isActive = true;
        this.currentStep = 0;
        
        this.createOverlay();
        this.showStep(0);
        
        toastManager.info('Welcome! Let\'s take a quick tour of the features.', 3000);
    }

    /**
     * Create overlay for highlighting elements
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.overlay.innerHTML = `
            <div class="onboarding-backdrop"></div>
            <div class="onboarding-highlight"></div>
        `;
        document.body.appendChild(this.overlay);
    }

    /**
     * Show a specific step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.completeOnboarding();
            return;
        }

        const step = this.steps[stepIndex];
        const target = document.querySelector(step.target);
        
        if (!target) {
            // Skip this step if target doesn't exist
            this.nextStep();
            return;
        }

        this.currentStep = stepIndex;
        this.highlightElement(target);
        this.showTooltip(step, target);
    }

    /**
     * Highlight an element
     */
    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        const highlight = this.overlay.querySelector('.onboarding-highlight');
        
        highlight.style.top = `${rect.top - 8}px`;
        highlight.style.left = `${rect.left - 8}px`;
        highlight.style.width = `${rect.width + 16}px`;
        highlight.style.height = `${rect.height + 16}px`;
        highlight.style.borderRadius = '12px';
    }

    /**
     * Show tooltip for current step
     */
    showTooltip(step, target) {
        if (this.tooltip) {
            this.tooltip.remove();
        }

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'onboarding-tooltip';
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <h3>${step.title}</h3>
                <button class="tooltip-close" aria-label="Close tour">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="tooltip-content">
                <p>${step.content}</p>
            </div>
            <div class="tooltip-footer">
                <div class="step-indicator">
                    <span>${this.currentStep + 1} of ${this.steps.length}</span>
                </div>
                <div class="tooltip-buttons">
                    ${this.currentStep > 0 ? '<button class="btn-secondary tooltip-prev">Previous</button>' : ''}
                    <button class="btn-secondary tooltip-skip">Skip Tour</button>
                    <button class="btn-primary tooltip-next">
                        ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltip);
        this.positionTooltip(step, target);
        this.attachTooltipEvents();

        // Animate in
        requestAnimationFrame(() => {
            this.tooltip.classList.add('show');
        });
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(step, target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let top, left;
        
        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 16;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 16;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 16;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 16;
                break;
            default:
                top = rect.bottom + 16;
                left = rect.left;
        }
        
        // Ensure tooltip stays within viewport
        if (left < 16) {left = 16;}
        if (left + tooltipRect.width > viewportWidth - 16) {
            left = viewportWidth - tooltipRect.width - 16;
        }
        if (top < 16) {top = 16;}
        if (top + tooltipRect.height > viewportHeight - 16) {
            top = viewportHeight - tooltipRect.height - 16;
        }
        
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    /**
     * Attach event listeners to tooltip buttons
     */
    attachTooltipEvents() {
        const nextBtn = this.tooltip.querySelector('.tooltip-next');
        const prevBtn = this.tooltip.querySelector('.tooltip-prev');
        const skipBtn = this.tooltip.querySelector('.tooltip-skip');
        const closeBtn = this.tooltip.querySelector('.tooltip-close');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipOnboarding());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.skipOnboarding());
        }
    }

    /**
     * Go to next step
     */
    nextStep() {
        this.showStep(this.currentStep + 1);
    }

    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Skip onboarding
     */
    skipOnboarding() {
        this.cleanup();
        toastManager.info('You can restart the tour anytime from the help menu.', 3000);
    }

    /**
     * Complete onboarding
     */
    completeOnboarding() {
        this.markAsCompleted();
        this.cleanup();
        toastManager.success('Great! You\'re all set to start using Rapid AI Assistant. 🎉', 4000);
    }

    /**
     * Clean up onboarding elements
     */
    cleanup() {
        this.isActive = false;
        
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    /**
     * Check if onboarding has been completed
     */
    hasCompletedOnboarding() {
        return localStorage.getItem(this.onboardingKey) === 'true';
    }

    /**
     * Mark onboarding as completed
     */
    markAsCompleted() {
        localStorage.setItem(this.onboardingKey, 'true');
    }

    /**
     * Reset onboarding (for testing or user request)
     */
    resetOnboarding() {
        localStorage.removeItem(this.onboardingKey);
        this.cleanup();
    }

    /**
     * Restart onboarding
     */
    restartOnboarding() {
        this.cleanup();
        setTimeout(() => {
            this.startOnboarding();
        }, 100);
    }

    /**
     * Show contextual tooltip for specific element
     */
    showContextualTooltip(selector, title, content, duration = 5000) {
        const element = document.querySelector(selector);
        if (!element) {return;}

        const tooltip = document.createElement('div');
        tooltip.className = 'contextual-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${title}</h4>
            </div>
            <div class="tooltip-content">
                <p>${content}</p>
            </div>
        `;

        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + 8}px`;
        tooltip.style.left = `${rect.left}px`;
        
        // Show tooltip
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });

        // Auto-remove
        setTimeout(() => {
            tooltip.classList.add('removing');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }, duration);
    }
}

// Create global instance
const onboardingManager = new OnboardingManager();

// Export for module usage
export { onboardingManager };

// Also make it globally available
window.onboardingManager = onboardingManager;

// Add CSS for onboarding
const onboardingStyles = `
.onboarding-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
}

.onboarding-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.onboarding-highlight {
    position: absolute;
    background-color: transparent;
    border: 3px solid var(--accent-green);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease-in-out;
    pointer-events: auto;
}

.onboarding-tooltip {
    position: fixed;
    background-color: var(--white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 320px;
    min-width: 280px;
    z-index: 10000;
    opacity: 0;
    transform: scale(0.9) translateY(10px);
    transition: all 0.3s ease-out;
    pointer-events: auto;
}

.onboarding-tooltip.show {
    opacity: 1;
    transform: scale(1) translateY(0);
}

.tooltip-header {
    padding: var(--space-3) var(--space-3) var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tooltip-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--gray-900);
}

.tooltip-header h4 {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--gray-900);
}

.tooltip-close {
    background: none;
    border: none;
    color: var(--gray-500);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: auto;
    transition: color 0.2s ease-in-out;
}

.tooltip-close:hover {
    color: var(--gray-700);
    background-color: var(--gray-100);
    transform: none;
    box-shadow: none;
}

.tooltip-content {
    padding: var(--space-2) var(--space-3);
}

.tooltip-content p {
    margin: 0;
    color: var(--gray-600);
    line-height: var(--leading-relaxed);
}

.tooltip-footer {
    padding: var(--space-2) var(--space-3) var(--space-3) var(--space-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--gray-200);
}

.step-indicator {
    font-size: var(--font-size-sm);
    color: var(--gray-500);
    font-weight: 500;
}

.tooltip-buttons {
    display: flex;
    gap: var(--space-2);
}

.tooltip-buttons button {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-sm);
    min-height: auto;
}

.contextual-tooltip {
    position: fixed;
    background-color: var(--gray-800);
    color: var(--white);
    border-radius: var(--radius);
    padding: var(--space-2) var(--space-3);
    max-width: 250px;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease-out;
    box-shadow: var(--shadow-lg);
}

.contextual-tooltip.show {
    opacity: 1;
    transform: translateY(0);
}

.contextual-tooltip.removing {
    opacity: 0;
    transform: translateY(-10px);
}

.contextual-tooltip .tooltip-header {
    padding: 0 0 var(--space-1) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.contextual-tooltip .tooltip-header h4 {
    color: var(--white);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.contextual-tooltip .tooltip-content {
    padding: var(--space-1) 0 0 0;
}

.contextual-tooltip .tooltip-content p {
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--font-size-sm);
    line-height: var(--leading-normal);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .onboarding-tooltip {
        max-width: calc(100vw - var(--space-4));
        min-width: auto;
    }
    
    .tooltip-footer {
        flex-direction: column;
        gap: var(--space-2);
        align-items: stretch;
    }
    
    .tooltip-buttons {
        justify-content: stretch;
    }
    
    .tooltip-buttons button {
        flex: 1;
    }
}
`;

// Inject onboarding styles
const styleSheet = document.createElement('style');
styleSheet.textContent = onboardingStyles;
document.head.appendChild(styleSheet);