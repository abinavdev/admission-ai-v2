import { Router } from 'express';
import { getSessions, createSession, getSession, addMessage, getMessages } from '../controllers/chat';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:id', getSession);
router.get('/sessions/:id/messages', getMessages);
router.post('/sessions/:id/messages', addMessage);

export default router;
