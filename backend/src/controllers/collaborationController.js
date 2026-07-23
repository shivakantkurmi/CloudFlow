import fs from 'node:fs/promises';
import * as collaborationService from '../services/collaborationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, status, data, message) => res.status(status).json({ success: true, data, message });
export const listComments = asyncHandler(async (req, res) => respond(res, 200, await collaborationService.listComments(req.params.taskId, req.auth), 'Comments retrieved.'));
export const addComment = asyncHandler(async (req, res) => respond(res, 201, await collaborationService.addComment(req.params.taskId, req.body.content, req.auth), 'Comment added.'));
export const deleteComment = asyncHandler(async (req, res) => { await collaborationService.deleteComment(req.params.taskId, req.params.id, req.auth); respond(res, 200, null, 'Comment deleted.'); });
export const listAttachments = asyncHandler(async (req, res) => respond(res, 200, await collaborationService.listAttachments(req.params.taskId, req.auth), 'Attachments retrieved.'));
export const uploadAttachment = asyncHandler(async (req, res) => respond(res, 201, await collaborationService.createAttachment(req.params.taskId, req.file, req.auth), 'Attachment uploaded.'));
export const deleteAttachment = asyncHandler(async (req, res) => { await collaborationService.deleteAttachment(req.params.taskId, req.params.id, req.auth); respond(res, 200, null, 'Attachment deleted.'); });
export const downloadAttachment = asyncHandler(async (req, res) => { const { attachment, absolutePath } = await collaborationService.getAttachmentForDownload(req.params.taskId, req.params.id, req.auth); await fs.access(absolutePath); res.type(attachment.mimeType).download(absolutePath, attachment.fileName); });
