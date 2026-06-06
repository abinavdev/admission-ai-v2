import { Response } from 'express';
import { prisma } from '../config/database';
import { success } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getAnalyticsOverview(_req: AuthRequest, res: Response): Promise<void> {
  const [leadsByStatus, callsByStatus] = await Promise.all([
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.callLog.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  success(res, { leadStatusBreakdown: leadsByStatus, callStatusBreakdown: callsByStatus });
}

export async function getAnalytics(_req: AuthRequest, res: Response): Promise<void> {
  const [
    totalLeads,
    totalChats,
    totalCalls,
    totalDocuments,
    leadsByStatus,
    leadsBySource,
    leadsByCourse,
    recentLeads,
    callsByStatus,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.chatSession.count(),
    prisma.callLog.count(),
    prisma.document.count(),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['course'], _count: { _all: true }, orderBy: { _count: { course: 'desc' } }, take: 10 }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 7 }),
    prisma.callLog.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const convertedLeads = leadsByStatus.find((s) => s.status === 'CONVERTED')?._count._all ?? 0;
  const conversionRate = totalLeads > 0 ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

  success(res, {
    overview: { totalLeads, totalChats, totalCalls, totalDocuments, conversionRate },
    leadsByStatus,
    leadsBySource,
    leadsByCourse,
    recentLeads,
    callsByStatus,
  });
}
