const express = require('express'); 
const dashboardController = require('../app/controllers/dashboardController'); 
const auth = require('../../src/middleware/auth');
const router = express.Router();


// @route GET /restaurant 
// @desc Get all restaurants 
// @access private: only admin 
router.get('/restaurant', auth.verifyToken, auth.checkRole('admin'), dashboardController.getAllRestaurants);

router.get('/restaurant/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.getRestaurantById);

// @route GET /shipper
// @desc Get all shipper
// @access private: only admin
router.get('/shipper', auth.verifyToken, auth.checkRole('admin'), dashboardController.getAllShipper);

router.get('/shipper/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.getShipperById);


// @route GET /user
// @desc Get all users
// @access private: only admin
router.get('/user', auth.verifyToken, auth.checkRole('admin'), dashboardController.getAllUsers);

router.get('/user/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.getUserById);


// @route PUT /restaurant/:id
// @desc Update restaurant status
// @access private: only admin
router.put('/restaurant/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.approveRestaurant);

// @route PUT /shipper/:id
// @desc Update shipper status
// @access private: only admin
router.put('/shipper/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.approveShipper);

// @route PUT /user/:id
// @desc Update user status
// @access private: only admin
router.put('/banned/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.banUser);




//@route PUT /restaurant
//@desc Update restaurant
//@access private: only admin
router.put('/restaurant', auth.verifyToken, auth.checkRole('admin'), dashboardController.updateRestaurant);

// @route GET /restaurant/:id
// @desc Get restaurant by id
// @access private: only admin
router.get('/restaurant/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.getRestaurantById);

router.get('/statistic', auth.verifyToken, auth.checkRole('admin'), dashboardController.getStatistic);




module.exports = router;