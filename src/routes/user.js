const express = require('express');
const userController = require('../app/controllers/userController');
const validateMiddleware = require('../middleware/validationMiddleware');
const auth = require('../middleware/auth');
const orderController = require('../app/controllers/orderController');

const router = express.Router();

//@route GET /:id
//@desc Get user by id
//@access private
router.get('/:id',
    auth.verifyToken,
    auth.checkPermission,
    userController.getUserById
);

//@route UPDATE /:id
//@desc Update user by id
//@access private
router.put('/:id',
    validateMiddleware.updateUser,
    auth.verifyToken,
    auth.checkPermission,
    userController.updateUserById
);

router.post('/order', auth.verifyToken, auth.checkRole("user"), orderController.createOrder)






module.exports = router;