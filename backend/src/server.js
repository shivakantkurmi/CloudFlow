import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { initializeSockets } from './sockets/socketServer.js';

const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: env.corsOrigin, credentials: true } });
initializeSockets(io);

const shutdown = async () => {
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
httpServer.listen(env.port, () => console.info(`CloudFlow API listening on port ${env.port}`));
