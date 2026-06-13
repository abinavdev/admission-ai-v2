import 'dotenv/config';
import { retrieveRelevantChunks } from '../services/retrieval';

const queries = [
  'What courses are available?',
  'What scholarships are available?',
  'What hostel facilities are available?',
  'Can OEC students get benefits?',
  'What is the fee structure?',
  'What is the eligibility for B.Tech Computer Science and Engineering?'
];

async function run() {
  for (const q of queries) {
    console.log('\n==============================================');
    console.log('QUERY:', q);
    const results = await retrieveRelevantChunks(q, 8);
    console.log('TOP CHUNKS:', results.length);
    results.forEach((r, i) => {
      console.log(`\n#${i + 1} - Document: ${r.documentName} - chunk: ${r.chunkIndex} - score: ${r.score}`);
      console.log(r.content.substring(0, 400).replace(/\n/g, ' '));
    });
    console.log('==============================================\n');
  }
}

run().catch((e) => {
  console.error('Test retrieval failed:', e);
  process.exit(1);
});
