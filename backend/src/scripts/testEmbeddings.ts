import { getEmbedding } from '../services/embedding';

async function test() {
  const sampleText = "Cochin University of Science and Technology offers world-class postgraduate programs.";
  console.log('Generating embedding for:', `"${sampleText}"`);

  try {
    const embedding = await getEmbedding(sampleText);

    console.log('\n--- Test Results ---');
    console.log('Embedding Length:', embedding.length);
    console.log('First 5 Values:', embedding.slice(0, 5));

    if (embedding.length === 768) {
      console.log('✅ Success: Embedding length is exactly 768!');
    } else {
      console.log(`❌ Failure: Expected embedding length 768, but got ${embedding.length}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test script failed:', err);
    process.exit(1);
  }
}

test();
