import { prisma } from '../config/prisma.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';

let io;

const canJoinProject = async (projectId, auth) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, status: { not: 'DELETED' } }, select: { ownerId: true } });
  if (!project) return false;
  if (auth.role === 'ADMIN' || project.ownerId === auth.sub) return true;
  return Boolean(await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: auth.sub } } }));
};

export const initializeSockets = (socketServer) => {
  io = socketServer;
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required.'));
    try {
      socket.auth = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error('Invalid socket token.'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.auth.sub}`);
    socket.on('project:join', async (projectId, acknowledge) => {
      const allowed = typeof projectId === 'string' && await canJoinProject(projectId, socket.auth);
      if (allowed) socket.join(`project:${projectId}`);
      acknowledge?.({ success: allowed });
    });
    socket.on('project:leave', (projectId) => socket.leave(`project:${projectId}`));
  });
};

export const emitToProject = (projectId, event, payload) => io?.to(`project:${projectId}`).emit(event, payload);
export const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload);
