import { Router } from 'express';
import * as controller from '../controllers/collaborationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireProjectRole } from '../middleware/rbacMiddleware.js';
import { resolveUploadTask, taskUpload } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { attachmentIdValidation, commentIdValidation, commentValidation, taskIdValidation } from '../validations/collaborationValidation.js';

export const commentRouter = Router({ mergeParams: true });
commentRouter.use(authenticate);

commentRouter.route('/')
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), taskIdValidation, validateRequest, controller.listComments)
  .post(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER']), commentValidation, validateRequest, controller.addComment);

commentRouter.delete('/:id', requireProjectRole(['PROJECT_MANAGER']), commentIdValidation, validateRequest, controller.deleteComment);

export const attachmentRouter = Router({ mergeParams: true });
attachmentRouter.use(authenticate);

attachmentRouter.route('/')
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), taskIdValidation, validateRequest, controller.listAttachments)
  .post(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER']), resolveUploadTask, taskUpload.single('file'), controller.uploadAttachment);

attachmentRouter.get('/:id/download', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), attachmentIdValidation, validateRequest, controller.downloadAttachment);
attachmentRouter.delete('/:id', requireProjectRole(['PROJECT_MANAGER']), attachmentIdValidation, validateRequest, controller.deleteAttachment);
