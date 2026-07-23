import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

const uploadRoot = path.resolve(env.uploadDir);
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

export const uploadPath = (relativePath) => path.resolve(uploadRoot, relativePath);

export const resolveUploadTask = async (req, _res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId }, select: { id: true, projectId: true } });
    if (!task) return next(new AppError('Task not found.', 404, 'TASK_NOT_FOUND'));
    req.uploadTask = task;
    return next();
  } catch (error) { return next(error); }
};

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const destination = path.join(uploadRoot, req.uploadTask.projectId, req.uploadTask.id);
    fs.mkdir(destination, { recursive: true }, (error) => callback(error, destination));
  },
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

export const taskUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE ?? 10 * 1024 * 1024), files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
});
