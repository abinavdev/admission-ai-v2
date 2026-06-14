import { prisma } from '../config/database';
import { retrieveRelevantChunks } from '../services/retrieval';
import { semanticSearch } from '../services/vectorSearch';

// Re-implement keyword-only search logic locally for comparative purposes
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'about', 'and', 'or', 'but', 'not',
  'this', 'that', 'these', 'those', 'it', 'its', 'i', 'me', 'my',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
  'what', 'which', 'who', 'how', 'when', 'where', 'why', 'please',
  'tell', 'give', 'know', 'want', 'need', 'get',
  'available', 'information', 'details', 'guide'
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

async function getKeywordOnlyResults(question: string, limit = 3) {
  const queryTerms = tokenize(question);
  const dbChunks = await prisma.documentChunk.findMany({
    include: { document: true },
    where: { document: { status: 'PROCESSED' } }
  });

  const scored = dbChunks.map((chunk) => {
    let score = 0;
    const tokens = tokenize(chunk.content);
    queryTerms.forEach((term) => {
      const tf = tokens.filter(t => t === term).length;
      if (tf > 0) score += 1 + Math.log(tf + 1);
    });

    const content = chunk.content.toLowerCase();
    if (content.includes(question.toLowerCase())) score += 12;

    return {
      id: chunk.id,
      content: chunk.content,
      score
    };
  });

  return scored.filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

const testQueries = [
  'What can I study?',
  'Programs available',
  'Hostel accommodation',
  'Scholarships',
  'Fee payment'
];

async function run() {
  console.log('[Test Hybrid Retrieval] Starting comparison tests across retrieval modes...\n');

  for (const query of testQueries) {
    console.log(`================================================================================`);
    console.log(`QUERY: "${query}"`);
    console.log(`================================================================================`);

    // 1. Keyword-Only Results
    console.log('\n--- 🔑 KEYWORD-ONLY SEARCH ---');
    try {
      const kwResults = await getKeywordOnlyResults(query, 2);
      if (kwResults.length === 0) {
        console.log('  (No matches)');
      }
      kwResults.forEach((res, i) => {
        console.log(`  [Match #${i+1}] Score: ${res.score.toFixed(2)} | Snippet: "${res.content.replace(/\s+/g, ' ').substring(0, 100)}..."`);
      });
    } catch (e: any) {
      console.log('  ❌ Keyword search error:', e.message || e);
    }

    // 2. Semantic-Only Results
    console.log('\n--- 🧠 SEMANTIC-ONLY SEARCH ---');
    try {
      const semResults = await semanticSearch(query, 2);
      if (semResults.length === 0) {
        console.log('  (No matches)');
      }
      semResults.forEach((res, i) => {
        console.log(`  [Match #${i+1}] Similarity: ${(res.similarity * 100).toFixed(2)}% | Snippet: "${res.content.replace(/\s+/g, ' ').substring(0, 100)}..."`);
      });
    } catch (e: any) {
      console.log('  ❌ Semantic search error:', e.message || e);
    }

    // 3. Hybrid Results
    console.log('\n--- 🔀 HYBRID SEARCH (0.7 * Semantic + 0.3 * Keyword) ---');
    try {
      const hybridResults = await retrieveRelevantChunks(query, 2);
      if (hybridResults.length === 0) {
        console.log('  (No matches)');
      }
      hybridResults.forEach((res, i) => {
        console.log(`  [Match #${i+1}] Hybrid Score: ${res.hybridScore.toFixed(4)} (Sem: ${res.semanticScore.toFixed(4)}, Kw: ${res.keywordScore.toFixed(4)})`);
        console.log(`               Snippet: "${res.content.replace(/\s+/g, ' ').substring(0, 100)}..."`);
      });
    } catch (e: any) {
      console.log('  ❌ Hybrid search error:', e.message || e);
    }
    console.log('\n');
  }

  await prisma.$disconnect();
}

run();
