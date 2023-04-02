
const express = require('express');
require('dotenv').config();
const authController = require('../app/controllers/authController');
const validateMiddleware = require('../middleware/validationMiddleware');


const router = express.Router();

//@route POST api/auth/register
//@desc Register user
//@access public
router.post('/register',validateMiddleware.signup, authController.register);

module.exports = router;

