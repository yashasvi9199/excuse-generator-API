//Categories for excuses
const CATEGORIES = [
    'work',
    'school',
    'social',
    'family',
    'health',
    'dating',
    'general'
];

// Moods for excuse tone
const MOODS = [
    'professional',
    'casual',
    'dramatic',
    'funny',
    'sincere',
    'mysterious'
];

// Supported image formats
const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
];

// Size limits
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 *1024;

// Number of excuses to generated
const NUM_EXCUSES = 3;

// Error codes mapping
const ERROR_CODES = {

    // client errors (4xx)
    INVALID_INPUT: {
        code: 400,
        title: 'INVALID_ARGUMENT',
        message: 'Request contains invalid or missing required fields.'
    },
    IMAGE_TOO_LARGE: {
        code: 413,
        title: 'PAYLOAD_TOO_LARGE',
        message: `Image size exceeds maximum limit of ${MAX_IMAGE_SIZE_MB}MB.`
    },
    UNSUPPORTED_IMAGE: {
        code: 415,
        title: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Image format not supported. Use JPG, JPEG, PNG, or WebP.'
    },
    CONTENT_BLOCKED: {
        code: 422,
        title: 'SAFETY',
        message: 'Content was blocked by safety filters. Unable to generate excuse for this input.'
    },
    RATE_LIMITED: {
        code: 429,
        title: 'RESOURCE_EXHAUSTED',
        message: 'Too many requests sent to API. Please wait and try again.'
    },

    // Server errors (5xx)
    GEMINI_ERROR: {
        code: 502,
        title: 'BAD_GATEWAY',
        message: 'API is temporarily unavailable. Please try again later.'
    },
    SERVICE_BUSY: {
        code: 503,
        title: 'UNAVAILABLE',
        message: 'Service is currently busy processing other requests. please retry shortly.'
    },
    INTERNAL_ERROR: {
        code: 500,
        title: 'INTERNAL',
        message: 'An unexpected error occurrd while processing your request.'
    },
    CONFIG_ERROR: {
        code: 500,
        title: 'CONFIGURATION_ERROR',
        message: 'Service configuration error. API key may be invalid or missing.'
    }
};

module.exports = {
    CATEGORIES,
    MOODS,
    SUPPORTED_IMAGE_TYPES,
    MAX_IMAGE_SIZE_MB,
    MAX_IMAGE_SIZE_BYTES,
    NUM_EXCUSES,
    ERROR_CODES
}