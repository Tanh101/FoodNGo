const express = require('express');
const router = express.Router();

const categoryController = require('../app/controllers/categoryCotroller');

//route GET /category
//@desc Get all categories
//@access public
router.get('/', categoryController.getAllProductsInCategory);

//route GET /category
//@desc find category
//@access public
router.get('/:name', categoryController.getCategoryByName);

router.post('/', categoryController.createCategory);

module.exports = router;
