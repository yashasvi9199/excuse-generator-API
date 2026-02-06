const express = require('express');
const router = express.Router();

const { healthCheck, getCategories, getModels } = require('../controllers/infoController');
const { generateExcuse } = require('../controllers/excuseController');
const { generateExcuseFromImage } = require('../controllers/imageController');
const { getHistory, getStats } = require('../controllers/historyController');
const { validateExcuseInput, validateImageInput } = require('../middleware/validator');

// Info routes
router.get('/health', healthCheck);
router.get('/categories', getCategories);
router.get('/models', getModels);

// Excuse generation routes
router.post('/excuse', validateExcuseInput, generateExcuse);
router.post('/excuse/image', validateImageInput, generateExcuseFromImage);

// History routes
router.get('/history', getHistory);
router.get('/history/stats', getStats);

module.exports = router;