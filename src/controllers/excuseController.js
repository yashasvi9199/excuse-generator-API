const { buildTextPrompt } = require('../utils/prompts');
const { callGemini, parseGeminiJSON } = require('../services/geminiService');

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