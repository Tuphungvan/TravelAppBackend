const express = require('express');
const router = express.Router();
const ReviewController = require('../app/controllers/ReviewController');
const isAdmin = require('../app/middlewares/isAdmin');

// Admin API
router.get('/api/admin/reviews', isAdmin, ReviewController.getAllReviews);
router.post('/api/admin/reviews/add', isAdmin, ReviewController.addReview);
router.delete('/api/admin/reviews/delete/:id', isAdmin, ReviewController.deleteReview);

// User API (app gọi)
router.get('/api/reviews', ReviewController.getReviewsJson);

module.exports = router;
