import * as Joi from 'joi';

/**
 * Application configuration factory.
 * Loaded by ConfigModule.forRoot() and accessible via ConfigService.
 */
export const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});

/**
 * Environment validation schema.
 * Application will fail fast if required variables are missing.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('debug'),
});
