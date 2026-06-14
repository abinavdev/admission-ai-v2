import { prisma } from '../config/database';
import { getEmbedding } from './embedding';

export interface SemanticSearchResult {
  id: string;
  content: string;
  documentId: string;
  chunkIndex: number;
  similarity: number;
}

/**
 * Performs a semantic vector similarity search against the document chunks
 * stored in the database.
 *
 * @param question The user's query question
 * @param limit The maximum number of chunks to return (default: 5)
 * @returns A list of matching chunks with similarity scores
 */
export async function semanticSearch(
  question: string,
  limit = 5
): Promise<SemanticSearchResult[]> {
  if (!question || question.trim().length === 0) {
    return [];
  }

  try {
    // 1. Generate query embedding vector
    const embedding = await getEmbedding(question);

    // 2. Format embedding array as PostgreSQL vector literal: '[0.1, 0.2, ...]'
    const vectorString = `[${embedding.join(',')}]`;

    // 3. Query pgvector using cosine similarity (1 - cosine distance) via raw SQL
    // We use double quotes for camelCase column names in PostgreSQL
    const results = await prisma.$queryRawUnsafe<SemanticSearchResult[]>(
      `SELECT 
         id, 
         content, 
         "documentId", 
         "chunkIndex", 
         1 - (embedding <=> $1::vector) as similarity
       FROM document_chunks
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorString,
      limit
    );

    return results;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Vector Search Service] Semantic search failed:', errorMsg);
    throw new Error(`Semantic search failed: ${errorMsg}`);
  }
}
