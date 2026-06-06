import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/stats', getDashboardStats);

export default router;
