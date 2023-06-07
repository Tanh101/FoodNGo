const express = require('express');
const router = express.Router();
const restaurantController = require('../app/controllers/restaurantController');
const productController = require('../app/controllers/productController');
const auth = require('../middleware/auth');


router.get('/infor', auth.verifyToken, auth.checkRole('restaurant'), restaurantController.getInforRestaurant);

//route GET product/
//@desc Get all products of a restaurant and user
//@access public
router.get('/:id', auth.verifyToken, auth.checkRole('restaurant'), productController.getProductById);

module.exports = router;