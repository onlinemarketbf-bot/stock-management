const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Stock movement routes
router.post('/entry', stockController.recordEntry);
router.post('/exit', stockController.recordExit);
router.get('/movements', stockController.getAllMovements);
router.get('/movements/:product_id', stockController.getMovementsByProduct);

module.exports = router;
