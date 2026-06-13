import { prisma } from '../config/database';
import { env } from '../config/env';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'about', 'and', 'or', 'but', 'not',
  'this', 'that', 'these', 'those', 'it', 'its', 'i', 'me', 'my',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  'what', 'which', 'who', 'how', 'when', 'where', 'why', 'please',
  'tell', 'give', 'know', 'want', 'need', 'get',
  'available',
  'information',
  'details',
  'guide'
]);

const SYNONYMS: Record<string, string[]> = {
  course: ['program', 'degree', 'curriculum'],
  courses: ['programs', 'degrees', 'btech', 'mtech', 'mba', 'mca'],
  scholarship: ['grant', 'financial', 'assistance'],
  scholarships: ['grant', 'financial', 'assistance'],
  hostel: ['accommodation', 'residence'],
  fees: ['fee', 'tuition', 'payment'],
  fee: ['fees', 'tuition', 'payment'],
  admission: ['application', 'registration', 'enrollment'],
  placements: ['jobs', 'career', 'recruitment'],
  placement: ['jobs', 'career', 'recruitment'],
  coursewise: ['programs', 'btech', 'mtech']
};

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
    .filter(
      (word) =>
        word.length > 2 &&
        !STOP_WORDS.has(word)
    );
}

function expandTerms(terms: string[]): string[] {
  const expanded = new Set<string>();

  terms.forEach((term) => {
    expanded.add(term);

    const synonyms = SYNONYMS[term];

    if (synonyms) {
      synonyms.forEach((synonym) =>
        expanded.add(synonym)
      );
    }
  });

  return [...expanded];
}

function getPhrasesFromQuestion(question: string): string[] {
  const tokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const phrases = new Set<string>();
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      phrases.add(tokens.slice(i, i + n).join(' '));
    }
  }
  return [...phrases];
}

function phraseScore(content: string, phrases: string[]): number {
  let score = 0;
  const lc = content.toLowerCase();
  phrases.forEach((p) => {
    if (lc.includes(p)) score += 3;
  });
  return score;
}

function tfScore(
  tokens: string[],
  queryTerms: string[]
): number {
  let score = 0;

  const tokenCounts = new Map<string, number>();

  tokens.forEach((token) => {
    tokenCounts.set(
      token,
      (tokenCounts.get(token) || 0) + 1
    );
  });

  queryTerms.forEach((term) => {
    if (tokenCounts.has(term)) {
      const tf = tokenCounts.get(term)!;

      score += 1 + Math.log(tf + 1);
    }
  });

  return score;
}

export async function retrieveRelevantChunks(
  question: string,
  topK = 5
): Promise<RetrievedChunk[]> {

  const start = Date.now();

  const queryTerms = tokenize(question);

  if (
    question.toLowerCase().includes('course') ||
    question.toLowerCase().includes('program') ||
    question.toLowerCase().includes('degree')
  ) {
    queryTerms.push('btech', 'mtech', 'mba', 'mca', 'programs');
  }

  const expanded = expandTerms(queryTerms);
  const phrases = getPhrasesFromQuestion(question);

  console.log('\n=========================');
  console.log('QUESTION:', question);
  console.log('QUERY TERMS:', queryTerms);
  console.log('EXPANDED TERMS:', expanded);
  console.log('PHRASES:', phrases);
  console.log('=========================\n');

  const chunks =
    await prisma.documentChunk.findMany({
      include: {
        document: {
          select: {
            name: true,
            status: true
          }
        }
      },
      where: {
        document: {
          status: 'PROCESSED'
        }
      }
    });

  if (chunks.length === 0) {
    return [];
  }

  const scored = chunks.map((chunk) => {
    const tokens = tokenize(chunk.content);
    let score = tfScore(tokens, expanded);

    const content = chunk.content.toLowerCase();
    const fileName = chunk.document.name.toLowerCase();

    expanded.forEach((term) => {
      if (fileName.includes(term)) score += 6;
      if (content.includes(term)) score += 0.75;
    });

    score += phraseScore(content, phrases);

    if (content.includes(question.toLowerCase())) score += 12;

    return {
      content: chunk.content,
      documentName: chunk.document.name,
      score,
      chunkIndex: chunk.chunkIndex
    };
  });

  const results = scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, Math.max(3, topK));

  console.log('\n===== TOP RESULTS =====');

  results.forEach((result, index) => {
    console.log(`\n#${index + 1}`);
    console.log(
      'Document:',
      result.documentName
    );
    console.log(
      'Score:',
      result.score
    );
    console.log(
      'Chunk:',
      result.chunkIndex
    );
    console.log(
      result.content
        .substring(0, 250)
        .replace(/\n/g, ' ')
    );
  });

  console.log('\n=======================\n');

  console.log('retrieval_time_ms=', Date.now() - start);

  return results.slice(0, 3);
}

export function buildContext(chunks: RetrievedChunk[], maxChars = 3000): string {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const chunk of chunks) {
    const sentences = chunk.content.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    for (const s of sentences) {
      const key = s.toLowerCase().replace(/\s+/g, ' ').slice(0, 300);
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(s);
      const joined = parts.join(' ');
      if (joined.length >= maxChars) return joined.slice(0, maxChars);
    }
  }

  return parts.join(' ');
}

export function buildAnswer(
  question: string,
  chunks: RetrievedChunk[]
): string {

  if (chunks.length === 0) {
    return 'I could not find that information in the uploaded university documents.';
  }

  return chunks.slice(0, 3).map((c) => `Source: ${c.documentName} (chunk ${c.chunkIndex})\n${c.content}`).join('\n\n');
}