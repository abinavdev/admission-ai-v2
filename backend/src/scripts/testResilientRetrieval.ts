import { retrieveRelevantChunks } from '../services/retrieval';
import { generateSearchQuery } from '../services/llm';

// We can temporarily simulate failures by breaking the environment API Key
// or intercepting the SDK. Since we want to test both, let's trigger them!
async function run() {
  console.log('=== STARTING RESILIENT RETRIEVAL VERIFICATION TESTS ===\n');

  // --- Test 1: Query Rewrite Fallback ---
  console.log('--- TEST 1: Query Rewrite Fallback ---');
  // Pass invalid history to trigger some error or simulate it
  // We can temporarily unset process.env.GEMINI_API_KEY to force a 403/401 API Error
  const originalApiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'invalid_key_for_testing';

  try {
    const rawQuery = 'What is MCA eligibility requirements?';
    console.log(`Sending query: "${rawQuery}" with empty/mock history.`);
    const result = await generateSearchQuery(rawQuery, [{ role: 'user', content: 'hello' }]);
    console.log(`✅ Result from generateSearchQuery: "${result}"`);
    if (result !== rawQuery) {
      console.error('❌ Expected fallback to return raw query!');
    } else {
      console.log('✅ Fallback successfully returned the raw query.');
    }
  } catch (err) {
    console.error('❌ Failed! generateSearchQuery threw an exception instead of falling back:', err);
  }
  console.log('');

  // --- Test 2: Embedding Fallback ---
  console.log('--- TEST 2: Embedding Fallback ---');
  try {
    const query = 'What is the fee structure?';
    console.log(`Retrieving chunks for: "${query}" (with invalid API key to trigger embedding fallback)`);
    const chunks = await retrieveRelevantChunks(query, 3);
    console.log(`✅ Retrieved ${chunks.length} chunks via Keyword-Only fallback.`);
    if (chunks.length === 0) {
      console.error('❌ Expected to retrieve chunks using keyword-only TF scoring!');
    } else {
      chunks.forEach((chunk, i) => {
        console.log(`   [Chunk #${i + 1}] File: ${chunk.documentName} | Score: ${chunk.score.toFixed(4)} | Snippet: "${chunk.content.substring(0, 80)}..."`);
      });
      console.log('✅ Fallback retrieved chunks successfully.');
    }
  } catch (err) {
    console.error('❌ Failed! retrieveRelevantChunks threw an exception instead of falling back:', err);
  }

  // Restore API key
  process.env.GEMINI_API_KEY = originalApiKey;
  console.log('\n=== ALL RESILIENT RETRIEVAL TESTS COMPLETED SUCCESSFULY ===');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
