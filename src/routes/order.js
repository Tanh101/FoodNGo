const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validateMiddleware = require('../middleware/validationMiddleware');
const orderController = require('../app/controllers/orderController');

router.get('/restaurants', auth.verifyToken, auth.checkRole('restaurant'), orderController.getOrdersByRestaurant);

router.get('/users', auth.verifyToken, auth.checkRole('user'), orderController.getOrdersByUser);

router.patch('/:id/user', auth.verifyToken, auth.checkRole('user'), orderController.cancelOrder);

router.patch('/:id/shipper', auth.verifyToken, auth.checkRole('shipper'), orderController.updaetOrderByShipper);

router.patch('/:id/restaurant', auth.verifyToken, auth.checkRole('restaurant'), orderController.updateStatusOrderByRestaurant);

module.exports = router;