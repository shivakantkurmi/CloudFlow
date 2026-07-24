import { prisma } from '../config/prisma.js';
import { eventBus } from '../events/eventBus.js';
import { AppError } from '../utils/AppError.js';

export const listProjectActivities = async (projectId, actor) => {
  // Check membership
  const project = await prisma.project.findFirst({
    where: { id: projectId, status: { not: 'DELETED' } },
    select: { id: true, organizationId: true }
  });
  if (!project) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  
  if (actor.role !== 'ADMIN') {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: actor.sub } }
    });
    
    if (!member) {
      const orgMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: project.organizationId,
            userId: actor.sub
          }
        }
      });
      if (!orgMember || !['OWNER', 'ADMIN'].includes(orgMember.role)) {
        throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }
    }
  }

  return prisma.activityLog.findMany({
    where: { projectId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

const createActivity = async ({ projectId, userId, action, entityType, entityId, oldValues, newValues }) => {
  try {
    await prisma.activityLog.create({
      data: { projectId, userId, action, entityType, entityId, oldValues, newValues }
    });
  } catch (error) {
    console.error('Failed to create activity log', error);
  }
};

// Listeners
eventBus.on('task:created', ({ task, actor }) => {
  createActivity({ projectId: task.projectId, userId: actor.sub, action: 'CREATED', entityType: 'task', entityId: task.id, newValues: { title: task.title } });
});

eventBus.on('task:updated', ({ oldTask, newTask, actor }) => {
  const oldValues = {};
  const newValues = {};
  let changed = false;
  
  if (oldTask.status !== newTask.status) { oldValues.status = oldTask.status; newValues.status = newTask.status; changed = true; }
  if (oldTask.title !== newTask.title) { oldValues.title = oldTask.title; newValues.title = newTask.title; changed = true; }
  if (oldTask.assigneeId !== newTask.assigneeId) { oldValues.assigneeId = oldTask.assigneeId; newValues.assigneeId = newTask.assigneeId; changed = true; }
  
  if (changed) {
    createActivity({ projectId: newTask.projectId, userId: actor.sub, action: 'UPDATED', entityType: 'task', entityId: newTask.id, oldValues, newValues });
  }
});

eventBus.on('task:deleted', ({ task, actor }) => {
  createActivity({ projectId: task.projectId, userId: actor.sub, action: 'DELETED', entityType: 'task', entityId: task.id, oldValues: { title: task.title } });
});

eventBus.on('comment:added', ({ comment, task, actor }) => {
  createActivity({ projectId: task.projectId, userId: actor.sub, action: 'COMMENTED', entityType: 'task', entityId: task.id, newValues: { commentId: comment.id } });
});

eventBus.on('member:added', ({ projectId, userId, role, actor }) => {
  createActivity({ projectId, userId: actor.sub, action: 'INVITED', entityType: 'member', entityId: userId, newValues: { role } });
});

eventBus.on('member:removed', ({ projectId, userId, actor }) => {
  createActivity({ projectId, userId: actor.sub, action: 'LEFT', entityType: 'member', entityId: userId });
});
