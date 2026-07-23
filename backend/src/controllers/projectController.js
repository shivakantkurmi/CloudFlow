import * as projectService from '../services/projectService.js';
import * as activityService from '../services/activityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });
export const create = asyncHandler(async (req, res) => respond(res, 201, await projectService.createProject(req.body, req.auth), 'Project created.'));
export const list = asyncHandler(async (req, res) => respond(res, 200, await projectService.listProjects(req.auth, req.query.limit), 'Projects retrieved.'));
export const getById = asyncHandler(async (req, res) => respond(res, 200, await projectService.getProject(req.params.id, req.auth), 'Project retrieved.'));
export const update = asyncHandler(async (req, res) => respond(res, 200, await projectService.updateProject(req.params.id, req.body, req.auth), 'Project updated.'));
export const remove = asyncHandler(async (req, res) => { await projectService.deleteProject(req.params.id, req.auth); respond(res, 200, null, 'Project deleted.'); });
export const listMembers = asyncHandler(async (req, res) => respond(res, 200, await projectService.listMembers(req.params.id, req.auth), 'Project members retrieved.'));
export const addMember = asyncHandler(async (req, res) => respond(res, 201, await projectService.addMember(req.params.id, req.body, req.auth), 'Project member added.'));
export const removeMember = asyncHandler(async (req, res) => { await projectService.removeMember(req.params.id, req.params.userId, req.auth); respond(res, 200, null, 'Project member removed.'); });
export const listActivities = asyncHandler(async (req, res) => respond(res, 200, await activityService.listProjectActivities(req.params.id, req.auth), 'Activities retrieved.'));
