const express = require('express');
const router = express.Router();

const categoryController = require('../app/controllers/categoryCotroller');
const auth = require('../middleware/auth');

router.post('/restaurants', auth.verifyToken, auth.checkRole('restaurant'), categoryController.createCategory);

router.get('/restaurants', auth.verifyToken, auth.checkRole('restaurant'), categoryController.getAllCategoryByRestaurant);

router.get('/:id/restaurants', auth.verifyToken, auth.checkRole('restaurant'), categoryController.getCategoryById);

router.get('/default', categoryController.getAllCategoryDefault);

router.put('/:id/restaurants', auth.verifyToken, auth.checkRole('restaurant'), categoryController.updateCategory);

router.delete('/:id/restaurants', auth.verifyToken, auth.checkRole('restaurant'), categoryController.deleteCategory);


module.exports = router;
