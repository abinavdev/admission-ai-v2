import { prisma } from '../config/database';
import { askQuestion } from '../controllers/chat';

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

async function runTests() {
  console.log('=== STARTING CONVERSATION MEMORY TESTS ===\n');

  let activeConversationId: string | undefined = undefined;

  // --- Turn 1: First Question ---
  console.log('--- TURN 1: First Question ---');
  const req1 = {
    body: {
      question: 'Tell me about the MCA program duration at CUSAT.'
    }
  } as any;

  const mock1 = createMockResponse();
  await askQuestion(req1, mock1.res);

  const res1 = mock1.getData();
  if (!res1 || !res1.success) {
    console.error('❌ Turn 1 failed:', res1);
    process.exit(1);
  }

  activeConversationId = res1.data.conversationId;
  const answer1 = res1.data.answer;

  console.log('✅ Turn 1 Succeeded!');
  console.log(`Generated Conversation ID: ${activeConversationId}`);
  console.log(`Answer:\n${answer1}\n`);

  // Verify DB state for Turn 1
  const conv1 = await prisma.conversation.findUnique({
    where: { id: activeConversationId },
    include: { messages: true }
  });

  if (!conv1) {
    console.error('❌ Conversation not found in DB!');
    process.exit(1);
  }

  console.log(`DB Title: "${conv1.title}"`);
  console.log(`DB Message Count: ${conv1.messages.length}`);
  conv1.messages.forEach((m, idx) => {
    console.log(`  [Message #${idx + 1}] Role: ${m.role} | Content: ${m.content.substring(0, 80)}...`);
  });
  console.log('');

  // --- Turn 2: Follow-up Question ---
  console.log('--- TURN 2: Follow-up Question ---');
  const req2 = {
    body: {
      question: 'What is its eligibility requirements?',
      conversationId: activeConversationId
    }
  } as any;

  const mock2 = createMockResponse();
  await askQuestion(req2, mock2.res);

  const res2 = mock2.getData();
  if (!res2 || !res2.success) {
    console.error('❌ Turn 2 failed:', res2);
    process.exit(1);
  }

  const answer2 = res2.data.answer;
  console.log('✅ Turn 2 Succeeded!');
  console.log(`Answer:\n${answer2}\n`);

  // Verify DB state for Turn 2
  const conv2 = await prisma.conversation.findUnique({
    where: { id: activeConversationId },
    include: { messages: true }
  });

  console.log(`DB Message Count: ${conv2?.messages.length}`);
  conv2?.messages.forEach((m, idx) => {
    console.log(`  [Message #${idx + 1}] Role: ${m.role} | Content: ${m.content.substring(0, 80)}...`);
  });
  console.log('');

  // --- Turn 3: Second Follow-up comparing ---
  console.log('--- TURN 3: Comparative Follow-up ---');
  const req3 = {
    body: {
      question: 'Can you compare that with MBA course duration?',
      conversationId: activeConversationId
    }
  } as any;

  const mock3 = createMockResponse();
  await askQuestion(req3, mock3.res);

  const res3 = mock3.getData();
  if (!res3 || !res3.success) {
    console.error('❌ Turn 3 failed:', res3);
    process.exit(1);
  }

  const answer3 = res3.data.answer;
  console.log('✅ Turn 3 Succeeded!');
  console.log(`Answer:\n${answer3}\n`);

  // Verify DB state for Turn 3
  const conv3 = await prisma.conversation.findUnique({
    where: { id: activeConversationId },
    include: { messages: true }
  });

  console.log(`DB Message Count: ${conv3?.messages.length}`);
  conv3?.messages.forEach((m, idx) => {
    console.log(`  [Message #${idx + 1}] Role: ${m.role} | Content: ${m.content.substring(0, 80)}...`);
  });
  console.log('');

  // Clean up
  console.log('Cleaning up test conversation data...');
  await prisma.conversation.delete({ where: { id: activeConversationId } });
  console.log('Cleaned up.');

  await prisma.$disconnect();
  console.log('\n=== ALL CONVERSATION MEMORY TESTS COMPLETED SUCCESSFULY ===');
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
