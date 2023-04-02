const registerValidate = require('../app/validators/authValidate');
const validate = {
    registervalidate: (req, res, next) => {
        const data = req.body;
        const { error } = registerValidate(data);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        next();
    }
};

module.exports = validate;
