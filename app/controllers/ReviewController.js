const Review = require('../models/Review');

class ReviewController {
    // [GET] /api/admin/reviews - lấy tất cả review (admin)
    async getAllReviews(req, res) {
        try {
            const reviews = await Review.find();
            if (!reviews.length) {
                return res.json({ success: false, message: "Không có đánh giá nào", data: [] });
            }
            res.json({ success: true, data: reviews });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi lấy danh sách đánh giá", error: error.message });
        }
    }

    // [POST] /api/admin/reviews/add - thêm review mới
    async addReview(req, res) {
        try {
            const { image, name, review } = req.body;

            if (!image || !name || !review) {
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
            }

            const newReview = new Review({ image, name, review });
            await newReview.save();

            res.json({ success: true, message: "Thêm review thành công", data: newReview });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi thêm review", error: error.message });
        }
    }

    // [DELETE] /api/admin/reviews/delete/:id - xóa review
    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const deletedReview = await Review.findByIdAndDelete(id);

            if (!deletedReview) {
                return res.status(404).json({ success: false, message: "Không tìm thấy review để xóa" });
            }

            res.json({ success: true, message: "Xóa review thành công", data: deletedReview });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi xóa review", error: error.message });
        }
    }

    // [GET] /api/reviews - lấy review cho user (trang chủ, app)
    async getReviewsJson(req, res) {
        try {
            const reviews = await Review.find();
            res.json({ success: true, data: reviews });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu review", error: error.message });
        }
    }
}

module.exports = new ReviewController();
