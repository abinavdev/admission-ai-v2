import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/', getAnalytics);

export default router;
