import { initializeFileSelection } from './modules/fileSelectionFixed.js';
import { initializeTemplateSelection } from './modules/templateManager.js';
import { initializeVoiceInput } from './modules/voiceManager.js';
import { processor } from './modules/integratedProcessor.js';
import { uiManager } from './modules/uiManager.js';
import { errorHandler } from './modules/errorHandler.js';
import { stateManager } from './modules/stateManager.js';
import { toastManager } from './modules/toastManager.js';
import { onboardingManager } from './modules/onboardingManager.js';

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

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize all modules
  initializeFileSelection();
  await initializeTemplateSelection();
  initializeVoiceInput();
  processor.initialize();
  uiManager.initialize();
  
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

      let requestBody = { prompt };
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
    } catch (error) {
      const handledError = errorHandler.handleError(
        error,
        error.type || errorHandler.errorTypes.UNKNOWN_ERROR
      );
      uiManager.addMessage(handledError.message, 'error');
      toastManager.error('Processing failed: ' + handledError.message);
    } finally {
      uiManager.setProcessingState(false);
    }
  });
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
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save('output.pdf');
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
