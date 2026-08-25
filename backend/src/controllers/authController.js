import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' };
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  respond(res, 201, user, 'Account created.');
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  respond(res, 200, user, 'Login successful.');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token is required.', 401, 'UNAUTHORIZED');
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setAuthCookies(res, accessToken, refreshToken);
  respond(res, 200, user, 'Token refreshed.');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  respond(res, 200, null, 'Logged out successfully.');
});

export const me = asyncHandler(async (req, res) => respond(res, 200, await authService.getCurrentUser(req.auth.sub), 'Current user retrieved.'));
