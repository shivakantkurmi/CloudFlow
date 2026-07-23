import * as taskService from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });
export const create = asyncHandler(async (req, res) => respond(res, 201, await taskService.createTask(req.params.projectId, req.body, req.auth), 'Task created.'));
export const list = asyncHandler(async (req, res) => respond(res, 200, await taskService.listTasks(req.params.projectId, { status: req.query.status, assigneeId: req.query.assigneeId }, req.auth), 'Tasks retrieved.'));
export const getById = asyncHandler(async (req, res) => respond(res, 200, await taskService.getTaskById(req.params.projectId, req.params.id, req.auth), 'Task retrieved.'));
export const update = asyncHandler(async (req, res) => respond(res, 200, await taskService.updateTask(req.params.projectId, req.params.id, req.body, req.auth), 'Task updated.'));
export const remove = asyncHandler(async (req, res) => { await taskService.deleteTask(req.params.projectId, req.params.id, req.auth); respond(res, 200, null, 'Task deleted.'); });
export const move = asyncHandler(async (req, res) => respond(res, 200, await taskService.moveTask(req.params.projectId, req.params.id, req.body, req.auth), 'Task position updated.'));
