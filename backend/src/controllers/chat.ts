import { Response } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getSessions(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);

  const [sessions, total] = await Promise.all([
    prisma.chatSession.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { messages: true } } },
    }),
    prisma.chatSession.count(),
  ]);

  paginated(res, sessions, total, page, limit);
}

export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  const { studentName, courseInterest } = req.body;
  if (!studentName) {
    error(res, 'Student name is required');
    return;
  }

  const session = await prisma.chatSession.create({
    data: { studentName, courseInterest, agentId: req.userId },
  });
  success(res, session, 201);
}

export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  const session = await prisma.chatSession.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session) {
    error(res, 'Session not found', 404);
    return;
  }
  success(res, session);
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
  if (!session) {
    error(res, 'Session not found', 404);
    return;
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  success(res, messages);
}

export async function addMessage(req: AuthRequest, res: Response): Promise<void> {
  const { role, content } = req.body;
  if (!role || !content) {
    error(res, 'Role and content are required');
    return;
  }

  const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
  if (!session) {
    error(res, 'Session not found', 404);
    return;
  }

  const message = await prisma.chatMessage.create({
    data: { sessionId: req.params.id, role, content },
  });
  success(res, message, 201);
}
