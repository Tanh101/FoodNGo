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
    checkRole: (req, res, next) => {
        if(req.user.role === "admin"){
            next();
        }
        else{
            return res.status(403).json("You are not allowed to do that");
        }
    }
}

module.exports = auth;
