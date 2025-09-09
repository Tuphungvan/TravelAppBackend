const express = require('express');
const router = express.Router();
const isAuthenticated = require('../app/middlewares/isAuthenticated');
const profileController = require('../app/controllers/ProfileController');

// Lấy thông tin profile
router.get('/', isAuthenticated, profileController.index);

// Đơn hàng
router.get('/my-orders', isAuthenticated, profileController.myOrders);
router.get('/my-orders/:orderId', isAuthenticated, profileController.orderDetail);

// Lịch sử
router.get('/history', isAuthenticated, profileController.history);
router.get('/history/:historyId', isAuthenticated, profileController.historyDetail);

// Cập nhật profile
router.put('/update', isAuthenticated, profileController.handleUpdateProfile);

// Ví
router.get('/wallet', isAuthenticated, profileController.getWallet);
router.post('/wallet/recharge', isAuthenticated, profileController.handleRechargeWallet);

module.exports = router;
