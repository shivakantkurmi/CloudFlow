import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.auth);
  res.status(200).json({ success: true, data: stats, message: 'Dashboard stats retrieved.' });
});
