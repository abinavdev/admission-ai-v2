import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getLeads(req: AuthRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const status = req.query.status as string | undefined;
  const source = req.query.source as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  paginated(res, leads, total, page, limit);
}

export async function getLead(req: AuthRequest, res: Response): Promise<void> {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) {
    error(res, 'Lead not found', 404);
    return;
  }
  success(res, lead);
}

export async function createLead(req: AuthRequest, res: Response): Promise<void> {
  const { name, phone, email, course, status, source } = req.body;
  if (!name || !phone || !source) {
    error(res, 'Name, phone, and source are required');
    return;
  }

  const lead = await prisma.lead.create({
    data: { name, phone, email: email || '', course: course || '', status: status || 'NEW', source },
  });
  success(res, lead, 201);
}

export async function updateLead(req: AuthRequest, res: Response): Promise<void> {
  const { name, phone, email, course, status } = req.body;

  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    error(res, 'Lead not found', 404);
    return;
  }

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { name, phone, email, course, status },
  });
  success(res, lead);
}

export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    error(res, 'Lead not found', 404);
    return;
  }
  await prisma.lead.delete({ where: { id: req.params.id } });
  success(res, { deleted: true });
}

export async function createPublicLead(req: Request, res: Response): Promise<void> {
  const { name, phone, email, course, chatHistory } = req.body;
  if (!name || !phone) {
    error(res, 'Name and phone are required');
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the lead
      const lead = await tx.lead.create({
        data: {
          name,
          phone,
          email: email || '',
          course: course || '',
          status: 'NEW',
          source: 'CHAT',
        },
      });

      // 2. Create the conversation
      const conversation = await tx.conversation.create({
        data: {
          leadId: lead.id,
          title: `Chat with ${lead.name}`,
        },
      });

      // 3. Insert messages if chatHistory is provided
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        const messagesData = chatHistory
          .filter((msg: any) => msg && typeof msg.content === 'string' && msg.content.trim().length > 0)
          .map((msg: any) => ({
            conversationId: conversation.id,
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content.trim(),
          }));

        if (messagesData.length > 0) {
          await tx.message.createMany({
            data: messagesData,
          });
        }
      }

      return { lead, conversationId: conversation.id };
    });

    success(res, result, 201);
  } catch (err) {
    console.error('Failed to create public lead with conversation:', err);
    error(res, 'Failed to create lead');
  }
}


