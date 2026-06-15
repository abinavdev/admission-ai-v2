import 'dotenv/config';
import { generateSearchQuery } from '../services/llm';
import { retrieveRelevantChunks } from '../services/retrieval';

async function run() {
  const query = 'Tell me about MCA';
  console.log(`Input query: "${query}"`);

  // 1. Rewrite the query
  const rewritten = await generateSearchQuery(query, []);
  console.log(`Rewritten search query: "${rewritten}"`);

  // 2. Retrieve chunks
  console.log('\nRetrieving chunks...');
  const chunks = await retrieveRelevantChunks(rewritten, 8);

  console.log('\n--- RETRIEVED CHUNKS SUMMARY ---');
  chunks.forEach((chunk, index) => {
    console.log(`[Rank #${index + 1}] Document: ${chunk.documentName} | Chunk: ${chunk.chunkIndex} | Score: ${chunk.score.toFixed(4)}`);
  });
}

run().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
