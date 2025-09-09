const express = require('express');
const router = express.Router();
const checkoutController = require('../app/controllers/CheckoutController');
const isAuthenticated = require('../app/middlewares/isAuthenticated');

// Xem giỏ hàng + tổng tiền
router.get('/', isAuthenticated, checkoutController.index);

// Xác nhận trước khi thanh toán
router.post('/confirm', isAuthenticated, checkoutController.confirm);

// Đặt hàng
router.post('/place-order', isAuthenticated, checkoutController.placeOrder);

// Xác nhận thanh toán cho đơn hàng
router.post('/confirm-payment/:id', isAuthenticated, checkoutController.confirmPayment);

// Lấy thông tin thanh toán (order + ví)
router.get('/payment/:id', isAuthenticated, checkoutController.showPaymentPage);

module.exports = router;
