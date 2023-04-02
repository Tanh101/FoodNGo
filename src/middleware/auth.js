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
    verifyTokenAndAdminAuth: (req, res, next) =>{
        auth.verifyToken(req, res, ()=>{
            if(req.user.id == req.params.id || req.user.role == "admin"){
                next();
            }
            else{
                return res.status(403).json("You're not allowed to delete other");
            }
        });
    }
}

module.exports = auth;
