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

export async function generateAnswerWithGemini(question: string, context: string): Promise<LLMResponse> {
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = `You are AdmissionAI, a university admission assistant.\n\nAnswer ONLY using the provided context.\n\nRules:\n- Never invent information.\n- Never hallucinate.\n- If information is unavailable, clearly state that.\n- Use bullet points where appropriate.\n- Be concise and professional.\n- For course questions, organize courses into Undergraduate and Postgraduate categories.\n- For scholarship questions, list scholarship names clearly.\n- For hostel questions, summarize facilities cleanly.\n- Mention exact course names from context.\n\nContext:\n${context}\n\nQuestion:\n${question}`;

  console.log('\n===== GEMINI REQUEST =====');
  console.log('Question:', question);
  console.log('Context length:', context.length);
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
