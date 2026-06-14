import { prisma } from '../config/database';
import { getEmbedding } from '../services/embedding';

async function runTest() {
  console.log('[Test Vector Storage] Starting tests...');

  try {
    // 1. Fetch a test chunk from the database
    const chunk = await prisma.documentChunk.findFirst();

    if (!chunk) {
      console.log('⚠️ [Test Vector Storage] No chunks found in the database. Please process a document first to run this test.');
      return;
    }

    console.log(`[Test Vector Storage] Found test chunk ID: ${chunk.id}`);
    console.log(`[Test Vector Storage] Content: "${chunk.content.substring(0, 100)}..."`);

    // 2. Generate embedding vector
    console.log('[Test Vector Storage] Generating embedding...');
    const embedding = await getEmbedding(chunk.content);
    console.log(`[Test Vector Storage] Generated vector length locally: ${embedding.length}`);

    // 3. Store vector in database
    console.log('[Test Vector Storage] Storing vector in database...');
    const vectorString = `[${embedding.join(',')}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      chunk.id
    );
    console.log('✅ Embedding stored successfully.');

    // 4. Verify embedding length using SQL vector_dims
    console.log('[Test Vector Storage] Verifying vector dimension in DB...');
    const verification = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, vector_dims(embedding) as dims FROM document_chunks WHERE id = $1`,
      chunk.id
    );

    const dims = verification?.[0]?.dims;
    console.log(`[Test Vector Storage] DB Vector Dimension: ${dims}`);

    if (dims === 768) {
      console.log('✅ Success: DB vector length is exactly 768!');
    } else {
      console.log(`❌ Failure: Expected DB vector length 768, but got ${dims}`);
      process.exit(1);
    }

    // 5. Verify similarity search works via raw SQL using <=> (cosine distance)
    console.log('[Test Vector Storage] Testing similarity query via Cosine Distance...');
    const searchResults = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, content, 1 - (embedding <=> $1::vector) as similarity 
       FROM document_chunks 
       WHERE embedding IS NOT NULL 
       ORDER BY embedding <=> $1::vector 
       LIMIT 3`,
      vectorString
    );

    console.log('\n--- Cosine Similarity Search Results ---');
    searchResults.forEach((res, index) => {
      console.log(`#${index + 1} - ID: ${res.id}`);
      console.log(`     Similarity: ${(res.similarity * 100).toFixed(2)}%`);
      console.log(`     Snippet: "${res.content.substring(0, 80)}..."`);
    });
    console.log('----------------------------------------\n');

    if (searchResults.length > 0) {
      console.log('✅ Success: Similarity search retrieval is working perfectly!');
    } else {
      console.log('❌ Failure: No similarity results returned.');
      process.exit(1);
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ [Test Vector Storage] Test failed:', errorMsg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
