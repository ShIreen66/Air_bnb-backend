const Booking = require("../../models/bookingModels/booking.model.js");
const User = require('../../models/userModel/user.model.js')
const CustomError = require("../../utils/customError.js");
const paymentInstance = require("../../services/payment.services.js");
const { sendMail } = require("../../utils/email.js");
const { bookingConfirmationTemplate } = require("../../utils/emailTemplet.js");

// property lagaya
const Property = require("../../models/propertyModel/property.model.js");

module.exports.processPaymentController = async (req, res, next) => {
  try {
    const { property, checkin_date, checkout_date } = req.body;

    const options = {
      amount: property.price * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    // sabse pehle order create hoga
    const razorpayOrder = await paymentInstance.orders.create(options)
    if(!razorpayOrder) {return next(new CustomError("Error in creating Razorpay order", 400))}

    // fr booking ko save karenge razorpay order id ke sath bcz order id generate karni padegi
    const booking = new Booking({
        user: req.user._id,
        property: property._id,
        checkin_date,
        checkout_date,
        razorpayOrderId: razorpayOrder.id
    })

    await booking.save()

    // ab booking confirmation ke liye mail bookingTemplate

    const bookingTemplate = bookingConfirmationTemplate(
        req.user.userName, 
        property.location,
        checkin_date,
        checkout_date
    )

    // send confirmation mail

    await sendMail(
        process.env.FROM_MAIL,
        "Booking Confirmed",
        bookingTemplate
    )

    // send response
    res.status(200).json({
        success: true,
        message: "Booking confirmed and email sent",
        data: razorpayOrder
    })
  } catch (error) {
    next(new CustomError(error.message, 500))
  }
};

