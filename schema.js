const Joi = require('joi');

const listingSchema = Joi.object({
    title: Joi.string().required(),
    description : Joi.string().required(),
    location : Joi.string().required(),
    country : Joi.string().required(),
    price : Joi.number().required().min(0),
    image : Joi.number().allow("", null),
})

module.exports = listingSchema;