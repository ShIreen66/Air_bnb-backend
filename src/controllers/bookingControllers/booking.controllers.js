// const Booking = require('../../models/bookingModels/booking.model.js')
// const Property = require('../../models/propertyModel/property.model.js')
// const paymentInstance = require('../../services/payment.services.js')
// const CustomError = require('../../utils/customError.js')

// module.exports.createBookingController = async (req, res, next) => {
//     try {
//         const { property_id, checkin_date, checkout_date, totalPrice } = req.body

//         const property = await Property.findById(property_id)
//         if(!property) return next(new CustomError("property not found", 400))

//         if(!property_id && !checkin_date && !checkout_date && !totalPrice)
//             return next(new CustomError("All fields are required", 400))

//         const booking = await Booking.create({
//             property: property_id,
//             user_id: req.user._id,
//             checkin_date,
//             checkout_date,
//             totalPrice,
//             status: "Pending"
//         })

//         const options = {
//             amount: totalPrice * 100,
//             currency: "INR",
//             receipt: `receipt ${booking._id}`,
//             payment_capture: 1
//         } 

//         const razorpayOrder = await paymentInstance.orders.create(options)

//         booking.razorpayOrderId = razorpayOrder.id
//         await booking.save()


//         res.status(200).json({
//             success: true,
//             data: booking,
//             amount: totalPrice
//         })
//     } catch (error) {
//         next(new CustomError(error.message, 500))
//     }
// }



const mongoose = require('mongoose'); // Import mongoose
const Booking = require('../../models/bookingModels/booking.model.js');
const Property = require('../../models/propertyModel/property.model.js');
const paymentInstance = require('../../services/payment.services.js');
const CustomError = require('../../utils/customError.js');

module.exports.createBookingController = async (req, res, next) => {
    try {
        const { property_id, checkin_date, checkout_date, totalPrice } = req.body;

        // Check for required fields
        if (!property_id || !checkin_date || !checkout_date || !totalPrice) {
            return next(new CustomError("All fields are required", 400));
        }

        // Check if property_id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(property_id)) {
            return next(new CustomError("Invalid Property ID", 400)); // Or 404, depending on desired behavior
        }
      
        const property = await Property.findById(property_id);
        if (!property) {
            return next(new CustomError("Property not found", 404)); // Changed to 404
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

        res.status(200).json({
            success: true,
            data: booking,
            amount: totalPrice
        });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};
