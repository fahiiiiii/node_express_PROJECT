const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    const authheaders = req.headers.authorization;
    if(!authheaders){
        res.status(401).json({Message:"Unauthorized"});
        return;
    }
    const token = authheaders && authheaders.split(' ')[1];
    if(!token){
        res.status(401).json({Message:"Unauthorized"});
        return;
    }else{
         jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
            if(err){
        res.status(401).json({Message:"Unauthorized"});

            }else{
                req.userPayload = payload;
                next();
            }
        })
    }
}