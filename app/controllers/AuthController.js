const User = require("../models/User");
const bcrypt = require("bcrypt");

class AuthController {
    // Đăng ký
    async register(req, res) {
        try {
            const { username, email, password, phoneNumber, address } = req.body;

            // Kiểm tra dữ liệu
            if (!username || !email || !password) {
                return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
            }

            if (username.length < 6) {
                return res.status(400).json({ message: "Tên người dùng phải dài ít nhất 6 ký tự." });
            }

            // Kiểm tra trùng lặp
            const existingUser = await User.findOne({
                $or: [{ email }, { phoneNumber }],
            });

            if (existingUser) {
                let errorMessage = "Thông tin đã được sử dụng.";
                if (existingUser.email === email) errorMessage = "Email đã được đăng ký.";
                if (existingUser.phoneNumber === phoneNumber) errorMessage = "Số điện thoại đã được đăng ký.";
                return res.status(400).json({ message: errorMessage });
            }

            // Kiểm tra xem có admin nào chưa
            const adminExists = await User.findOne({ admin: true });
            const isAdmin = !adminExists;

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                phoneNumber,
                address,
                admin: isAdmin,
            });

            await newUser.save();
            return res.status(201).json({ message: "Đăng ký thành công!", userId: newUser._id });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Email người dùng không tồn tại." });
            }

            if (!user.active) {
                return res.status(403).json({ message: "Tài khoản đã bị vô hiệu. Liên hệ admin." });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Mật khẩu không đúng." });
            }

            // Lưu session
            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
                admin: user.admin,
            };

            return res.status(200).json({ message: "Đăng nhập thành công!", user: req.session.user });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error", error: err.message });
        }
    }

    // Đăng xuất
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Đăng xuất không thành công." });
            }
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "Đăng xuất thành công." });
        });
    }

    // Kiểm tra trạng thái đăng nhập
    checkLoginStatus(req, res) {
        if (req.session && req.session.user) {
            return res.json({
                loggedIn: true,
                user: req.session.user,
            });
        } else {
            return res.json({ loggedIn: false });
        }
    }
}

module.exports = new AuthController();
