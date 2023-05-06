const express = require('express'); 
const dashboardController = require('../app/controllers/dashboardController'); 
const auth = require('../../src/middleware/auth');
const router = express.Router();


// @route GET /restaurant 
// @desc Get all restaurants 
// @access private: only admin 
router.get('/restaurant', auth.verifyToken, auth.checkRole('admin'), dashboardController.getAllRestaurants);

// @route PUT /restaurant/:id
// @desc Update restaurant status
// @access private: only admin
router.put('/restaurant/:id', auth.verifyToken, auth.checkRole('admin'), dashboardController.approveRestaurant);

// @route GET /user
// @desc Get all users
// @access private: only admin
router.get('/user', auth.verifyToken, auth.checkRole('admin'), dashboardController.getAllUsers);



module.exports = router;