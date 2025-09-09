const Tour = require('../models/Tour');
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Hàm trích xuất videoId từ URL YouTube
function extractVideoId(videoUrl) {
    if (typeof videoUrl === 'string' && videoUrl) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/[^\?]+|\S+\/\S+\/\S+))?([a-zA-Z0-9_-]{11})/;
        const match = videoUrl.match(regex);
        return match ? match[1] : null;
    }
    return null;
}

class AdminController {
    // Dashboard
    async dashboard(req, res) {
        return res.json({ message: "Welcome to Admin Dashboard" });
    }

    // Danh sách tour
    async manageTours(req, res) {
        try {
            const tours = await Tour.find();
            return res.json({ tours });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // Tạo tour mới
    async createTour(req, res) {
        try {
            const { name, description, videoUrl, level, startDate, endDate, itinerary, price } = req.body;

            const videoId = extractVideoId(videoUrl);
            if (!videoId) {
                return res.status(400).json({ message: 'Invalid YouTube URL' });
            }

            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

            const newTour = new Tour({
                name,
                description,
                videoId,
                level,
                startDate,
                endDate,
                itinerary,
                price,
                image: thumbnailUrl,
            });

            await newTour.save();
            return res.status(201).json({ message: "Tour created successfully", tour: newTour });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // Cập nhật tour
    async updateTour(req, res) {
        try {
            const { name, description, videoUrl, level, startDate, endDate, itinerary, price } = req.body;

            const videoId = extractVideoId(videoUrl);
            if (!videoId) {
                return res.status(400).json({ message: 'Invalid YouTube URL' });
            }

            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

            const updatedTour = await Tour.findByIdAndUpdate(
                req.params.id,
                { name, description, videoId, level, startDate, endDate, itinerary, price, image: thumbnailUrl },
                { new: true }
            );

            if (!updatedTour) return res.status(404).json({ message: "Tour not found" });

            return res.json({ message: "Tour updated successfully", tour: updatedTour });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // Xóa tour
    async deleteTour(req, res) {
        try {
            const deleted = await Tour.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: "Tour not found" });
            return res.json({ message: "Tour deleted successfully" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // Danh sách user
    async manageUsers(req, res) {
        try {
            const query = {};
            if (req.query.search) {
                query.username = { $regex: req.query.search, $options: 'i' };
            }
            const sortOption = req.query.sort === 'asc' ? { username: 1 } : req.query.sort === 'desc' ? { username: -1 } : {};
            const users = await User.find(query).sort(sortOption);
            return res.json({ users });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Khóa user
    async deactivateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
            if (!user) return res.status(404).json({ message: "User not found" });
            return res.json({ message: "User deactivated successfully", user });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Kích hoạt user
    async activateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { active: true }, { new: true });
            if (!user) return res.status(404).json({ message: "User not found" });
            return res.json({ message: "User activated successfully", user });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const defaultPassword = "000000";
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(defaultPassword, salt);
            await user.save();

            return res.json({ message: "Password reset successfully", userId: user._id });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Tạo admin mới
    async createAdmin(req, res) {
        try {
            const { username, email, password, phoneNumber } = req.body;

            const existingUser = await User.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
            if (existingUser) {
                return res.status(400).json({ message: "Thông tin đã được sử dụng." });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new User({
                username,
                email,
                password: hashedPassword,
                phoneNumber,
                admin: true,
            });

            await newAdmin.save();
            return res.status(201).json({ message: "Admin created successfully", adminId: newAdmin._id });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }
}

module.exports = new AdminController();
