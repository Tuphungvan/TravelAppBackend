const express = require('express');
const router = express.Router();
const managerOrderController = require('../app/controllers/ManagerOrderController');
const isAdmin = require('../app/middlewares/isAdmin');
const ensureActive = require('../app/middlewares/ensureActive');

// Lấy danh sách đơn hàng chờ thanh toán
router.get('/pending-payment', isAdmin, ensureActive, managerOrderController.getOrdersPendingPayment);

// Lấy danh sách đơn hàng đã thanh toán và chờ xác nhận
router.get('/to-confirm', isAdmin, ensureActive, managerOrderController.getOrdersToConfirm);

// Xác nhận đơn hàng (chuyển sang Hoàn tất)
router.post('/confirm/:orderId', isAdmin, ensureActive, managerOrderController.confirmOrder);

// Xóa đơn hàng chưa thanh toán
router.delete('/delete/:orderId', isAdmin, ensureActive, managerOrderController.deletePendingOrder);

// Hoàn tất đơn hàng đã hết hạn
router.post('/complete/:orderId', isAdmin, ensureActive, managerOrderController.confirmExpiredOrder);

// Lấy danh sách đơn hàng Hoàn tất
router.get('/completed', isAdmin, ensureActive, managerOrderController.getOrdersCompleted);

// Lấy báo cáo doanh thu
router.get('/revenue-report', isAdmin, ensureActive, managerOrderController.getRevenueReport);

// Trang tổng quan (API có thể bỏ hoặc trả JSON đơn giản)
router.get('/', isAdmin, ensureActive, (req, res) => {
    res.json({ success: true, message: "Trang quản lý đơn hàng (API)" });
});

module.exports = router;
