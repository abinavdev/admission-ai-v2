import { Router } from 'express';
import * as callsController from '../controllers/calls';
import { authenticateUser } from '../middleware/auth';

const router = Router();

console.log('CALLS CONTROLLER EXPORTS:', Object.keys(callsController));

router.use(authenticateUser);

router.get('/', callsController.getCallLogs);
router.get('/:id', callsController.getCallLog);
router.post('/', callsController.createCallLog);

export default router;