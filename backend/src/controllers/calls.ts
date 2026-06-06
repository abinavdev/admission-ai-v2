import { Response } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getCallLogs(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [calls, total] = await Promise.all([
    prisma.callLog.findMany({
      where,
      orderBy: { calledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.callLog.count({ where }),
  ]);

  paginated(res, calls, total, page, limit);
}

export async function getCallLog(req: AuthRequest, res: Response): Promise<void> {
  const call = await prisma.callLog.findUnique({ where: { id: req.params.id } });
  if (!call) {
    error(res, 'Call log not found', 404);
    return;
  }
  success(res, call);
}
