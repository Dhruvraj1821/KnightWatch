import { Router } from 'express';
import { createBroadcast, getBroadcasts, deleteBroadcast } from './broadcast.controller.js';
import { authenticate } from '../user/user.middleware.js';
import { requireAdmin } from '../user/user.middleware.js';

const router = Router();
router.post('/create', authenticate, requireAdmin, createBroadcast);
router.get('/',        authenticate, getBroadcasts);
router.delete('/:id',  authenticate, requireAdmin, deleteBroadcast);

export default router;