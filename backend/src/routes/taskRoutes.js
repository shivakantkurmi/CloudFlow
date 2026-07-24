import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireProjectRole } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createTaskValidation, listTaskValidation, moveTaskValidation, taskParams, updateTaskValidation } from '../validations/taskValidation.js';

export const taskRouter = Router({ mergeParams: true });
taskRouter.use(authenticate);

taskRouter.route('/')
  .post(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER']), createTaskValidation, validateRequest, taskController.create)
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), listTaskValidation, validateRequest, taskController.list);

taskRouter.put('/:id/status', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER']), moveTaskValidation, validateRequest, taskController.move);

taskRouter.route('/:id')
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), taskParams, validateRequest, taskController.getById)
  .put(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER']), updateTaskValidation, validateRequest, taskController.update)
  .delete(requireProjectRole(['PROJECT_MANAGER']), taskParams, validateRequest, taskController.remove);
