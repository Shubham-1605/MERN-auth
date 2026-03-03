import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: 'not authorized, Login again'});
    }


    try{
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecoded.id){
            // ensure req.body exists (some requests may not have a body/parser for the content-type)
            if (!req.body) req.body = {};
            req.body.userId = tokenDecoded.id;
            // also attach to req.userId for safer access elsewhere
            req.userId = tokenDecoded.id;
        }else{
            return res.json({success: false, message: 'Not Authorized, Login Again'});
        }

        next();
    }catch(error){
        res.json({success: false, message: error.message});
    }
}

export default userAuth;