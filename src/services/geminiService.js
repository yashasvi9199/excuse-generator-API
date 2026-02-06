const config = require('../config');
const { ERROR_CODES } = require('../utils/constants');

// Polyfill fetch for Node.js environments that don't have it
const fetch = global.fetch || require('node-fetch');

/**
 * Call Gemini API for text-based excuse generation
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
    if (error.code && error.title) {
      throw error;
    }
    console.error('Gemini API network error:', error);
    throw ERROR_CODES.GEMINI_ERROR;
  }
}

/**
 * Call Gemini API with image for excuse generation
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
    if (error.code && error.title) {
      throw error;
    }
    console.error('Gemini API network error:', error);
    throw ERROR_CODES.GEMINI_ERROR;
  }
}

/**
 * Handle Gemini API response and errors
 */
async function handleGeminiResponse(response) {
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

  const data = await response.json();
  
  const candidate = data.candidates?.[0];
  
  if (!candidate) {
    console.error('No candidates in Gemini response');
    throw ERROR_CODES.INTERNAL_ERROR;
  }

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

  const text = candidate.content?.parts?.[0]?.text;
  
  if (!text) {
    console.error('No text in Gemini response');
    throw ERROR_CODES.INTERNAL_ERROR;
  }

  return text;
}

/**
 * List available Gemini models
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

/**
 * Parse JSON response from Gemini (handles markdown code blocks and malformed responses)
 */
function parseGeminiJSON(text) {
  try {
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    cleanText = cleanText.trim();
    
    // Try direct JSON parse first
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.excuses && Array.isArray(parsed.excuses)) {
        return parsed.excuses;
      }
    } catch (e) {
      // Continue to fallback methods
    }
    
    // Fallback: Extract JSON object from text
    const jsonMatch = cleanText.match(/\{[\s\S]*"excuses"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.excuses && Array.isArray(parsed.excuses)) {
          return parsed.excuses;
        }
      } catch (e) {
        // Continue to next fallback
      }
    }
    
    // Fallback: Extract excuses array directly
    const arrayMatch = cleanText.match(/"excuses"\s*:\s*\[([\s\S]*?)\]/);
    if (arrayMatch) {
      try {
        const excusesArray = JSON.parse('[' + arrayMatch[1] + ']');
        if (Array.isArray(excusesArray) && excusesArray.length > 0) {
          return excusesArray;
        }
      } catch (e) {
        // Continue to next fallback
      }
    }
    
    // Fallback: Extract quoted strings as excuses
    const quoteMatches = cleanText.match(/"([^"]{10,})"/g);
    if (quoteMatches && quoteMatches.length >= 1) {
      const excuses = quoteMatches
        .map(q => q.slice(1, -1))
        .filter(e => !e.includes('excuses') && e.length > 10)
        .slice(0, 3);
      
      if (excuses.length > 0) {
        return excuses;
      }
    }
    
    // Final fallback: Split by common delimiters
    const lines = cleanText
      .split(/\|\|\||[\n\r]+/)
      .map(line => line.replace(/^[\d\.\-\*]+\s*/, '').trim())
      .filter(line => line.length > 10 && !line.startsWith('{') && !line.startsWith('"excuses'));
    
    if (lines.length > 0) {
      return lines.slice(0, 3);
    }
    
    throw new Error('Could not extract excuses from response');
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