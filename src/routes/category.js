const express = require('express');
const router = express.Router();

const categoryController = require('../app/controllers/categoryCotroller');
const auth = require('../middleware/auth');

//route GET /category
//@desc find category
//@access public
router.get('/:name', categoryController.getCategoryByName);

router.post('/', auth.verifyToken, auth.checkRole('restaurant'), categoryController.createCategory);

router.get('/', categoryController.getAllProductsInCategory)

router.patch('/', categoryController.updateCategory)

module.exports = router;
