const {CATEGORIES, MOODS, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES} = require('../utils/constants');
const {ERROR_CODES: ERROR} = require('../utils/constants');

/**
 * Validate text-based excuse request
*/
function validateExcuseInput (req, res, next) {
    const {situation, category, mood, language} = req.body;

    // Situation is required
    if (!situation || typeof situation !== 'string' || situation.trim().length === 0){
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: Error.INVALID_INPUT.title,
                message: 'Situation is required and must be a non-empty string.'
            }
        });
    }

    // Validate situation length (max 1000 characters)
    if (situation.length > 1000) {
        return res.body(400).json({
            success: false,
            error: {
                code: Error.INVALID_INPUT.code,
                title: Error.INVALID_INPUT.title,
                message: "Situation must not exceed 1000 characters."
            }
        });
    }

    
}