const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Kết nối MongoDB thành công!');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = { connect };
