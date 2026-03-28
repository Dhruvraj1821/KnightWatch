import { Router } from 'express';
import { signup, login, logout, refresh, getMe } from './user.controller.js';
import { authenticate } from './user.middleware.js';

const router = Router();
router.post('/signup',  signup);
router.post('/login',   login);
router.post('/logout',  logout);
router.post('/refresh', refresh);
router.get('/me',       authenticate, getMe);

export default router;