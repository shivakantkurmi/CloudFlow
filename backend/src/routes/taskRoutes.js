import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createTaskValidation, listTaskValidation, moveTaskValidation, taskParams, updateTaskValidation } from '../validations/taskValidation.js';

export const taskRouter = Router({ mergeParams: true });
taskRouter.use(authenticate);
taskRouter.route('/').post(createTaskValidation, validateRequest, taskController.create).get(listTaskValidation, validateRequest, taskController.list);
taskRouter.put('/:id/status', moveTaskValidation, validateRequest, taskController.move);
taskRouter.route('/:id').get(taskParams, validateRequest, taskController.getById).put(updateTaskValidation, validateRequest, taskController.update).delete(taskParams, validateRequest, taskController.remove);
