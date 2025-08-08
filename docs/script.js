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
    baseUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
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
    // Initialize analytics dashboard
    analyticsDashboard = new AnalyticsDashboard({
      enableRealTimeUpdates: true,
      dataRetentionDays: 30,
      enableExport: true
    });
    await analyticsDashboard.initialize();
    
    // Initialize file organizer
    fileOrganizer = new FileOrganizer({
      enableAutoOrganization: false,
      defaultStrategy: 'smart',
      enableSmartRenaming: true
    });
    await fileOrganizer.initialize();
    
    // Initialize collaboration tools
    collaborationTools = new CollaborationTools({
      enableRealTimeUpdates: true,
      maxWorkspaceMembers: 10,
      enableFileSharing: true
    });
    await collaborationTools.initialize();
    
    // Initialize enterprise API
    enterpriseAPI = new EnterpriseAPI({
      enableCloudStorage: true,
      enableCRM: false,
      enableWorkflow: false
    });
    await enterpriseAPI.initialize();
    
    // Setup Phase 3 UI handlers
    setupPhase3UIHandlers();
    
    console.log('Phase 3 modules initialized successfully');
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
  const exportAnalyticsBtn = document.getElementById('exportAnalytics');
  const resetAnalyticsBtn = document.getElementById('resetAnalytics');
  
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
  const smartRenamingToggle = document.getElementById('smartRenaming');
  const organizeFilesBtn = document.getElementById('organizeFiles');
  const previewOrganizationBtn = document.getElementById('previewOrganization');
  
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
  
  // Update displays on load
  updateAnalyticsDisplay();
  updateFileOrganizationDisplay();
  updateCollaborationDisplay();
  updateIntegrationsDisplay();
}

// Helper functions for Phase 3 UI updates
function updateAnalyticsDisplay() {
  if (analyticsDashboard) {
    const report = analyticsDashboard.generateReport();
    
    // Update processing stats with null checks
    const totalFilesEl = document.getElementById('totalProcessedFiles');
    const avgTimeEl = document.getElementById('avgProcessingTime');
    const successRateEl = document.getElementById('successRate');
    
    // Use optional chaining and provide fallback values
    if (totalFilesEl) {
      totalFilesEl.textContent = report?.processing?.totalFiles ?? 0;
    }
    if (avgTimeEl) {
      const avgTime = report?.processing?.averageTime ?? 0;
      avgTimeEl.textContent = `${avgTime}ms`;
    }
    if (successRateEl) {
      const successRate = report?.processing?.successRate ?? 0;
      successRateEl.textContent = `${successRate}%`;
    }
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
    const status = collaborationTools.getCollaborationStatus();
    
    // Update workspace info
    const workspaceStatusEl = document.getElementById('workspaceStatus');
    const workspaceDetailsEl = document.getElementById('workspaceDetails');
    
    if (workspaceStatusEl) {
      workspaceStatusEl.textContent = status.currentWorkspace ? 'Connected' : 'Not connected';
      workspaceStatusEl.className = `status ${status.currentWorkspace ? 'connected' : 'disconnected'}`;
    }
    
    if (workspaceDetailsEl && status.currentWorkspace) {
      workspaceDetailsEl.innerHTML = `
        <div>Workspace: ${status.currentWorkspace.name}</div>
        <div>Members: ${status.currentWorkspace.members}</div>
      `;
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
  if (enterpriseAPI) {
    const status = enterpriseAPI.getIntegrationStatus();
    
    // Update integration statuses
    Object.entries(status).forEach(([integration, isConnected]) => {
      const statusEl = document.getElementById(`${integration}Status`);
      if (statusEl) {
        statusEl.textContent = isConnected ? 'Connected' : 'Not connected';
        statusEl.className = `status ${isConnected ? 'connected' : 'disconnected'}`;
      }
    });
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
    const workBtn = document.getElementById('workModeBtn');
    const chatBtn = document.getElementById('chatModeBtn');
    const workBtnDesktop = document.getElementById('workModeBtnDesktop');
    const chatBtnDesktop = document.getElementById('chatModeBtnDesktop');
    
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
});
