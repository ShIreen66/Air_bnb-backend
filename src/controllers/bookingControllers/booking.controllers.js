const mongoose = require('mongoose')
const Booking = require('../../models/bookingModels/booking.model.js');
const Property = require('../../models/propertyModel/property.model.js');
const paymentInstance = require('../../services/payment.services.js');
const CustomError = require('../../utils/customError.js');
const { sendMail } = require('../../utils/email.js')
const { bookingConfirmationTemplate } = require('../../utils/emailTemplet.js')

module.exports.createBookingController = async (req, res, next) => {
    try {
        const { property_id, checkin_date, checkout_date, totalPrice } = req.body;


        if (!property_id && !checkin_date && !checkout_date && !totalPrice) {
            return next(new CustomError("All fields are required", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(property_id)) {
            return next(new CustomError("Invalid Property ID", 400)); 
        }
      
        const property = await Property.findById(property_id);
        if (!property) {
            return next(new CustomError("Property not found", 404)); 
        }

        const booking = await Booking.create({
            property: property_id,
            user_id: req.user._id,
            checkin_date,
            checkout_date,
            totalPrice,
            status: "Pending"
        });

        const options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: `receipt ${booking._id}`,
            payment_capture: 1
        };

        const razorpayOrder = await paymentInstance.orders.create(options);

        booking.razorpayOrderId = razorpayOrder.id;
        await booking.save();

        const bookingTemplate = bookingConfirmationTemplate(
            req.user.userName,
            property.location,
            checkin_date,
            checkout_date
        )

        await sendMail("0606shiree@gmail.com",
            "Booking confirmed",
            bookingTemplate
        )
        res.status(200).json({
            success: true,
            data: booking,
            amount: totalPrice
        });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};


module.exports.viewBookingController = async (req, res, next) => {
    const { userId } = req.params;

    try {
        if(!userId) return next(new CustomError("User not found", 404))

        const bookings = await Booking.findOne({ user_id: userId }).populate(
            "user_id",
            "userName email"
        )

        if(!bookings) return next(new CustomError("Bookings details nor found", 404))

            res.status(200).json({
                message: "Bookings details",
                data: bookings,
            })
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
}