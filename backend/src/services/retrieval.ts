import { prisma } from '../config/database';
import { semanticSearch } from './vectorSearch';
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
  coursewise: ['programs', 'btech', 'mtech'],
  // Synonym expansion for course abbreviations to map to full text content
  cse: ['computer', 'science', 'engineering'],
  it: ['information', 'technology'],
  ece: ['electronics', 'communication'],
  eee: ['electrical', 'electronics'],
  mca: ['computer', 'applications'],
  mba: ['business', 'administration']
};

export const COURSE_DOCUMENT_MAP: Record<string, { docName: string; keywords: string[] }> = {
  cse: {
    docName: 'btech_cse_cusat.txt',
    keywords: ['cse', 'computer science']
  },
  it: {
    docName: 'btech_it_cusat.txt',
    keywords: ['it', 'information technology']
  },
  ece: {
    docName: 'btech_ece_cusat.txt',
    keywords: ['ece', 'electronics and communication', 'electronics & communication']
  },
  eee: {
    docName: 'btech_eee_cusat.txt',
    keywords: ['eee', 'electrical and electronics', 'electrical & electronics']
  },
  civil: {
    docName: 'btech_civil_cusat.txt',
    keywords: ['civil']
  },
  mechanical: {
    docName: 'btech_mechanical_cusat.txt',
    keywords: ['mechanical', 'mech']
  },
  marine: {
    docName: 'btech_marine_engineering_cusat.txt',
    keywords: ['marine']
  },
  safety: {
    docName: 'btech_safety_fire_cusat.txt',
    keywords: ['safety', 'fire', 'safety & fire']
  },
  ai: {
    docName: 'btech_ai_ds_cusat.txt',
    keywords: ['ai', 'artificial intelligence', 'data science', 'ds']
  },
  chemistry: {
    docName: 'msc_chemistry_cusat.txt',
    keywords: ['chemistry']
  },
  biology: {
    docName: 'msc_marine_biology_cusat.txt',
    keywords: ['marine biology', 'biology']
  },
  mathematics: {
    docName: 'msc_mathematics_cusat.txt',
    keywords: ['mathematics', 'maths', 'math']
  },
  biotechnology: {
    docName: 'msc_biotechnology_cusat.txt',
    keywords: ['biotechnology', 'biotech']
  },
  llb: {
    docName: 'bsc_llb_computer_science_cusat.txt',
    keywords: ['bsc llb', 'computer science llb']
  },
  bba_llb: {
    docName: 'bba_llb_cusat.txt',
    keywords: ['bba llb', 'bba law']
  },
  bcom_llb: {
    docName: 'bcom_llb_cusat.txt',
    keywords: ['bcom llb', 'bcom law']
  },
  mca: {
    docName: 'courses_overview.txt',
    keywords: ['mca', 'computer applications']
  },
  mba: {
    docName: 'courses_overview.txt',
    keywords: ['mba', 'business administration']
  },
  naval: {
    docName: 'btech_naval_architecture_cusat.txt',
    keywords: ['naval', 'naval architecture', 'ship building']
  }
};

export function detectCourseDocument(question: string): string | null {
  const lowercaseQuestion = question.toLowerCase();
  
  for (const entry of Object.values(COURSE_DOCUMENT_MAP)) {
    for (const kw of entry.keywords) {
      if (kw.length <= 3) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(lowercaseQuestion)) {
          return entry.docName;
        }
      } else {
        if (lowercaseQuestion.includes(kw)) {
          return entry.docName;
        }
      }
    }
  }
  
  return null;
}

export function isCourseSpecificDocument(docName: string): boolean {
  const name = docName.toLowerCase();
  
  // 1. Prefix-based check for general scaling and new course files
  if (name.startsWith('btech_') || 
      name.startsWith('msc_') || 
      name.startsWith('bsc_') || 
      name.startsWith('bba_') || 
      name.startsWith('bcom_')) {
    return true;
  }
  
  // 2. Map-based check for any other mapped document (excluding courses_overview.txt)
  for (const entry of Object.values(COURSE_DOCUMENT_MAP)) {
    if (entry.docName === docName && docName !== 'courses_overview.txt') {
      return true;
    }
  }
  return false;
}

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
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Hybrid Retrieval] Semantic search failed, falling back to keyword search only:', errorMsg);
    console.log(`[Embedding Fallback Activated] Reason: ${errorMsg}`);
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

  // Filter by score threshold
  const threshold = env.RETRIEVAL_SCORE_THRESHOLD !== undefined ? env.RETRIEVAL_SCORE_THRESHOLD : 0.20;
  const maxChunksPerDoc = env.MAX_CHUNKS_PER_DOC !== undefined ? env.MAX_CHUNKS_PER_DOC : 2;

  const chunksBeforeFiltering = hybridResults.length;
  const filteredResults = hybridResults.filter(r => r.hybridScore >= threshold);
  const chunksAfterFiltering = filteredResults.length;
  const removedResults = hybridResults.filter(r => r.hybridScore < threshold);
  const chunksRemoved = removedResults.length;

  console.log(`[Retrieval Diagnostics] Chunks Before Filtering: ${chunksBeforeFiltering}`);
  console.log(`[Retrieval Diagnostics] Chunks After Filtering: ${chunksAfterFiltering}`);
  console.log(`[Retrieval Diagnostics] Chunks Removed By Threshold: ${chunksRemoved}`);

  // Group remaining chunks by document
  const docsMap = new Map<string, RetrievedChunk[]>();
  filteredResults.forEach(chunk => {
    const docName = chunk.documentName;
    if (!docsMap.has(docName)) {
      docsMap.set(docName, []);
    }
    docsMap.get(docName)!.push(chunk);
  });

  // Sort each document's chunks by score descending
  const docSummaries: { docName: string; maxScore: number; chunks: RetrievedChunk[] }[] = [];
  docsMap.forEach((chunks, docName) => {
    const sortedChunks = chunks.sort((a, b) => b.hybridScore - a.hybridScore);
    const maxScore = sortedChunks[0]?.hybridScore || 0;
    docSummaries.push({ docName, maxScore, chunks: sortedChunks });
  });

  // Rank documents by highest chunk score descending
  docSummaries.sort((a, b) => b.maxScore - a.maxScore);

  // Round-robin selection limiting chunks per document
  const selectedChunks: RetrievedChunk[] = [];
  const limit = Math.max(3, topK);

  // 1. Adaptive Course Routing: Detect specific course tags dynamically using COURSE_DOCUMENT_MAP
  const primaryDocName = detectCourseDocument(question) || '';

  // 2. Prioritize up to 4 chunks from the primary matching document if confidently detected
  if (primaryDocName) {
    const primaryDoc = docSummaries.find(d => d.docName === primaryDocName);
    if (primaryDoc) {
      const primaryChunksToTake = primaryDoc.chunks.slice(0, 4);
      selectedChunks.push(...primaryChunksToTake);
      // Remove these chunks from docSummaries list so they aren't round-robined/duplicated
      primaryDoc.chunks = primaryDoc.chunks.slice(4);
    }
  }

  // 3. Fall back to standard round-robin for the remaining slots (supporting files: fees, hostel, etc.)
  for (let chunkIndex = 0; chunkIndex < maxChunksPerDoc; chunkIndex++) {
    for (const doc of docSummaries) {
      if (selectedChunks.length >= limit) {
        break;
      }
      // If a specific course document was confidently detected, skip chunks from other course-specific documents
      if (primaryDocName && doc.docName !== primaryDocName && isCourseSpecificDocument(doc.docName)) {
        continue;
      }
      if (chunkIndex < doc.chunks.length) {
        selectedChunks.push(doc.chunks[chunkIndex]);
      }
    }
    if (selectedChunks.length >= limit) {
      break;
    }
  }

  // Diagnostics print
  const selectedDocs = new Set(selectedChunks.map(c => c.documentName));

  console.log('\nSelected Documents:');
  selectedDocs.forEach(doc => {
    console.log(`* ${doc}`);
  });

  console.log('\nChunks Removed By Threshold:');
  if (removedResults.length === 0) {
    console.log('(none)');
  } else {
    removedResults.sort((a, b) => b.hybridScore - a.hybridScore).forEach(r => {
      console.log(`* Document: ${r.documentName} | Chunk: ${r.chunkIndex} | Score: ${r.hybridScore.toFixed(4)} (below threshold ${threshold.toFixed(2)})`);
    });
  }

  console.log('\nFinal Context Chunks:');
  selectedChunks.forEach((c, i) => {
    console.log(`* Rank #${i + 1} | Document: ${c.documentName} | Chunk: ${c.chunkIndex} | Score: ${c.hybridScore.toFixed(4)} | Text: "${c.content.substring(0, 100).replace(/\n/g, ' ')}..."`);
  });

  console.log('\n===============================\n');
  console.log('retrieval_time_ms=', Date.now() - start);

  return selectedChunks;
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

  const docOrder: string[] = [];
  const groups = new Map<string, string[]>();

  for (const chunk of chunks) {
    const docName = chunk.documentName;
    if (!groups.has(docName)) {
      groups.set(docName, []);
      docOrder.push(docName);
    }
    groups.get(docName)!.push(chunk.content);
  }

  const parts: string[] = [];
  const seen = new Set<string>();

  for (const docName of docOrder) {
    const contents = groups.get(docName) || [];
    const docParts: string[] = [];
    for (const content of contents) {
      const sentences = content.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
      for (const s of sentences) {
        const key = s.toLowerCase().replace(/\s+/g, ' ').slice(0, 300);
        if (seen.has(key)) continue;
        seen.add(key);
        docParts.push(s);
      }
    }
    if (docParts.length > 0) {
      parts.push(`Source: ${docName}\n${docParts.join(' ')}`);
    }
  }

  return `I'm currently using information directly from the university knowledge base:\n\n` + parts.join('\n\n');
}