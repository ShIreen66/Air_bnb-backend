const express = require('express')
const userRoutes = require('./routes/userRoutes/user.routes.js')
const cookieParser = require('cookie-parser')
const morgan = require("morgan")
const errorHandler = require('./middlewares/errorHandler.js')
const propertyRoutes = require('./routes/propertyRoutes/property.routes.js')
const bookingRoutes = require("./routes/bookingRoutes/booking.routes.js")
const paymentRoutes = require('./routes/paymentRoutes/payment.routes.js')


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan("tiny"))


app.use('/auth/api', userRoutes)
app.use('/auth/property', propertyRoutes)
app.use('/auth/booking', bookingRoutes)
app.use('/auth/payment', paymentRoutes)

app.get('/', (req, res) => {
    res.send("Hello from Server")
})

app.use(errorHandler)

module.exports = app