// const mongoose = require('mongoose')
// const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken')

// const userSchema = new mongoose.Schema({
//     userName: {
//         type: String,
//         required: true
//     },
//     email :{
//         type: String,
//         required: true,
//     },
//     mobile: {
//         type: Number,
//         maxLength: 10,
//     },
//     address: {
//         type:String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true
//     }
// })

// userSchema.pre('save', async function (next) {
//     if(this.isModified("password") ) {
//         this.password = await bcrypt.hash(this.password, 10)
//     }
//     console.log("isModified------>", this.isModified("password"))
//     next()
// })

// userSchema.methods.generateAuthToken = async function() {
//     const token = jwt.sign({id: this._id}, process.env.JWT_SECRET,{
//         expiresIn: "1h"
//     })

//     console.log("token------>", token)

//     if(!token) throw new Error("error generating token")
//         return token
// }


// userSchema.statics.authenticateUser = async function(email, password) {
//     const user = await this.findOne({email})
//     console.log("obj user ------->", user)
//     if(!user) throw new Error("User is not found")

//     const isMatch = await bcrypt.compare(password, user.password)
//     console.log("agar password sahi hai to", isMatch)

//     return user
// }
// const userModel = new mongoose.model("User", userSchema)

// module.exports = userModel

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        maxLength: 10,
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
})

// Password hashing before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    console.log("Password modified:", this.isModified('password'))
    next()
})

// Generate JWT Token
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    })

    console.log("Generated Token:", token)

    if (!token) throw new Error('Error generating token')
    return token
}

// Authenticate user
userSchema.statics.authenticateUser = async function (email, password) {
    const user = await this.findOne({ email })
    console.log("Found User:", user)

    if (!user) throw new Error('User is not found')

    const isMatch = await bcrypt.compare(password, user.password)
    console.log("Password Match:", isMatch)

    if (!isMatch) throw new Error('Password is incorrect')

    return user
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
