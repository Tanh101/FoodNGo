const express = require('express');
const userController = require('../app/controllers/userController');
const validateMiddleware = require('../middleware/validationMiddleware');
const auth = require('../middleware/auth');
const orderController = require('../app/controllers/orderController');
const restaurantController = require('../app/controllers/restaurantController');

const router = express.Router();

//@route GET /:id
//@desc Get user by id
//@access private
router.get('/',
    auth.verifyToken,
    auth.checkRole("user"),
    userController.getUserInfor
);


//@route UPDATE /:id
//@desc Update user by id
//@access private
router.put('/',
    // validateMiddleware.updateUser,
    auth.verifyToken,
    auth.checkRole("user"),
    userController.updateUserById
);



//@router GET

router.post('/order', auth.verifyToken, auth.checkRole("user"), orderController.createOrder)

router.get('/restaurants', restaurantController.findRestaurantByName)
module.exports = router;