import { body, param, query } from 'express-validator';

const projectKey = body('key')
  .trim()
  .toUpperCase()
  .matches(/^[A-Z][A-Z0-9_]{1,9}$/)
  .withMessage('Project key must be 2–10 uppercase letters, numbers, or underscores and start with a letter.');

export const projectIdValidation = [param('id').isString().trim().notEmpty()];

export const createProjectValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  projectKey,
  body('description').optional({ values: 'null' }).trim().isLength({ max: 5000 }),
  body('visibility').optional().isIn(['PRIVATE', 'PUBLIC']),
];

export const updateProjectValidation = [
  ...projectIdValidation,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 5000 }),
  body('visibility').optional().isIn(['PRIVATE', 'PUBLIC']),
  body('status').optional().isIn(['ACTIVE', 'ARCHIVED']),
];

export const listProjectValidation = [query('limit').optional().toInt().isInt({ min: 1, max: 100 })];

export const addMemberValidation = [
  ...projectIdValidation,
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['LEAD', 'MEMBER']),
];

export const removeMemberValidation = [...projectIdValidation, param('userId').isString().trim().notEmpty()];
