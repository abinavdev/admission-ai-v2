import { prisma } from '../config/database';
import { getEmbedding } from '../services/embedding';

const BATCH_SIZE = 2; // Process 2 chunks at a time to prevent rate limits
const DELAY_BETWEEN_BATCHES_MS = 1500; // Delay of 1500ms between batches to stay under 100 RPM

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfill() {
  const startTime = Date.now();
  console.log('[Backfill] Starting embedding backfill process...');

  try {
    // 1. Fetch chunks where embedding is NULL using raw SQL since Prisma ignores Unsupported fields
    const chunks = await prisma.$queryRawUnsafe<{ id: string; content: string }[]>(
      `SELECT id, content FROM document_chunks WHERE embedding IS NULL`
    );

    const totalChunks = chunks.length;
    console.log(`[Backfill] Found ${totalChunks} chunks needing embeddings.`);

    if (totalChunks === 0) {
      console.log('[Backfill] All chunks already have embeddings. Nothing to do!');
      return;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalChunks; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      console.log(`[Backfill] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(totalChunks / BATCH_SIZE)} (chunks ${i + 1} to ${Math.min(i + BATCH_SIZE, totalChunks)})...`);

      // Process batch concurrently
      await Promise.all(
        batch.map(async (chunk) => {
          try {
            // Generate embedding
            const embedding = await getEmbedding(chunk.content);

            // Format as string representation of vector, e.g. '[0.1,0.2,...]'
            const vectorString = `[${embedding.join(',')}]`;

            // Update record in database using raw SQL
            await prisma.$executeRawUnsafe(
              `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
              vectorString,
              chunk.id
            );

            processedCount++;
          } catch (err) {
            failedCount++;
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`[Backfill] Failed to process chunk ID ${chunk.id}:`, errorMsg);
          }
        })
      );

      // Apply rate-limit delay between batches (if not the last batch)
      if (i + BATCH_SIZE < totalChunks) {
        await delay(DELAY_BETWEEN_BATCHES_MS);
      }
    }

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n--- Backfill Summary ---');
    console.log(`Total Chunks: ${totalChunks}`);
    console.log(`Successfully Processed Chunks: ${processedCount}`);
    console.log(`Failed Chunks: ${failedCount}`);
    console.log(`Elapsed Time: ${elapsedTime}s`);
    console.log('------------------------\n');

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Backfill] Critical error during backfill execution:', errorMsg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
