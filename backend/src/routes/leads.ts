import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, getLead } from '../controllers/leads';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
