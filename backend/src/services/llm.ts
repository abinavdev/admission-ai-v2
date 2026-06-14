import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

export interface LLMResponse {
  answer: string;
  raw?: any;
}

// Use official Google GenAI SDK only. No REST fallback.
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
console.log('Gemini initialized');
console.log('API Key Loaded:', !!env.GEMINI_API_KEY);

export async function generateAnswerWithGemini(
  question: string,
  context: string,
  history: { role: string; content: string }[] = []
): Promise<LLMResponse> {
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const historyText = history.length > 0
    ? history.map((m) => `${m.role === 'user' ? 'Student' : 'AI Assistant'}: ${m.content}`).join('\n')
    : 'No prior conversation history.';

  const prompt = `You are AdmissionAI, a university admission assistant.

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
- Mention exact course names from context.

Conversation History:
${historyText}

Context:
${context}

Current Question:
${question}`;

  console.log('\n===== GEMINI REQUEST =====');
  console.log('Question:', question);
  console.log('Context length:', context.length);
  console.log('History length:', history.length);
  console.log('Model:', model);
  console.log('==========================\n');

  const t0 = Date.now();
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  const t1 = Date.now();

  // SDK returns text in different fields depending on version; attempt to extract
  const text = (response as any)?.text ?? (response as any)?.output?.[0]?.content ?? JSON.stringify(response);

  console.log('\n===== GEMINI RESPONSE (truncated) =====');
  console.log(String(text).substring(0, 1200));
  console.log('Response time ms:', t1 - t0);
  console.log('======================================\n');

  return { answer: String(text).trim(), raw: response };
}

export async function generateSearchQuery(
  question: string,
  history: { role: string; content: string }[]
): Promise<string> {
  if (!history || history.length === 0) return question;

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const historyText = history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `Given the following conversation history and a follow-up question, generate a standalone search query that contains all necessary keywords to retrieve relevant information from a database.
Do not write an answer. Only return the search query keywords.

Conversation History:
${historyText}

Follow-up Question:
${question}

Standalone Search Query:`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    const text = (response as any)?.text ?? (response as any)?.output?.[0]?.content ?? question;
    return text.trim();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to generate standalone search query:', errorMsg);
    console.log(`[Query Rewrite Fallback Activated] Reason: ${errorMsg}`);
    return question;
  }
}

