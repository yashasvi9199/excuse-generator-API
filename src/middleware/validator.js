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

/**
 * Validate image-based excuse request
 */
function validateImageInput (req, res, next) {
    const {image, mimeType, category, mood, language} = req.body;
/*
 **Example:
{
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mimeType": "image/png"
}
*/
    //Image is required
    if (!image || typeof image !== 'string'){
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: 'Image (base64 encoded) is required.'
            }
        });
    }

    // MIME type is required
    if (!mimeType || typeof mimeType !== 'string') {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: 'Image MIME type is required.'
            }
        });
    }

    // Validate MIME Type
    if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
        return res.status(415).json({
            success: false,
            error: {
                code: ERROR.UNSUPPORTED_IMAGE.code,
                title: ERROR.UNSUPPORTED_IMAGE.title,
                message: ERROR.UNSUPPORTED_IMAGE.message
            }
        });
    }

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(image)){
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: 'Invalid base64 image format.'
            }
        });
    }

    // Validate image size (base64 string length * 0.75 gives approx byte size)
    const imageSizeBytes = (image.length *3) / 4;
    if (imageSizeBytes > MAX_IMAGE_SIZE_BYTES) {
        return res.status(413).json({
            success: false,
            error: {
                code: ERROR.IMAGE_TOO_LARGE.code,
                title: ERROR.IMAGE_TOO_LARGE.title,
                message: ERROR.IMAGE_TOO_LARGE.message
            }
        });
    }

    // Validate 'categories' (if provided)
    if (category && !CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                messsage: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
            }
        });
    }

    // Validate 'mood' (if provided)
    if (mood && !MOODS.includes(mood)) {
        return res.status(400).json({
            success: false,
            error: {
                code: ERROR.INVALID_INPUT.code,
                title: ERROR.INVALID_INPUT.title,
                message: `Invalid Mood. Must be one of: ${MOODS.join(', ')}`
            }
        });
    }

    // Validate 'language' (if provided)
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

module.exports = {
    validateExcuseInput,
    validateImageInput
};