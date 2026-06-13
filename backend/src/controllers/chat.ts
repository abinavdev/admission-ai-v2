import { Response, Request } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { retrieveRelevantChunks, buildAnswer, buildContext } from '../services/retrieval';
import { generateAnswerWithGemini } from '../services/llm';

export async function askQuestion(req: Request, res: Response): Promise<void> {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    error(res, 'Question is required');
    return;
  }

  const q = question.trim();

  try {
    const chunks = await retrieveRelevantChunks(q, 8);

    // Build merged, deduped context
    const context = buildContext(chunks, 3000);

    console.log('Top chunks returned:', chunks.length);
    // Log each top chunk briefly
    chunks.forEach((c, i) => {
      console.log(`CHUNK #${i + 1} - Document: ${c.documentName} - chunk: ${c.chunkIndex} - score: ${c.score}`);
      console.log(c.content.substring(0, 240).replace(/\n/g, ' '));
    });

    console.log('Context length:', context.length);
    console.log('Context (truncated):', context.substring(0, 1200).replace(/\n/g, ' '));

    // Call Gemini LLM
    try {
      console.log('Sending context to Gemini...');
      const t0 = Date.now();
      const llmResp = await generateAnswerWithGemini(q, context);
      const t1 = Date.now();
      // Log details for debugging
      console.log('LLM raw response present:', llmResp.raw && Object.keys(llmResp.raw).length ? 'yes' : 'no');
      console.log('LLM response time ms:', t1 - t0);
      console.log('LLM answer (truncated):', llmResp.answer.substring(0, 800));
      success(res, { answer: llmResp.answer, sourceCount: chunks.length });
      return;
    } catch (llmErr) {
      console.error('Gemini failed:', llmErr?.message || llmErr);
      // fallback to retrieval-based answer
      const fallback = buildAnswer(q, chunks);
      success(res, { answer: fallback, sourceCount: chunks.length, fallback: true });
      return;
    }
  } catch (err) {
    console.error('Retrieval error:', err);
    error(res, 'Failed to process question');
    return;
  }
}

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
