import { body, param, query } from 'express-validator';

const taskStatuses = ['TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const labelValidation = (value) => {
  if (!Array.isArray(value) || value.length > 10) throw new Error('Labels must contain at most 10 entries.');
  for (const label of value) {
    if (typeof label?.label !== 'string' || label.label.trim().length < 1 || label.label.trim().length > 30) throw new Error('Each label must have a name between 1 and 30 characters.');
    if (label.color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(label.color)) throw new Error('Label colors must be a six-digit hex color.');
  }
  return true;
};

export const projectTaskParams = [param('projectId').isString().trim().notEmpty()];
export const taskParams = [...projectTaskParams, param('id').isString().trim().notEmpty()];

const taskFields = [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 10_000 }),
  body('assigneeId').optional({ values: 'null' }).isString().trim().notEmpty(),
  body('status').optional().isIn(taskStatuses),
  body('priority').optional().isIn(priorities),
  body('dueDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('labels').optional().custom(labelValidation),
];

export const createTaskValidation = [...projectTaskParams, ...taskFields];
export const updateTaskValidation = [
  ...taskParams,
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 10_000 }),
  body('assigneeId').optional({ values: 'null' }).isString().trim().notEmpty(),
  body('status').optional().isIn(taskStatuses),
  body('priority').optional().isIn(priorities),
  body('dueDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('labels').optional().custom(labelValidation),
];
export const listTaskValidation = [...projectTaskParams, query('status').optional().isIn(taskStatuses), query('assigneeId').optional().isString().trim().notEmpty()];
export const moveTaskValidation = [...taskParams, body('status').isIn(taskStatuses), body('position').isFloat()];
