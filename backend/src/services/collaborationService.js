import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma.js';
import { emitToProject } from '../sockets/socketServer.js';
import { eventBus } from '../events/eventBus.js';
import { AppError } from '../utils/AppError.js';
import { uploadPath } from '../middleware/uploadMiddleware.js';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatar: true };
const isSystemAdmin = (actor) => actor.role === 'ADMIN';
const isManager = (membership) => membership?.role === 'PROJECT_MANAGER';

const requireTaskMembership = async (taskId, actor) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      project: { select: { organizationId: true, status: true } }
    }
  });
  if (!task || task.project.status === 'DELETED') {
    throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
  }
  
  if (isSystemAdmin(actor)) {
    return { task, membership: { role: 'PROJECT_MANAGER' } };
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: actor.sub } }
  });
  if (membership) return { task, membership };

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: task.project.organizationId,
        userId: actor.sub
      }
    }
  });
  if (orgMember && ['OWNER', 'ADMIN'].includes(orgMember.role)) {
    return { task, membership: { role: 'PROJECT_MANAGER' } };
  }

  throw new AppError('Project membership is required.', 403, 'FORBIDDEN');
};

export const listComments = async (taskId, actor) => {
  await requireTaskMembership(taskId, actor);
  return prisma.taskComment.findMany({ where: { taskId }, include: { author: { select: userSelect } }, orderBy: { createdAt: 'asc' } });
};

export const addComment = async (taskId, content, actor) => {
  const { task } = await requireTaskMembership(taskId, actor);
  const comment = await prisma.taskComment.create({ data: { taskId, authorId: actor.sub, content }, include: { author: { select: userSelect } } });
  emitToProject(task.projectId, 'comment:added', { ...comment, projectId: task.projectId });
  eventBus.emit('comment:added', { comment, task, actor });
  return comment;
};

export const deleteComment = async (taskId, commentId, actor) => {
  const { task, membership } = await requireTaskMembership(taskId, actor);
  const comment = await prisma.taskComment.findFirst({ where: { id: commentId, taskId } });
  if (!comment) throw new AppError('Comment not found.', 404, 'COMMENT_NOT_FOUND');
  if (!isSystemAdmin(actor) && !isManager(membership) && comment.authorId !== actor.sub) throw new AppError('You do not have permission to delete this comment.', 403, 'FORBIDDEN');
  await prisma.taskComment.delete({ where: { id: commentId } });
  emitToProject(task.projectId, 'comment:deleted', { id: commentId, taskId, projectId: task.projectId });
};

export const listAttachments = async (taskId, actor) => {
  await requireTaskMembership(taskId, actor);
  return prisma.taskAttachment.findMany({ where: { taskId }, include: { uploadedBy: { select: userSelect } }, orderBy: { uploadedAt: 'desc' } });
};

export const createAttachment = async (taskId, file, actor) => {
  const { task } = await requireTaskMembership(taskId, actor);
  if (!file) throw new AppError('A file is required.', 422, 'VALIDATION_ERROR');
  const relativePath = path.posix.join(task.projectId, taskId, file.filename);
  try {
    const attachment = await prisma.taskAttachment.create({ data: { taskId, uploadedById: actor.sub, fileName: path.basename(file.originalname), filePath: relativePath, fileSize: file.size, mimeType: file.mimetype }, include: { uploadedBy: { select: userSelect } } });
    emitToProject(task.projectId, 'attachment:added', { ...attachment, projectId: task.projectId });
    return attachment;
  } catch (error) {
    await fs.unlink(file.path).catch(() => undefined);
    throw error;
  }
};

const getAttachment = async (taskId, attachmentId, actor) => {
  const { task, membership } = await requireTaskMembership(taskId, actor);
  const attachment = await prisma.taskAttachment.findFirst({ where: { id: attachmentId, taskId }, include: { uploadedBy: { select: userSelect } } });
  if (!attachment) throw new AppError('Attachment not found.', 404, 'ATTACHMENT_NOT_FOUND');
  return { task, membership, attachment };
};

export const deleteAttachment = async (taskId, attachmentId, actor) => {
  const { task, membership, attachment } = await getAttachment(taskId, attachmentId, actor);
  if (!isSystemAdmin(actor) && !isManager(membership) && attachment.uploadedById !== actor.sub) throw new AppError('You do not have permission to delete this attachment.', 403, 'FORBIDDEN');
  await prisma.taskAttachment.delete({ where: { id: attachmentId } });
  await fs.unlink(uploadPath(attachment.filePath)).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  emitToProject(task.projectId, 'attachment:deleted', { id: attachmentId, taskId, projectId: task.projectId });
};

export const getAttachmentForDownload = async (taskId, attachmentId, actor) => {
  const { attachment } = await getAttachment(taskId, attachmentId, actor);
  return { attachment, absolutePath: uploadPath(attachment.filePath) };
};
