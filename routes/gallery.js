const express = require('express');
const router = express.Router();
const galleryController = require('../app/controllers/GalleryController');
const isAdmin = require('../app/middlewares/isAdmin');

// User: xem gallery theo category
router.get('/gallery/category/:category', galleryController.getGalleryItemsByCategoryUser);

// Admin: quản lý gallery
router.get('/admin/gallery', isAdmin, galleryController.getAllGalleryItems);
router.post('/admin/gallery/add', isAdmin, galleryController.addGalleryItem);
router.put('/admin/gallery/update/:id', isAdmin, galleryController.updateGalleryItem);
router.delete('/admin/gallery/delete/:id', isAdmin, galleryController.deleteGalleryItem);

module.exports = router;
