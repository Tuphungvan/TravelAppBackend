const siteRouter = require('./site');
const authRouter = require('./auth');
const profileRouter = require('./profile');
const adminRouter = require('./admin');
const cartRouter = require('./cart');
const checkoutRouter = require('./checkout');
const managerOrderRouter = require('./managerOrder');
const galleryRouter = require('./gallery');
const reviewRouter = require('./review');
const videoRoute = require('./videos');

function route(app) {
    app.use('/admin', adminRouter);
    app.use('/v1/auth', authRouter);
    app.use('/profile', profileRouter);
    app.use('/', siteRouter);
    app.use('/', cartRouter);
    app.use('/checkout', checkoutRouter);
    app.use('/admin/manager-order', managerOrderRouter);
    app.use('/', galleryRouter);
    app.use('/', reviewRouter);
    app.use('/api/videos', videoRoute);
}

module.exports = route;
