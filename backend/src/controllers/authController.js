import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });

export const register = asyncHandler(async (req, res) => respond(res, 201, await authService.register(req.body), 'Account created.'));
export const login = asyncHandler(async (req, res) => respond(res, 200, await authService.login(req.body), 'Login successful.'));
export const refresh = asyncHandler(async (req, res) => respond(res, 200, await authService.refresh(req.body.refreshToken), 'Token refreshed.'));
export const logout = asyncHandler(async (req, res) => { await authService.logout(req.body.refreshToken); respond(res, 200, null, 'Logged out successfully.'); });
export const me = asyncHandler(async (req, res) => respond(res, 200, await authService.getCurrentUser(req.auth.sub), 'Current user retrieved.'));
