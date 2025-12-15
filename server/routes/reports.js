const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Report routes
router.get('/dashboard', reportController.getDashboardStats);
router.get('/sales/:period', reportController.getSalesByPeriod);
router.get('/monthly/:year/:month', reportController.getMonthlyReport);
router.get('/annual/:year', reportController.getAnnualReport);
router.get('/profit-by-product', reportController.getProfitByProduct);

module.exports = router;
