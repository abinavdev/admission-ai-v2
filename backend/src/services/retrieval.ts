import { prisma } from '../config/database';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'about', 'and', 'or', 'but', 'not',
  'this', 'that', 'these', 'those', 'it', 'its', 'i', 'me', 'my',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  'what', 'which', 'who', 'how', 'when', 'where', 'why', 'please',
  'tell', 'give', 'know', 'want', 'need', 'get','available',
'information',
'details',
'guide'
]);

export interface RetrievedChunk {
  content: string;
  documentName: string;
  score: number;
  chunkIndex: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function tfScore(tokens: string[], queryTerms: string[]): number {
  if (queryTerms.length === 0) return 0;

  const tokenSet = new Set(tokens);
  let score = 0;

  for (const term of queryTerms) {
    if (tokenSet.has(term)) {
      const tf = tokens.filter((t) => t === term).length;
      score += 1 + Math.log(tf + 1);
    }
  }

  return score;
}

export async function retrieveRelevantChunks(
  question: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const queryTerms = tokenize(question);

  console.log('\n==============================');
  console.log('QUESTION:', question);
  console.log('QUERY TERMS:', queryTerms);
  console.log('==============================\n');

  if (queryTerms.length === 0) return [];

  const chunks = await prisma.documentChunk.findMany({
    include: {
      document: {
        select: {
          name: true,
          status: true,
        },
      },
    },
    where: {
      document: {
        status: 'PROCESSED',
      },
    },
  });

  console.log(`Loaded ${chunks.length} chunks from database`);

  if (chunks.length === 0) {
    console.log('NO CHUNKS FOUND');
    return [];
  }

  const scored = chunks.map((chunk) => {
    const tokens = tokenize(chunk.content);
    const score = tfScore(tokens, queryTerms);

    return {
      content: chunk.content,
      documentName: chunk.document.name,
      score,
      chunkIndex: chunk.chunkIndex,
    };
  });

  const results = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  console.log('\n========== TOP MATCHES ==========');

  results.forEach((r, index) => {
    console.log(`\n#${index + 1}`);
    console.log('Document:', r.documentName);
    console.log('Score:', r.score);
    console.log('Chunk Index:', r.chunkIndex);
    console.log(
      'Preview:',
      r.content.substring(0, 250).replace(/\n/g, ' ')
    );
  });

  console.log('\n=================================\n');

  return results;
}

export function buildAnswer(
  question: string,
  chunks: RetrievedChunk[],
): string {

  if (chunks.length === 0) {
    return 'I could not find that information in the uploaded university documents.';
  }

  const bestChunk = chunks[0];

  return bestChunk.content;
}