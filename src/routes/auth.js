
const express = require('express');
require('dotenv').config();
const authController = require('../app/controllers/authController');
const validateMiddleware = require('../../src/middleware/validate');

const router = express.Router();

//@route POST api/auth/register
//@desc Register user
//@access public
router.post('/register', authController.register);

module.exports = router;

