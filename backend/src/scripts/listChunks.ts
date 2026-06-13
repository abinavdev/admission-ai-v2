import 'dotenv/config';
import { prisma } from '../config/database';

async function run() {
  const chunks = await prisma.documentChunk.findMany({
    take: 20,
    include: { document: { select: { id: true, name: true, status: true } } }
  });

  console.log('TOTAL CHUNKS FOUND:', chunks.length);
  chunks.forEach((c, i) => {
    console.log(`\n#${i + 1} Document: ${c.document.name} (status: ${c.document.status}) chunkIndex: ${c.chunkIndex}`);
    console.log(c.content.substring(0, 400).replace(/\n/g, ' '));
  });
}

run().catch((e) => {
  console.error('Error listing chunks', e);
  process.exit(1);
});
