import { Response } from 'express';
import { prisma } from '../config/database';
import { success } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  const [totalLeads, totalCalls, totalChats, totalDocuments] = await Promise.all([
    prisma.lead.count(),
    prisma.callLog.count(),
    prisma.chatSession.count(),
    prisma.document.count(),
  ]);

  success(res, { totalLeads, totalCalls, totalChats, totalDocuments });
}
