const Order = require('../models/Order');
const History = require('../models/History');
const Tour = require('../models/Tour');
const RevenueReport = require('../models/RevenueReport');

class ManagerOrderController {
    // 1. Lấy danh sách đơn hàng "Chờ thanh toán"
    async getOrdersPendingPayment(req, res) {
        try {
            const orders = await Order.find({ status: 'Chờ thanh toán' });
            res.json({ success: true, data: orders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng chờ thanh toán.', error: error.message });
        }
    }

    // 2.2 Xóa đơn hàng chưa thanh toán
    async deletePendingOrder(req, res) {
        const { orderId } = req.params;
        try {
            const deleted = await Order.findByIdAndDelete(orderId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng để xóa" });
            }
            res.json({ success: true, message: "Xóa đơn hàng thành công" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xóa đơn hàng chưa thanh toán.', error: error.message });
        }
    }

    // 3. Lấy danh sách đơn hàng "Đã thanh toán và chờ xác nhận"
    async getOrdersToConfirm(req, res) {
        try {
            const orders = await Order.find({ status: 'Đã thanh toán và chờ xác nhận' });
            res.json({ success: true, data: orders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng chờ xác nhận.', error: error.message });
        }
    }

    // 4. Xác nhận đơn hàng và chuyển sang trạng thái "Hoàn tất"
    async confirmOrder(req, res) {
        const { orderId } = req.params;
        try {
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

            if (order.status !== 'Đã thanh toán và chờ xác nhận') {
                return res.status(400).json({ success: false, message: 'Đơn hàng không hợp lệ để xác nhận' });
            }

            const tour = await Tour.findOne({ slug: order.items[0].slug });
            if (!tour) return res.status(404).json({ success: false, message: 'Không tìm thấy tour tương ứng.' });

            order.status = 'Hoàn tất';
            await order.save();

            res.json({ success: true, message: "Xác nhận đơn hàng thành công", data: order });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xác nhận đơn hàng', error: error.message });
        }
    }

    // 6. Lấy danh sách đơn hàng "Hoàn tất"
    async getOrdersCompleted(req, res) {
        try {
            const orders = await Order.find({ status: 'Hoàn tất' });
            res.json({ success: true, data: orders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng.', error: error.message });
        }
    }

    // 7. Admin xác nhận đơn hàng đã kết thúc (chuyển sang History + update RevenueReport)
    async confirmExpiredOrder(req, res) {
        const { orderId } = req.params;
        try {
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

            const tour = await Tour.findOne({ slug: order.items[0].slug });
            if (!tour) return res.status(404).json({ success: false, message: 'Không tìm thấy tour tương ứng.' });

            // Tạo bản ghi trong History
            const historyItems = order.items.map(item => ({
                name: item.name,
                price: item.price,
                image: item.image,
            }));

            const history = new History({
                userId: order.userId,
                orderId: order._id,
                completedAt: new Date(),
                endDate: tour.endDate,
                items: historyItems,
            });
            await history.save();

            // Update RevenueReport
            const completedAt = history.completedAt;
            const month = completedAt.getMonth() + 1;
            const year = completedAt.getFullYear();

            let revenueReport = await RevenueReport.findOne({ month, year });
            if (!revenueReport) {
                revenueReport = new RevenueReport({
                    month,
                    year,
                    totalRevenue: 0,
                    totalOrders: 0
                });
            }

            order.items.forEach(item => {
                revenueReport.totalRevenue += item.price;
            });
            revenueReport.totalOrders += 1;

            await revenueReport.save();

            await Order.findByIdAndDelete(orderId);

            res.json({ success: true, message: "Xác nhận đơn hàng hết hạn thành công", data: history });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xác nhận hết hạn.', error: error.message });
        }
    }

    // 10. Lấy báo cáo doanh thu
    async getRevenueReport(req, res) {
        try {
            const revenueReports = await RevenueReport.find().sort({ year: -1, month: -1 });
            if (!revenueReports.length) {
                return res.status(404).json({ success: false, message: "Không có báo cáo doanh thu nào" });
            }
            res.json({ success: true, data: revenueReports });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy báo cáo doanh thu.', error: error.message });
        }
    }
}

module.exports = new ManagerOrderController();
