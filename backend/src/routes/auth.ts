import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticateUser, getProfile);

export default router;
