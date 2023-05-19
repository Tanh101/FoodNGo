const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateMiddleware = require('../middleware/validationMiddleware');
const restaurantController = require('../app/controllers/restaurantController');
const orderController = require('../app/controllers/orderController');

//route GET /restaurant/:id/products
//@desc Get all products of a restaurant
//@access public
router.get('/:id/products', restaurantController.getProductsByRestaurantId);

// @route GET /restaurant
// @desc Get all restaurants
// @access public
router.get('/', restaurantController.getAllRestaurants);

// @route GET /restaurant/:id
// @desc Get restaurant by id
// @access public
router.get('/:id', restaurantController.getRestaurantById);

// @route UPDATE /restaurant/:id
// @desc Update restaurant by id
// @access private: only current restaurant
router.put('/:id', auth.verifyToken,
    // validateMiddleware.updateRestaurant,
    auth.checkAdminOrCurrentRestaurant,
    restaurantController.updateRestaurantById);

// @route UPDATE /restaurant/:id
// @desc update restaurant status by id
// @access private: current restaurant
router.delete('/:id', auth.verifyToken,
    auth.checkRole("restaurant"),
    auth.checkPermission,
    restaurantController.updateRestaurantStatus);

router.get('/:id/orders', auth.verifyToken,
    auth.checkRole("restaurant"),
    auth.checkPermission,
    orderController.getOrdersByRestaurant);

router.put('/orders/:orderId/accept', auth.verifyToken,
    auth.checkRole("restaurant"),
    orderController.acceptPreparing);

router.put('/orders/:orderId/refuse', auth.verifyToken,
    auth.checkRole("restaurant"),
    orderController.refuseOrder);




module.exports = router;



