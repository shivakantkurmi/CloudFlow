import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMsg = result.array()[0]?.msg || 'Request validation failed.';
    return next(new AppError(errorMsg, 422, 'VALIDATION_ERROR'));
  }
  return next();
};
