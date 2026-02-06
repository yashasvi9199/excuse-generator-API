const {buildImagePrompt} = require('../utils/prompts');
const {callGeminiWithImage, parseGeminiJSON} = require('../services/geminiService');
const {saveExcuse} = require('../services/redisService');

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

        // Save to Redis (non-blocking, don't wait)
        saveExcuse({
            excuses,
            category,
            mood,
            type: 'image'
        }).catch( err => console.error('Failed to save excuse to history: ', err) );

        // Return success response
        res.status(200).json({
            success: true,
            excuses
        });

    }catch(error){
        next(error)
    }
}

module.exports = {
    generateExcuseFromImage
};