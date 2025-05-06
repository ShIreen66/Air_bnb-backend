const Booking = require("../../models/bookingModels/booking.model.js");
const User = require("../../models/userModel/user.model.js");
const CustomError = require("../../utils/customError.js");
const paymentInstance = require("../../services/payment.services.js");
const { sendMail } = require("../../utils/email.js");
const { bookingConfirmationTemplate, paymentConfirmationTemplate } = require("../../utils/emailTemplet.js");
const crypto = require("crypto");

// property lagaya
const Property = require("../../models/propertyModel/property.model.js");

module.exports.processPaymentController = async (req, res, next) => {
  try {
    const { property, checkin_date, checkout_date } = req.body;

    const options = {
      amount: property.price * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // sabse pehle order create hoga
    const razorpayOrder = await paymentInstance.orders.create(options);
    if (!razorpayOrder) {
      return next(new CustomError("Error in creating Razorpay order", 400));
    }

    // fr booking ko save karenge razorpay order id ke sath bcz order id generate karni padegi
    const booking = new Booking({
      user: req.user._id,
      property: property._id,
      checkin_date,
      checkout_date,
      razorpayOrderId: razorpayOrder.id,
    });

    await booking.save();

    // ab booking confirmation ke liye mail bookingTemplate

    const bookingTemplate = bookingConfirmationTemplate(
      req.user.userName,
      property.location,
      checkin_date,
      checkout_date
    );

    // send confirmation mail

    await sendMail(process.env.FROM_MAIL, "Booking Confirmed", bookingTemplate);

    // send response
    res.status(200).json({
      success: true,
      message: "Booking confirmed and email sent",
      data: razorpayOrder,
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports.verifyPaymentController = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return next(new CustomError("razorpay order details required", 400));

    const booking = await Booking.findOne({
      razorpayOrderId: razorpay_order_id,
    })
      .populate("user_id", "userName email")
      .populate("property", "location");

    if (!booking) {
      return next(new CustomError("booking not found", 404));
    }

    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id} | ${razorpay_payment_id}`)
      .digest("hex");

    if (generateSignature !== razorpay_signature)
      return next(
        new CustomError("verification failed, payment declined", 400)
      );

      booking.status = "Completed"
      booking.paymentDetails = {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        signature: razorpay_signature,
      }

      await booking.save()

      const emailTemplate = paymentConfirmationTemplate(
        req.user.userName,
        booking.property.location,
        booking.status,
        booking.totalPrice
      )

      await sendMail(
        process.env.FROM_MAIL,
        "Booking and Payment completed",
        emailTemplate
      )

      res.status(200).json({
        success: true,
        message: "Booking and payment completed", 
        data: booking,
      })
  } catch (error) {
    next(new CustomError(error.message, 500))
  }
};
