const config = {
    // Gemini API configuration
    geminiApiKey : process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

    // API endpoints
    geminiBaseUrl : 'https://generativelanguage.googleapis.com/v1beta/models',

    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',

    // Validate required config
    isValid() {
        return !!this.geminiApiKey;
    }
};

module.exports = config;