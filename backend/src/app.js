import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { authRouter } from './routes/authRoutes.js';
import orgRouter from './routes/orgRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';
import { attachmentRouter, commentRouter } from './routes/collaborationRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { searchRouter } from './routes/searchRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health & Keep-Alive endpoints (placed before rate limiter so pingers are never throttled)
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);

app.use(rateLimit({ windowMs: env.rateLimitWindowMs, limit: env.rateLimitMax, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth', authRouter);
app.use('/api/orgs', orgRouter);
app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/tasks', taskRouter);
app.use('/api/tasks/:taskId/comments', commentRouter);
app.use('/api/tasks/:taskId/attachments', attachmentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/search', searchRouter);
app.use('/api/dashboard', dashboardRouter);
app.use(notFound);
app.use(errorHandler);
