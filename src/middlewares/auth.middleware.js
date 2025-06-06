const jwt = require("jsonwebtoken")
const User = require('../models/userModel/user.model.js')
const CustomError = require('../utils/customError.js')
const cacheClient = require('../services/cache.services.js')

const authMiddleware = async(req, res, next) => {
    const {token} = req.cookies
    
    try {
        if(!token) return next(new CustomError("Unauthorized user!", 401))

            const isBlacklistedToken = await cacheClient.get(token)
            if(isBlacklistedToken) {
                return res.status(401).json({
                    message: "token blacklisted"
                })    
            }
        const decode = jwt.verify(token, process.env.JWT_SECRET) 
        console.log("decoded---->", decode)
        
        const user = await User.findById(decode.id)
        if(!user){
            return next(new CustomError("user not found", 401))
        }
        req.user = user
        next()
    } catch (error) {
        next(new CustomError(error.message, 500))
    }
}

module.exports = authMiddleware