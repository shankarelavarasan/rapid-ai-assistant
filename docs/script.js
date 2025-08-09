import { initializeFileSelection } from './modules/fileSelectionFixed.js';
import { initializeTemplateSelection } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import { processor } from './modules/integratedProcessor.js';
import { uiManager } from './modules/uiManager.js';
import { errorHandler } from './modules/errorHandler.js';
import { stateManager } from './modules/stateManager.js';
import { toastManager } from './modules/toastManager.js';
import { onboardingManager } from './modules/onboardingManager.js';

// Phase 1 Enhanced Modules
import { FolderManager } from './modules/folderManager.js';
import { TamilLanguageManager } from './modules/tamilLanguageManager.js';
import { GeminiDocumentProcessor } from './modules/geminiDocumentProcessor.js';
import { BatchProcessor } from './modules/batchProcessor.js';
import { DocumentClassifier } from './modules/documentClassifier.js';
import { ResultsManager } from './modules/resultsManager.js';
import { FileProcessingPipeline } from './modules/fileProcessingPipeline.js';
import { OCRProcessor } from './modules/ocrProcessor.js';

// Phase 3 Advanced Modules
import { AnalyticsDashboard } from './modules/analyticsDashboard.js';
import { FileOrganizer } from './modules/fileOrganizer.js';
import { CollaborationTools } from './modules/collaborationTools.js';
import { EnterpriseAPI } from './modules/enterpriseAPI.js';

// API Configuration
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:9999',
    wsUrl: 'ws://localhost:9999',
  },
  production: {
    baseUrl: 'https://rapid-ai-assistant.onrender.com',
    wsUrl: 'wss://rapid-ai-assistant.onrender.com',
  },
};

// Get environment based on hostname
const isProduction = window.location.hostname === 'shankarelavarasan.github.io';
const API_URLS = isProduction ? API_CONFIG.production : API_CONFIG.development;

// Initialize Phase 1 Enhanced Modules
let folderManager;
let tamilLanguageManager;
let geminiDocumentProcessor;
let batchProcessor;
let documentClassifier;
let resultsManager;
let fileProcessingPipeline;
let ocrProcessor;

// Initialize Phase 3 Advanced Modules
let analyticsDashboard;
let fileOrganizer;
let collaborationTools;
let enterpriseAPI;

// Initialize Phase 1 Modules Function
async function initializePhase1Modules() {
  try {
    // Initialize folder manager for enhanced folder selection
    folderManager = new FolderManager();
    
    // Initialize Tamil language manager
    tamilLanguageManager = new TamilLanguageManager();
    
    // Initialize Gemini document processor
    geminiDocumentProcessor = new GeminiDocumentProcessor({
      apiKey: 'your-gemini-api-key', // This should be configured properly
      model: 'gemini-1.5-flash'
    });
    
    // Initialize batch processor
    batchProcessor = new BatchProcessor();
    
    // Initialize document classifier
    documentClassifier = new DocumentClassifier();
    
    // Initialize results manager
    resultsManager = new ResultsManager();
    
    // Initialize OCR processor
    ocrProcessor = new OCRProcessor();
    
    // Initialize file processing pipeline
    fileProcessingPipeline = new FileProcessingPipeline({
      geminiProcessor: geminiDocumentProcessor,
      batchProcessor: batchProcessor,
      classifier: documentClassifier,
      resultsManager: resultsManager,
      ocrProcessor: ocrProcessor
    });
    
    // Setup folder selection enhancement
    setupFolderSelection();
    
    // Setup Tamil language toggle
    setupTamilLanguageToggle();
    
    console.log('Phase 1 modules initialized successfully');
    toastManager.success('Enhanced AI features loaded successfully!');
    
    // Initialize Phase 3 modules
    await initializePhase3Modules();
  } catch (error) {
    console.error('Error initializing Phase 1 modules:', error);
    toastManager.error('Error loading enhanced features');
  }
}

// Initialize Phase 3 Advanced Modules Function
async function initializePhase3Modules() {
  try {
    // Initialize analytics dashboard with error handling
    try {
      if (typeof AnalyticsDashboard !== 'undefined') {
        analyticsDashboard = new AnalyticsDashboard({
          enableRealTimeUpdates: true,
          dataRetentionDays: 30,
          enableExport: true
        });
        await analyticsDashboard.initialize();
        console.log('AnalyticsDashboard initialized successfully');
      } else {
        console.warn('AnalyticsDashboard class not available, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing AnalyticsDashboard:', error);
    }
    
    // Initialize file organizer with error handling
    try {
      if (typeof FileOrganizer !== 'undefined') {
        fileOrganizer = new FileOrganizer({
          enableAutoOrganization: false,
          defaultStrategy: 'smart',
          enableSmartRenaming: true
        });
        await fileOrganizer.initialize();
        console.log('FileOrganizer initialized successfully');
      } else {
        console.warn('FileOrganizer class not available, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing FileOrganizer:', error);
    }
    
    // Initialize collaboration tools with error handling
    try {
      if (typeof CollaborationTools !== 'undefined') {
        collaborationTools = new CollaborationTools({
          enableRealTimeUpdates: true,
          maxWorkspaceMembers: 10,
          enableFileSharing: true
        });
        await collaborationTools.initialize();
        console.log('CollaborationTools initialized successfully');
      } else {
        console.warn('CollaborationTools class not available, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing CollaborationTools:', error);
    }
    
    // Initialize enterprise API with error handling
    try {
      if (typeof EnterpriseAPI !== 'undefined') {
        enterpriseAPI = new EnterpriseAPI({
          enableCloudStorage: true,
          enableCRM: false,
          enableWorkflow: false
        });
        await enterpriseAPI.initialize();
        console.log('EnterpriseAPI initialized successfully');
      } else {
        console.warn('EnterpriseAPI class not available, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing EnterpriseAPI:', error);
    }
    
    // Setup Phase 3 UI handlers
    try {
      setupPhase3UIHandlers();
      console.log('Phase 3 UI handlers setup successfully');
    } catch (error) {
      console.error('Error setting up Phase 3 UI handlers:', error);
    }
    
    console.log('Phase 3 modules initialization completed');
    toastManager.success('Advanced features loaded successfully!');
  } catch (error) {
    console.error('Error initializing Phase 3 modules:', error);
    toastManager.error('Error loading advanced features');
  }
}

// Setup enhanced folder selection
function setupFolderSelection() {
  const folderInput = document.getElementById('folderInput');
  const selectFolderBtn = document.getElementById('selectFolderBtn');
  
  // Add click handler for folder selection button
  if (selectFolderBtn) {
    selectFolderBtn.addEventListener('click', () => {
      folderInput.click();
    });
  }
  
  if (folderInput && folderManager) {
    folderInput.addEventListener('change', async (event) => {
      try {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
          toastManager.success(`Selected ${files.length} files from folder`);
          
          // Update UI to show folder processing mode
          const processBtn = document.getElementById('processBtn');
          const processingModeIndicator = document.getElementById('processingModeIndicator');
          const folderStats = document.getElementById('folderStats');
          
          if (processBtn) {
            processBtn.textContent = '🤖 Process Folder (Enhanced)';
            processBtn.dataset.mode = 'folder';
            processBtn.classList.add('enhanced-processing-btn');
          }
          
          // Show processing mode indicator
          if (processingModeIndicator) {
            processingModeIndicator.style.display = 'block';
          }
          
          // Update folder stats
          if (folderStats) {
            const fileTypes = {};
            files.forEach(file => {
              const ext = file.name.split('.').pop().toLowerCase();
              fileTypes[ext] = (fileTypes[ext] || 0) + 1;
            });
            
            const statsHtml = `
              <strong>📁 Folder Analysis:</strong><br>
              📄 Total files: ${files.length}<br>
              📊 File types: ${Object.entries(fileTypes).map(([ext, count]) => `${ext.toUpperCase()}: ${count}`).join(', ')}<br>
              🤖 Enhanced AI processing enabled
            `;
            folderStats.innerHTML = statsHtml;
          }
          
          // Store files in state manager for processing
          stateManager.state.selectedFiles = files;
          
          // Update integratedProcessor with selected files
          if (processor && processor.handleFileSelection) {
            processor.handleFileSelection(files);
          }
        }
      } catch (error) {
        console.error('Error handling folder selection:', error);
        toastManager.error('Error processing folder selection');
      }
    });
  }
  
  // Also setup regular file selection to hide enhanced mode
  const fileInput = document.getElementById('fileInput');
  const selectFileBtn = document.getElementById('selectFileBtn');
  
  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        // Hide enhanced mode for regular file selection
        const processingModeIndicator = document.getElementById('processingModeIndicator');
        const processBtn = document.getElementById('processBtn');
        
        if (processingModeIndicator) {
          processingModeIndicator.style.display = 'none';
        }
        
        if (processBtn) {
          processBtn.textContent = 'Process';
          processBtn.dataset.mode = '';
          processBtn.classList.remove('enhanced-processing-btn');
        }
        
        // Update integratedProcessor with selected files
        if (processor && processor.handleFileSelection) {
          processor.handleFileSelection(files);
        }
      }
    });
  }
}

// Setup Tamil language toggle
function setupTamilLanguageToggle() {
  const languageSelect = document.getElementById('languageSelect');
  
  if (languageSelect && tamilLanguageManager) {
    // Add Tamil option if not present
    const tamilOption = Array.from(languageSelect.options).find(option => option.value === 'ta');
    if (!tamilOption) {
      const option = document.createElement('option');
      option.value = 'ta';
      option.textContent = 'தமிழ் (Tamil)';
      languageSelect.appendChild(option);
    }
    
    languageSelect.addEventListener('change', async (event) => {
      const selectedLanguage = event.target.value;
      
      if (selectedLanguage === 'ta') {
        try {
          await tamilLanguageManager.translateUI();
          toastManager.success('UI translated to Tamil');
        } catch (error) {
          console.error('Error translating to Tamil:', error);
          toastManager.error('Error translating UI');
        }
      } else {
        // Restore English UI
        tamilLanguageManager.restoreOriginalUI();
        toastManager.success('UI restored to English');
      }
    });
  }
}

// Setup Phase 3 UI Handlers
function setupPhase3UIHandlers() {
  // Analytics Dashboard Handlers
  const exportAnalyticsBtn = document.getElementById('exportAnalyticsBtn');
  const resetAnalyticsBtn = document.getElementById('resetAnalyticsBtn');
  
  if (exportAnalyticsBtn) {
    exportAnalyticsBtn.addEventListener('click', async () => {
      try {
        const data = await analyticsDashboard.exportData('json');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toastManager.success('Analytics data exported successfully!');
      } catch (error) {
        console.error('Export error:', error);
        toastManager.error('Failed to export analytics data');
      }
    });
  }
  
  if (resetAnalyticsBtn) {
    resetAnalyticsBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all analytics data?')) {
        try {
          await analyticsDashboard.resetData();
          updateAnalyticsDisplay();
          toastManager.success('Analytics data reset successfully!');
        } catch (error) {
          console.error('Reset error:', error);
          toastManager.error('Failed to reset analytics data');
        }
      }
    });
  }
  
  // File Organization Handlers
  const autoOrganizeToggle = document.getElementById('autoOrganize');
  const organizationStrategy = document.getElementById('organizationStrategy');
  const smartRenamingToggle = document.getElementById('smartRename');
  const organizeFilesBtn = document.getElementById('organizeNowBtn');
  const previewOrganizationBtn = document.getElementById('previewOrganizationBtn');
  
  if (autoOrganizeToggle) {
    autoOrganizeToggle.addEventListener('change', (e) => {
      fileOrganizer.updateConfig({ enableAutoOrganization: e.target.checked });
    });
  }
  
  if (organizationStrategy) {
    organizationStrategy.addEventListener('change', (e) => {
      fileOrganizer.updateConfig({ defaultStrategy: e.target.value });
    });
  }
  
  if (smartRenamingToggle) {
    smartRenamingToggle.addEventListener('change', (e) => {
      fileOrganizer.updateConfig({ enableSmartRenaming: e.target.checked });
    });
  }
  
  if (organizeFilesBtn) {
    organizeFilesBtn.addEventListener('click', async () => {
      try {
        const files = getSelectedFiles();
        if (files.length === 0) {
          toastManager.warning('Please select files to organize');
          return;
        }
        
        const result = await fileOrganizer.organizeFiles(files);
        toastManager.success(`Organized ${result.organized} files successfully!`);
        updateFileOrganizationDisplay();
      } catch (error) {
        console.error('Organization error:', error);
        toastManager.error('Failed to organize files');
      }
    });
  }
  
  if (previewOrganizationBtn) {
    previewOrganizationBtn.addEventListener('click', async () => {
      try {
        const files = getSelectedFiles();
        if (files.length === 0) {
          toastManager.warning('Please select files to preview organization');
          return;
        }
        
        const preview = await fileOrganizer.previewOrganization(files);
        displayOrganizationPreview(preview);
      } catch (error) {
        console.error('Preview error:', error);
        toastManager.error('Failed to preview organization');
      }
    });
  }
  
  // Collaboration Handlers
  const createWorkspaceBtn = document.getElementById('createWorkspace');
  const joinWorkspaceBtn = document.getElementById('joinWorkspace');
  const shareFileBtn = document.getElementById('shareFile');
  const addCommentBtn = document.getElementById('addComment');
  
  if (createWorkspaceBtn) {
    createWorkspaceBtn.addEventListener('click', async () => {
      const name = prompt('Enter workspace name:');
      if (name) {
        try {
          const workspace = await collaborationTools.createWorkspace(name);
          toastManager.success(`Workspace "${name}" created successfully!`);
          updateCollaborationDisplay();
        } catch (error) {
          console.error('Workspace creation error:', error);
          toastManager.error('Failed to create workspace');
        }
      }
    });
  }
  
  if (joinWorkspaceBtn) {
    joinWorkspaceBtn.addEventListener('click', async () => {
      const workspaceId = prompt('Enter workspace ID:');
      if (workspaceId) {
        try {
          await collaborationTools.joinWorkspace(workspaceId);
          toastManager.success('Joined workspace successfully!');
          updateCollaborationDisplay();
        } catch (error) {
          console.error('Join workspace error:', error);
          toastManager.error('Failed to join workspace');
        }
      }
    });
  }
  
  if (shareFileBtn) {
    shareFileBtn.addEventListener('click', async () => {
      try {
        const files = getSelectedFiles();
        if (files.length === 0) {
          toastManager.warning('Please select files to share');
          return;
        }
        
        const permissions = document.querySelector('input[name="sharePermission"]:checked')?.value || 'view';
        const result = await collaborationTools.shareFile(files[0], { permissions });
        toastManager.success('File shared successfully!');
        updateCollaborationDisplay();
      } catch (error) {
        console.error('File sharing error:', error);
        toastManager.error('Failed to share file');
      }
    });
  }
  
  if (addCommentBtn) {
    addCommentBtn.addEventListener('click', async () => {
      const commentInput = document.getElementById('commentInput');
      const comment = commentInput?.value.trim();
      
      if (comment) {
        try {
          await collaborationTools.addComment('current-file', comment);
          commentInput.value = '';
          toastManager.success('Comment added successfully!');
          updateCommentsDisplay();
        } catch (error) {
          console.error('Comment error:', error);
          toastManager.error('Failed to add comment');
        }
      }
    });
  }
  
  // Enterprise Integration Handlers
  const connectGoogleDriveBtn = document.getElementById('connectGoogleDrive');
  const connectSlackBtn = document.getElementById('connectSlack');
  const connectSalesforceBtn = document.getElementById('connectSalesforce');
  
  if (connectGoogleDriveBtn) {
    connectGoogleDriveBtn.addEventListener('click', async () => {
      try {
        await enterpriseAPI.enableIntegration('googleDrive');
        toastManager.success('Google Drive connected successfully!');
        updateIntegrationsDisplay();
      } catch (error) {
        console.error('Google Drive connection error:', error);
        toastManager.error('Failed to connect Google Drive');
      }
    });
  }
  
  if (connectSlackBtn) {
    connectSlackBtn.addEventListener('click', async () => {
      try {
        await enterpriseAPI.enableIntegration('slack');
        toastManager.success('Slack connected successfully!');
        updateIntegrationsDisplay();
      } catch (error) {
        console.error('Slack connection error:', error);
        toastManager.error('Failed to connect Slack');
      }
    });
  }
  
  if (connectSalesforceBtn) {
    connectSalesforceBtn.addEventListener('click', async () => {
      try {
        await enterpriseAPI.enableIntegration('salesforce');
        toastManager.success('Salesforce connected successfully!');
        updateIntegrationsDisplay();
      } catch (error) {
        console.error('Salesforce connection error:', error);
        toastManager.error('Failed to connect Salesforce');
      }
    });
  }
  
  // Update displays on load with error handling
  try {
    updateAnalyticsDisplay();
  } catch (error) {
    console.error('Error updating analytics display:', error);
  }
  
  try {
    updateFileOrganizationDisplay();
  } catch (error) {
    console.error('Error updating file organization display:', error);
  }
  
  try {
    updateCollaborationDisplay();
  } catch (error) {
    console.error('Error updating collaboration display:', error);
  }
  
  try {
    updateIntegrationsDisplay();
  } catch (error) {
    console.error('Error updating integrations display:', error);
  }
}

// Helper functions for Phase 3 UI updates
function updateAnalyticsDisplay() {
  try {
    if (typeof analyticsDashboard !== 'undefined' && analyticsDashboard) {
      const report = analyticsDashboard.generateReport();
      
      // Update processing stats with null checks
      const totalFilesEl = document.getElementById('totalProcessedFiles');
      const avgTimeEl = document.getElementById('avgProcessingTime');
      const successRateEl = document.getElementById('successRate');
      
      // Use optional chaining and provide fallback values
      if (totalFilesEl && report) {
        totalFilesEl.textContent = report?.processing?.totalFiles ?? 0;
      }
      if (avgTimeEl && report) {
        const avgTime = report?.processing?.averageTime ?? 0;
        avgTimeEl.textContent = `${avgTime}ms`;
      }
      if (successRateEl && report) {
        const successRate = report?.processing?.successRate ?? 0;
        successRateEl.textContent = `${successRate}%`;
      }
    }
  } catch (error) {
    console.error('Error in updateAnalyticsDisplay:', error);
  }
}

function updateFileOrganizationDisplay() {
  // Update file organization status and stats
  const statusEl = document.getElementById('organizationStatus');
  if (statusEl && fileOrganizer) {
    const status = fileOrganizer.getOrganizationStatus();
    statusEl.textContent = `${status.organized} files organized`;
  }
}

function updateCollaborationDisplay() {
  if (collaborationTools) {
    try {
      const status = collaborationTools.getCollaborationStatus();
      
      // Update workspace info with null safety
      const workspaceStatusEl = document.getElementById('workspaceStatus');
      const workspaceDetailsEl = document.getElementById('workspaceDetails');
      
      if (workspaceStatusEl) {
        const isConnected = status && status.currentWorkspace;
        workspaceStatusEl.textContent = isConnected ? 'Connected' : 'Not connected';
        workspaceStatusEl.className = `status ${isConnected ? 'connected' : 'disconnected'}`;
      }
      
      if (workspaceDetailsEl) {
        if (status && status.currentWorkspace) {
          const workspace = status.currentWorkspace;
          workspaceDetailsEl.innerHTML = `
            <div>Workspace: ${workspace.name || 'Unknown'}</div>
            <div>Members: ${workspace.members || 0}</div>
          `;
        } else {
          workspaceDetailsEl.innerHTML = `
            <div>Workspace: Not connected</div>
            <div>Members: 0</div>
          `;
        }
      }
    } catch (error) {
      console.warn('Error updating collaboration display:', error);
      // Fallback display
      const workspaceStatusEl = document.getElementById('workspaceStatus');
      const workspaceDetailsEl = document.getElementById('workspaceDetails');
      
      if (workspaceStatusEl) {
        workspaceStatusEl.textContent = 'Error';
        workspaceStatusEl.className = 'status disconnected';
      }
      
      if (workspaceDetailsEl) {
        workspaceDetailsEl.innerHTML = `
          <div>Workspace: Error loading</div>
          <div>Members: 0</div>
        `;
      }
    }
  }
}

function updateCommentsDisplay() {
  // Update comments list
  const commentsList = document.getElementById('commentsList');
  if (commentsList && collaborationTools) {
    // This would be populated with actual comments from the collaboration tools
    commentsList.innerHTML = '<div class="comment-item">Comments will appear here...</div>';
  }
}

function updateIntegrationsDisplay() {
  try {
    if (typeof enterpriseAPI !== 'undefined' && enterpriseAPI) {
      const status = enterpriseAPI.getIntegrationStatus();
      
      // Update integration statuses with null safety
      if (status && typeof status === 'object') {
        Object.entries(status).forEach(([integration, isConnected]) => {
          const statusEl = document.getElementById(`${integration}Status`);
          if (statusEl) {
            statusEl.textContent = isConnected ? 'Connected' : 'Not connected';
            statusEl.className = `status ${isConnected ? 'connected' : 'disconnected'}`;
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in updateIntegrationsDisplay:', error);
  }
}

function getSelectedFiles() {
  // Helper function to get currently selected files
  const fileInput = document.getElementById('fileInput');
  return fileInput?.files ? Array.from(fileInput.files) : [];
}

function displayOrganizationPreview(preview) {
  // Display organization preview in a modal or dedicated area
  console.log('Organization Preview:', preview);
  toastManager.info('Organization preview generated - check console for details');
}

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize all modules
  initializeFileSelection();
  await initializeTemplateSelection();
  initializeVoiceInput();
  processor.initialize();
  uiManager.initialize();
  
  // Initialize Phase 1 Enhanced Modules
  await initializePhase1Modules();
  
  // Initialize modern UI enhancements
  // toastManager and onboardingManager are auto-initialized
  
  // Add help button for restarting onboarding
  addHelpButton();
  
  // Initialize mobile navigation
  initializeMobileNavigation();
  
  // Synchronize mode buttons
  synchronizeModeButtons();
  
  // Initialize navigation tabs
  initializeNavigationTabs();
  
  // Initialize template cards
  initializeTemplateCards();
  
  // Initialize settings
  initializeSettings();

  const templateSelect = document.getElementById('templateSelect');

  // Add event listener for the Submit button (GitHub integration)
  if (uiManager.elements.submitBtn) {
    uiManager.elements.submitBtn.addEventListener('click', async () => {
    try {
      uiManager.addMessage('Pushing changes to GitHub...', 'user');

      const response = await errorHandler.wrapAsync(
        fetch(`${API_URLS.baseUrl}/api/github/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ message: 'Update from Rapid AI Assistant' }),
        })
      );

      const data = await response.json();

      if (response.ok) {
        const successMsg = `Successfully pushed to GitHub: ${data.message}`;
        uiManager.addMessage(successMsg, 'ai');
        toastManager.success('Changes pushed to GitHub successfully!');
      } else {
        const error = errorHandler.handleError(
          new Error(data.error),
          errorHandler.errorTypes.API_ERROR
        );
        uiManager.addMessage(error.message, 'error');
        toastManager.error('Failed to push to GitHub: ' + data.error);
      }
    } catch (error) {
      const handledError = errorHandler.handleError(
        error,
        errorHandler.errorTypes.API_ERROR
      );
      uiManager.addMessage(handledError.message, 'error');
      toastManager.error('GitHub push failed: ' + handledError.message);
    } finally {
      // Reset processing state
      const processBtn = document.getElementById('processBtn');
      if (processBtn) {
        processBtn.disabled = false;
        processBtn.textContent = 'Process';
      }
    }
  });
  }

  // Reset functionality is now handled by uiManager

  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.addEventListener('click', async () => {
    try {
      const prompt = uiManager.elements.promptTextarea.value;

      // Validate input
      errorHandler.validateInput(
        { prompt },
        {
          prompt: { required: true, minLength: 1 },
        }
      );

      const numFiles = stateManager.state.selectedFiles.length;
      if (numFiles > 0) {
        if (
          !confirm(
            `You are about to generate responses for ${numFiles} files. Proceed?`
          )
        ) {
          return;
        }
      }

      uiManager.setProcessingState(true);
      uiManager.addMessage(prompt, 'user');
      uiManager.elements.promptTextarea.value = '';

      // Check if using enhanced processing pipeline
      const isFolder = processBtn.dataset.mode === 'folder';
      const useEnhancedPipeline = isFolder && fileProcessingPipeline;

      if (useEnhancedPipeline) {
        // Use enhanced processing pipeline for folder processing
        try {
          toastManager.info('Using enhanced AI processing pipeline...');
          
          const processingOptions = {
            prompt: prompt,
            files: stateManager.state.selectedFiles,
            enableClassification: true,
            enableOCR: true,
            batchSize: 5
          };
          
          const results = await fileProcessingPipeline.processFiles(processingOptions);
          
          // Display enhanced results
          let previewHtml = '<div class="enhanced-results">';
          previewHtml += '<h3>🤖 Enhanced AI Processing Results</h3>';
          
          if (results.classification) {
            previewHtml += `<div class="classification-summary">`;
            previewHtml += `<h4>📊 Document Classification</h4>`;
            previewHtml += `<p>Total files processed: ${results.totalFiles}</p>`;
            previewHtml += `<p>Categories found: ${Object.keys(results.classification).join(', ')}</p>`;
            previewHtml += `</div>`;
          }
          
          if (results.responses && Array.isArray(results.responses)) {
            results.responses.forEach(resp => {
              previewHtml += `
                <div class="enhanced-response">
                  <h4>📄 ${resp.file ? `${resp.file}` : 'Response'}</h4>
                  ${resp.category ? `<span class="category-tag">${resp.category}</span>` : ''}
                  <div class="response-content">${resp.response}</div>
                </div>
              `;
            });
          }
          
          previewHtml += '</div>';
          uiManager.setPreviewContent(previewHtml);
          
          const combinedContent = results.responses
            .map(resp => 
              `${resp.file ? `File: ${resp.file}\n` : ''}${resp.category ? `Category: ${resp.category}\n` : ''}Response: ${resp.response}`
            )
            .join('\n\n');
          setupExportButtons(combinedContent);
          
          uiManager.addMessage('✨ Enhanced processing complete! Check preview for detailed results.', 'ai');
          toastManager.success('Enhanced AI processing completed successfully!');
        } catch (enhancedError) {
          console.error('Enhanced processing failed, falling back to standard processing:', enhancedError);
          toastManager.warning('Enhanced processing failed, using standard processing...');
          // Fall back to standard processing
          await performStandardProcessing(prompt);
        }
      } else {
        // Use standard processing
        await performStandardProcessing(prompt);
      }
    } catch (error) {
      const handledError = errorHandler.handleError(
        error,
        error.type || errorHandler.errorTypes.UNKNOWN_ERROR
      );
      uiManager.addMessage(handledError.message, 'error');
      toastManager.error('Processing failed: ' + handledError.message);
    } finally {
      uiManager.setProcessingState(false);
      // Reset process button
      processBtn.textContent = 'Process';
      processBtn.dataset.mode = '';
    }
  });
  }
  
  // Standard processing function
  async function performStandardProcessing(prompt) {
    const requestBody = { prompt };
    if (stateManager.state.mode === 'work') {
      const selectedTemplate = stateManager.state.selectedTemplate;
      requestBody.templateFile = selectedTemplate
        ? {
            name: selectedTemplate.name,
            content: selectedTemplate.content,
            type: selectedTemplate.type,
          }
        : null;
      requestBody.files = stateManager.state.selectedFiles;
    }

    const response = await errorHandler.wrapAsync(
      fetch(`${API_URLS.baseUrl}/api/ask-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })
    );

    if (!response.ok) {
      throw errorHandler.handleError(
        new Error(`HTTP error! status: ${response.status}`),
        errorHandler.errorTypes.API_ERROR
      );
    }

    const data = await response.json();

    if (stateManager.state.mode === 'work') {
      // Display preview
      let previewHtml = '';
      if (data.responses && Array.isArray(data.responses)) {
        data.responses.forEach(resp => {
          previewHtml += `
                          <div>
                              <h4>${resp.file ? `Response for ${resp.file}:` : 'Response:'}</h4>
                              <p>${resp.response}</p>
                          </div>
                      `;
        });
      } else {
        previewHtml = 'Unexpected response format.';
      }
      uiManager.setPreviewContent(previewHtml);

      const combinedContent = data.responses
        .map(
          resp =>
            (resp.file
              ? `Response for ${resp.file}:
`
              : '') + resp.response
        )
        .join('\n\n');
      setupExportButtons(combinedContent);

      uiManager.addMessage('Processing complete. Check preview.', 'ai');
      toastManager.success('Processing completed successfully!');
    } else {
      // Chat mode: display response in chat
      uiManager.addMessage(data.responses[0].response, 'ai');
      toastManager.success('Response generated successfully!');
    }
  }

  function setupExportButtons(content) {
    document.getElementById('exportPdfBtn').onclick = () =>
      exportAsPdf(content);
    document.getElementById('exportWordBtn').onclick = () =>
      exportAsDocx(content);
    document.getElementById('exportExcelBtn').onclick = () =>
      exportAsExcel(content);
    document.getElementById('exportTextBtn').onclick = () =>
      exportAsTxt(content);
  }

  function exportAsPdf(content) {
    try {
      // Check if jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error('jsPDF library not loaded');
        toastManager.error('PDF export library not available');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Split content into lines to handle long text
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 10, 10);
      doc.save('output.pdf');
      
      toastManager.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toastManager.error('Failed to export PDF: ' + error.message);
    }
  }

  function exportAsDocx(content) {
    const { Document, Packer, Paragraph } = window.docx;
    const doc = new Document({
      sections: [{ children: [new Paragraph(content)] }],
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'output.docx');
    });
  }

  function exportAsExcel(content) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([content.split('\n')]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'output.xlsx');
  }

  function exportAsTxt(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, 'output.txt');
  }
  
  // Add help button for restarting onboarding
  function addHelpButton() {
    const helpBtn = document.createElement('button');
    helpBtn.id = 'helpBtn';
    helpBtn.className = 'btn btn-secondary help-btn';
    helpBtn.innerHTML = '?';
    helpBtn.title = 'Show help and onboarding';
    helpBtn.onclick = () => {
      onboardingManager.startOnboarding();
    };
    
    // Add to the top-right corner of the page
    document.body.appendChild(helpBtn);
  }
  
  // Initialize mobile navigation
  function initializeMobileNavigation() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const leftPanel = document.getElementById('leftPanel');
    const panelClose = document.getElementById('panelClose');
    
    if (hamburgerMenu && leftPanel) {
      hamburgerMenu.addEventListener('click', () => {
        leftPanel.classList.toggle('panel-open');
        hamburgerMenu.classList.toggle('active');
      });
    }
    
    if (panelClose && leftPanel) {
      panelClose.addEventListener('click', () => {
        leftPanel.classList.remove('panel-open');
        hamburgerMenu.classList.remove('active');
      });
    }
    
    // Close panel when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !leftPanel.contains(e.target) && 
          !hamburgerMenu.contains(e.target) &&
          leftPanel.classList.contains('panel-open')) {
        leftPanel.classList.remove('panel-open');
        hamburgerMenu.classList.remove('active');
      }
    });
  }
  
  // Synchronize desktop and mobile mode buttons
  function synchronizeModeButtons() {
    const workBtn = document.getElementById('workBtn');
    const chatBtn = document.getElementById('chatBtn');
    const workBtnDesktop = document.getElementById('workBtnDesktop');
    const chatBtnDesktop = document.getElementById('chatBtnDesktop');
    
    // Sync mobile to desktop
    if (workBtn && workBtnDesktop) {
      workBtn.addEventListener('click', () => {
        workBtnDesktop.click();
      });
    }
    
    if (chatBtn && chatBtnDesktop) {
      chatBtn.addEventListener('click', () => {
        chatBtnDesktop.click();
      });
    }
    
    // Sync desktop to mobile
    if (workBtnDesktop && workBtn) {
      workBtnDesktop.addEventListener('click', () => {
        workBtn.classList.add('active');
        chatBtn.classList.remove('active');
      });
    }
    
    if (chatBtnDesktop && chatBtn) {
      chatBtnDesktop.addEventListener('click', () => {
        chatBtn.classList.add('active');
        workBtn.classList.remove('active');
      });
    }
   }
   
   // Initialize navigation tabs
   function initializeNavigationTabs() {
     const navTabs = document.querySelectorAll('.nav-tab');
     const tabContents = document.querySelectorAll('.tab-content');
     
     navTabs.forEach(tab => {
       tab.addEventListener('click', () => {
         const targetTab = tab.dataset.tab;
         
         // Remove active class from all tabs and contents
         navTabs.forEach(t => t.classList.remove('active'));
         tabContents.forEach(content => content.classList.remove('active'));
         
         // Add active class to clicked tab and corresponding content
         tab.classList.add('active');
         const targetContent = document.getElementById(`${targetTab}-tab`);
         if (targetContent) {
           targetContent.classList.add('active');
         }
       });
     });
   }
   
   // Initialize template cards
   function initializeTemplateCards() {
     const templateCards = document.querySelectorAll('.template-card');
     
     templateCards.forEach(card => {
       card.addEventListener('click', () => {
         // Remove selected class from all cards
         templateCards.forEach(c => c.classList.remove('selected'));
         
         // Add selected class to clicked card
         card.classList.add('selected');
         
         const templateType = card.dataset.template;
         
         // Set predefined prompts based on template type
         const promptTextarea = document.getElementById('promptTextarea');
         if (promptTextarea) {
           switch (templateType) {
             case 'summary':
               promptTextarea.value = 'Please provide a concise summary of the uploaded document(s), highlighting the key points and main ideas.';
               break;
             case 'analysis':
               promptTextarea.value = 'Analyze the content of the uploaded document(s) and provide insights on themes, structure, and important details.';
               break;
             case 'extraction':
               promptTextarea.value = 'Extract key information, data points, and important details from the uploaded document(s).';
               break;
             case 'translation':
               promptTextarea.value = 'Translate the content of the uploaded document(s) to [specify target language].';
               break;
           }
         }
         
         toastManager.success(`${card.querySelector('h4').textContent} template selected!`);
       });
     });
     
     // Create template button
     const createTemplateBtn = document.getElementById('createTemplateBtn');
     if (createTemplateBtn) {
       createTemplateBtn.addEventListener('click', () => {
         toastManager.info('Custom template creation feature coming soon!');
       });
     }
   }
   
   // Initialize settings
   function initializeSettings() {
     const themeSelect = document.getElementById('themeSelect');
     const languageSelect = document.getElementById('languageSelect');
     const autoSave = document.getElementById('autoSave');
     const notifications = document.getElementById('notifications');
     const showOnboardingBtn = document.getElementById('showOnboardingBtn');
     
     // Load saved settings
     if (themeSelect) {
       themeSelect.value = localStorage.getItem('theme') || 'light';
       themeSelect.addEventListener('change', (e) => {
         localStorage.setItem('theme', e.target.value);
         toastManager.success('Theme preference saved!');
       });
     }
     
     if (languageSelect) {
       languageSelect.value = localStorage.getItem('language') || 'en';
       languageSelect.addEventListener('change', (e) => {
         localStorage.setItem('language', e.target.value);
         toastManager.success('Language preference saved!');
       });
     }
     
     if (autoSave) {
       autoSave.checked = localStorage.getItem('autoSave') === 'true';
       autoSave.addEventListener('change', (e) => {
         localStorage.setItem('autoSave', e.target.checked);
         toastManager.success(`Auto-save ${e.target.checked ? 'enabled' : 'disabled'}!`);
       });
     }
     
     if (notifications) {
       notifications.checked = localStorage.getItem('notifications') !== 'false';
       notifications.addEventListener('change', (e) => {
         localStorage.setItem('notifications', e.target.checked);
         toastManager.success(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}!`);
       });
     }
     
     if (showOnboardingBtn) {
       showOnboardingBtn.addEventListener('click', () => {
         onboardingManager.startOnboarding();
       });
     }
   }
   
   // Check if this is the user's first visit
  if (!localStorage.getItem('onboarding_completed')) {
    setTimeout(() => {
      onboardingManager.startOnboarding();
    }, 1000); // Delay to ensure all elements are loaded
  }
  
  // Initialize modern UI components
  initializeModernUI();
});

// Modern UI Components
function initializeModernUI() {
  // Initialize cursor effects
  initializeCursorEffects();
  
  // Initialize image slider
  initializeImageSlider();
  
  // Initialize 3D carousel
  initialize3DCarousel();
  
  // Initialize smooth scroll effects
  initializeSmoothScroll();
  
  // Initialize glass navbar
  initializeGlassNavbar();
  
  // Initialize GSAP animations
  initializeGSAPAnimations();
}

// Cursor Effects
function initializeCursorEffects() {
  const canvas = document.getElementById('cursorCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const maxParticles = 50;
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 5 + 1;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      this.size *= 0.98;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  function addParticle(x, y) {
    if (particles.length < maxParticles) {
      particles.push(new Particle(x, y));
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      
      if (particles[i].life <= 0 || particles[i].size <= 0.1) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  document.addEventListener('mousemove', (e) => {
    addParticle(e.clientX, e.clientY);
  });
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  animate();
}

// Image Slider
function initializeImageSlider() {
  const sliderContainer = document.querySelector('.image-slider-container');
  if (!sliderContainer) return;
  
  const slides = sliderContainer.querySelectorAll('.slide');
  const prevBtn = sliderContainer.querySelector('.slider-nav.prev');
  const nextBtn = sliderContainer.querySelector('.slider-nav.next');
  const indicators = sliderContainer.querySelectorAll('.indicator');
  
  let currentSlide = 0;
  let isAnimating = false;
  let autoplayInterval;
  
  function showSlide(index) {
    if (isAnimating || index === currentSlide || !slides[currentSlide] || !slides[index]) return;
    
    isAnimating = true;
    const prevSlide = slides[currentSlide];
    const nextSlide = slides[index];
    
    // GSAP animation with element validation
    if (window.gsap && prevSlide && nextSlide) {
      gsap.timeline()
        .to(prevSlide, {
          opacity: 0,
          rotationY: -90,
          scale: 0.8,
          duration: 0.6,
          ease: "power2.inOut"
        })
        .fromTo(nextSlide, 
          {
            opacity: 0,
            rotationY: 90,
            scale: 0.8
          },
          {
            opacity: 1,
            rotationY: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              isAnimating = false;
            }
          }, "-=0.3"
        );
    } else {
      // Fallback without GSAP or when elements are missing
      if (prevSlide) prevSlide.style.opacity = '0';
      if (nextSlide) nextSlide.style.opacity = '1';
      isAnimating = false;
    }
    
    // Update indicators with safety check
    if (indicators && indicators.length > 0) {
      indicators.forEach((indicator, i) => {
        if (indicator) {
          indicator.classList.toggle('active', i === index);
        }
      });
    }
    
    currentSlide = index;
  }
  
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }
  
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 4000);
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index));
  });
  
  // Pause autoplay on hover
  sliderContainer.addEventListener('mouseenter', stopAutoplay);
  sliderContainer.addEventListener('mouseleave', startAutoplay);
  
  // Initialize
  showSlide(0);
  startAutoplay();
}

// 3D Carousel
function initialize3DCarousel() {
  const carouselContainer = document.querySelector('.carousel-3d-container');
  if (!carouselContainer) return;
  
  const carousel = carouselContainer.querySelector('.carousel-3d');
  const items = carouselContainer.querySelectorAll('.carousel-item');
  const prevBtn = carouselContainer.querySelector('.carousel-btn:first-child');
  const nextBtn = carouselContainer.querySelector('.carousel-btn:last-child');
  
  let currentRotation = 0;
  const itemCount = items.length;
  const angleStep = 360 / itemCount;
  const radius = 250;
  
  function positionItems() {
    items.forEach((item, index) => {
      const angle = (index * angleStep) + currentRotation;
      const radian = (angle * Math.PI) / 180;
      
      const x = Math.sin(radian) * radius;
      const z = Math.cos(radian) * radius;
      
      item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${-angle}deg)`;
      
      // Scale based on z position (closer items are larger)
      const scale = (z + radius) / (radius * 2) * 0.5 + 0.5;
      item.style.opacity = scale;
    });
  }
  
  function rotateCarousel(direction) {
    currentRotation += direction * angleStep;
    
    if (window.gsap && carousel) {
      gsap.to(carousel, {
        rotationY: currentRotation,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: positionItems
      });
    } else {
      if (carousel) {
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
      }
      positionItems();
    }
  }
  
  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => rotateCarousel(1));
  if (nextBtn) nextBtn.addEventListener('click', () => rotateCarousel(-1));
  
  // Initialize positions
  positionItems();
  
  // Auto-rotate
  setInterval(() => rotateCarousel(-1), 5000);
}

// Smooth Scroll Effects
function initializeSmoothScroll() {
  const scrollProgress = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');
  
  // Update scroll progress
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (scrollProgress) {
      scrollProgress.style.width = `${scrollPercent}%`;
    }
    
    // Show/hide back to top button
    if (backToTop) {
      if (scrollTop > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
      }
    }
  }
  
  // Smooth scroll to top
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Scroll event listener
  window.addEventListener('scroll', updateScrollProgress);
  
  // Initialize
  updateScrollProgress();
}

// Glass Navbar
function initializeGlassNavbar() {
  const navbar = document.querySelector('.glass-navbar');
  if (!navbar) return;
  
  // Navbar scroll effect
  function handleScroll() {
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 50) {
      navbar.style.background = 'rgba(255, 255, 255, 0.15)';
      navbar.style.backdropFilter = 'blur(25px)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.1)';
      navbar.style.backdropFilter = 'blur(20px)';
    }
  }
  
  window.addEventListener('scroll', handleScroll);
}

// GSAP Animations
function initializeGSAPAnimations() {
  if (!window.gsap) {
    console.warn('GSAP library not loaded');
    return;
  }
  
  // Register ScrollTrigger plugin if available
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeGSAPElements();
    });
  } else {
    initializeGSAPElements();
  }
}

// Initialize GSAP elements with proper checks
function initializeGSAPElements() {
  if (!window.gsap) return;
  
  // Animate elements on page load with existence checks
  const leftPanel = document.querySelector('.left-panel');
  if (leftPanel) {
    gsap.from(leftPanel, {
      x: -100,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    });
  }
  
  const rightPanel = document.querySelector('.right-panel');
  if (rightPanel) {
    gsap.from(rightPanel, {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power2.out"
    });
  }
  
  // Animate buttons on hover with existence checks
  const buttons = document.querySelectorAll('.btn, .glass-btn');
  if (buttons.length > 0) {
    buttons.forEach(button => {
      if (button && button.nodeType === Node.ELEMENT_NODE) {
        button.addEventListener('mouseenter', () => {
          if (button && window.gsap) {
            gsap.to(button, {
              scale: 1.05,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
        
        button.addEventListener('mouseleave', () => {
          if (button && window.gsap) {
            gsap.to(button, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      }
    });
  }
  
  // Animate template cards with existence checks
  const templateCards = document.querySelectorAll('.template-card');
  if (templateCards.length > 0) {
    templateCards.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power2.out"
        });
      }
    });
  }
  
  // Parallax effect for background elements with ScrollTrigger check
  if (window.ScrollTrigger) {
    const bodyElement = document.body;
    if (bodyElement) {
      gsap.to(bodyElement, {
        backgroundPosition: '50% 100%',
        ease: "none",
        scrollTrigger: {
          trigger: bodyElement,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }
  
  // Initialize other GSAP-dependent components
  initializeGSAPSlider();
  initializeGSAPCarousel();
}

// GSAP-enhanced slider
function initializeGSAPSlider() {
  if (!window.gsap) return;
  
  const sliderTrack = document.getElementById('sliderTrack');
  if (sliderTrack) {
    // Add GSAP animations for slider transitions
    console.log('GSAP slider initialized');
  }
}

// GSAP-enhanced carousel
function initializeGSAPCarousel() {
  if (!window.gsap) return;
  
  const carousel3D = document.getElementById('carousel3D');
  if (carousel3D) {
    // Add GSAP animations for 3D carousel
    console.log('GSAP 3D carousel initialized');
  }
}
