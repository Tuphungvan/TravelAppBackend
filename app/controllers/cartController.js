const Cart = require('../models/Cart');
const Tour = require('../models/Tour');

class CartController {
    // POST /api/cart/:slug - Thêm tour vào giỏ
    async addToCart(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id; // đã xác thực từ middleware

            const tour = await Tour.findOne({ slug });
            if (!tour) {
                return res.status(404).json({ success: false, message: 'Tour không tồn tại' });
            }

            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            const existingItem = cart.items.find(item => item.slug === slug);
            if (existingItem) {
                return res.json({ success: true, message: 'Tour đã có trong giỏ hàng', cart });
            }

            cart.items.push({
                slug: tour.slug,
                name: tour.name,
                price: tour.price,
                image: tour.image,
            });

            await cart.save();
            res.json({ success: true, message: 'Thêm vào giỏ thành công', cart });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // GET /api/cart - Xem giỏ hàng
    async viewCart(req, res) {
        try {
            const userId = req.user.id;
            const cart = await Cart.findOne({ userId });

            if (!cart) {
                return res.json({ success: true, cart: { items: [], total: 0 } });
            }

            const total = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
            res.json({ success: true, cart, total });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // DELETE /api/cart/:slug - Xóa 1 tour
    async removeFromCart(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;

            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
            }

            cart.items = cart.items.filter(item => item.slug !== slug);
            await cart.save();

            res.json({ success: true, message: 'Xóa tour khỏi giỏ thành công', cart });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // GET /api/cart/count - Số lượng item trong giỏ
    async cartItemCount(req, res) {
        try {
            const userId = req.user.id;
            const cart = await Cart.findOne({ userId });
            const totalCount = cart ? cart.items.length : 0;

            res.json({ success: true, count: totalCount });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new CartController();
