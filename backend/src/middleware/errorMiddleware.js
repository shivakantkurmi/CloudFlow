import { Prisma } from '@prisma/client';
import multer from 'multer';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

export const errorHandler = (error, _req, res) => {
  let statusCode = error.statusCode ?? 500;
  let code = error.code ?? 'INTERNAL_SERVER_ERROR';
  let message = error.message ?? 'An unexpected error occurred.';

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'A record with this value already exists.';
  }
  if (error instanceof multer.MulterError) {
    statusCode = 422;
    code = 'UPLOAD_ERROR';
    message = error.code === 'LIMIT_FILE_SIZE' ? 'The uploaded file exceeds the allowed size.' : 'The upload could not be processed.';
  }

  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({ success: false, error: code, message });
};
