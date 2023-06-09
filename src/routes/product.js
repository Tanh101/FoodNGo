const express = require('express');
const productController = require('../app/controllers/productController');
const auth = require('../middleware/auth');
const validateMiddleware = require('../middleware/validationMiddleware');
const router = express.Router();

//@route POST product/create
//@desc Create product
//@access private
router.post('/', validateMiddleware.createProduct, auth.verifyToken, auth.checkRole("restaurant"), productController.createProduct);


//route GET product/
//@desc Get all products of a restaurant
//@access public
router.get('/', auth.verifyToken, auth.checkRole("restaurant"), productController.getAllProducts);

router.get('/:id', auth.verifyToken, auth.checkRole('restaurant'), productController.getProductById);

//route PUT product/:id
//@desc Update product
//@access private
router.put('/:id', validateMiddleware.createProduct, auth.verifyToken, auth.checkRole('restaurant'), productController.updateProduct);


//route DELETE product/:id
//@desc Delete product
//@access private
router.delete('/:id', auth.verifyToken, auth.checkRole('restaurant'), productController.deleteProduct);
module.exports = router;