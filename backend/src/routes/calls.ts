import { Router } from 'express';
import { getCallLogs, getCallLog } from '../controllers/calls';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/', getCallLogs);
router.get('/:id', getCallLog);

export default router;
