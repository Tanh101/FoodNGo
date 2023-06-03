const { RestaurantValidator } = require('../app/validation/restaurantValidator');
const { UserValidator } = require('../app/validation/userValidator');
const {validateSignup} = require('../app/validation/validator');
const { ProductValidator } = require('../app/validation/productValidator');

const validateMiddleware = {
    signupUser: (req, res, next) => {
        const { error } = validateSignup(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    }, 
    updateUser: (req, res, next) => {
        const { error } = UserValidator(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    }, 

    updateRestaurant: (req, res, next) => {
        const { error } = RestaurantValidator(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    },

    createProduct: (req, res, next) => {
        const { error } = ProductValidator(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    }
}

module.exports = validateMiddleware;