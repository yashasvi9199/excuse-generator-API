const express = require('express');
const config = require('../src/config');
const excuseRoutes = require('../src/routes/excuseRoutes');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

// Check if API key is configured
if (!config.isValid()) {
    console.error('Error: Gemini_API_KEY is not configured');
    process.exit(1);
}

// Middleware
app.use(express.json({
    limit: '5mb'
}));

// CORS - Allowed Origins (for all)
app.use( (req, res, next) => {
    res.header('Access-Control-Allowed-Origin', '*');
    res.header('Access-Control-Allowed-Origin', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allowed-Origin', 'Content-Type');

    if(req.method === 'OPTIONS'){
        return res.status(200).end();
    }

    next();
});

// Mounting Routes
app.use('/api', excuseRoutes)

// Global Error Handling
app.use(errorHandler);

module.exports = app;