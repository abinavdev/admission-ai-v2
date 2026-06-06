import { Router } from 'express';
import { getCallLogs, getCallLog, createCallLog, updateCallLog, deleteCallLog } from '../controllers/calls';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/', getCallLogs);
router.post('/', createCallLog);
router.get('/:id', getCallLog);
router.patch('/:id', updateCallLog);
router.delete('/:id', deleteCallLog);

export default router;
