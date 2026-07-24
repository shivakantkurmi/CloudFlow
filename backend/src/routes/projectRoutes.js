import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOrgRole, requireProjectRole } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { addMemberValidation, createProjectValidation, projectIdValidation, removeMemberValidation, updateProjectValidation } from '../validations/projectValidation.js';

export const projectRouter = Router();
projectRouter.use(authenticate);

// List projects in an org (needs orgId query param or body)
projectRouter.route('/')
  .post(requireOrgRole(['OWNER', 'ADMIN']), createProjectValidation, validateRequest, projectController.create)
  .get(projectController.list); // the controller will use the user's memberships to list

projectRouter.route('/:id')
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), projectIdValidation, validateRequest, projectController.getById)
  .put(requireProjectRole(['PROJECT_MANAGER']), updateProjectValidation, validateRequest, projectController.update)
  .delete(requireProjectRole(['PROJECT_MANAGER']), projectIdValidation, validateRequest, projectController.remove);

projectRouter.route('/:id/members')
  .get(requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), projectIdValidation, validateRequest, projectController.listMembers)
  .post(requireProjectRole(['PROJECT_MANAGER']), addMemberValidation, validateRequest, projectController.addMember);

projectRouter.delete('/:id/members/:userId', requireProjectRole(['PROJECT_MANAGER']), removeMemberValidation, validateRequest, projectController.removeMember);
projectRouter.get('/:id/activity', requireProjectRole(['PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']), projectIdValidation, validateRequest, projectController.listActivities);
