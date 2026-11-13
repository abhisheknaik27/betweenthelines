import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_MISO_STATE,
  applyJunction1,
  applyJunction2,
  applyJunction3,
  applyJunction4,
  applyJunction5,
  applyJunction6,
  applyJunction7,
  getFinalNetPosition,
  getShareCurrentValue,
  getCommodityCurrentValue,
  calculateCareScore,
  evaluateMisoEnding,
} from './miso-engine';

import {
  INITIAL_FUNFAIR_STATE,
  selectFunfairStall,
  selectFunfairLocation,
  purchaseInitialStock,
  selectPricingStrategy,
  applyFunfairJunction5,
  applyFunfairJunction6,
  applyFunfairJunction7,
  applyFunfairJunction8,
  applyFunfairFinalSettlement,
  getFinalBusinessValue,
  getGrowthMultiple,
  evaluateFunfairOutcome,
} from './funfair-engine';

test('Miso Engine: starts with ₹5,000 and tracks Junction 1–7 accurately', () => {
  let state = structuredClone(INITIAL_MISO_STATE);
  assert.equal(state.wallet_balance, 5000);
  assert.equal(state.total_expenses, 0);

  // J1_A: Buy cat food for ₹100
  state = applyJunction1(state, 'J1_A');
  assert.equal(state.wallet_balance, 4900);
  assert.equal(state.food_expense, 100);
  assert.equal(state.food_provided, true);

  // J2_A: Rescuer-assisted transport for ₹250
  state = applyJunction2(state, 'J2_A', ['Lower cost', 'Keeping money for treatment']);
  assert.equal(state.wallet_balance, 4650);
  assert.equal(state.transport_expense, 250);
  assert.equal(state.vet_consultation_completed, true);

  // J3: Budget & Vet Consultation (₹800) + Urgent Tests (₹2,700) = ₹3,500
  state = applyJunction3(
    state,
    {
      immediateCare: 800,
      transport: 250,
      food: 100,
      treatmentAndMedicines: 3000,
      emergencyReserve: 500,
    },
    'BALANCED_PLAN'
  );
  assert.equal(state.wallet_balance, 1150); // 4650 - 3500
  assert.equal(state.urgent_care_completed, true);

  // J4_C: Ask animal welfare group for ₹500 support -> wallet becomes 1650, pays ₹1,500 for Medicines + Follow-up -> wallet = 150
  state = applyJunction4(state, { optionId: 'J4_C' });
  assert.equal(state.support_received, 500);
  assert.equal(state.wallet_balance, 150);
  assert.equal(state.follow_up_completed, true);

  // J5_D: Buy 1 share of Company A at ₹110 -> wallet = 40, share_units.companyA = 1
  // Transition to J6 updates Company A share price to ₹120!
  state = applyJunction5(state, 'J5_D', 1, 'companyA');
  assert.equal(state.wallet_balance, 40);
  assert.equal(state.share_units.companyA, 1);
  assert.equal(state.share_prices.companyA.current, 120);
  assert.equal(getShareCurrentValue(state), 120);

  // J6_D: Combine ₹500 diagnostic support with player funds
  state = applyJunction6(state, 'J6_D');
  assert.equal(state.stage, 8);
  assert.equal(calculateCareScore(state), 3);

  // J7: Final allocation
  state = applyJunction7(state, {
    repaymentAmount: 0,
    savingsAmount: 0,
    accessibleWalletAmount: state.wallet_balance,
    investmentAmount: 0,
  });
  assert.equal(state.stage, 9);
  const ending = evaluateMisoEnding(state);
  assert.equal(ending.careScore, 3);
  assert.ok(['ENDING_A', 'ENDING_B', 'ENDING_C'].includes(ending.endingId));
});

test('Miso Engine: bank loan 10% interest and Ending C / Ending D rules work properly', () => {
  let state = structuredClone(INITIAL_MISO_STATE);
  state = applyJunction1(state, 'J1_B'); // Community food help (₹0)
  state = applyJunction2(state, 'J2_D'); // Rescuer transport support (₹0)
  state = applyJunction3(state, state.budget_plan, 'DEFAULT'); // 5000 - 3500 = 1500
  // J4_B: Bank loan of ₹1,000 at 10% interest -> +₹100 interest, repayment_due = 1100
  state = applyJunction4(state, { optionId: 'J4_B', bankLoanAmount: 1000 });
  assert.equal(state.borrowed_principal, 1000);
  assert.equal(state.interest_amount, 100);
  assert.equal(state.repayment_due, 1100);
  assert.equal(state.wallet_balance, 1000); // 1500 + 1000 - 1500 = 1000

  // J5_E: Buy 2 units of Wheat at ₹120 = ₹240 -> market update changes Wheat to ₹110
  state = applyJunction5(state, 'J5_E', 2, 'wheat');
  assert.equal(getCommodityCurrentValue(state), 220);

  // Test explicit delay at J6 triggers Ending D
  const delayedState = applyJunction6(state, 'J6_E', true);
  const delayedEnding = evaluateMisoEnding(delayedState);
  assert.equal(delayedEnding.endingId, 'ENDING_D');
});

test('Funfair Founder Engine: viable route achieves the 4x Champion target (>= ₹4,000)', () => {
  let state = structuredClone(INITIAL_FUNFAIR_STATE);
  assert.equal(state.wallet_balance, 1000);

  // J1: Food Stall (-₹350 -> ₹650)
  state = selectFunfairStall(state, 'food');
  assert.equal(state.wallet_balance, 650);

  // J2: Main Stage (-₹350 -> ₹300, 1.5x footfall)
  state = selectFunfairLocation(state, 'main_stage');
  assert.equal(state.wallet_balance, 300);

  // J3: Buy 20 Lemonades (₹200) + 10 Popcorns (₹150) = ₹350 gross, with 10% Bulk Discount = ₹315 (using ₹100 supplier credit so wallet covers it easily)
  state = purchaseInitialStock(state, { lemonade: 22, popcorn: 12 }, true, 150);
  assert.equal(state.bulk_discount, true);
  assert.ok(state.wallet_balance >= 0);

  // J4: Suggested or Premium pricing
  state = selectPricingStrategy(state, 'suggested');

  // J5: Period 1 Opening Rush (Promote + Bundle)
  state = applyFunfairJunction5(state, 'promote', 'bundle');
  assert.ok(state.total_revenue > 500);

  // J6: Keep surplus in wallet for big Peak Crowd restock
  state = applyFunfairJunction6(state, 'wallet', 0);

  // J7: Period 2 Peak Crowd - Restock popular Lemonade (35 units) & Popcorn (25 units)
  state = applyFunfairJunction7(state, 'restock_popular', { lemonade: 35, popcorn: 25 });
  assert.ok(state.total_revenue > 2000);

  // J8: Period 3 Final Rush - Differentiate stall + Accept 30-unit Bulk Order + Restock 30 Lemonades
  state = applyFunfairJunction8(state, 'differentiate', true, 30);

  // Final Settlement: Repay debt & settle accounts
  state = applyFunfairFinalSettlement(state, {
    liquidateSharesAndCommodities: true,
    repayAllDebt: true,
    depositSurplusToSavings: 500,
  });

  const finalVal = getFinalBusinessValue(state);
  const mult = getGrowthMultiple(state);
  const report = evaluateFunfairOutcome(state);

  assert.ok(finalVal >= 4000, `Expected final business value >= 4000, got ${finalVal}`);
  assert.ok(mult >= 4.0, `Expected growth multiple >= 4.0, got ${mult}`);
  assert.equal(report.won4xChallenge, true);
  assert.equal(report.outcomeTier, '4× Champion');
});
