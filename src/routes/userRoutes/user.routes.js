const express = require('express')
const router = express.Router()
const userControllers = require('../../controllers/userControllers/user.controllers.js')
const authMiddleware = require('../../middlewares/auth.middleware.js')


router.post('/register', userControllers.registerViewController)
router.post('/login', userControllers.loginViewController)
router.post('/logout', userControllers.logoutController)

router.get(
    "/current-user",
    authMiddleware, 
    userControllers.currentUserController
)


module.exports = router