const express = require('express');
const userController = require('../app/controllers/userController');
const validateMiddleware = require('../middleware/validationMiddleware');
const auth = require('../middleware/auth');

const router = express.Router();

//@route GET user/
//@desc Get all users
//@access private
// auth.verifyToken, 
router.get('/', auth.verifyToken,
    auth.checkRole("admin"),
    userController.getAllusers);

//@route GET /:id
//@desc Get user by id
//@access private
router.get('/:id',
    auth.verifyToken,
    auth.checkRole("admin"),
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






module.exports = router;