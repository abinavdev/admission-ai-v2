import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument, getDocument, getDocumentStats } from '../controllers/documents';
import { authenticateUser } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

router.use(authenticateUser);
router.get('/stats', getDocumentStats);
router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
