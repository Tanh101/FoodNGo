const express = require('express');
const router = express.Router();
const restaurantController = require('../app/controllers/restaurantController');
const productController = require('../app/controllers/productController');
const restaurantDashboardController = require('../app/controllers/restaurantDashboardController');
const auth = require('../middleware/auth');


router.get('/infor', auth.verifyToken, auth.checkRole('restaurant'), restaurantController.getInforRestaurant);

//route GET product/
//@desc Get all products of a restaurant and user
//@access public
router.get('/products/:id', auth.verifyToken, auth.checkRole('restaurant'), productController.getProductById);

//route get best selling items
//@desc Get best selling items
//@access public
router.get('/best-selling-items', auth.verifyToken, auth.checkRole('restaurant'), restaurantDashboardController.getBestSellingItems);

module.exports = router;