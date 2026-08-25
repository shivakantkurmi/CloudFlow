import express from 'express';
import {
  createOrganization,
  getUserOrganizations,
  getOrganization,
  deleteOrganization,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from '../controllers/orgController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createOrganization)
  .get(getUserOrganizations);

router.route('/:id')
  .get(getOrganization)
  .delete(deleteOrganization);

router.route('/:id/members')
  .post(addOrganizationMember);

router.route('/:id/members/:userId')
  .put(updateOrganizationMemberRole)
  .delete(removeOrganizationMember);

export default router;
