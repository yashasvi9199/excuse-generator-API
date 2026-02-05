const { CATEGORIES, MOODS } = require('../utils/constants');
const { listModels } = require('../services/geminiService');
const config = require('../config');

/**
 * Health checkpoint
 */

async function healthCheck(res, req) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        model: config.geminiModel
    });
}

/**
 * Get available categories and moods
 */
async function getCategories(req, res) {
    res.status(200).json({
        categories: CATEGORIES,
        moods: MOODS
    });
}

/**
 * Get Available Gemini models
 */
async function getModels(req, res, next) {
    try {
        const models = await listModels();
        res.status(200).json({
            models
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    healthCheck,
    getCategories,
    getModels
};