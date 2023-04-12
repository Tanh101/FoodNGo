const jwt = require('jsonwebtoken');

const auth = {
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization;
        if(token){
            //bearer 123333
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
                if(err){
                    return res.status(403).json("Token is not valid");
                }
                req.user= user;
                next();
            });
        }
        else{
            return res.status(401).json("You are not authenticated");
        }

    },
    checkRole: (role) => {
        return (req, res, next) => {
            const userRole = req.user.role;
            if (userRole === role) {
                next();
            } else {
                return res.status(403).json("You do not have permission to access this resource");
            }
        };
    },
    checkRestaurantPermission: (req, res, next) => {
        const userId = req.user.id;
        const restaurantId = req.params.id;
        if (userId === restaurantId) {
            next();
        } else {
            return res.status(403).json("You do not have permission to access this resource");
        }
    }, 
    checkUserPermission: (req, res, next) => {
        const userId = req.user.id;
        const userId2 = req.params.id;
        if (userId === userId2) {
            next();
        } else {
            return res.status(403).json("You do not have permission to access this resource");
        }
    }
}

module.exports = auth;
