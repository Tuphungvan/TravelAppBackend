// controllers/SiteController.js
const Tour = require('../models/Tour');

class SiteController {
    // GET /api/home - trả về 6 tour ngẫu nhiên
    async index(req, res) {
        try {
            const randomTours = await Tour.aggregate([{ $sample: { size: 6 } }]);
            res.json({ success: true, data: randomTours });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: "Lỗi tải trang chủ", error: err.message });
        }
    }

    // GET /api/search - tìm kiếm tour
    async search(req, res) {
        try {
            const { q, level, startDate, endDate, price } = req.query;
            const query = {};

            if (q) query.name = { $regex: q, $options: 'i' };
            if (level) query.level = level;
            if (startDate) query.startDate = { $gte: new Date(startDate) };
            if (endDate) query.endDate = { $lte: new Date(endDate) };
            if (price) query.price = { $lte: parseInt(price, 10) };

            const tours = await Tour.find(query);

            if (!tours.length) {
                return res.json({ success: true, data: [], message: "Không tìm thấy tour phù hợp" });
            }

            res.json({ success: true, data: tours });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: "Lỗi tìm kiếm", error: err.message });
        }
    }

    // GET /api/tours/:slug - chi tiết tour
    async detail(req, res) {
        try {
            const { slug } = req.params;
            const tour = await Tour.findOne({ slug });

            if (!tour) {
                return res.status(404).json({ success: false, message: "Không tìm thấy tour" });
            }

            res.json({ success: true, data: tour });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: "Lỗi lấy chi tiết tour", error: err.message });
        }
    }
}

module.exports = new SiteController();
