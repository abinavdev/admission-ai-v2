import 'dotenv/config';
import { retrieveRelevantChunks, detectCatalogIntent } from '../services/retrieval';
import { generateAnswerWithGemini } from '../services/llm';
import { generateAnswerWithGroq } from '../services/groq';
import { buildContext } from '../services/retrieval';

const TEST_QUERIES = [
  "what courses are available",
  "list all courses",
  "available programs",
  "courses offered",
  "what can i study",
  "programs available at cusat"
];

async function runDiagnostics() {
  console.log("=============================================================");
  console.log("STARTING CATALOG RETRIEVAL & GENERATION DIAGNOSTICS");
  console.log("=============================================================\n");

  let allSuccess = true;

  for (const query of TEST_QUERIES) {
    console.log(`Testing Query: "${query}"`);
    
    // 1. Detect catalog intent
    const isCatalog = detectCatalogIntent(query);
    console.log(`-> Detected Catalog Intent: ${isCatalog ? "✅ YES" : "❌ NO"}`);
    if (!isCatalog) {
      console.error(`❌ Fail: Catalog intent was NOT detected for query "${query}"`);
      allSuccess = false;
      continue;
    }

    // 2. Retrieve chunks
    const chunks = await retrieveRelevantChunks(query, 8);
    console.log(`-> Retrieved Chunks: ${chunks.length}`);

    // Verify Rank #1 to #4 are courses_overview.txt
    let top4AreOverview = true;
    for (let i = 0; i < Math.min(4, chunks.length); i++) {
      if (chunks[i].documentName !== 'courses_overview.txt') {
        top4AreOverview = false;
        console.error(`❌ Fail: Rank #${i + 1} is not courses_overview.txt, it is: ${chunks[i].documentName}`);
      }
    }

    if (top4AreOverview) {
      console.log(`-> Rank #1 to #4: courses_overview.txt ✅`);
    } else {
      allSuccess = false;
    }

    // Verify no diversification across other course files
    const otherCourseDocs = chunks.filter(c => 
      c.documentName !== 'courses_overview.txt' && 
      (c.documentName.startsWith('btech_') || 
       c.documentName.startsWith('msc_') || 
       c.documentName.startsWith('bsc_') || 
       c.documentName.startsWith('bba_') || 
       c.documentName.startsWith('bcom_'))
    );
    if (otherCourseDocs.length > 0) {
      console.error(`❌ Fail: Mixed in unrelated branch course files: ${otherCourseDocs.map(c => c.documentName).join(', ')}`);
      allSuccess = false;
    } else {
      console.log(`-> Isolated from unrelated course branch files ✅`);
    }

    // Check presence of Undergraduate, Postgraduate, Integrated, and Law programs in context
    const textContext = chunks.map(c => c.content.toUpperCase()).join(' ');
    
    const hasUG = textContext.includes('UNDERGRADUATE') || textContext.includes('B.TECH');
    const hasPG = textContext.includes('POSTGRADUATE') || textContext.includes('M.TECH') || textContext.includes('MCA') || textContext.includes('M.SC');
    const hasIntegrated = textContext.includes('INTEGRATED');
    const hasLaw = textContext.includes('LLB') || textContext.includes('LAW');

    console.log(`-> Program Category Checklist:`);
    console.log(`   - Undergraduate: ${hasUG ? "✅ Present" : "❌ Missing"}`);
    console.log(`   - Postgraduate: ${hasPG ? "✅ Present" : "❌ Missing"}`);
    console.log(`   - Integrated: ${hasIntegrated ? "✅ Present" : "❌ Missing"}`);
    console.log(`   - Law: ${hasLaw ? "✅ Present" : "❌ Missing"}`);

    if (!hasUG || !hasPG || !hasIntegrated || !hasLaw) {
      console.error("❌ Fail: Not all program categories are represented in the retrieved chunks.");
      allSuccess = false;
    } else {
      console.log(`-> All program categories represented in top ranks ✅`);
    }
    console.log("-------------------------------------------------------------\n");
  }

  // 5. Verify Gemini can produce a complete course catalog response
  console.log("=============================================================");
  console.log("TESTING GEMINI E2E GENERATION FOR BROAD CATALOG QUERY");
  console.log("=============================================================\n");

  const catalogQuery = "What courses are available?";
  console.log(`Executing LLM query: "${catalogQuery}"`);
  
  const chunks = await retrieveRelevantChunks(catalogQuery, 8);
  const context = buildContext(chunks, 8000);

  let response;
  let provider = 'Gemini';
  try {
    response = await generateAnswerWithGemini(catalogQuery, context, []);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️ Gemini execution failed. Trying Groq fallback... Error: ${errorMsg}`);
    try {
      response = await generateAnswerWithGroq(catalogQuery, context, []);
      provider = 'Groq';
    } catch (groqErr) {
      const groqErrorMsg = groqErr instanceof Error ? groqErr.message : String(groqErr);
      console.error(`❌ FAIL: Groq fallback execution failed too: ${groqErrorMsg}`);
      allSuccess = false;
    }
  }

  if (response) {
    console.log(`\n--- ${provider.toUpperCase()} ANSWER ---`);
    console.log(response.answer);
    console.log("---------------------\n");

    const answerLower = response.answer.toLowerCase();
    const hasBTech = answerLower.includes("b.tech") || answerLower.includes("computer science") || answerLower.includes("undergraduate");
    const hasMTechOrMCA = answerLower.includes("m.tech") || answerLower.includes("mca") || answerLower.includes("postgraduate") || answerLower.includes("msc") || answerLower.includes("m.sc");
    const hasIntegrated = answerLower.includes("integrated");
    const hasLaw = answerLower.includes("llb") || answerLower.includes("law") || answerLower.includes("bba llb") || answerLower.includes("bsc llb");

    console.log(`LLM Coverage Verification (${provider}):`);
    console.log(`- Undergraduate courses listed: ${hasBTech ? "✅" : "❌"}`);
    console.log(`- Postgraduate courses listed: ${hasMTechOrMCA ? "✅" : "❌"}`);
    console.log(`- Integrated courses listed: ${hasIntegrated ? "✅" : "❌"}`);
    console.log(`- Law courses listed: ${hasLaw ? "✅" : "❌"}`);

    if (hasBTech && hasMTechOrMCA && hasIntegrated && hasLaw) {
      console.log(`\n🎉 SUCCESS: ${provider} generated a comprehensive response covering all program categories! ✅`);
    } else {
      console.error(`\n❌ FAIL: ${provider} response did not sufficiently cover all program categories.`);
      allSuccess = false;
    }
  }

  console.log("\n=============================================================");
  if (allSuccess) {
    console.log("🎉 ALL DIAGNOSTIC TESTS PASSED SUCCESSFULLY!");
  } else {
    console.log("❌ SOME DIAGNOSTIC TESTS FAILED.");
  }
  console.log("=============================================================");
}

runDiagnostics().catch(console.error);

