
const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');

// API cho Android
router.get('/home', siteController.index);
router.get('/search', siteController.search);
router.get('/tours/:slug', siteController.detail);

module.exports = router;
