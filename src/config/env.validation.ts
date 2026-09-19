/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Joi from 'joi';

export function validate(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production')
      .default('development'),

    PORT: Joi.number().default(8000),

    JWT_SECRET: Joi.string().required(),

    LOCAL_FRONTEND_URL: Joi.string().required(),

    FRONTEND_URL: Joi.string().required(),

    ENABLE_SWAGGER: Joi.boolean().default(false),

    RESEND_API_KEY: Joi.string().required(),

    DATABASE_HOST: Joi.string().required(),

    DATABASE_PORT: Joi.number().required(),

    DATABASE_USERNAME: Joi.string().required(),

    DATABASE_PASSWORD: Joi.string().required(),

    DATABASE_NAME: Joi.string().required(),
  });

  const { error, value } = schema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return value;
}
