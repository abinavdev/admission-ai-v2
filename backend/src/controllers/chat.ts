import { Response, Request } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { retrieveRelevantChunks, buildAnswer, buildContext } from '../services/retrieval';
import { generateAnswerWithGemini, generateSearchQuery } from '../services/llm';

export async function askQuestion(req: Request, res: Response): Promise<void> {
  const { question, conversationId } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    error(res, 'Question is required');
    return;
  }

  const q = question.trim();

  try {
    let conversation;
    let history: { role: string; content: string }[] = [];

    if (conversationId && typeof conversationId === 'string') {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      // Create new conversation and set title to first 60 chars of user's first question
      const title = q.substring(0, 60);
      conversation = await prisma.conversation.create({
        data: {
          title,
        },
      });
    } else {
      // Fetch the last 10 messages for the conversation history
      const dbMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      // Reverse to maintain chronological order
      dbMessages.reverse();
      history = dbMessages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
    }

    // Rewrite search query to be self-contained using history
    const standaloneQuery = await generateSearchQuery(q, history);
    console.log('Original Query:', q);
    console.log('Rewritten Standalone Query:', standaloneQuery);

    // Retrieve chunks using the rewritten query
    const chunks = await retrieveRelevantChunks(standaloneQuery, 8);

    // Save the user's incoming message to the DB
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: q,
      },
    });

    // Build merged, deduped context
    const context = buildContext(chunks, 3000);

    console.log('Top chunks returned:', chunks.length);
    chunks.forEach((c, i) => {
      console.log(`CHUNK #${i + 1} - Document: ${c.documentName} - chunk: ${c.chunkIndex} - score: ${c.score}`);
    });

    console.log('Context length:', context.length);

    // Call Gemini LLM
    try {
      console.log('Sending context to Gemini with history...');
      const t0 = Date.now();
      const llmResp = await generateAnswerWithGemini(q, context, history);
      const t1 = Date.now();
      const answer = llmResp.answer;

      // Log details for debugging
      console.log('LLM response time ms:', t1 - t0);
      console.log('LLM answer (truncated):', answer.substring(0, 800));

      // Save the assistant's answer to the DB
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: answer,
        },
      });

      success(res, { answer, conversationId: conversation.id, sourceCount: chunks.length });
      return;
    } catch (llmErr) {
      const errorMsg = llmErr instanceof Error ? llmErr.message : String(llmErr);
      console.error('Gemini failed:', errorMsg);
      console.log(`[Gemini Fallback Activated] Reason: ${errorMsg}`);
      // fallback to retrieval-based answer
      const fallback = buildAnswer(q, chunks);

      // Save the fallback assistant answer to the DB
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: fallback,
        },
      });

      success(res, { answer: fallback, conversationId: conversation.id, sourceCount: chunks.length, fallback: true });
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
