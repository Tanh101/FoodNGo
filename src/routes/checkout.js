const express = require('express');
const router = require('express').Router();
const auth = require('../middleware/auth');
const orderController = require('../app/controllers/orderController');

router.get('/', auth.verifyToken, auth.checkRole('user'), orderController.getInforCheckout);

module.exports = router;