const router = require('express').Router();
const shoppingCartController = require('../app/controllers/shoppingCartController');
const auth = require('../middleware/auth');



// @route GET /cart
// @desc Get cart by user id
// @access private: current user
router.get('/', auth.verifyToken, auth.checkRole("user"), shoppingCartController.getCart);

// @route POST /cart
// @desc Add item to cart
// @access private: current user
router.post('/', auth.verifyToken, auth.checkRole('user'), shoppingCartController.addToCart);

// @route PUT /cart
// @desc remove item from cart
// @access private: current user
router.put('/remove', auth.verifyToken, auth.checkRole('user'), shoppingCartController.removeCart);

// @route PUT /cart
// @desc Update item from cart
// @access private: current user
router.put('/', auth.verifyToken, auth.checkRole('user'), shoppingCartController.updateCart);

// @route DELETE /cart
// @desc Delete item from cart
// @access private: current user
router.delete('/', auth.verifyToken, auth.checkRole('user'), shoppingCartController.deleteCart);


module.exports = router;