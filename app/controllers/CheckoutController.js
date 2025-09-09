const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');

class CheckoutController {
    // [GET] /api/checkout - xem giỏ hàng + tổng tiền
    async index(req, res) {
        try {
            const userId = req.user.id; // lấy từ middleware auth thay vì session
            const cart = await Cart.findOne({ userId });

            if (!cart || cart.items.length === 0) {
                return res.json({ success: false, message: "Giỏ hàng rỗng" });
            }

            const total = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
            res.json({ success: true, data: { cart, total } });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi tải trang thanh toán", error: error.message });
        }
    }

    // [POST] /api/checkout/confirm - xác nhận trước khi thanh toán
    async confirm(req, res) {
        try {
            const userId = req.user.id;
            const cart = await Cart.findOne({ userId });
            if (!cart || cart.items.length === 0) {
                return res.json({ success: false, message: "Giỏ hàng rỗng" });
            }

            const totalAmount = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

            res.json({
                success: true,
                message: "Xác nhận thanh toán thành công",
                data: { totalAmount }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi xác nhận", error: error.message });
        }
    }

    // [POST] /api/checkout/place-order - đặt hàng
    async placeOrder(req, res) {
        try {
            const userId = req.user.id;
            const cart = await Cart.findOne({ userId });

            if (!cart || cart.items.length === 0) {
                return res.json({ success: false, message: "Giỏ hàng rỗng" });
            }

            // Tính tổng tiền
            const totalAmount = cart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

            const newOrder = new Order({
                userId,
                items: cart.items,
                totalAmount,
                status: 'Chờ thanh toán',
                paymentMethod: 'My wallet',
            });

            await newOrder.save();
            await Cart.deleteOne({ userId });

            res.json({ success: true, message: "Đặt hàng thành công", data: newOrder });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi đặt hàng", error: error.message });
        }
    }

    // [POST] /api/checkout/confirm-payment/:id - xác nhận thanh toán
    async confirmPayment(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId);

            if (!order || order.status !== 'Chờ thanh toán') {
                return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ hoặc đã thanh toán' });
            }

            const userId = req.user.id;
            const wallet = await Wallet.findOne({ userId });

            if (!wallet || wallet.balance < order.totalAmount) {
                return res.json({ success: false, message: "Số dư ví không đủ, vui lòng nạp thêm" });
            }

            // Trừ tiền trong ví
            wallet.balance -= order.totalAmount;
            await wallet.save();

            // Cập nhật trạng thái đơn hàng
            order.status = 'Đã thanh toán và chờ xác nhận';
            await order.save();

            res.json({ success: true, message: "Thanh toán thành công", data: order });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra', error: error.message });
        }
    }

    // [GET] /api/checkout/payment/:id - lấy thông tin đơn hàng + số dư ví
    async showPaymentPage(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId).populate('items');

            if (!order) {
                return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
            }

            const userId = req.user.id;
            const wallet = await Wallet.findOne({ userId });

            res.json({ success: true, data: { order, wallet } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi hệ thống', error: error.message });
        }
    }
}

module.exports = new CheckoutController();
