import { buildAnswer, RetrievedChunk } from '../services/retrieval';

const mockChunks: RetrievedChunk[] = [
  {
    content: 'Semester fees for MCA are ₹25,000.',
    documentName: 'fees.txt',
    score: 0.8,
    chunkIndex: 0,
    documentId: 'doc1',
    semanticScore: 0.8,
    keywordScore: 0.8,
    hybridScore: 0.8
  },
  {
    content: 'Hostel fees are ₹3,000 per month.',
    documentName: 'fees.txt',
    score: 0.75,
    chunkIndex: 1,
    documentId: 'doc1',
    semanticScore: 0.75,
    keywordScore: 0.75,
    hybridScore: 0.75
  },
  {
    content: 'B.Tech duration is 4 years at CUSAT.',
    documentName: 'courses.txt',
    score: 0.7,
    chunkIndex: 0,
    documentId: 'doc2',
    semanticScore: 0.7,
    keywordScore: 0.7,
    hybridScore: 0.7
  },
  {
    content: 'Semester fees for MCA are ₹25,000.', // duplicate sentence
    documentName: 'fees.txt',
    score: 0.65,
    chunkIndex: 2,
    documentId: 'doc1',
    semanticScore: 0.65,
    keywordScore: 0.65,
    hybridScore: 0.65
  }
];

async function run() {
  console.log('=== RUNNING FALLBACK FORMATTING TEST ===\n');

  const answer = buildAnswer('What are the fees?', mockChunks);

  console.log('--- GENERATED FALLBACK RESPONSE ---');
  console.log(answer);
  console.log('\n========================================');
}

run();
