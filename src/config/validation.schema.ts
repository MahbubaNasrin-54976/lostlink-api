import Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
JWT_EXPIRES_IN: Joi.string().default('1d'),
PRIVATE_ATTRIBUTE_SECRET: Joi.string().length(64).required(),
MAIL_HOST: Joi.string().optional(),
MAIL_PORT: Joi.number().default(587),
MAIL_USER: Joi.string().optional(),
MAIL_PASSWORD: Joi.string().optional(),
MAIL_FROM: Joi.string().optional(),
});
