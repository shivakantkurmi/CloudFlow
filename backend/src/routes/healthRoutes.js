import { Router } from 'express';
import * as healthController from '../controllers/healthController.js';

export const healthRouter = Router();

// Full health check (server + database query)
healthRouter.get('/', healthController.getHealth);

// Explicit database ping
healthRouter.get('/db', healthController.getDbPing);

// Fast server liveness check (pong)
healthRouter.get('/ping', healthController.getPing);
