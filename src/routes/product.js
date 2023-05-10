const express = require('express');
const productController = require('../app/controllers/productController');
const auth = require('../middleware/auth');
const validateMiddleware = require('../middleware/validationMiddleware');
const router = express.Router();

//@route POST product/create
//@desc Create product
//@access public
router.post('/', validateMiddleware.createProduct, auth.verifyToken, auth.checkRole("restaurant"), productController.createProduct);

module.exports = router;