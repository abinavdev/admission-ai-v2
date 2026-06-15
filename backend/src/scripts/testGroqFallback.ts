import { prisma } from '../config/database';
import { askQuestion } from '../controllers/chat';
import { geminiConfig, generateSearchQuery } from '../services/llm';
import { groqConfig } from '../services/groq';

// Helper to mock Express Response
function createMockResponse() {
  let responseData: any = null;
  let statusSet = 200;

  const res = {
    status(code: number) {
      statusSet = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    }
  } as any;

  return {
    res,
    getData: () => responseData,
    getStatus: () => statusSet
  };
}

async function run() {
  console.log('=== STARTING GROQ LLM FALLBACK VERIFICATION TESTS ===\n');

  let conversationId: string | undefined = undefined;

  try {
    // ==========================================
    // TEST 0: Query Rewrite Refinement Tests
    // ==========================================
    console.log('--- TEST 0: Query Rewrite Refinement Tests ---');
    geminiConfig.simulateFailure = false;
    groqConfig.simulateFailure = false;

    // Sub-test 1: Broad query exact match
    const q1 = await generateSearchQuery('mca', []);
    console.log(`Query: "mca" -> Rewritten: "${q1}"`);
    if (q1 === 'MCA course details duration eligibility fees placements admission') {
      console.log('✅ Sub-test 1 Success!');
    } else {
      console.error('❌ Sub-test 1 Failed!');
    }

    // Sub-test 2: Broad query prefix match
    const q2 = await generateSearchQuery('tell me about mca', []);
    console.log(`Query: "tell me about mca" -> Rewritten: "${q2}"`);
    if (q2 === 'MCA course details duration eligibility fees placements admission') {
      console.log('✅ Sub-test 2 Success!');
    } else {
      console.error('❌ Sub-test 2 Failed!');
    }

    // Sub-test 3: History-based follow-up query rewrite (eligibility)
    const q3 = await generateSearchQuery('what is its eligibility?', [
      { role: 'user', content: 'What is MCA?' },
      { role: 'assistant', content: 'MCA is Master of Computer Applications.' }
    ]);
    console.log(`Query: "what is its eligibility?" with history MCA -> Rewritten: "${q3}"`);
    if ((q3.toLowerCase().includes('mca') || q3.toLowerCase().includes('computer applications')) && q3.toLowerCase().includes('eligibility')) {
      console.log('✅ Sub-test 3 Success!');
    } else {
      console.error('❌ Sub-test 3 Failed!');
    }

    // Sub-test 4: History-based follow-up query rewrite (placements)
    const q4 = await generateSearchQuery('what about placements?', [
      { role: 'user', content: 'What is MCA?' },
      { role: 'assistant', content: 'MCA is Master of Computer Applications.' }
    ]);
    console.log(`Query: "what about placements?" with history MCA -> Rewritten: "${q4}"`);
    if (q4.toLowerCase().includes('mca') && q4.toLowerCase().includes('placement')) {
      console.log('✅ Sub-test 4 Success!');
    } else {
      console.error('❌ Sub-test 4 Failed!');
    }

    // Sub-test 5: Self-contained query unchanged
    const q5 = await generateSearchQuery('what are MCA fees?', []);
    console.log(`Query: "what are MCA fees?" -> Rewritten: "${q5}"`);
    if (q5 === 'what are MCA fees?') {
      console.log('✅ Sub-test 5 Success!');
    } else {
      console.error('❌ Sub-test 5 Failed!');
    }
    console.log('\n-------------------------------------------\n');

    // ==========================================
    // TEST 1: Normal Flow (Gemini works)
    // ==========================================
    console.log('--- TEST 1: Normal Flow (Gemini active) ---');
    geminiConfig.simulateFailure = false;
    groqConfig.simulateFailure = false;

    const req1 = {
      body: {
        question: 'What is the eligibility criteria for MCA course?'
      }
    } as any;
    const mock1 = createMockResponse();

    await askQuestion(req1, mock1.res);
    const res1 = mock1.getData();

    if (res1 && res1.success) {
      console.log('✅ TEST 1 Success! Gemini responded successfully.');
      console.log(`Provider: Gemini (Success)`);
      console.log(`Answer Snippet: "${res1.data.answer.substring(0, 150)}..."`);
      conversationId = res1.data.conversationId;
    } else {
      console.error('❌ TEST 1 Failed:', res1);
    }
    console.log('\n-------------------------------------------\n');


    // ==========================================
    // TEST 2: Secondary Fallback Flow (Gemini fails -> Groq succeeds)
    // ==========================================
    console.log('--- TEST 2: Groq Fallback Flow (Gemini broken) ---');
    geminiConfig.simulateFailure = true;
    groqConfig.simulateFailure = false;

    const req2 = {
      body: {
        question: 'What is the duration of MCA program?',
        conversationId
      }
    } as any;
    const mock2 = createMockResponse();

    await askQuestion(req2, mock2.res);
    const res2 = mock2.getData();

    if (res2 && res2.success && res2.data.provider === 'groq') {
      console.log('✅ TEST 2 Success! Successfully fell back to Groq.');
      console.log(`Provider: ${res2.data.provider}`);
      console.log(`Answer Snippet: "${res2.data.answer.substring(0, 150)}..."`);
    } else {
      console.error('❌ TEST 2 Failed (Expected fallback to Groq):', res2);
    }
    console.log('\n-------------------------------------------\n');


    // ==========================================
    // TEST 3: Tertiary Fallback Flow (Gemini & Groq fail -> KB Fallback)
    // ==========================================
    console.log('--- TEST 3: Knowledge Base Fallback Flow (Both broken) ---');
    geminiConfig.simulateFailure = true;
    groqConfig.simulateFailure = true;

    const req3 = {
      body: {
        question: 'Are there any hostels for MCA students?',
        conversationId
      }
    } as any;
    const mock3 = createMockResponse();

    await askQuestion(req3, mock3.res);
    const res3 = mock3.getData();

    if (res3 && res3.success && res3.data.fallback === true) {
      console.log('✅ TEST 3 Success! Successfully fell back to local Knowledge Base.');
      console.log(`Fallback Enabled: ${res3.data.fallback}`);
      console.log(`Answer Snippet: "${res3.data.answer.substring(0, 150)}..."`);
    } else {
      console.error('❌ TEST 3 Failed (Expected fallback to Knowledge Base):', res3);
    }
    console.log('\n-------------------------------------------\n');

  } catch (error) {
    console.error('An unexpected error occurred during tests:', error);
  } finally {
    // Cleanup the test conversation
    if (conversationId) {
      console.log('Cleaning up test conversation...');
      try {
        await prisma.conversation.delete({
          where: { id: conversationId }
        });
        console.log('Cleanup completed successfully.');
      } catch (cleanupErr) {
        console.error('Cleanup failed:', cleanupErr);
      }
    }

    // Reset simulation flags
    geminiConfig.simulateFailure = false;
    groqConfig.simulateFailure = false;
    
    await prisma.$disconnect();
    console.log('\n=== GROQ LLM FALLBACK VERIFICATION COMPLETED ===');
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

