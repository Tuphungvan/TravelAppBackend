const express = require('express');
const router = express.Router();
const isAdmin = require('../app/middlewares/isAdmin');
const ensureActive = require('../app/middlewares/ensureActive');
const adminController = require('../app/controllers/AdminController');

// Dashboard
router.get('/dashboard', isAdmin, ensureActive, adminController.dashboard);

// Tours
router.get('/tours', isAdmin, ensureActive, adminController.manageTours);
router.post('/tours', isAdmin, ensureActive, adminController.createTour);
router.put('/tours/:id', isAdmin, ensureActive, adminController.updateTour);
router.delete('/tours/:id', isAdmin, ensureActive, adminController.deleteTour);

// Users
router.get('/users', isAdmin, ensureActive, adminController.manageUsers);
router.post('/users/:id/deactivate', isAdmin, ensureActive, adminController.deactivateUser);
router.post('/users/:id/activate', isAdmin, ensureActive, adminController.activateUser);
router.post('/users/:id/reset-password', isAdmin, ensureActive, adminController.resetPassword);

// Admin
router.post('/create-admin', isAdmin, adminController.createAdmin);

module.exports = router;
