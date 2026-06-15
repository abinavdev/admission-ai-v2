import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { generateSearchQueryWithGroq } from './groq';

export interface LLMResponse {
  answer: string;
  raw?: any;
}

// Use official Google GenAI SDK only. No REST fallback.
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
console.log('Gemini initialized');
console.log('API Key Loaded:', !!env.GEMINI_API_KEY);

export const geminiConfig = {
  simulateFailure: false
};

export async function generateAnswerWithGemini(
  question: string,
  context: string,
  history: { role: string; content: string }[] = []
): Promise<LLMResponse> {
  if (geminiConfig.simulateFailure) {
    throw new Error('Simulated Gemini failure (e.g. Rate Limit / Quota Exceeded)');
  }
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

export function checkAndRewriteQuery(
  query: string,
  history: { role: string; content: string }[] = []
): { rewritten: string; path: string } | null {
  const clean = query.trim().replace(/[?.,!]/g, '').toLowerCase();

  // Regex to match a course name (with optional specialization)
  const coursePattern = /\b(mca|mba|mtech|btech|m\.tech|b\.tech|m\.sc|msc)(?:\s+(?:cse|computer\s+science(?:\s+and\s+engineering)?|it|information\s+technology|ece|electronics(?:\s+and\s+communication(?:\s+engineering)?)?|mechanical|civil|data\s+science|cyber\s+security|artificial\s+intelligence|data\s+analytics))?\b/i;

  // 1. Detect broad query prefixes or exact matches
  const broadPrefixes = [
    /^\s*(tell\s+me\s+about|explain|what\s+is|info|information\s+about|details\s+on|guide\s+for|course\s+details\s+for|admission\s+details\s+for)\s+(.+)$/i,
    /^(.+)\s+(?:course|program|degree)\s*(?:details|info|information)?$/i
  ];

  // Check exact course match
  const exactMatch = clean.match(new RegExp(`^${coursePattern.source}$`, 'i'));
  if (exactMatch) {
    const course = exactMatch[0].toUpperCase();
    return {
      rewritten: `${course} course details duration eligibility fees placements admission`,
      path: '[Query Rewrite] Broad query detected'
    };
  }

  for (const regex of broadPrefixes) {
    const match = clean.match(regex);
    if (match) {
      const target = match[2] || match[1];
      const courseMatch = target.match(new RegExp(`^${coursePattern.source}$`, 'i'));
      if (courseMatch) {
        const course = courseMatch[0].toUpperCase();
        return {
          rewritten: `${course} course details duration eligibility fees placements admission`,
          path: '[Query Rewrite] Broad query detected'
        };
      }
    }
  }

  // 2. Check if the query is self-contained (contains a course AND a specific attribute)
  const attributeKeywords = /\b(fee|fees|cost|tuition|placement|placements|jobs|salary|package|eligibility|eligible|duration|years|admission|mode|entrance|hostel|hostels|accommodation|scholarship|scholarships|grant)\b/i;
  const followUpMarkers = /\b(it|its|they|their|them|he|she|him|her|this|that|these|those|what\s+about|how\s+about)\b/i;

  const hasCourse = coursePattern.test(clean);
  const hasAttribute = attributeKeywords.test(clean);
  const hasFollowUpMarker = followUpMarkers.test(clean);

  if (hasCourse && hasAttribute && !hasFollowUpMarker) {
    return {
      rewritten: query,
      path: '[Query Rewrite] Self-contained query unchanged'
    };
  }

  // 3. If history is empty and it wasn't detected as broad or self-contained:
  if (!history || history.length === 0) {
    return {
      rewritten: query,
      path: '[Query Rewrite] Self-contained query unchanged'
    };
  }

  return null;
}

export async function generateSearchQuery(
  question: string,
  history: { role: string; content: string }[]
): Promise<string> {
  try {
    const codeRewrite = checkAndRewriteQuery(question, history);
    if (codeRewrite) {
      console.log(codeRewrite.path);
      return codeRewrite.rewritten;
    }

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const historyText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a search query rewriter for a university admission assistant. Given the following conversation history and a follow-up question, generate a standalone search query.
Do not write an answer. Only return the search query.

Conversation History:
${historyText}

Follow-up Question:
${question}

Standalone Search Query:`;

    try {
      if (geminiConfig.simulateFailure) {
        throw new Error('Simulated Gemini failure (e.g. Rate Limit / Quota Exceeded)');
      }
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = (response as any)?.text ?? (response as any)?.output?.[0]?.content ?? question;
      console.log('[Query Rewrite] History-based rewrite via Gemini');
      return text.trim();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to generate standalone search query with Gemini:', errorMsg);
      console.log(`[Gemini Generation Failed] Reason: ${errorMsg}`);
      console.log('[Groq Fallback Activated]');

      try {
        const rewritten = await generateSearchQueryWithGroq(question, history);
        console.log('[Query Rewrite] History-based rewrite via Groq');
        return rewritten;
      } catch (groqErr) {
        const groqErrorMsg = groqErr instanceof Error ? groqErr.message : String(groqErr);
        console.error('Failed to generate standalone search query with Groq:', groqErrorMsg);
        console.log(`[Groq Generation Failed] Reason: ${groqErrorMsg}`);
        console.log('[Query Rewrite] Raw query fallback');
        return question;
      }
    }
  } catch (outerErr) {
    const errorMsg = outerErr instanceof Error ? outerErr.message : String(outerErr);
    console.error('Unexpected error in generateSearchQuery:', errorMsg);
    console.log('[Query Rewrite] Raw query fallback');
    return question;
  }
}

