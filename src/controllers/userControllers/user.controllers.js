const userModel = require('../../models/userModel/user.model.js')
const User = require("../../models/userModel/user.model.js")
const CustomError = require('../../utils/customError.js')
const cacheClient = require("../../services/cache.services.js")

module.exports.registerViewController = async (req, res, next) => {
  const { userName, email, mobile, address, password } = req.body;

    try {
        const existingUser = await User.findOne({email})
    if(existingUser) return next(new CustomError("user already exist", 409))

  const user = await User.create({
    userName,
    email,
    mobile,
    address,
    password,
  });

  const token = await user.generateAuthToken()
  console.log("token inside controller---->", token)

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none"
  })

  res.status(201).json({
    message: "user created successfully", 
    token: token
  })
    } catch (error) {
       next(new CustomError(error.message, 500)) 
    }
};


module.exports.loginViewController = async(req, res, next) => {
  const {email, password} = req.body
  console.log(req.body)

  try {
    const user = await User.authenticateUser(email, password)
    console.log(user)
    
    const token = await user.generateAuthToken()
    console.log("this way token", token)

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
    })
    res.status(200).json({message: "User Logged in ", token: token})
  } catch (error) {
    next(new CustomError(error.message, 500))
  }
}

module.exports.logoutController = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) return next(new CustomError("User unauthorized", 401));

    const blacklistToken = await cacheClient.set(
      token,
      "blacklisted",
      "EX",
      3600
    );

    res.clearCookie("token");
    res.status(200).json({ message: "user logged out" });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports.currentUserController = async(req, res, next) => {
  try {
    const user = req.user
    res.status(200).json({
      message: "authentication successful", user: user
    })
  } catch (error) {
    
  }
}