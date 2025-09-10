// routes/video.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/videos/list
router.get('/list', (req, res) => {
    // Chỉ định folder video từ root project
    const videoDir = path.resolve('public', 'img');

    fs.readdir(videoDir, (err, files) => {
        if (err) {
            console.error('Cannot read video folder:', err);
            return res.status(500).json({ error: 'Cannot read video folder' });
        }

        // Lọc file .mp4 và trả đường dẫn public
        const videos = files
            .filter(f => f.toLowerCase().endsWith('.mp4'))
            .map(f => `/img/${f}`); // đường dẫn public

        res.json(videos);
    });
});

module.exports = router;
