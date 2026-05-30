const jwt = require("jsonwebtoken");

const verifyToken = (req,res,next)=>{

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){

        return res.status(401).json({
            message:"Authorization token required"
        });

    }

    const token = authHeader.split(" ")[1];

    try{

        const decoded =
            jwt.verify(token,process.env.JWT_SECRET);

        req.user = decoded;

        next();

    }
    catch(error){

        return res.status(401).json({
            message:"Invalid token"
        });

    }

};

const authorizeRole = (...roles)=>(req,res,next)=>{

    if(!req.user || !roles.includes(req.user.role)){

        return res.status(403).json({
            message:"Access denied"
        });

    }

    next();

};

module.exports = {
    verifyToken,
    authorizeRole
};
