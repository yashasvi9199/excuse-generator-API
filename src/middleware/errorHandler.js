/*
 * Global error handler 'middleware'
 * Catches all errors and formats them properly
 */
function errorHandler(err, req, res, next) {

    // Log errors for debugging
    console.error('Error Occurred: ', {
        message: err.message || err.title,  // A safety precaution or failsafe
        code: err.code,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // If error is from custom formats (ERROR_CODES)
    if (err.code && err.title && err.message) {
        return res.status(err.code).json({
            success: false,
            error: {
                code: err.code,
                title: err.title,
                message: err.message,
                ...(err.retryAfter && {retryAfter: err.retryAfter})
            }
        });
    }

    // Default error response (Cuz we can get unexpected errors toooo)
    res.status(500).json({
        success: false,
        error: {
            code: 500,
            title: 'INTERNAL',
            message: 'An unexpected error occurred while processing your request.'
        }
    });
}

module.exports = errorHandler;