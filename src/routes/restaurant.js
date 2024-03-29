const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateMiddleware = require('../middleware/validationMiddleware');
const restaurantController = require('../app/controllers/restaurantController');
const orderController = require('../app/controllers/orderController');
const categoryController = require('../app/controllers/categoryCotroller');

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
router.put('/', auth.verifyToken,
    // validateMiddleware.updateRestaurant,
    auth.checkRole("restaurant"),
    restaurantController.updateRestaurantById);

// @route UPDATE /restaurant/:id
// @desc update restaurant status by id
// @access private: current restaurant
router.patch('/:id', auth.verifyToken, auth.checkRole('restaurant'),
    restaurantController.updateRestaurantStatus);

module.exports = router;



