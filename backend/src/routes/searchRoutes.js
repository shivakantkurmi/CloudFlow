import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

export const searchRouter = Router();

searchRouter.use(authenticate);
searchRouter.get('/', searchController.globalSearch);
