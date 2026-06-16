import 'dotenv/config';
import { retrieveRelevantChunks } from '../services/retrieval';

async function main() {
  console.log("=== BEFORE CHANGE DIAGNOSTICS: 'What courses are available?' ===");
  const chunks = await retrieveRelevantChunks("What courses are available?", 8);
  console.log(`\nSelected Context Chunks Count: ${chunks.length}`);
  chunks.forEach((chunk, index) => {
    console.log(`[Rank #${index + 1}] Document: ${chunk.documentName} | Chunk: ${chunk.chunkIndex} | Hybrid Score: ${chunk.hybridScore.toFixed(4)}`);
    console.log(`  Snippet: "${chunk.content.substring(0, 160).replace(/\n/g, ' ')}..."\n`);
  });
}

main().catch(console.error);
