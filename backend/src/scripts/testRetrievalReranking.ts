import 'dotenv/config';
import { generateSearchQuery } from '../services/llm';
import { retrieveRelevantChunks } from '../services/retrieval';
import { prisma } from '../config/database';

const testQueries = [
  'Tell me about MCA',
  'Tell me about MBA',
  'What is the fee structure?',
  'What hostel facilities are available?'
];

async function run() {
  console.log('=== STARTING RETRIEVAL DIVERSITY & RERANKING TESTS ===\n');
  console.log(`RETRIEVAL_SCORE_THRESHOLD = ${process.env.RETRIEVAL_SCORE_THRESHOLD || '0.20'}`);
  console.log(`MAX_CHUNKS_PER_DOC = ${process.env.MAX_CHUNKS_PER_DOC || '2'}\n`);

  for (const q of testQueries) {
    console.log('----------------------------------------------------');
    console.log(`USER QUERY: "${q}"`);

    // Rewrite query
    const rewritten = await generateSearchQuery(q, []);
    console.log(`REWRITTEN QUERY: "${rewritten}"`);

    // Retrieve chunks (triggers logic and diagnostics inside retrieveRelevantChunks)
    const chunks = await retrieveRelevantChunks(rewritten, 8);
    console.log(`RETRIEVED CHUNKS COUNT: ${chunks.length}`);
    console.log('----------------------------------------------------\n');
  }

  await prisma.$disconnect();
  console.log('=== RETRIEVAL DIVERSITY & RERANKING TESTS COMPLETED ===');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
