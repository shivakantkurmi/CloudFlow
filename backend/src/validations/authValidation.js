import { body } from 'express-validator';

const password = body('password')
  .isString()
  .isLength({ min: 8, max: 72 })
  .withMessage('Password must be between 8 and 72 characters.')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter.')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter.')
  .matches(/\d/)
  .withMessage('Password must include a number.');

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 }),
  password,
];

export const loginValidation = [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()];

export const refreshValidation = [body('refreshToken').isString().notEmpty()];
