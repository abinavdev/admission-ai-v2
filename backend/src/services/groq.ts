import Groq from 'groq-sdk';
import { env } from '../config/env';

export interface GroqResponse {
  answer: string;
  raw?: any;
}

// Initializing the Groq SDK client
const groq = new Groq({ apiKey: env.GROQ_API_KEY });
console.log('Groq initialized');
console.log('Groq API Key Loaded:', !!env.GROQ_API_KEY);

export const groqConfig = {
  simulateFailure: false
};

/**
 * Generates an answer using Groq Chat Completions.
 */
export async function generateAnswerWithGroq(
  question: string,
  context: string,
  history: { role: string; content: string }[] = []
): Promise<GroqResponse> {
  if (groqConfig.simulateFailure) {
    throw new Error('Simulated Groq failure (e.g. Rate Limit / Quota Exceeded)');
  }
  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const systemInstruction = `You are AdmissionAI, a university admission assistant.

Answer the user's question ONLY using the provided context. If the answer cannot be found in the context, but is referenced in the conversation history, you can refer to it. Otherwise, clearly state that the information is unavailable.

Rules:
- Never invent information.
- Never hallucinate.
- If information is unavailable, clearly state that.
- Use bullet points where appropriate.
- Be concise and professional.
- For course questions, organize courses into Undergraduate and Postgraduate categories.
- For scholarship questions, list scholarship names clearly.
- For hostel questions, summarize facilities cleanly.
- Mention exact course names from context.`;

  const historyText = history.length > 0
    ? history.map((m) => `${m.role === 'user' ? 'Student' : 'AI Assistant'}: ${m.content}`).join('\n')
    : 'No prior conversation history.';

  const userContent = `Conversation History:
${historyText}

Context:
${context}

Current Question:
${question}`;

  console.log('\n===== GROQ REQUEST =====');
  console.log('Question:', question);
  console.log('Context length:', context.length);
  console.log('History length:', history.length);
  console.log('Model:', model);
  console.log('========================\n');

  const t0 = Date.now();
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userContent }
    ],
    temperature: 0.2,
  });
  const t1 = Date.now();

  const text = response.choices[0]?.message?.content || '';

  console.log('\n===== GROQ RESPONSE (truncated) =====');
  console.log(text.substring(0, 1200));
  console.log('Response time ms:', t1 - t0);
  console.log('=====================================\n');

  return { answer: text.trim(), raw: response };
}

/**
 * Rewrites the query to be standalone using Groq.
 */
export async function generateSearchQueryWithGroq(
  question: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  if (groqConfig.simulateFailure) {
    throw new Error('Simulated Groq failure (e.g. Rate Limit / Quota Exceeded)');
  }
  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const historyText = history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const systemInstruction = `You are a search query rewriter for a university admission assistant. Given the following conversation history and a follow-up question, generate a standalone search query.
Do not write an answer. Only return the search query.`;

  const userContent = `Conversation History:
${historyText}

Follow-up Question:
${question}

Standalone Search Query:`;

  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userContent }
    ],
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content || question;
  return text.trim();
}
