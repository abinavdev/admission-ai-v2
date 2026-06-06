import { prisma } from '../config/database';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'about', 'and', 'or', 'but', 'not',
  'this', 'that', 'these', 'those', 'it', 'its', 'i', 'me', 'my',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  'what', 'which', 'who', 'how', 'when', 'where', 'why', 'please',
  'tell', 'give', 'know', 'want', 'need', 'get',
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
      // count occurrences for term frequency
      const tf = tokens.filter((t) => t === term).length;
      score += 1 + Math.log(tf + 1);
    }
    // partial match: any token starts with the query term (handles plurals/suffixes)
    for (const token of tokenSet) {
      if (token !== term && token.startsWith(term) && term.length >= 4) {
        score += 0.5;
        break;
      }
    }
  }
  // boost score by match coverage (how many query terms matched)
  const matched = queryTerms.filter((t) => tokenSet.has(t) || [...tokenSet].some((tok) => tok.startsWith(t) && t.length >= 4)).length;
  const coverage = matched / queryTerms.length;
  return score * (0.5 + coverage);
}

export async function retrieveRelevantChunks(
  question: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const queryTerms = tokenize(question);
  if (queryTerms.length === 0) return [];

  // Fetch all chunks with their parent document names
  const chunks = await prisma.documentChunk.findMany({
    include: { document: { select: { name: true, status: true } } },
    where: { document: { status: 'PROCESSED' } },
  });

  if (chunks.length === 0) return [];

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

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildAnswer(question: string, chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "I could not find that information in the uploaded university documents. Please contact the admissions office for confirmation.";
  }

  const sources = [...new Set(chunks.map((c) => c.documentName))];
  const context = chunks.map((c) => c.content).join('\n\n---\n\n');

  // Construct a direct answer from the retrieved content
  const sourceNote = sources.length === 1
    ? `Source: ${sources[0]}`
    : `Sources: ${sources.join(', ')}`;

  return buildResponseFromContext(question, context, sourceNote);
}

function buildResponseFromContext(question: string, context: string, sourceNote: string): string {
  const lq = question.toLowerCase();

  // Extract meaningful sentences from context that match the question
  const sentences = context
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const queryTerms = tokenize(question);
  const relevantSentences = sentences
    .map((s) => ({ s, score: tfScore(tokenize(s), queryTerms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.s);

  if (relevantSentences.length === 0) {
    // Fall back to first chunk paragraph summary
    const summary = context.substring(0, 600).replace(/---/g, '').trim();
    return `Based on the uploaded university documents:\n\n${summary}\n\n${sourceNote}`;
  }

  // Build topic-appropriate response
  let intro = 'Based on the uploaded university documents:';
  if (lq.includes('eligib') || lq.includes('require') || lq.includes('qualify')) {
    intro = 'According to the uploaded documents, the eligibility criteria are:';
  } else if (lq.includes('fee') || lq.includes('cost') || lq.includes('tuition')) {
    intro = 'According to the uploaded documents, the fee information is:';
  } else if (lq.includes('course') || lq.includes('program') || lq.includes('offer')) {
    intro = 'According to the uploaded documents, the available programs include:';
  } else if (lq.includes('hostel') || lq.includes('accommodation') || lq.includes('stay')) {
    intro = 'According to the uploaded documents, the hostel information is:';
  } else if (lq.includes('scholarship') || lq.includes('financial') || lq.includes('merit')) {
    intro = 'According to the uploaded documents, scholarship information:';
  } else if (lq.includes('placement') || lq.includes('job') || lq.includes('career')) {
    intro = 'According to the uploaded documents, placement information:';
  } else if (lq.includes('apply') || lq.includes('admission') || lq.includes('process')) {
    intro = 'According to the uploaded documents, the admission process:';
  }

  const body = relevantSentences.slice(0, 6).join('\n');
  return `${intro}\n\n${body}\n\n${sourceNote}`;
}
