import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { addMemberValidation, createProjectValidation, listProjectValidation, projectIdValidation, removeMemberValidation, updateProjectValidation } from '../validations/projectValidation.js';

export const projectRouter = Router();
projectRouter.use(authenticate);
projectRouter.route('/').post(createProjectValidation, validateRequest, projectController.create).get(listProjectValidation, validateRequest, projectController.list);
projectRouter.route('/:id').get(projectIdValidation, validateRequest, projectController.getById).put(updateProjectValidation, validateRequest, projectController.update).delete(projectIdValidation, validateRequest, projectController.remove);
projectRouter.route('/:id/members').get(projectIdValidation, validateRequest, projectController.listMembers).post(addMemberValidation, validateRequest, projectController.addMember);
projectRouter.delete('/:id/members/:userId', removeMemberValidation, validateRequest, projectController.removeMember);
projectRouter.get('/:id/activity', projectIdValidation, validateRequest, projectController.listActivities);
