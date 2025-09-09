const express = require('express');
const router = express.Router();
const cartController = require('../app/controllers/cartController');
const isAuthenticated = require('../app/middlewares/isAuthenticated');

router.post('/cart/:slug', isAuthenticated, cartController.addToCart);
router.get('/cart', isAuthenticated, cartController.viewCart);
router.delete('/cart/:slug', isAuthenticated, cartController.removeFromCart);
router.get('/cart/count', isAuthenticated, cartController.cartItemCount);

module.exports = router;
