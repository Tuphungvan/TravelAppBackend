const User = require("../models/User");

const isAdmin = async (req, res, next) => {
    try {
        const adminExists = await User.findOne({ admin: true });
        if (!adminExists) return next();

        if (req.session && req.session.user && req.session.user.admin) {
            return next();
        }
        return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = isAdmin;
