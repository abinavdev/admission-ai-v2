import { Response } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getCallLogs(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

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

export async function createCallLog(req: AuthRequest, res: Response): Promise<void> {
  const { studentName, phone, duration, status, transcript, calledAt } = req.body;
  if (!studentName || !phone) {
    error(res, 'Student name and phone are required');
    return;
  }

  const call = await prisma.callLog.create({
    data: {
      studentName,
      phone,
      duration: duration || '0:00',
      status: status || 'COMPLETED',
      transcript: transcript || '',
      calledAt: calledAt ? new Date(calledAt) : new Date(),
    },
  });
  success(res, call, 201);
}

export async function updateCallLog(req: AuthRequest, res: Response): Promise<void> {
  const { studentName, phone, duration, status, transcript } = req.body;

  const existing = await prisma.callLog.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    error(res, 'Call log not found', 404);
    return;
  }

  const call = await prisma.callLog.update({
    where: { id: req.params.id },
    data: { studentName, phone, duration, status, transcript },
  });
  success(res, call);
}

export async function deleteCallLog(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.callLog.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    error(res, 'Call log not found', 404);
    return;
  }
  await prisma.callLog.delete({ where: { id: req.params.id } });
  success(res, { deleted: true });
}
