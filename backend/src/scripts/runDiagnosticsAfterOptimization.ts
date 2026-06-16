import 'dotenv/config';
import { retrieveRelevantChunks } from '../services/retrieval';

const queries = [
  'Tell me about B.Tech CSE',
  'Tell me about B.Tech IT',
  'Tell me about MCA',
  'What are the placements for B.Tech CSE?',
  'What are the fees for B.Tech IT?'
];

async function main() {
  console.log('--- RETRIEVAL DIAGNOSTICS AFTER RAG COURSE OPTIMIZATION ---\n');

  for (const q of queries) {
    console.log('================================================================================');
    console.log(`QUERY: "${q}"`);
    console.log('================================================================================');

    const chunks = await retrieveRelevantChunks(q, 8);
    console.log(`\nSelected Context Chunks Count: ${chunks.length}`);
    chunks.forEach((chunk, index) => {
      console.log(`[Rank #${index + 1}] Document: ${chunk.documentName} | Chunk: ${chunk.chunkIndex} | Hybrid Score: ${chunk.hybridScore.toFixed(4)}`);
      console.log(`  Snippet: "${chunk.content.substring(0, 160).replace(/\n/g, ' ')}..."\n`);
    });
    console.log('\n');
  }
}

main().catch(console.error);
