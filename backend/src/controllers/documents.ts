import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { processDocument } from '../services/documentProcessor';

export async function getDocuments(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count(),
  ]);

  paginated(res, documents, total, page, limit);
}

export async function getDocument(req: AuthRequest, res: Response): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) {
    error(res, 'Document not found', 404);
    return;
  }
  success(res, document);
}

export async function uploadDocument(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    error(res, 'No file uploaded');
    return;
  }

  const document = await prisma.document.create({
    data: {
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      status: 'QUEUED',
    },
  });

  // Kick off real async processing
  setImmediate(() => processDocument(document.id));

  success(res, document, 201);
}

export async function getDocumentStats(_req: AuthRequest, res: Response): Promise<void> {
  const [totalChunks, failedCount, processedCount, totalDocuments, processingCount] = await Promise.all([
    prisma.documentChunk.count(),
    prisma.document.count({ where: { status: 'FAILED' } }),
    prisma.document.count({ where: { status: 'PROCESSED' } }),
    prisma.document.count(),
    prisma.document.count({ where: { status: 'PROCESSING' } }),
  ]);
  success(res, { totalChunks, failedCount, processedCount, totalDocuments, processingCount });
}

export async function deleteDocument(req: AuthRequest, res: Response): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) {
    error(res, 'Document not found', 404);
    return;
  }

  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  await prisma.document.delete({ where: { id: req.params.id } });
  success(res, { deleted: true });
}
