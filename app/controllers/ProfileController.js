const User = require('../models/User');
const Order = require('../models/Order');
const History = require('../models/History');
const bcrypt = require('bcrypt');
const Wallet = require('../models/Wallet');

class ProfileController {
    // [GET] /api/profile - thông tin user
    async index(req, res) {
        try {
            const userId = req.user.id; // lấy từ middleware auth
            const user = await User.findById(userId).select("-password"); // ẩn password
            res.json({ success: true, data: user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [GET] /api/profile/my-orders - danh sách đơn hàng
    async myOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await Order.find({ userId }).sort({ createdAt: -1 });
            res.json({ success: true, data: orders });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [GET] /api/profile/history - lịch sử đơn hàng
    async history(req, res) {
        try {
            const userId = req.user.id;
            const histories = await History.find({ userId }).sort({ completedAt: -1 });
            res.json({ success: true, data: histories });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [PUT] /api/profile/update - cập nhật thông tin cá nhân
    async handleUpdateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { username, email, phoneNumber, address, password } = req.body;

            // Kiểm tra trùng lặp
            const existingUser = await User.findOne({ $or: [{ username }, { email }, { phoneNumber }] });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ success: false, message: "Username, email, or phone number already in use." });
            }

            // Nếu có thay đổi mật khẩu
            let updateData = { username, email, phoneNumber, address };
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

            res.json({ success: true, message: "Cập nhật thành công", data: updatedUser });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [GET] /api/profile/wallet - xem ví
    async getWallet(req, res) {
        try {
            const userId = req.user.id;
            let wallet = await Wallet.findOne({ userId });
            if (!wallet) {
                wallet = await Wallet.create({ userId, balance: 0 });
            }
            res.json({ success: true, data: wallet });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [POST] /api/profile/wallet/recharge - nạp tiền vào ví
    async handleRechargeWallet(req, res) {
        try {
            const userId = req.user.id;
            const { amount } = req.body;

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(400).json({ success: false, message: "Invalid amount" });
            }

            const wallet = await Wallet.findOneAndUpdate(
                { userId },
                { $inc: { balance: Number(amount) } },
                { new: true, upsert: true }
            );

            res.json({ success: true, message: "Nạp tiền thành công", data: wallet });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [GET] /api/profile/my-orders/:orderId - chi tiết đơn hàng
    async orderDetail(req, res) {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId).populate('items.slug');
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
            res.json({ success: true, data: order });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }

    // [GET] /api/profile/history/:historyId - chi tiết lịch sử
    async historyDetail(req, res) {
        try {
            const { historyId } = req.params;
            const history = await History.findById(historyId).populate('orderId');
            if (!history) {
                return res.status(404).json({ success: false, message: "History record not found" });
            }
            res.json({ success: true, data: history });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }
}

module.exports = new ProfileController();
