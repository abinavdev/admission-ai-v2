import { Response } from 'express';
import { prisma } from '../config/database';
import { success } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  const [totalLeads, totalCalls, totalChats, totalDocuments] = await Promise.all([
    prisma.lead.count(),
    prisma.callLog.count(),
    prisma.conversation.count({ where: { leadId: { not: null } } }),
    prisma.document.count(),
  ]);

  success(res, { totalLeads, totalCalls, totalChats, totalDocuments });
}
