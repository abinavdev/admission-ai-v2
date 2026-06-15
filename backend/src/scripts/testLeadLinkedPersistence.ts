import { prisma } from '../config/database';
import { askQuestion } from '../controllers/chat';
import { createPublicLead } from '../controllers/leads';

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
  console.log('=== STARTING LEAD-LINKED CONVERSATION PERSISTENCE TESTS ===\n');

  // --- Step 1: Anonymous Chat Query ---
  console.log('--- STEP 1: Anonymous Chat Query (No DB insertion expected) ---');
  const req1 = {
    body: {
      question: 'What is the eligibility requirement for MCA?',
      history: [
        { role: 'assistant', content: 'Welcome! How can I help you today?' }
      ]
    }
  } as any;

  const mock1 = createMockResponse();
  await askQuestion(req1, mock1.res);

  const res1 = mock1.getData();
  if (!res1 || !res1.success) {
    console.error('❌ Step 1 failed:', res1);
    process.exit(1);
  }

  const returnedConvId = res1.data.conversationId;
  const answer1 = res1.data.answer;
  console.log(`✅ Step 1 response success! Returned conversationId: ${returnedConvId}`);
  console.log(`AI Answer:\n${answer1}\n`);

  // Verify that NO conversation was created in the database for 'temp-session' or returned ID
  if (returnedConvId && returnedConvId !== 'temp-session') {
    const dbConv = await prisma.conversation.findUnique({
      where: { id: returnedConvId }
    });
    if (dbConv) {
      console.error('❌ Error: Anonymous chat created a conversation in the database!');
      process.exit(1);
    }
  }
  console.log('✅ Verified: No conversation database record created for anonymous chat.\n');

  // --- Step 2: Submit Lead with Chat History ---
  console.log('--- STEP 2: Submit Lead with Chat History ---');
  const testHistory = [
    { role: 'assistant', content: 'Welcome! How can I help you today?' },
    { role: 'user', content: 'What is the eligibility requirement for MCA?' },
    { role: 'assistant', content: answer1 }
  ];

  const req2 = {
    body: {
      name: 'John Doe Test',
      phone: '1234567890',
      email: 'johndoe@test.com',
      course: 'MCA',
      chatHistory: testHistory
    }
  } as any;

  const mock2 = createMockResponse();
  await createPublicLead(req2, mock2.res);

  const res2 = mock2.getData();
  if (!res2 || !res2.success) {
    console.error('❌ Step 2 failed:', res2);
    process.exit(1);
  }

  const { lead, conversationId } = res2.data;
  console.log('✅ Lead creation success!');
  console.log(`Created Lead ID: ${lead.id}`);
  console.log(`Created Conversation ID: ${conversationId}\n`);

  // Verify DB record existence and linkage
  const dbConv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { lead: true, messages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!dbConv) {
    console.error('❌ Error: Conversation not found in DB!');
    process.exit(1);
  }

  if (dbConv.leadId !== lead.id) {
    console.error(`❌ Error: Conversation leadId (${dbConv.leadId}) does not match Lead ID (${lead.id})!`);
    process.exit(1);
  }

  console.log(`✅ Verified: Conversation is linked to Lead (${dbConv.lead?.name})`);
  console.log(`DB Messages Count: ${dbConv.messages.length}`);
  dbConv.messages.forEach((m, idx) => {
    console.log(`  [Message #${idx + 1}] Role: ${m.role} | Content: ${m.content.substring(0, 80)}...`);
  });

  if (dbConv.messages.length !== testHistory.length) {
    console.error(`❌ Error: Expected ${testHistory.length} messages, found ${dbConv.messages.length} in DB!`);
    process.exit(1);
  }
  console.log('✅ Verified: All messages from chat history were successfully persisted to DB.\n');

  // --- Step 3: Post-Lead Persistent Chat ---
  console.log('--- STEP 3: Post-Lead Persistent Chat ---');
  const req3 = {
    body: {
      question: 'What about scholarship options?',
      conversationId: conversationId
    }
  } as any;

  const mock3 = createMockResponse();
  await askQuestion(req3, mock3.res);

  const res3 = mock3.getData();
  if (!res3 || !res3.success) {
    console.error('❌ Step 3 failed:', res3);
    process.exit(1);
  }

  const answer3 = res3.data.answer;
  console.log('✅ Post-lead response success!');
  console.log(`AI Answer:\n${answer3}\n`);

  // Verify that subsequent question and answer are persisted to DB
  const dbConvAfter = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  console.log(`DB Messages Count after post-lead message: ${dbConvAfter?.messages.length}`);
  dbConvAfter?.messages.forEach((m, idx) => {
    console.log(`  [Message #${idx + 1}] Role: ${m.role} | Content: ${m.content.substring(0, 80)}...`);
  });

  if ((dbConvAfter?.messages.length || 0) !== testHistory.length + 2) {
    console.error(`❌ Error: Expected ${testHistory.length + 2} messages in DB after post-lead turn, found ${dbConvAfter?.messages.length}!`);
    process.exit(1);
  }
  console.log('✅ Verified: Post-lead messages are automatically persisted to DB under the same conversation.\n');

  // --- Step 4: Cleanup Test Data ---
  console.log('--- STEP 4: Cleanup Test Data ---');
  // Deleting the Lead should cascade delete Conversation and Messages
  await prisma.lead.delete({
    where: { id: lead.id }
  });
  console.log('✅ Test Lead, Conversation, and Messages deleted successfully.');

  await prisma.$disconnect();
  console.log('\n=== ALL LEAD-LINKED CONVERSATION PERSISTENCE TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
