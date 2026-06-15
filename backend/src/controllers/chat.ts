import { Response, Request } from 'express';
import { prisma } from '../config/database';
import { success, error, paginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { retrieveRelevantChunks, buildAnswer, buildContext } from '../services/retrieval';
import { generateAnswerWithGemini, generateSearchQuery } from '../services/llm';
import { generateAnswerWithGroq } from '../services/groq';

export async function askQuestion(req: Request, res: Response): Promise<void> {
  const { question, conversationId } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    error(res, 'Question is required');
    return;
  }

  const q = question.trim();

  try {
    let isPersisted = false;
    let dbConversation = null;
    let history: { role: string; content: string }[] = [];

    if (conversationId && typeof conversationId === 'string') {
      dbConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (dbConversation && dbConversation.leadId) {
        isPersisted = true;
      }
    }

    if (isPersisted && dbConversation) {
      // Fetch the last 10 messages for the conversation history
      const dbMessages = await prisma.message.findMany({
        where: { conversationId: dbConversation.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      // Reverse to maintain chronological order
      dbMessages.reverse();
      history = dbMessages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
    } else {
      // For anonymous/temporary chats, use history passed in request body
      if (Array.isArray(req.body.history)) {
        history = req.body.history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content,
        }));
      }
    }

    // Rewrite search query to be self-contained using history
    let standaloneQuery = q;
    try {
      standaloneQuery = await generateSearchQuery(q, history);
    } catch (rewriteErr) {
      console.error('Failed to rewrite search query:', rewriteErr);
      standaloneQuery = q;
    }
    console.log('Original Query:', q);
    console.log('Rewritten Standalone Query:', standaloneQuery);

    // Retrieve chunks using the rewritten query
    const chunks = await retrieveRelevantChunks(standaloneQuery, 8);

    // Save the user's incoming message ONLY if conversation is persisted
    if (isPersisted && dbConversation) {
      await prisma.message.create({
        data: {
          conversationId: dbConversation.id,
          role: 'user',
          content: q,
        },
      });
    }

    // Build merged, deduped context
    const context = buildContext(chunks, 3000);

    console.log('Top chunks returned:', chunks.length);
    chunks.forEach((c, i) => {
      console.log(`CHUNK #${i + 1} - Document: ${c.documentName} - chunk: ${c.chunkIndex} - score: ${c.score}`);
    });

    console.log('Context length:', context.length);

    const resConversationId = isPersisted && dbConversation ? dbConversation.id : (conversationId || 'temp-session');

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

      // Save the assistant's answer ONLY if conversation is persisted
      if (isPersisted && dbConversation) {
        await prisma.message.create({
          data: {
            conversationId: dbConversation.id,
            role: 'assistant',
            content: answer,
          },
        });
      }

      success(res, { answer, conversationId: resConversationId, sourceCount: chunks.length });
      return;
    } catch (llmErr) {
      const errorMsg = llmErr instanceof Error ? llmErr.message : String(llmErr);
      console.error('Gemini failed:', errorMsg);
      console.log(`[Gemini Generation Failed] Reason: ${errorMsg}`);
      console.log('[Groq Fallback Activated]');

      try {
        console.log('Sending context to Groq with history...');
        const t0 = Date.now();
        const groqResp = await generateAnswerWithGroq(q, context, history);
        const t1 = Date.now();
        const answer = groqResp.answer;

        // Log details for debugging
        console.log('Groq response time ms:', t1 - t0);
        console.log('Groq answer (truncated):', answer.substring(0, 800));

        // Save the assistant's answer ONLY if conversation is persisted
        if (isPersisted && dbConversation) {
          await prisma.message.create({
            data: {
              conversationId: dbConversation.id,
              role: 'assistant',
              content: answer,
            },
          });
        }

        success(res, { answer, conversationId: resConversationId, sourceCount: chunks.length, provider: 'groq' });
        return;
      } catch (groqErr) {
        const groqErrorMsg = groqErr instanceof Error ? groqErr.message : String(groqErr);
        console.error('Groq failed:', groqErrorMsg);
        console.log(`[Groq Generation Failed] Reason: ${groqErrorMsg}`);
        console.log('[Knowledge Base Fallback Activated]');

        // fallback to retrieval-based answer
        const fallback = buildAnswer(q, chunks);

        // Save the fallback assistant answer ONLY if conversation is persisted
        if (isPersisted && dbConversation) {
          await prisma.message.create({
            data: {
              conversationId: dbConversation.id,
              role: 'assistant',
              content: fallback,
            },
          });
        }

        success(res, { answer: fallback, conversationId: resConversationId, sourceCount: chunks.length, fallback: true });
        return;
      }
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

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        leadId: { not: null },
      },
      include: {
        lead: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.conversation.count({
      where: {
        leadId: { not: null },
      },
    }),
  ]);

  const sessions = conversations.map((c) => ({
    id: c.id,
    studentName: c.lead?.name || 'Student',
    courseInterest: c.lead?.course || '',
    createdAt: c.createdAt,
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  }));

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
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: req.params.id,
      leadId: { not: null },
    },
    include: {
      lead: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    error(res, 'Session not found', 404);
    return;
  }

  const session = {
    id: conversation.id,
    studentName: conversation.lead?.name || 'Student',
    courseInterest: conversation.lead?.course || '',
    createdAt: conversation.createdAt,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  };

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
