/**
 * Control Architect Game Unit Tests - Lightweight Node-native verification script
 */

const assert = require("assert");
const {
  STAGE1_PRINCIPLES,
  STAGE2_CONTROL_SORT,
  STAGE3_DEFENSE_STACK,
  STAGE4_POLICY_CLAUSES,
  STAGE5_REQUIREMENTS,
  STANDARD_ROLE_OPTIONS,
  DEFENSE_LAYER,
  DEFENSE_LAYER_MIN_COUNT,
  calculateScore,
  scoreStage1,
  setScore,
  scoreStage2Item,
  evaluateStage3Layers,
  scoreStage3,
  scoreStage4,
  scoreStage5,
  evaluateLearningOutcome,
} = require("./game-core.js");

console.log("=========================================");
console.log("RUNNING CONTROL ARCHITECT GAME CORE TESTS...");
console.log("=========================================");

try {
  // Test 1: Scenario bank integrity and bilingual coverage
  console.log("Test 1: Verifying scenario bank structure and bilingual fields...");
  assert.strictEqual(STAGE1_PRINCIPLES.length, 3, "Stage 1 should have exactly 3 principle-matching scenarios.");
  assert.strictEqual(STAGE2_CONTROL_SORT.items.length, 4, "Stage 2 should have exactly 4 control-sort items (ก-ง).");
  assert.strictEqual(STAGE3_DEFENSE_STACK.length, 2, "Stage 3 should have exactly 2 defense-stack scenarios.");
  assert.strictEqual(STAGE4_POLICY_CLAUSES.length, 2, "Stage 4 should have exactly 2 policy scenarios.");
  assert.strictEqual(STAGE5_REQUIREMENTS.length, 2, "Stage 5 should have exactly 2 requirement scenarios.");

  STAGE1_PRINCIPLES.forEach((item) => {
    assert.ok(item.scenario.th && item.scenario.en, `Stage 1 item ${item.id} is missing bilingual scenario text.`);
    assert.strictEqual(item.correctPair.length, 2, `Stage 1 item ${item.id} must name exactly 2 correct principles.`);
  });
  STAGE4_POLICY_CLAUSES.forEach((item) => {
    assert.strictEqual(item.clauses.length, 3, `Stage 4 item ${item.id} must have exactly 3 clauses.`);
  });
  console.log("✔ Scenario bank verified successfully.");

  // Test 2: Score calculation logic (shared speed-bonus formula)
  console.log("Test 2: Verifying calculateScore speed-bonus rules...");
  assert.strictEqual(calculateScore(100, 0, 45), 150, "Zero elapsed time should reward maximum points + speed bonus.");
  assert.strictEqual(calculateScore(100, 45, 45), 50, "Reaching the time limit should reward the minimum floor points.");
  console.log("✔ Score calculations verified successfully.");

  // Test 3: Stage 1 principle-pair scoring
  console.log("Test 3: Verifying Stage 1 principle-pair scoring...");
  const s1item = STAGE1_PRINCIPLES[0];
  const correctTradeoff = s1item.tradeoffOptions.find((t) => t.correct);
  const s1Perfect = scoreStage1(s1item, { principles: s1item.correctPair, tradeoffId: correctTradeoff.id });
  assert.strictEqual(s1Perfect.ratio, 1, "Correct pair and correct trade-off should score a perfect ratio.");
  const s1OnePrincipleOnly = scoreStage1(s1item, { principles: [s1item.correctPair[0], "ECONOMY_OF_MECHANISM"], tradeoffId: correctTradeoff.id });
  assert.ok(s1OnePrincipleOnly.ratio < s1Perfect.ratio, "Getting only one of the two correct principles should score lower than a perfect answer.");
  const s1WrongTradeoff = s1item.tradeoffOptions.find((t) => !t.correct);
  const s1BadTradeoff = scoreStage1(s1item, { principles: s1item.correctPair, tradeoffId: s1WrongTradeoff.id });
  assert.ok(s1BadTradeoff.ratio < s1Perfect.ratio, "A correct pair with a wrong trade-off should score lower than a perfect answer.");
  console.log("✔ Stage 1 scoring verified successfully.");

  // Test 4: Stage 2 control-sort scoring, including multi-role acceptance
  console.log("Test 4: Verifying Stage 2 control-sort scoring and multi-role acceptance...");
  assert.strictEqual(setScore(["PREVENTIVE"], ["PREVENTIVE"]), 1, "An exact single-value match should score 1.");
  assert.strictEqual(setScore(["DETECTIVE"], ["PREVENTIVE"]), 0, "A wrong-only selection should score 0.");
  assert.strictEqual(setScore(["PREVENTIVE", "DETECTIVE"], ["PREVENTIVE", "DETECTIVE"]), 1, "An exact multi-value match should score 1 (a control may legitimately have more than one role).");
  assert.strictEqual(setScore(["PREVENTIVE"], ["PREVENTIVE", "DETECTIVE"]), 0.5, "Getting one of two accepted values with no wrong picks should score partial credit.");
  assert.strictEqual(setScore(["PREVENTIVE", "PHYSICAL"], ["PREVENTIVE"]), 0.25, "Including a wrong value alongside a correct one should score low, not zero.");
  const itemC = STAGE2_CONTROL_SORT.items.find((i) => i.id === "ITEM_C");
  const itemCPerfect = scoreStage2Item(itemC, { functions: itemC.acceptedFunctions, natures: itemC.acceptedNatures });
  assert.strictEqual(itemCPerfect.ratio, 1, "Item C's two accepted functions (preventive+detective) should both be required for full credit.");
  console.log("✔ Stage 2 scoring and multi-role acceptance verified successfully.");

  // Test 5: Stage 3 defense-stack scoring and the single-point-of-failure rule
  console.log("Test 5: Verifying Stage 3 defense-stack scoring and the single-point-of-failure rule...");
  const tooFew = evaluateStage3Layers(["AUTHENTICATION", "RESOURCE_AUTHZ_POLICY"]);
  assert.strictEqual(tooFew.singlePointOfFailure, true, `Fewer than ${DEFENSE_LAYER_MIN_COUNT} layers must be flagged.`);
  const sameDimension = evaluateStage3Layers(["RESOURCE_AUTHZ_POLICY", "JOINT_APPROVAL", "DATA_RECOVERY_PLAN"]);
  // RESOURCE_AUTHZ_POLICY and JOINT_APPROVAL are both LIMIT_IMPACT; DATA_RECOVERY_PLAN is ENABLE_RECOVERY -> 2 dimensions, should pass
  assert.strictEqual(sameDimension.singlePointOfFailure, false, "Three layers spanning 2 distinct dimensions should not be flagged.");
  const allSameDimension = evaluateStage3Layers(["RESOURCE_AUTHZ_POLICY", "JOINT_APPROVAL"]);
  assert.strictEqual(allSameDimension.singlePointOfFailure, true, "Two layers is already below the minimum count regardless of dimension spread.");
  const allSameDimensionButEnoughCount = (() => {
    // Construct a hypothetical 3-layer selection that all share one tag, using only IDs that exist.
    const limitImpactOnly = Object.values(DEFENSE_LAYER)
      .filter((l) => l.tag === "LIMIT_IMPACT")
      .map((l) => l.id);
    return limitImpactOnly.length >= 2 ? limitImpactOnly : null;
  })();
  assert.ok(allSameDimensionButEnoughCount, "Test setup expects at least 2 LIMIT_IMPACT-tagged layers in the data.");

  const s3item = STAGE3_DEFENSE_STACK[0];
  const s3ZeroScore = scoreStage3(s3item, { layerIds: ["AUTHENTICATION", "RESOURCE_AUTHZ_POLICY"], tags: {} });
  assert.strictEqual(s3ZeroScore.ratio, 0, "Fewer than the minimum layer count must score zero regardless of tags.");
  assert.strictEqual(s3ZeroScore.singlePointOfFailure, true);

  const correctRisk = s3item.residualRiskOptions.find((r) => r.correct);
  const correctTo = s3item.tradeoffOptions.find((t) => t.correct);
  const s3Good = scoreStage3(s3item, {
    layerIds: ["AUTHENTICATION", "RESOURCE_AUTHZ_POLICY", "ACTIVITY_LOG"],
    tags: { AUTHENTICATION: "REDUCE_LIKELIHOOD", RESOURCE_AUTHZ_POLICY: "LIMIT_IMPACT", ACTIVITY_LOG: "LIMIT_IMPACT" },
    residualRiskId: correctRisk.id,
    tradeoffId: correctTo.id,
  });
  assert.ok(s3Good.ratio > 0.7, "Three well-tagged layers spanning distinct dimensions plus correct risk/trade-off should score highly.");
  console.log("✔ Stage 3 scoring and single-point-of-failure rule verified successfully.");

  // Test 6: Stage 4 clause-tagging scoring
  console.log("Test 6: Verifying Stage 4 policy-clause scoring...");
  const s4item = STAGE4_POLICY_CLAUSES[0];
  const perfectTags = {};
  s4item.clauses.forEach((c) => {
    perfectTags[c.id] = c.correctConcept;
  });
  const s4Perfect = scoreStage4(s4item, { clauseTags: perfectTags });
  assert.strictEqual(s4Perfect.ratio, 1, "Tagging every clause with its correct concept should score a perfect ratio.");
  const s4Partial = scoreStage4(s4item, { clauseTags: { [s4item.clauses[0].id]: s4item.clauses[0].correctConcept } });
  assert.ok(s4Partial.ratio > 0 && s4Partial.ratio < 1, "Tagging only one of three clauses correctly should score partial credit.");
  console.log("✔ Stage 4 scoring verified successfully.");

  // Test 7: Stage 5 requirement-builder scoring
  console.log("Test 7: Verifying Stage 5 requirement-builder scoring...");
  const s5item = STAGE5_REQUIREMENTS[0];
  const correctBehavior = s5item.behaviorOptions.find((o) => o.correct);
  const correctAssetAction = s5item.assetActionOptions.find((o) => o.correct);
  const correctCondition = s5item.conditionOptions.find((o) => o.correct);
  const correctStandardRole = STANDARD_ROLE_OPTIONS.find((o) => o.correct);
  const s5Perfect = scoreStage5(s5item, {
    behaviorId: correctBehavior.id,
    assetActionId: correctAssetAction.id,
    conditionId: correctCondition.id,
    standardRoleId: correctStandardRole.id,
  });
  assert.strictEqual(s5Perfect.ratio, 1, "Choosing every correct slot should score a perfect ratio.");
  const s5Vague = scoreStage5(s5item, {
    behaviorId: s5item.behaviorOptions.find((o) => !o.correct).id,
    assetActionId: correctAssetAction.id,
    conditionId: correctCondition.id,
    standardRoleId: correctStandardRole.id,
  });
  assert.ok(s5Vague.ratio < s5Perfect.ratio, "Choosing a vague behavior slot should score lower than a perfect answer.");
  console.log("✔ Stage 5 scoring verified successfully.");

  // Test 8: Learning outcome mapping
  console.log("Test 8: Verifying evaluateLearningOutcome output classifications...");
  const perfect = evaluateLearningOutcome({ s1: 100, s2: 100, s3: 100, s4: 100, s5: 100 });
  assert.strictEqual(perfect.accuracy, 100);
  assert.strictEqual(perfect.title.en, "Chief Control Architect");
  const zero = evaluateLearningOutcome({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 });
  assert.strictEqual(zero.accuracy, 0);
  assert.strictEqual(zero.title.en, "Control Architect Apprentice");
  console.log("✔ Learning outcomes mapping verified successfully.");

  console.log("\n=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! [PASS]");
  console.log("=========================================");
  process.exit(0);
} catch (error) {
  console.error("\n❌ TEST SUITE FAILED:");
  console.error(error);
  process.exit(1);
}
