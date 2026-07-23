import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { emitToProject } from '../sockets/socketServer.js';
import { eventBus } from '../events/eventBus.js';

const userSelect = { id: true, email: true, firstName: true, lastName: true, avatar: true };
const taskInclude = { assignee: { select: userSelect }, createdBy: { select: userSelect }, labels: true };
const isSystemAdmin = (actor) => actor.role === 'ADMIN';
const isProjectManager = (membership) => membership?.role === 'ADMIN' || membership?.role === 'LEAD';

const requireProjectMembership = async (projectId, actor) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, status: { not: 'DELETED' } }, select: { id: true, ownerId: true } });
  if (!project) throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
  if (isSystemAdmin(actor) || project.ownerId === actor.sub) return { project, membership: { role: 'ADMIN' } };
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: actor.sub } } });
  if (!membership) throw new AppError('Project membership is required.', 403, 'FORBIDDEN');
  return { project, membership };
};

const verifyAssignee = async (projectId, assigneeId) => {
  if (!assigneeId) return null;
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: assigneeId } } });
  if (!membership) throw new AppError('Assignee must be a member of this project.', 422, 'INVALID_ASSIGNEE');
  return assigneeId;
};

const labelData = (labels) => labels?.map(({ label, color = '#64748B' }) => ({ label: label.trim(), color }));
const extractTaskData = ({ title, description, assigneeId, status, priority, dueDate }) => ({ title, description, assigneeId, status, priority, dueDate });
const removeUndefined = (data) => Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

const getTask = async (projectId, id) => {
  const task = await prisma.task.findFirst({ where: { id, projectId }, include: taskInclude });
  if (!task) throw new AppError('Task not found.', 404, 'TASK_NOT_FOUND');
  return task;
};

const assertTaskManager = (task, actor, membership) => {
  if (isSystemAdmin(actor) || isProjectManager(membership) || task.createdById === actor.sub) return;
  throw new AppError('You do not have permission to modify this task.', 403, 'FORBIDDEN');
};

export const createTask = async (projectId, input, actor) => {
  await requireProjectMembership(projectId, actor);
  const assigneeId = await verifyAssignee(projectId, input.assigneeId);
  const lastTask = await prisma.task.findFirst({ where: { projectId, status: input.status ?? 'TODO' }, orderBy: { position: 'desc' }, select: { position: true } });
  const task = await prisma.task.create({
    data: { ...removeUndefined(extractTaskData({ ...input, assigneeId })), projectId, createdById: actor.sub, position: (lastTask?.position ?? -1) + 1, ...(input.labels ? { labels: { create: labelData(input.labels) } } : {}) },
    include: taskInclude,
  });
  emitToProject(projectId, 'task:created', task);
  eventBus.emit('task:created', { task, actor });
  return task;
};

export const listTasks = async (projectId, filters, actor) => {
  await requireProjectMembership(projectId, actor);
  return prisma.task.findMany({ where: { projectId, ...removeUndefined(filters) }, include: taskInclude, orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }] });
};

export const getTaskById = async (projectId, id, actor) => {
  await requireProjectMembership(projectId, actor);
  return getTask(projectId, id);
};

export const updateTask = async (projectId, id, input, actor) => {
  const { membership } = await requireProjectMembership(projectId, actor);
  const task = await getTask(projectId, id);
  assertTaskManager(task, actor, membership);
  const assigneeId = input.assigneeId === undefined ? undefined : await verifyAssignee(projectId, input.assigneeId);
  const data = removeUndefined(extractTaskData({ ...input, assigneeId }));
  if (input.labels !== undefined) data.labels = { deleteMany: {}, create: labelData(input.labels) };
  const updatedTask = await prisma.task.update({ where: { id }, data, include: taskInclude });
  emitToProject(projectId, 'task:updated', updatedTask);
  eventBus.emit('task:updated', { oldTask: task, newTask: updatedTask, actor });
  return updatedTask;
};

export const deleteTask = async (projectId, id, actor) => {
  const { membership } = await requireProjectMembership(projectId, actor);
  const task = await getTask(projectId, id);
  assertTaskManager(task, actor, membership);
  await prisma.task.delete({ where: { id } });
  emitToProject(projectId, 'task:deleted', { id, projectId });
  eventBus.emit('task:deleted', { task, actor });
};

export const moveTask = async (projectId, id, { status, position }, actor) => {
  const { membership } = await requireProjectMembership(projectId, actor);
  const task = await getTask(projectId, id);
  assertTaskManager(task, actor, membership);
  const updatedTask = await prisma.task.update({ where: { id }, data: { status, position }, include: taskInclude });
  emitToProject(projectId, 'task:updated', updatedTask);
  eventBus.emit('task:updated', { oldTask: task, newTask: updatedTask, actor });
  return updatedTask;
};
