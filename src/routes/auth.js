const express = require('express');
const authController = require('../app/controllers/authController');
const validateMiddleware = require('../middleware/validationMiddleware');
const auth = require('../middleware/auth');


const router = express.Router();

//@route GET auth/refresh
//@desc Refresh token
//@access public
router.post('/token', authController.refreshAccessToken);

//@route POST auth/register/user
//@desc Register user
//@access public
router.post('/register/user', validateMiddleware.signupUser ,authController.userRegister);

//@route POST auth/register/restaurant
//@desc Register restaurant
//@access public
router.post('/register/restaurant', validateMiddleware.signupRestaurant, authController.restaurantRegister);

//@route POST auth/login
//@desc Login user
//@access public
router.post('/login', authController.login);

//@route DELETE auth/delete
//@desc delete user
//@access public
router.put('/delete/:id',auth.verifyToken, auth.checkRole("admin"),  authController.updateStatus);

//@route POST auth/update
//@desc update user
//@access public
router.put('/:id', auth.verifyToken, auth.checkRole("admin"),  authController.updateRole);


module.exports = router;

