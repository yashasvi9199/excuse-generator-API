const express = require('express');
const router = express.Router();

const {healthCheck, getCategories, getModels} = require('../controllers/infoController');
const {generateExcuse} = require('../controllers/excuseController');
const {validateExcuseInput, validateImageInput} = require('../middleware/validator');
const { generateExcuseFromImage } = require('../controllers/imageController');


// Infor routes
router.get('/health', healthCheck);
router.get('/categories', getCategories);
router.get('/models', getModels);

// Excuse generation routes
router.post('/excuse', validateExcuseInput, generateExcuse);
router.post('/excuse/image', validateImageInput, generateExcuseFromImage);

module.exports = router;