import { Router } from 'express';
import { createRoom, joinRoom, leaveRoom, getRooms, getRoom } from './room.controller.js';
import { authenticate } from '../user/user.middleware.js';

const router = Router();
router.post('/create',    authenticate, createRoom);
router.post('/join',      authenticate, joinRoom);
router.post('/leave',     authenticate, leaveRoom);
router.get('/',           authenticate, getRooms);
router.get('/:roomId',    authenticate, getRoom);

export default router;