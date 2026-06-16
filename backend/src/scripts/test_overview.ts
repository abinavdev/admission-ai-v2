import 'dotenv/config';
import { prisma } from '../config/database';

async function main() {
  const doc = await prisma.document.findFirst({
    where: { name: 'courses_overview.txt' },
    include: { chunks: { orderBy: { chunkIndex: 'asc' } } }
  });

  if (!doc) {
    console.log("Document courses_overview.txt not found.");
    return;
  }

  console.log(`Document: ${doc.name} | Total Chunks: ${doc.chunks.length}`);
  doc.chunks.forEach((chunk) => {
    console.log(`Chunk Index: ${chunk.chunkIndex} | Size: ${chunk.content.length} chars`);
    console.log(`Snippet: "${chunk.content.substring(0, 150).replace(/\n/g, ' ')}..."\n`);
  });
}

main().catch(console.error);
