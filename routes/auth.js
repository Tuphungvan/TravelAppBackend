const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.post('/logout', authController.logout);

// Kiểm tra trạng thái đăng nhập
router.get('/check-login-status', authController.checkLoginStatus);

module.exports = router;
