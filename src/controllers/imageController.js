const {buildImagePrompt} = require('../utils/prompts');
const {callGeminiWithImage, parseGeminiJSON} = require('../services/geminiService');

/**
 * Generate excuses from image/screenshot
 */
async function generateExcuseFromImage(req, res, next) {
    try{

        const {image, mimeType, category, mood, language} = req.body;

        // Build prompt
        const prompt = buildImagePrompt(category, mood, language);

        // Call Gemini API with image
        const response = await callGeminiWithImage(prompt, image, mimeType);

        // Parse JSON response
        const excuses = parseGeminiJSON(response);

        // Return success response
        res.status(200).json({
            success: true,
            excuses
        });

    }catch(error){
        next(error)
    }
}

module.exports = {generateExcuseFromImage}