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
                title: ERROR.INVALID_INPUT.title,
                message: 'Situation is required and must be a non-empty string.'
            }
        });
    }

    // Validate situation length (max 1000 characters)
    if (situation.length > 1000) {
        return res.body(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: "Situation must not exceed 1000 characters."
            }
        });
    }

    // Validate category if provided
    if (category && !CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
            }
        });
    }

    // Validate mood if provided
    if (mood && !MOODS.includes(mood)) {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: `Invalid mood. Must be one of: ${MOODS.join(', ')}`
            }
        });
    }

    // Validate language if provided
    if (language && typeof language !== 'string') {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: 'Language must be a string.'
            }
        });
    }
    next();
}