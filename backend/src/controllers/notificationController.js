import * as notificationService from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });

export const listNotifications = asyncHandler(async (req, res) => {
  respond(res, 200, await notificationService.listNotifications(req.auth), 'Notifications retrieved.');
});

export const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.auth);
  respond(res, 200, null, 'Notification marked as read.');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.auth);
  respond(res, 200, null, 'All notifications marked as read.');
});
