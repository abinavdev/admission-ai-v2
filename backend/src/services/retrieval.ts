import { prisma } from '../config/database';
import { semanticSearch } from './vectorSearch';

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
  documentId: string;
  semanticScore: number;
  keywordScore: number;
  hybridScore: number;
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

  // 1. Keyword search (TF scoring)
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

  const dbChunks = await prisma.documentChunk.findMany({
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

  const keywordMap = new Map<string, any>();
  let maxKeywordScore = 0;

  dbChunks.forEach((chunk) => {
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

    if (score > 0) {
      if (score > maxKeywordScore) {
        maxKeywordScore = score;
      }
      keywordMap.set(chunk.id, {
        id: chunk.id,
        content: chunk.content,
        documentName: chunk.document.name,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        keywordScore: score
      });
    }
  });

  // 2. Semantic search
  let semanticResults: any[] = [];
  try {
    semanticResults = await semanticSearch(question, 20);
  } catch (err) {
    console.error('[Hybrid Retrieval] Semantic search failed, falling back to keyword search only:', err);
  }

  const semanticMap = new Map<string, any>();
  semanticResults.forEach((res) => {
    semanticMap.set(res.id, res);
  });

  // 3. Merge results and calculate hybrid scores
  const allChunkIds = new Set<string>([
    ...keywordMap.keys(),
    ...semanticMap.keys()
  ]);

  const hybridResults: RetrievedChunk[] = [];

  allChunkIds.forEach((id) => {
    const keywordInfo = keywordMap.get(id);
    const semanticInfo = semanticMap.get(id);

    const content = keywordInfo?.content || semanticInfo?.content || '';
    const documentName = keywordInfo?.documentName || '';
    const documentId = keywordInfo?.documentId || semanticInfo?.documentId || '';
    const chunkIndex = keywordInfo?.chunkIndex !== undefined ? keywordInfo.chunkIndex : (semanticInfo?.chunkIndex || 0);

    const keywordScore = keywordInfo?.keywordScore || 0;
    const semanticScore = semanticInfo?.similarity || 0;

    // Normalize keyword score to [0, 1]
    const normalizedKeywordScore = maxKeywordScore > 0 ? keywordScore / maxKeywordScore : 0;

    // Calculate hybrid score: 0.7 * semantic + 0.3 * keyword
    const hybridScore = 0.7 * semanticScore + 0.3 * normalizedKeywordScore;

    // Resolve documentName if it was only in semantic search and not in keywordMap
    let resolvedDocumentName = documentName;
    if (!resolvedDocumentName) {
      const match = dbChunks.find((c) => c.id === id);
      resolvedDocumentName = match?.document.name || 'Unknown Document';
    }

    hybridResults.push({
      content,
      documentName: resolvedDocumentName,
      score: hybridScore, // maps to score for backwards compatibility
      chunkIndex,
      documentId,
      semanticScore,
      keywordScore,
      hybridScore
    });
  });

  // Sort by hybridScore descending and return top K
  const sorted = hybridResults.sort((a, b) => b.hybridScore - a.hybridScore);
  const results = sorted.slice(0, Math.max(3, topK));

  console.log('\n===== HYBRID TOP RESULTS =====');
  results.forEach((result, index) => {
    console.log(`\n#${index + 1}`);
    console.log('Document:', result.documentName);
    console.log(`Score (Hybrid): ${result.hybridScore.toFixed(4)} (Semantic: ${result.semanticScore.toFixed(4)}, Keyword: ${result.keywordScore.toFixed(4)})`);
    console.log('Chunk:', result.chunkIndex);
    console.log(result.content.substring(0, 250).replace(/\n/g, ' '));
  });
  console.log('\n===============================\n');
  console.log('retrieval_time_ms=', Date.now() - start);

  return results;
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