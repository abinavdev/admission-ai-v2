import { semanticSearch } from '../services/vectorSearch';

const testQueries = [
  'What can I study?',
  'Available programs',
  'Courses offered',
  'Hostel accommodation',
  'Scholarships'
];

async function run() {
  console.log('[Test Semantic Search] Starting search query tests...\n');

  for (const query of testQueries) {
    console.log(`=========================================`);
    console.log(`Query: "${query}"`);
    console.log(`=========================================`);

    try {
      const results = await semanticSearch(query, 3);
      if (results.length === 0) {
        console.log('⚠️ No results found. Make sure document chunks are stored and backfilled.');
      }

      results.forEach((res, index) => {
        console.log(`Match #${index + 1}:`);
        console.log(`  Similarity Score: ${(res.similarity * 100).toFixed(2)}%`);
        console.log(`  Document ID:      ${res.documentId}`);
        console.log(`  Chunk Index:      ${res.chunkIndex}`);
        console.log(`  Snippet:          "${res.content.replace(/\s+/g, ' ').substring(0, 160)}..."`);
        console.log();
      });
    } catch (e: any) {
      console.error(`❌ Search failed for query "${query}":`, e.message || e);
    }
  }
}

run();
