import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';

export const authenticate = (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication is required.', 401, 'UNAUTHORIZED'));
  }

  try {
    req.auth = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError('Your access token is invalid or expired.', 401, 'UNAUTHORIZED'));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.auth.role)) {
    return next(new AppError('You do not have permission for this action.', 403, 'FORBIDDEN'));
  }
  return next();
};
