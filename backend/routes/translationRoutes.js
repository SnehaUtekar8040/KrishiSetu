const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

router.post('/translate-batch', translationController.translateBatch);

module.exports = router;
