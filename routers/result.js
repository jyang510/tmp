const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.get('/result', resultController.GetResult);

module.exports = router;