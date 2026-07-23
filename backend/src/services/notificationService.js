import { prisma } from '../config/prisma.js';
import { eventBus } from '../events/eventBus.js';
import { emitToUser } from '../sockets/socketServer.js';

export const listNotifications = async (actor) => {
  return prisma.notification.findMany({
    where: { userId: actor.sub },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

export const markAsRead = async (notificationId, actor) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId: actor.sub },
    data: { read: true }
  });
};

export const markAllAsRead = async (actor) => {
  return prisma.notification.updateMany({
    where: { userId: actor.sub, read: false },
    data: { read: true }
  });
};

const createNotification = async (userId, type, title, message, relatedId) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, relatedId }
    });
    emitToUser(userId, 'notification:new', notification);
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};

// Listeners
eventBus.on('task:updated', async ({ oldTask, newTask, actor }) => {
  // If assignee changed
  if (oldTask.assigneeId !== newTask.assigneeId && newTask.assigneeId) {
    if (newTask.assigneeId !== actor.sub) {
      createNotification(newTask.assigneeId, 'TASK_ASSIGNED', 'New Task Assigned', `You have been assigned to task: ${newTask.title}`, newTask.id);
    }
  }
});

eventBus.on('comment:added', async ({ task, actor }) => {
  // Notify assignee if not the actor
  if (task.assigneeId && task.assigneeId !== actor.sub) {
    createNotification(task.assigneeId, 'TASK_COMMENTED', 'New Comment on Task', `Someone commented on your assigned task: ${task.title}`, task.id);
  }
});

eventBus.on('member:added', async ({ projectId, userId, role, actor }) => {
  // Notify the user they were added
  if (userId !== actor.sub) {
    createNotification(userId, 'PROJECT_INVITE', 'Added to Project', `You have been added to a project as ${role}`, projectId);
  }
});
