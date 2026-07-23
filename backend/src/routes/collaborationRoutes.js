import { Router } from 'express';
import * as controller from '../controllers/collaborationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { resolveUploadTask, taskUpload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { attachmentIdValidation, commentIdValidation, commentValidation, taskIdValidation } from '../validations/collaborationValidation.js';

export const commentRouter = Router({ mergeParams: true });
commentRouter.use(authenticate);
commentRouter.route('/').get(taskIdValidation, validateRequest, controller.listComments).post(commentValidation, validateRequest, controller.addComment);
commentRouter.delete('/:id', commentIdValidation, validateRequest, controller.deleteComment);

export const attachmentRouter = Router({ mergeParams: true });
attachmentRouter.use(authenticate);
attachmentRouter.route('/').get(taskIdValidation, validateRequest, controller.listAttachments).post(resolveUploadTask, taskUpload.single('file'), controller.uploadAttachment);
attachmentRouter.get('/:id/download', attachmentIdValidation, validateRequest, controller.downloadAttachment);
attachmentRouter.delete('/:id', attachmentIdValidation, validateRequest, controller.deleteAttachment);
