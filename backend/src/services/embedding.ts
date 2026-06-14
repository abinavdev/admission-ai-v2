import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Generates a 768-dimensional embedding vector for a given text input
 * using the Google Gemini text-embedding-004 model.
 *
 * @param text The input text to generate embedding for
 * @returns A promise that resolves to an array of 768 floating-point numbers
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty.');
  }

  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  try {
    const response = await ai.models.embedContent({
      model: env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2',
      contents: text.trim(),
      config: {
        outputDimensionality: 768,
      },
    });

    const values = response.embeddings?.[0]?.values;
    if (!values || !Array.isArray(values) || values.length === 0) {
      throw new Error('No embedding vector returned from Gemini API.');
    }

    return values;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Embedding Service] Failed to generate embedding:', errorMsg);
    throw new Error(`Embedding generation failed: ${errorMsg}`);
  }
}
