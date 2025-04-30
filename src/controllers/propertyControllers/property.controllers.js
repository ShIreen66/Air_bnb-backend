const Property = require('../../models/propertyModel/property.model.js')
const CustomError = require('../../utils/customError.js')

module.exports.propertyCreateController = async (req, res, next) => {
    try {
        const { title, description, price, location, amenities, images } = req.body

        if (
            !title && 
            !description && 
            !price && 
            !location &&
            !amenities &&
            !images) {
                return next(new CustomError("All fields is required", 400))
            }

        const newProperty = await Property.create({
            title, 
            description, 
            price, 
            location, 
            amenities, 
            images,
            host: req.user._id,
        })

        if(!newProperty) 
            return next(new CustomError("error in creating property", 400))

        res.status(201).json({
            message: "Property created successfully", data: newProperty
        })
    } catch (error) {
        next(new CustomError(error.message, 500))
    }
}

module.exports.deletePropertyController = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      if (!id) return next(new CustomError("property id is required", 400));
  
      const deletedProperty = await Property.findByIdAndDelete(id);
      if (!deletedProperty)
        return next(new CustomError("Error in deletion property", 400));
  
      res.status(200).json({ message: "Property deleted successfulyy" });
    } catch (error) {
      next(new CustomError(error.message, 500));
    }
};
module.exports.updatePropertyController = async (req, res, next) => {
    try {
        const {id} = req.params

        if(!id) return next(new CustomError("property id is required", 400))

        const updatedProperty = await Property.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        })
        if(!updatedProperty) return next(new CustomError("Error in updating property", 400))

            res.status(200).json({
                message: "Property updated successfully",
                data: updatedProperty
            })
    } catch (error) {
        next(new CustomError(error.message, 500))   
    }
}

module.exports.viewPropertyController = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) return next(new CustomError("property id is required", 400));
  
      const propertyDetails = await Property.findById(id);
      if (!propertyDetails)
        return next(new CustomError("Error in fetching property data", 400));
  
      res.status(200).json({
        message: "Property fetched successfully",
        data: propertyDetails,
      });
    } catch (error) {
        next(new CustomError(error.message, 500))
    }
};
  
module.exports.searchPropertyController = async (req, res, next) => {
    try {
        const {location, minPrice, maxPrice} = req.body

        const query = {
            ...(location && {location: { $regex: "location", $options: "i"}}),
            ...(minPrice && {price: { $gte: minPrice}}),
            ...(maxPrice && {price: { $gte: maxPrice}}),
        }

    const property = await Property.find(query)

    if (!property) {
        return next(new CustomError("Property not found", 400))
    }

    res.status(200).json({
        message: "Properties fetched",
        data: property,
      });
    } catch (error) {
        next(new CustomError(error.message, 500))
    }
}