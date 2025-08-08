// docs/modules/templateManager.js
import { stateManager } from './stateManager.js';

export async function initializeTemplateSelection() {
  const templateSelect = document.getElementById('templateSelect');
  const selectTemplateFileBtn = document.getElementById(
    'selectTemplateFileBtn'
  );

  if (templateSelect && selectTemplateFileBtn) {
    stateManager.setState({ selectedTemplate: null });

    selectTemplateFileBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.addEventListener('change', () => {
        loadTemplateFiles(input.files);
      });
      input.click();
    });

    templateSelect.addEventListener('change', e => {
      const selectedName = e.target.value;
      const selectedTemplate = stateManager.state.selectedTemplate;
      if (selectedTemplate && selectedTemplate.name === selectedName) {
        applyTemplate(selectedName);
      }
    });
  }
}

function loadTemplateFiles(files) {
  const templateSelect = document.getElementById('templateSelect');
  templateSelect.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a template';
  templateSelect.appendChild(defaultOption);

  stateManager.setState({ selectedTemplate: null });
  const allowedExtensions = ['.docx', '.pdf', '.txt', '.md', '.xlsx', '.xls'];

  Array.from(files).forEach(file => {
    const ext = file.name.slice(file.name.lastIndexOf('.'));
    if (allowedExtensions.includes(ext)) {
      const reader = new FileReader();
      reader.onload = e => {
        const template = {
          name: file.name,
          content: e.target.result.split(',')[1],
          type: file.type,
        };
        stateManager.setSelectedTemplate(template);
        const option = document.createElement('option');
        option.value = file.name;
        option.textContent = file.name;
        templateSelect.appendChild(option);
        // Automatically select if single file
        if (files.length === 1) {
          templateSelect.value = file.name;
          applyTemplate(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

function applyTemplate(templateName) {
  const promptTextarea = document.getElementById('promptTextarea');
  if (!promptTextarea) {return;}

  promptTextarea.value = `Using template: ${templateName}`;

  const event = new CustomEvent('templateApplied', {
    detail: { templateName },
  });
  document.dispatchEvent(event);
}
