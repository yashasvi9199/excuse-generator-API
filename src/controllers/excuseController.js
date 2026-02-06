const { buildTextPrompt } = require('../utils/prompts');
const { callGemini, parseGeminiJSON } = require('../services/geminiService');
const {saveExcuse} = require('../services/redisService');

/**
 * Generate excuse from text situation
 */
async function generateExcuse(req, res, next) {
    try {
        const { situation, category, mood, language } = req.body;

        // Build prompt
        const prompt = buildTextPrompt(situation, category, mood, language);

        // call Gemini API
        const response = await callGemini(prompt);

        // Parse JSON response
        const excuses = parseGeminiJSON(response);

        // Save to Redis (non-blocking, don't wait)
        saveExcuse({
            excuse,
            category,
            mood,
            type: 'text'
        }).catch( err => console.error('Failed to save excuse to history: ', err) );

        // Return success response
        res.status(200).json({
            success: true,
            excuses
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    generateExcuse
}