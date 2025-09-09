const Gallery = require('../models/Gallery');

class GalleryController {

    // [GET] /api/gallery/category/:category - lấy gallery theo category cho user
    async getGalleryItemsByCategoryUser(req, res) {
        try {
            const { category } = req.params;
            const galleryItems = await Gallery.find({ category });

            if (!galleryItems.length) {
                return res.json({
                    success: false,
                    message: "Không tìm thấy bộ sưu tập cho thể loại này",
                    data: []
                });
            }

            res.json({ success: true, data: galleryItems, category });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi lấy bộ sưu tập", error: error.message });
        }
    }

    // [GET] /api/admin/gallery - lấy tất cả gallery (admin)
    async getAllGalleryItems(req, res) {
        try {
            const galleryItems = await Gallery.find();
            if (!galleryItems.length) {
                return res.json({ success: false, message: "Không có mục gallery nào", data: [] });
            }
            res.json({ success: true, data: galleryItems });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi lấy danh sách bộ sưu tập", error: error.message });
        }
    }

    // [POST] /api/admin/gallery/add - thêm mới
    async addGalleryItem(req, res) {
        try {
            const { mediaUrl, type, category, caption } = req.body;

            if (!mediaUrl || !type || !category || !caption) {
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin mục gallery." });
            }

            const newGalleryItem = new Gallery({ mediaUrl, type, category, caption });
            await newGalleryItem.save();

            res.json({ success: true, message: "Thêm mục gallery thành công", data: newGalleryItem });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi thêm mục vào bộ sưu tập", error: error.message });
        }
    }

    // [PUT] /api/admin/gallery/update/:id - cập nhật
    async updateGalleryItem(req, res) {
        try {
            const { id } = req.params;
            const { mediaUrl, type, category, caption } = req.body;

            if (!mediaUrl || !type || !category || !caption) {
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin mục gallery." });
            }

            const updatedItem = await Gallery.findByIdAndUpdate(
                id,
                { mediaUrl, type, category, caption },
                { new: true }
            );

            if (!updatedItem) {
                return res.status(404).json({ success: false, message: "Không tìm thấy mục trong bộ sưu tập" });
            }

            res.json({ success: true, message: "Cập nhật thành công", data: updatedItem });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi cập nhật mục gallery", error: error.message });
        }
    }

    // [DELETE] /api/admin/gallery/delete/:id - xóa
    async deleteGalleryItem(req, res) {
        try {
            const { id } = req.params;
            const deletedItem = await Gallery.findByIdAndDelete(id);

            if (!deletedItem) {
                return res.status(404).json({ success: false, message: "Không tìm thấy mục để xóa" });
            }

            res.json({ success: true, message: "Xóa thành công", data: deletedItem });
        } catch (error) {
            res.status(500).json({ success: false, message: "Có lỗi khi xóa mục trong bộ sưu tập", error: error.message });
        }
    }
}

module.exports = new GalleryController();
