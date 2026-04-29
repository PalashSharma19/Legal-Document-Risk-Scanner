const assert = require('assert');
const { segmentClauses } = require('../src/clauseSegmenter');

// Very basic test suite using Node's native assert module
console.log("Running clauseSegmenter tests...");

try {
  const sampleText = "This is the first sentence. This is the second sentence which is a bit longer than the first. And here is a third one!";
  const clauses = segmentClauses(sampleText);
  
  // Length > 40 is the filter threshold in segmentClauses
  // "This is the first sentence." = 27 chars (Filtered out)
  // "This is the second sentence which is a bit longer than the first." = 65 chars (Kept)
  // "And here is a third one!" = 24 chars (Filtered out)

  assert.strictEqual(clauses.length, 1, "Should filter out clauses under 40 characters");
  assert.strictEqual(clauses[0].text, "This is the second sentence which is a bit longer than the first.", "Should properly extract the longer sentence");
  
  console.log("✅ clauseSegmenter tests passed!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
