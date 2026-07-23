import { io } from 'socket.io-client';

let socket;
const projectRooms = new Set();
export const connectSocket = (token) => {
  if (socket?.connected && socket.auth?.token === token) return socket;
  socket?.disconnect();
  socket = io(import.meta.env.VITE_SOCKET_URL ?? window.location.origin, { auth: { token }, transports: ['websocket', 'polling'] });
  socket.on('connect', () => projectRooms.forEach((projectId) => socket.emit('project:join', projectId)));
  return socket;
};
export const getSocket = () => socket;
export const joinProjectRoom = (projectId) => { projectRooms.add(projectId); socket?.emit('project:join', projectId); };
export const leaveProjectRoom = (projectId) => { projectRooms.delete(projectId); socket?.emit('project:leave', projectId); };
export const disconnectSocket = () => { socket?.disconnect(); socket = undefined; projectRooms.clear(); };
