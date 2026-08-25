import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginValidation, registerValidation } from '../validations/authValidation.js';

export const authRouter = Router();
authRouter.post('/register', registerValidation, validateRequest, authController.register);
authRouter.post('/login', loginValidation, validateRequest, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
