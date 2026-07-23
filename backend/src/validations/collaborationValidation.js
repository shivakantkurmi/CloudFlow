import { body, param } from 'express-validator';
export const taskIdValidation = [param('taskId').isString().trim().notEmpty()];
export const commentValidation = [...taskIdValidation, body('content').trim().isLength({ min: 1, max: 5000 })];
export const commentIdValidation = [...taskIdValidation, param('id').isString().trim().notEmpty()];
export const attachmentIdValidation = [...taskIdValidation, param('id').isString().trim().notEmpty()];
