const config = require('../config');
const { ERROR_CODES } = require('../utils/constants');

// fetch for Node.js environment that don't have it
const fetch = global.fetch || require('node-fetch');

/*
    Call Gemini API for text-based excuse generation
 */
async function callGemini(prompt) {
  const url = `${config.geminiBaseUrl}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    return await handleGeminiResponse(response);
  } catch (error) {
    console.error('Gemini API network error:', error);
    throw ERROR_CODES.GEMINI_ERROR;
  }
}

/*
    Call Gemini API with image for excuse generation
 */
async function callGeminiWithImage(prompt, imageBase64, mimeType) {
  const url = `${config.geminiBaseUrl}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    return await handleGeminiResponse(response);
  } catch (error) {
    console.error('Gemini API network error:', error);
    throw ERROR_CODES.GEMINI_ERROR;
  }
}

/*
    Handle Gemini API response and errors
 */
async function handleGeminiResponse(response) {
  // Handle HTTP errors
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 60;
    const error = { ...ERROR_CODES.RATE_LIMITED, retryAfter: parseInt(retryAfter) };
    throw error;
  }

  if (response.status === 401 || response.status === 403) {
    console.error('Authentication error with Gemini API');
    throw ERROR_CODES.CONFIG_ERROR;
  }

  if (response.status === 503) {
    throw ERROR_CODES.SERVICE_BUSY;
  }

  if (response.status >= 500) {
    throw ERROR_CODES.GEMINI_ERROR;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API error:', errorData);
    throw ERROR_CODES.GEMINI_ERROR;
  }

  // Parse successful response
  const data = await response.json();
  
  // Check for candidates
  const candidate = data.candidates?.[0];
  
  if (!candidate) {
    console.error('No candidates in Gemini response');
    throw ERROR_CODES.INTERNAL_ERROR;
  }

  // Check finish reason
  const finishReason = candidate.finishReason;
  
  if (finishReason === 'SAFETY') {
    throw ERROR_CODES.CONTENT_BLOCKED;
  }

  if (finishReason === 'RECITATION') {
    throw ERROR_CODES.CONTENT_BLOCKED;
  }

  if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    console.error('Unexpected finish reason:', finishReason);
    throw ERROR_CODES.INTERNAL_ERROR;
  }

  // Extract text
  const text = candidate.content?.parts?.[0]?.text;
  
  if (!text) {
    console.error('No text in Gemini response');
    throw ERROR_CODES.INTERNAL_ERROR;
  }

  return text;
}

/*
    List available Gemini models
 */
async function listModels() {
  const url = `${config.geminiBaseUrl}?key=${config.geminiApiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    
    return data.models
      .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
      .map(model => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit
      }));
  } catch (error) {
    console.error('Error fetching models:', error);
    throw ERROR_CODES.GEMINI_ERROR;
  }
}

/*
    Parse JSON response from Gemini (handles markdown code blocks)
 */
function parseGeminiJSON(text) {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(cleanText.trim());
    
    if (!parsed.excuses || !Array.isArray(parsed.excuses)) {
      throw new Error('Invalid response format');
    }
    
    return parsed.excuses;
  } catch (error) {
    console.error('Failed to parse Gemini JSON response:', error);
    console.error('Raw response:', text);
    throw ERROR_CODES.INTERNAL_ERROR;
  }
}

module.exports = {
  callGemini,
  callGeminiWithImage,
  listModels,
  parseGeminiJSON
};