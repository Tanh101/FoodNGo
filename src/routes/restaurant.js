const express = require('express');
const router = express.Router();
const restaurantController = require('../app/controllers/restaurantController');
const auth = require('../middleware/auth');


// @route GET /restaurant
// @desc Get all restaurants
// @access public
router.get('/', restaurantController.getAllRestaurants);

// @route GET /restaurant/:id
// @desc Get restaurant by id
// @access public
router.get('/id', restaurantController.getRestaurantById);

// @route UPDATE /restaurant/:id
// @desc Update restaurant by id
// @access private
router.put('/:id', auth.verifyToken,
    auth.checkRestaurantPermission, 
    restaurantController.updateRestaurantById);

// @route DELETE /restaurant/:id
// @desc Delete restaurant by id
// @access private
router.delete('/:id', auth.verifyToken,
    auth.checkRestaurantPermission,
    restaurantController.deleteRestaurantById);

module.exports = router;



