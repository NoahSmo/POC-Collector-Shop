import Joi from 'joi';

export const createListingSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(1000).required(),
  price: Joi.number().positive().required(),
  condition: Joi.string().valid('MINT', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR').required(),
  images: Joi.array().items(Joi.string().uri()).min(3).required()
});
