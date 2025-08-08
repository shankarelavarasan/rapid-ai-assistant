/**
 * Enhanced Service for handling interactions with the Gemini API
 * Supports multiple file processing with collective analysis and summary generation
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withErrorHandling } from '../utils/errorUtils.js';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced processing configuration
const PROCESSING_CONFIG = {
  maxConcurrent: 3,
  maxRetries: 2,
  timeoutMs: 30000,
  maxTokens: 32000,
  supportedModels: {
    text: 'gemini-1.5-flash-latest',
    vision: 'gemini-1.5-pro-vision-latest',
    pro: 'gemini-1.5-pro-latest'
  },
  batchSizes: {
    small: 5,
    medium: 10,
    large: 20
  }
};

/**
 * Creates and returns a Gemini model instance
 * @param {string} apiKey - Gemini API key
 * @param {string} modelName - Model name to use
 * @returns {Object} Gemini model instance
 */
export const getGeminiModel = (
  apiKey,
  modelName = 'gemini-1.5-flash-latest'
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Creates enhanced Gemini models for different use cases
 * @param {string} apiKey - Gemini API key
 * @returns {Object} Object containing different model instances
 */
export const getEnhancedGeminiModels = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  return {
    textModel: genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.text }),
    visionModel: genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.vision }),
    proModel: genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.pro }),
    
    // Get appropriate model based on content type
    getModelForContent: (contentType) => {
      if (contentType === 'image' || contentType.startsWith('image/')) {
        return genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.vision });
      } else if (contentType === 'complex' || contentType === 'analysis') {
        return genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.pro });
      }
      return genAI.getGenerativeModel({ model: PROCESSING_CONFIG.supportedModels.text });
    }
  };
};

/**
 * Generates content using the Gemini API
 * @param {Object} model - Gemini model instance
 * @param {string|Array} prompt - Text prompt or array of parts (text and images)
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generation result
 */
export const generateContent = withErrorHandling(
  async (model, prompt, options = {}) => {
    return await model.generateContent(prompt, options);
  },
  {
    context: 'AI content generation',
    defaultMessage: 'Failed to generate content',
  }
);

/**
 * Processes a batch of files with Gemini
 * @param {Object} model - Gemini model instance
 * @param {string} basePrompt - Base prompt to use for all files
 * @param {Array} files - Array of file objects to process
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Array of responses for each file
 */
export const processBatch = withErrorHandling(
  async (model, basePrompt, files, options = {}) => {
    const responses = [];
    const { maxConcurrent = 3, outputFormat = 'text' } = options;

    // Process files in batches to avoid overwhelming the API
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const promises = batch.map(async file => {
        try {
          let result;
          if (file.isImage) {
            // Handle image file
            const filePart = {
              inlineData: {
                data: file.content,
                mimeType: file.type,
              },
            };
            result = await model.generateContent([basePrompt, filePart]);
          } else {
            // Handle text file
            const fullPrompt = `${basePrompt} Process this file content: ${file.text}`;
            result = await model.generateContent(fullPrompt);
          }

          const responseText = result.response.text();
          return {
            file: file.name,
            path: file.path || file.name,
            response: responseText,
            success: true,
            outputFormat,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            file: file.name,
            path: file.path || file.name,
            response: `Error processing file: ${error.message}`,
            success: false,
            outputFormat,
          };
        }
      });

      const batchResults = await Promise.all(promises);
      responses.push(...batchResults);
    }

    return responses;
  },
  { context: 'batch processing', defaultMessage: 'Failed to process files' }
);

/**
 * Processes a folder structure with Gemini
 * @param {Object} model - Gemini model instance
 * @param {string} basePrompt - Base prompt to use for all files
 * @param {Object} folderStructure - Processed folder structure with extracted text
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Object with responses for each folder
 */
export const processFolderStructure = withErrorHandling(
  async (model, basePrompt, folderStructure, options = {}) => {
    const { outputFormat = 'text', processingMode = 'individual' } = options;

    // If processing as a single unit, combine all text and process once
    if (processingMode === 'combined') {
      // Import here to avoid circular dependency
      const { combineExtractedText } = await import('./folderService.js');
      const combinedText = combineExtractedText(folderStructure);

      const fullPrompt = `${basePrompt}\n\nProcess this combined content from multiple files:\n${combinedText}`;
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      return {
        combined: true,
        response: responseText,
        outputFormat,
      };
    }

    // Process each folder separately
    const responses = {};

    for (const [folderPath, files] of Object.entries(folderStructure)) {
      // Process files in this folder
      const folderResponses = await processBatch(model, basePrompt, files, {
        ...options,
        outputFormat,
      });

      responses[folderPath] = folderResponses;
    }

    return {
      combined: false,
      responses,
      outputFormat,
    };
  },
  { context: 'folder processing', defaultMessage: 'Failed to process folder' }
);

/**
 * Enhanced batch processing with collective analysis
 * @param {Object} models - Enhanced Gemini models object
 * @param {string} basePrompt - Base prompt to use for all files
 * @param {Array} files - Array of file objects to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Enhanced processing result with collective insights
 */
export const processEnhancedBatch = withErrorHandling(
  async (models, basePrompt, files, options = {}) => {
    const {
      maxConcurrent = PROCESSING_CONFIG.maxConcurrent,
      outputFormat = 'structured',
      enableCollectiveAnalysis = true,
      enableClassification = true,
      enableSummary = true,
      language = 'tamil',
      processingMode = 'intelligent'
    } = options;

    const responses = [];
    const processingMetrics = {
      startTime: Date.now(),
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      averageProcessingTime: 0
    };

    // Process files in batches with intelligent model selection
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const promises = batch.map(async (file, index) => {
        const fileStartTime = Date.now();
        
        try {
          // Select appropriate model based on file type
          const model = models.getModelForContent(file.type || 'text');
          
          let result;
          let enhancedPrompt = basePrompt;
          
          // Add language-specific instructions
          if (language === 'tamil') {
            enhancedPrompt = `தமிழில் பதிலளிக்கவும். ${basePrompt}`;
          }
          
          if (file.isImage || (file.type && file.type.startsWith('image/'))) {
            // Handle image file with vision model
            const filePart = {
              inlineData: {
                data: file.content,
                mimeType: file.type,
              },
            };
            
            // Enhanced prompt for image analysis
            const imagePrompt = `${enhancedPrompt}\n\nAnalyze this image and provide:\n1. Content description\n2. Text extraction (OCR)\n3. Document classification\n4. Key insights\n5. Suggested filename`;
            
            result = await model.generateContent([imagePrompt, filePart]);
          } else {
            // Handle text file with enhanced processing
            const textPrompt = `${enhancedPrompt}\n\nProcess this file content and provide:\n1. Summary\n2. Classification\n3. Key data extraction\n4. Suggested filename\n5. Importance score\n\nFile content: ${file.text}`;
            
            result = await model.generateContent(textPrompt);
          }

          const responseText = result.response.text();
          const processingTime = Date.now() - fileStartTime;
          
          // Parse structured response
          const parsedResponse = parseStructuredResponse(responseText);
          
          processingMetrics.processedFiles++;
          
          return {
            file: file.name,
            path: file.path || file.name,
            type: file.type,
            size: file.size,
            response: responseText,
            parsedResponse,
            success: true,
            processingTime,
            model: file.isImage ? 'vision' : 'text',
            outputFormat,
            metadata: {
              language,
              processingMode,
              timestamp: new Date().toISOString()
            }
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          processingMetrics.failedFiles++;
          
          return {
            file: file.name,
            path: file.path || file.name,
            response: `Error processing file: ${error.message}`,
            success: false,
            error: error.message,
            outputFormat,
            metadata: {
              language,
              processingMode,
              timestamp: new Date().toISOString()
            }
          };
        }
      });

      const batchResults = await Promise.all(promises);
      responses.push(...batchResults);
    }

    // Calculate metrics
    const endTime = Date.now();
    processingMetrics.totalProcessingTime = endTime - processingMetrics.startTime;
    processingMetrics.averageProcessingTime = processingMetrics.totalProcessingTime / processingMetrics.processedFiles;
    
    // Generate collective analysis if enabled
    let collectiveInsights = null;
    if (enableCollectiveAnalysis && responses.length > 1) {
      collectiveInsights = await generateCollectiveInsights(models.proModel, responses, {
        language,
        basePrompt
      });
    }

    return {
      responses,
      collectiveInsights,
      metrics: processingMetrics,
      summary: {
        totalFiles: files.length,
        successfulFiles: processingMetrics.processedFiles,
        failedFiles: processingMetrics.failedFiles,
        successRate: (processingMetrics.processedFiles / files.length) * 100,
        averageProcessingTime: processingMetrics.averageProcessingTime
      },
      outputFormat,
      generatedAt: new Date().toISOString()
    };
  },
  { context: 'enhanced batch processing', defaultMessage: 'Failed to process files with enhanced features' }
);

/**
 * Generate collective insights from multiple file processing results
 * @param {Object} model - Gemini Pro model for complex analysis
 * @param {Array} responses - Array of individual file processing responses
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Collective insights
 */
export const generateCollectiveInsights = withErrorHandling(
  async (model, responses, options = {}) => {
    const { language = 'tamil', basePrompt = '' } = options;
    
    // Prepare summary of all processed files
    const filesSummary = responses.map(response => {
      if (response.success && response.parsedResponse) {
        return {
          file: response.file,
          summary: response.parsedResponse.summary || 'No summary available',
          classification: response.parsedResponse.classification || 'Unknown',
          keyData: response.parsedResponse.keyData || {},
          importance: response.parsedResponse.importance || 'Medium'
        };
      }
      return {
        file: response.file,
        error: response.error || 'Processing failed'
      };
    }).filter(item => !item.error);
    
    if (filesSummary.length === 0) {
      return {
        insights: 'No successful file processing results to analyze',
        patterns: [],
        recommendations: [],
        overallClassification: 'Unknown'
      };
    }
    
    // Create collective analysis prompt
    let collectivePrompt = `
Analyze the following collection of processed files and provide collective insights:

${filesSummary.map((item, index) => 
  `File ${index + 1}: ${item.file}
- Summary: ${item.summary}
- Classification: ${item.classification}
- Importance: ${item.importance}
- Key Data: ${JSON.stringify(item.keyData)}
`
).join('\n')}

Provide:
1. Overall patterns and themes
2. Document relationships and connections
3. Priority recommendations
4. Overall classification of the document set
5. Key insights and findings
6. Suggested actions or next steps
`;
    
    if (language === 'tamil') {
      collectivePrompt = `தமிழில் பதிலளிக்கவும். ${collectivePrompt}`;
    }
    
    const result = await model.generateContent(collectivePrompt);
    const responseText = result.response.text();
    
    // Parse collective insights
    const insights = parseCollectiveInsights(responseText);
    
    return {
      ...insights,
      processedFiles: filesSummary.length,
      totalFiles: responses.length,
      analysisLanguage: language,
      generatedAt: new Date().toISOString()
    };
  },
  { context: 'collective insights generation', defaultMessage: 'Failed to generate collective insights' }
);

/**
 * Parse structured response from Gemini
 * @param {string} responseText - Raw response text
 * @returns {Object} Parsed structured data
 */
function parseStructuredResponse(responseText) {
  try {
    // Try to extract JSON if present
    const jsonMatch = responseText.match(/\{[^}]+\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to pattern-based parsing
    const parsed = {
      summary: extractSection(responseText, ['summary', 'சுருக்கம்']),
      classification: extractSection(responseText, ['classification', 'வகைப்பாடு']),
      keyData: extractKeyData(responseText),
      suggestedName: extractSection(responseText, ['filename', 'suggested name', 'பரிந்துரைக்கப்பட்ட பெயர்']),
      importance: extractSection(responseText, ['importance', 'முக்கியத்துவம்']),
      insights: extractSection(responseText, ['insights', 'key insights', 'முக்கிய நுண்ணறிவுகள்'])
    };
    
    return parsed;
  } catch (error) {
    console.error('Error parsing structured response:', error);
    return {
      summary: responseText.substring(0, 200) + '...',
      classification: 'Unknown',
      keyData: {},
      raw: responseText
    };
  }
}

/**
 * Parse collective insights from response
 * @param {string} responseText - Raw response text
 * @returns {Object} Parsed collective insights
 */
function parseCollectiveInsights(responseText) {
  try {
    return {
      insights: extractSection(responseText, ['insights', 'key insights', 'முக்கிய நுண்ணறிவுகள்']),
      patterns: extractListSection(responseText, ['patterns', 'themes', 'வடிவங்கள்']),
      recommendations: extractListSection(responseText, ['recommendations', 'suggestions', 'பரிந்துரைகள்']),
      overallClassification: extractSection(responseText, ['overall classification', 'ஒட்டுமொத்த வகைப்பாடு']),
      connections: extractSection(responseText, ['relationships', 'connections', 'தொடர்புகள்']),
      nextSteps: extractListSection(responseText, ['next steps', 'actions', 'அடுத்த படிகள்']),
      fullAnalysis: responseText
    };
  } catch (error) {
    console.error('Error parsing collective insights:', error);
    return {
      insights: responseText,
      patterns: [],
      recommendations: [],
      overallClassification: 'Unknown'
    };
  }
}

/**
 * Extract section from text based on keywords
 * @param {string} text - Text to search
 * @param {Array} keywords - Keywords to search for
 * @returns {string} Extracted section
 */
function extractSection(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\s]*([^\n]+(?:\n(?!\d+\.|[A-Za-z]+:)[^\n]*)*)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

/**
 * Extract list section from text
 * @param {string} text - Text to search
 * @param {Array} keywords - Keywords to search for
 * @returns {Array} Extracted list items
 */
function extractListSection(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\s]*([^\n]+(?:\n(?:\s*[-*]|\d+\.).*)*)`,'i');
    const match = text.match(regex);
    if (match) {
      const listText = match[1];
      return listText.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\s*[-*\d.]+\s*/, '').trim())
        .filter(item => item.length > 0);
    }
  }
  return [];
}

/**
 * Extract key data from text
 * @param {string} text - Text to search
 * @returns {Object} Extracted key-value pairs
 */
function extractKeyData(text) {
  const data = {};
  const lines = text.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      if (key && value && !['summary', 'classification', 'filename', 'importance'].includes(key)) {
        data[key] = value;
      }
    }
  });
  
  return data;
}

/**
 * Get processing configuration
 * @returns {Object} Current processing configuration
 */
export const getProcessingConfig = () => {
  return { ...PROCESSING_CONFIG };
};

/**
 * Update processing configuration
 * @param {Object} newConfig - New configuration options
 */
export const updateProcessingConfig = (newConfig) => {
  Object.assign(PROCESSING_CONFIG, newConfig);
};
