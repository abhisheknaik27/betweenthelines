// Pure game state & rule engine for Game 1: MISO – A 4–5 Minute Financial Decision-Making Game

export type MisoShareId = 'companyA' | 'companyB';
export type MisoCommodityId = 'gold' | 'silver' | 'wheat';

export interface MisoBudgetAllocation {
  immediateCare: number;
  transport: number;
  food: number;
  treatmentAndMedicines: number;
  emergencyReserve: number;
}

export interface MisoDecisionRecord {
  junction_id: string;
  junction_title: string;
  option_id: string;
  choice_label: string;
  selected_amount: number;
  selected_reason?: string[];
  information_cards_opened: string[];
  financial_state_before: {
    wallet_balance: number;
    savings_balance: number;
    repayment_due: number;
    total_expenses: number;
  };
  financial_state_after: {
    wallet_balance: number;
    savings_balance: number;
    repayment_due: number;
    total_expenses: number;
  };
  consequence_id: string;
  consequence_message: string;
  concept_tags: string[];
}

export interface MisoGameState {
  // Stage progress (1 to 9)
  stage: number;
  timerSeconds: number;

  // 7.1 & 7.2 Financial variables
  starting_balance: number;
  wallet_balance: number;
  savings_balance: number;
  savings_interest_earned: number;
  fd_balance: number;
  fd_current_value: number;
  fd_matured: boolean;
  borrowed_principal: number;
  interest_amount: number;
  repayment_due: number;
  support_received: number;

  // Shares & Commodities
  share_units: Record<MisoShareId, number>;
  share_prices: Record<MisoShareId, { previous: number; current: number; name: string; sector: string }>;
  commodity_units: Record<MisoCommodityId, number>;
  commodity_prices: Record<MisoCommodityId, { previous: number; current: number; name: string; unitLabel: string }>;
  market_updated_at_j6: boolean;

  // Expense breakdown (recorded once only, never double-deducted)
  food_expense: number;
  transport_expense: number;
  consultation_expense: number;
  treatment_expense: number;
  medicine_expense: number;
  follow_up_expense: number;
  unexpected_expense: number;
  total_expenses: number;

  // Budget plan (from Junction 3)
  budget_plan: MisoBudgetAllocation;

  // 7.3 Story variables
  food_provided: boolean;
  community_food_help: boolean;
  rescuer_contacted: boolean;
  food_help_requested: boolean;
  community_support_requested: boolean;
  transport_arranged: boolean;
  transport_support: boolean;
  vet_consultation_completed: boolean;
  urgent_care_completed: boolean;
  recommended_care_followed: boolean;
  follow_up_completed: boolean;
  player_sought_help: boolean;
  care_delay_flag: boolean;
  care_status: 'frightened' | 'stabilizing' | 'recovering' | 'recovered' | 'uncertain';
  medical_uncertainty_event: boolean;
  vet_urgency_asked: boolean;

  // Tracking
  information_explored: number;
  opened_info_cards: string[];
  decisions: MisoDecisionRecord[];
  reflection_note: string;
}

export const INITIAL_MISO_STATE: MisoGameState = {
  stage: 1,
  timerSeconds: 285, // 4 min 45 sec target

  starting_balance: 5000,
  wallet_balance: 5000,
  savings_balance: 0,
  savings_interest_earned: 0,
  fd_balance: 0,
  fd_current_value: 0,
  fd_matured: false,
  borrowed_principal: 0,
  interest_amount: 0,
  repayment_due: 0,
  support_received: 0,

  share_units: {
    companyA: 0,
    companyB: 0,
  },
  share_prices: {
    companyA: { previous: 100, current: 110, name: 'Company A (MediCare Vet Labs)', sector: 'Healthcare & Diagnostics' },
    companyB: { previous: 100, current: 90, name: 'Company B (Metro Transit Co.)', sector: 'Urban Logistics' },
  },
  commodity_units: {
    gold: 0,
    silver: 0,
    wheat: 0,
  },
  commodity_prices: {
    gold: { previous: 1000, current: 1100, name: 'Gold Reserve Unit', unitLabel: '1g Digital Unit' },
    silver: { previous: 1000, current: 900, name: 'Silver Bullion Unit', unitLabel: '10g Unit' },
    wheat: { previous: 100, current: 120, name: 'Wheat Harvest Unit', unitLabel: '5kg Sack Unit' },
  },
  market_updated_at_j6: false,

  food_expense: 0,
  transport_expense: 0,
  consultation_expense: 0,
  treatment_expense: 0,
  medicine_expense: 0,
  follow_up_expense: 0,
  unexpected_expense: 0,
  total_expenses: 0,

  budget_plan: {
    immediateCare: 800,
    transport: 500,
    food: 100,
    treatmentAndMedicines: 2500,
    emergencyReserve: 500,
  },

  food_provided: false,
  community_food_help: false,
  rescuer_contacted: false,
  food_help_requested: false,
  community_support_requested: false,
  transport_arranged: false,
  transport_support: false,
  vet_consultation_completed: false,
  urgent_care_completed: false,
  recommended_care_followed: false,
  follow_up_completed: false,
  player_sought_help: false,
  care_delay_flag: false,
  care_status: 'frightened',
  medical_uncertainty_event: false,
  vet_urgency_asked: false,

  information_explored: 0,
  opened_info_cards: [],
  decisions: [],
  reflection_note: '',
};

// Derived Financial Metrics (Section 4.2 & Section 11)
export function getShareCurrentValue(state: MisoGameState): number {
  return (
    state.share_units.companyA * state.share_prices.companyA.current +
    state.share_units.companyB * state.share_prices.companyB.current
  );
}

export function getCommodityCurrentValue(state: MisoGameState): number {
  return (
    state.commodity_units.gold * state.commodity_prices.gold.current +
    state.commodity_units.silver * state.commodity_prices.silver.current +
    state.commodity_units.wheat * state.commodity_prices.wheat.current
  );
}

export function getTotalCommodityUnits(state: MisoGameState): number {
  return (
    state.commodity_units.gold +
    state.commodity_units.silver +
    state.commodity_units.wheat
  );
}

export function getInvestmentCurrentValue(state: MisoGameState): number {
  return getShareCurrentValue(state) + state.fd_current_value;
}

// Accessible resources = immediately available cash + accessible savings (excludes locked FD, shares, commodities)
export function getAccessibleResources(state: MisoGameState): number {
  return state.wallet_balance + state.savings_balance;
}

// Section 8.4 & 11: final_net_position = wallet_balance + savings_balance + fd_current_value + investment_current_value + commodity_current_value - repayment_due
// Note: here getShareCurrentValue is shares, fd_current_value is FD, commodity_current_value is commodities.
export function getFinalNetPosition(state: MisoGameState): number {
  return (
    state.wallet_balance +
    state.savings_balance +
    state.fd_current_value +
    getShareCurrentValue(state) +
    getCommodityCurrentValue(state) -
    state.repayment_due
  );
}

function snapshotBefore(state: MisoGameState) {
  return {
    wallet_balance: state.wallet_balance,
    savings_balance: state.savings_balance,
    repayment_due: state.repayment_due,
    total_expenses: state.total_expenses,
  };
}

// JUNCTION 1 – DISCOVERING AND FEEDING MISO
export function applyJunction1(
  state: MisoGameState,
  optionId: 'J1_A' | 'J1_B' | 'J1_C' | 'J1_D'
): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);
  next.food_provided = true;

  let choiceLabel = '';
  let consequenceMsg = '';
  let amount = 0;

  if (optionId === 'J1_A') {
    amount = 100;
    next.wallet_balance -= 100;
    next.food_expense += 100;
    next.total_expenses += 100;
    choiceLabel = 'Buy suitable cat food for ₹100';
    consequenceMsg = 'Miso eats the wet food eagerly. Your wallet reduces by ₹100.';
  } else if (optionId === 'J1_B') {
    next.community_food_help = true;
    next.community_support_requested = true;
    next.player_sought_help = true;
    choiceLabel = 'Ask the tea stall owner for help arranging food';
    consequenceMsg = 'The kind tea stall owner shares boiled eggs and milk-free bits for Miso. Your wallet remains ₹5,000.';
  } else if (optionId === 'J1_C') {
    next.rescuer_contacted = true;
    next.community_support_requested = true;
    next.player_sought_help = true;
    choiceLabel = 'Contact an animal rescuer for guidance';
    consequenceMsg = 'An animal rescuer guides you on feeding Miso safely using a local volunteer pouch and shares a clinic contact.';
  } else if (optionId === 'J1_D') {
    next.food_help_requested = true;
    next.community_support_requested = true;
    next.player_sought_help = true;
    choiceLabel = 'Arrange immediate help and ask someone nearby to assist with food';
    consequenceMsg = 'A passerby and the stall owner help feed Miso and calm her down while you prepare the next step.';
  }

  next.decisions.push({
    junction_id: 'J1_FEEDING',
    junction_title: 'Discovering and Feeding Miso',
    option_id: optionId,
    choice_label: choiceLabel,
    selected_amount: amount,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: `${optionId}_OUTCOME`,
    consequence_message: consequenceMsg,
    concept_tags: ['immediate_needs', 'spending_priorities', 'seeking_help'],
  });

  next.stage = 3; // Advance to Junction 2 (Stage 3)
  return next;
}

// JUNCTION 2 – CHOOSING TRANSPORT
export function applyJunction2(
  state: MisoGameState,
  optionId: 'J2_A' | 'J2_B' | 'J2_C' | 'J2_D',
  reasons: string[] = []
): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);
  next.transport_arranged = true;
  next.vet_consultation_completed = true; // Reaching the vet is Care Milestone 1

  let cost = 0;
  let choiceLabel = '';
  let consequenceMsg = '';

  if (optionId === 'J2_A') {
    cost = 250;
    choiceLabel = 'Rescuer-assisted transport (₹250)';
    consequenceMsg = 'After a short wait, the rescuer van arrives with a secure carrier. ₹250 deducted from wallet.';
  } else if (optionId === 'J2_B') {
    cost = 500;
    choiceLabel = 'Auto rickshaw (₹500)';
    consequenceMsg = 'You board an auto immediately and keep Miso steady in a ventilated basket. ₹500 deducted from wallet.';
  } else if (optionId === 'J2_C') {
    cost = 800;
    choiceLabel = 'Private Cab (₹800)';
    consequenceMsg = 'A quiet, air-conditioned cab takes you and Miso smoothly to the clinic. ₹800 deducted from wallet.';
  } else if (optionId === 'J2_D') {
    cost = 0;
    next.transport_support = true;
    next.player_sought_help = true;
    choiceLabel = 'Ask the rescuer to arrange community transport (₹0)';
    consequenceMsg = 'A local volunteer heading toward the clinic gives you and Miso a safe lift at no cost.';
  }

  next.wallet_balance -= cost;
  next.transport_expense += cost;
  next.total_expenses += cost;
  next.care_status = 'stabilizing';

  next.decisions.push({
    junction_id: 'J2_TRANSPORT',
    junction_title: 'Choosing Transport to the Vet',
    option_id: optionId,
    choice_label: choiceLabel,
    selected_amount: cost,
    selected_reason: reasons,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: `${optionId}_OUTCOME`,
    consequence_message: consequenceMsg,
    concept_tags: ['cost_comparison', 'value_vs_price', 'opportunity_cost', 'prioritisation'],
  });

  next.stage = 4; // Advance to Junction 3 (Stage 4)
  return next;
}

// Record opening an educational / vet estimate info card
export function recordInfoCardOpened(state: MisoGameState, cardId: string): MisoGameState {
  if (state.opened_info_cards.includes(cardId)) return state;
  return {
    ...state,
    information_explored: state.information_explored + 1,
    opened_info_cards: [...state.opened_info_cards, cardId],
  };
}

// JUNCTION 3 – VET ESTIMATE AND BUDGETING
// Rule: Budgeting screen plans money and records initial consultation + core urgent care commitment without double deducting.
// Vet estimate is ₹5,000 total (Consultation ₹800, Tests & treatment ₹2,700, Medicines ₹1,000, Follow-up ₹500).
// At Junction 3, the player reviews the ₹5,000 itemised estimate, plans their available balance across categories,
// and pays the initial Consultation (₹800) + first treatment deposit (₹2,700) = ₹3,500 now, while Medicines (₹1,000) & Follow-up (₹500) = ₹1,500 are due in the next stage (Junction 4) so the player experiences managing the financial gap!
export function applyJunction3(
  state: MisoGameState,
  allocation: MisoBudgetAllocation,
  planPresetName: string
): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);
  next.budget_plan = { ...allocation };

  // Deduct Consultation (₹800) + Urgent Tests & Treatment (₹2,700) = ₹3,500 at the clinic reception
  const consultationCost = 800;
  const urgentTreatmentCost = 2700;
  const immediateClinicCharge = consultationCost + urgentTreatmentCost; // ₹3,500

  next.consultation_expense = consultationCost;
  next.treatment_expense = urgentTreatmentCost;
  next.wallet_balance -= immediateClinicCharge;
  next.total_expenses += immediateClinicCharge;
  next.urgent_care_completed = true;
  next.recommended_care_followed = true;

  // Remaining planned care: Medicines (₹1,000) + Follow-up (₹500) = ₹1,500
  const remainingCareNeeded = 1500;
  const hasShortfall = next.wallet_balance < remainingCareNeeded;

  next.decisions.push({
    junction_id: 'J3_VET_BUDGET',
    junction_title: 'Vet Estimate and Budget Allocation',
    option_id: planPresetName,
    choice_label: `Planned ₹${(
      allocation.immediateCare +
      allocation.transport +
      allocation.food +
      allocation.treatmentAndMedicines +
      allocation.emergencyReserve
    ).toLocaleString('en-IN')} budget & paid ₹3,500 for Consultation + Urgent Tests`,
    selected_amount: immediateClinicCharge,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: hasShortfall ? 'J3_SHORTFALL_DETECTED' : 'J3_BUDGET_SET',
    consequence_message: hasShortfall
      ? `Consultation (₹800) and Urgent Tests (₹2,700) are underway! You have ₹${next.wallet_balance.toLocaleString('en-IN')} left, and Medicines (₹1,000) + Follow-up (₹500) plus a safe reserve will require bridging the financial gap.`
      : `Consultation (₹800) and Urgent Tests (₹2,700) are underway! You have ₹${next.wallet_balance.toLocaleString('en-IN')} remaining in your wallet for Medicines (₹1,000), Follow-up (₹500), and unexpected needs.`,
    concept_tags: ['budgeting', 'expense_planning', 'emergency_reserve', 'itemised_estimate'],
  });

  next.stage = 5; // Advance to Junction 4 (Stage 5)
  return next;
}

// JUNCTION 4 – MANAGING THE FINANCIAL GAP
// Player bridges the gap and settles Medicines (₹1,000) + Follow-up (₹500) = ₹1,500
export interface Junction4Input {
  optionId: 'J4_A' | 'J4_B' | 'J4_C' | 'J4_D' | 'J4_E';
  trustedBorrowAmount?: number; // 500 | 1000 | 1500
  bankLoanAmount?: number; // 500 | 1000 | 1500 (10% simple interest)
  requestWelfareSupport?: boolean; // adds ₹500 support
}

export function applyJunction4(state: MisoGameState, input: Junction4Input): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);

  let addedFunds = 0;
  const actionsTaken: string[] = [];

  if (input.optionId === 'J4_A') {
    const amt = input.trustedBorrowAmount || 1000;
    next.wallet_balance += amt;
    next.borrowed_principal += amt;
    next.repayment_due += amt; // 0% interest
    addedFunds += amt;
    actionsTaken.push(`Borrowed ₹${amt} from a trusted person (0% interest)`);
  } else if (input.optionId === 'J4_B') {
    const amt = input.bankLoanAmount || 1000;
    const interest = Math.round(amt * 0.1);
    next.wallet_balance += amt;
    next.borrowed_principal += amt;
    next.interest_amount += interest;
    next.repayment_due += amt + interest;
    addedFunds += amt;
    actionsTaken.push(`Took ₹${amt} Bank Loan (+₹${interest} interest at 10% = ₹${amt + interest} repayment)`);
  } else if (input.optionId === 'J4_C') {
    next.wallet_balance += 500;
    next.support_received += 500;
    next.player_sought_help = true;
    addedFunds += 500;
    actionsTaken.push('Received ₹500 support grant from Animal Welfare Group');
  } else if (input.optionId === 'J4_D') {
    actionsTaken.push('Reorganised existing budget without taking on debt');
  } else if (input.optionId === 'J4_E') {
    if (input.requestWelfareSupport) {
      next.wallet_balance += 500;
      next.support_received += 500;
      next.player_sought_help = true;
      addedFunds += 500;
      actionsTaken.push('₹500 Welfare Support');
    }
    if (input.trustedBorrowAmount && input.trustedBorrowAmount > 0) {
      const amt = input.trustedBorrowAmount;
      next.wallet_balance += amt;
      next.borrowed_principal += amt;
      next.repayment_due += amt;
      addedFunds += amt;
      actionsTaken.push(`₹${amt} Trusted Borrow (0%)`);
    }
    if (input.bankLoanAmount && input.bankLoanAmount > 0) {
      const amt = input.bankLoanAmount;
      const interest = Math.round(amt * 0.1);
      next.wallet_balance += amt;
      next.borrowed_principal += amt;
      next.interest_amount += interest;
      next.repayment_due += amt + interest;
      addedFunds += amt;
      actionsTaken.push(`₹${amt} Bank Loan (10% interest)`);
    }
    if (actionsTaken.length === 0) {
      actionsTaken.push('Reorganised budget');
    }
  }

  // Pay Medicines (₹1,000) and Follow-up Care booking (₹500) = ₹1,500
  const medicineAndFollowUp = 1500;
  if (next.wallet_balance >= medicineAndFollowUp) {
    next.wallet_balance -= medicineAndFollowUp;
    next.medicine_expense = 1000;
    next.follow_up_expense = 500;
    next.total_expenses += medicineAndFollowUp;
    next.follow_up_completed = true;
    next.care_status = 'recovering';
  } else {
    // Pay medicines first (₹1,000) and use welfare voucher for remaining follow-up if needed
    const medPay = Math.min(next.wallet_balance, 1000);
    next.wallet_balance -= medPay;
    next.medicine_expense = medPay;
    next.total_expenses += medPay;
    if (next.wallet_balance >= 500) {
      next.wallet_balance -= 500;
      next.follow_up_expense = 500;
      next.total_expenses += 500;
      next.follow_up_completed = true;
    } else {
      // Clinic community care covers follow-up check so low funds alone never hurt Miso
      next.follow_up_completed = true;
      next.player_sought_help = true;
    }
    next.care_status = 'recovering';
  }

  next.decisions.push({
    junction_id: 'J4_FINANCIAL_GAP',
    junction_title: 'Managing the Financial Gap',
    option_id: input.optionId,
    choice_label: actionsTaken.join(' + '),
    selected_amount: addedFunds,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: `${input.optionId}_OUTCOME`,
    consequence_message: `${actionsTaken.join(', ')}. Medicines (₹1,000) and Follow-up care (₹500) are now arranged! Wallet balance: ₹${next.wallet_balance.toLocaleString('en-IN')}.`,
    concept_tags: ['borrowing', 'interest', 'repayment', 'support_systems'],
  });

  next.stage = 6; // Advance to Junction 5 (Stage 6: Stationary Marketplace)
  return next;
}

// STATIONARY MARKETPLACE ACTIONS (Can be used at Junction 5 or anytime via the Persistent Marketplace Drawer)
export function marketplaceDepositSavings(state: MisoGameState, amount: number): MisoGameState {
  if (amount <= 0 || amount > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= amount;
  next.savings_balance += amount;
  return next;
}

export function marketplaceWithdrawSavings(state: MisoGameState, amount: number): MisoGameState {
  if (amount <= 0 || amount > state.savings_balance) return state;
  const next = structuredClone(state);
  next.savings_balance -= amount;
  next.wallet_balance += amount;
  return next;
}

export function marketplaceOpenFD(state: MisoGameState, amount: number): MisoGameState {
  if (amount <= 0 || amount > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= amount;
  next.fd_balance += amount;
  next.fd_current_value += Math.round(amount * 1.05); // 5% maturity value
  return next;
}

export function marketplaceBuyShare(
  state: MisoGameState,
  shareId: MisoShareId,
  units: number
): MisoGameState {
  if (units <= 0) return state;
  const price = state.share_prices[shareId].current;
  const cost = units * price;
  if (cost > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= cost;
  next.share_units[shareId] += units;
  return next;
}

export function marketplaceSellShare(
  state: MisoGameState,
  shareId: MisoShareId,
  units: number
): MisoGameState {
  if (units <= 0 || units > state.share_units[shareId]) return state;
  const price = state.share_prices[shareId].current;
  const saleValue = units * price;
  const next = structuredClone(state);
  next.share_units[shareId] -= units;
  next.wallet_balance += saleValue;
  return next;
}

export function marketplaceBuyCommodity(
  state: MisoGameState,
  commodityId: MisoCommodityId,
  units: number
): MisoGameState {
  if (units <= 0) return state;
  const price = state.commodity_prices[commodityId].current;
  const cost = units * price;
  if (cost > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= cost;
  next.commodity_units[commodityId] += units;
  return next;
}

export function marketplaceSellCommodity(
  state: MisoGameState,
  commodityId: MisoCommodityId,
  units: number
): MisoGameState {
  if (units <= 0 || units > state.commodity_units[commodityId]) return state;
  const price = state.commodity_prices[commodityId].current;
  const saleValue = units * price;
  const next = structuredClone(state);
  next.commodity_units[commodityId] -= units;
  next.wallet_balance += saleValue;
  return next;
}

// JUNCTION 5 – STATIONARY FINANCIAL MARKETPLACE DECISION
export function applyJunction5(
  state: MisoGameState,
  optionId: 'J5_A' | 'J5_B' | 'J5_C' | 'J5_D' | 'J5_E',
  amountOrDetail: number = 0,
  assetKey?: string
): MisoGameState {
  const before = snapshotBefore(state);
  let next = structuredClone(state);
  let choiceLabel = '';
  let consequenceMsg = '';
  let amountUsed = 0;

  if (optionId === 'J5_A') {
    choiceLabel = 'Keep money accessible in wallet';
    consequenceMsg = `You kept ₹${next.wallet_balance.toLocaleString('en-IN')} liquid in your wallet, ready for any unexpected medical costs.`;
  } else if (optionId === 'J5_B') {
    const amt = Math.min(amountOrDetail || 500, next.wallet_balance);
    if (amt > 0) {
      next = marketplaceDepositSavings(next, amt);
      amountUsed = amt;
    }
    choiceLabel = `Put ₹${amt.toLocaleString('en-IN')} in Savings Account (3% rate)`;
    consequenceMsg = `Transferred ₹${amt.toLocaleString('en-IN')} to your Savings Account. It earns interest while staying accessible when needed.`;
  } else if (optionId === 'J5_C') {
    const amt = Math.min(amountOrDetail || 500, next.wallet_balance);
    if (amt > 0) {
      next = marketplaceOpenFD(next, amt);
      amountUsed = amt;
    }
    choiceLabel = `Locked ₹${amt.toLocaleString('en-IN')} in a Fixed Deposit (5% return)`;
    consequenceMsg = `Placed ₹${amt.toLocaleString('en-IN')} in a Fixed Deposit (maturity value ₹${Math.round(amt * 1.05)}). Note: Locked funds cannot be used as immediate cash!`;
  } else if (optionId === 'J5_D') {
    const shareId: MisoShareId = assetKey === 'companyB' ? 'companyB' : 'companyA';
    const price = next.share_prices[shareId].current;
    const maxUnits = Math.floor(next.wallet_balance / price);
    const units = Math.min(Math.max(1, amountOrDetail || 2), maxUnits);
    if (units > 0) {
      next = marketplaceBuyShare(next, shareId, units);
      amountUsed = units * price;
    }
    choiceLabel = `Purchased ${units} share(s) of ${next.share_prices[shareId].name} for ₹${amountUsed}`;
    consequenceMsg = `Invested ₹${amountUsed} in ${units} share(s). Share values may fluctuate when market events occur.`;
  } else if (optionId === 'J5_E') {
    const commId: MisoCommodityId =
      assetKey === 'gold' ? 'gold' : assetKey === 'silver' ? 'silver' : 'wheat';
    const price = next.commodity_prices[commId].current;
    const maxUnits = Math.floor(next.wallet_balance / price);
    const units = Math.min(Math.max(1, amountOrDetail || 2), maxUnits);
    if (units > 0) {
      next = marketplaceBuyCommodity(next, commId, units);
      amountUsed = units * price;
    }
    choiceLabel = `Purchased ${units} unit(s) of ${next.commodity_prices[commId].name} for ₹${amountUsed}`;
    consequenceMsg = `Purchased ${units} commodity unit(s) for ₹${amountUsed}. Commodity prices shift with market supply and demand.`;
  }

  // Trigger the predefined Market Update as we transition into Junction 6 (Section 5, Junction 6)
  // Market update: Gold ₹1,000 -> ₹1,100, Silver ₹1,000 -> ₹850, Company A ₹100 -> ₹120, Company B ₹100 -> ₹80, Wheat ₹100 -> ₹110
  // Also credit 3% savings interest on savings_balance!
  if (next.savings_balance > 0) {
    const interest = Math.round(next.savings_balance * 0.03);
    next.savings_balance += interest;
    next.savings_interest_earned += interest;
  }

  next.share_prices.companyA = { ...next.share_prices.companyA, previous: 110, current: 120 };
  next.share_prices.companyB = { ...next.share_prices.companyB, previous: 90, current: 80 };
  next.commodity_prices.gold = { ...next.commodity_prices.gold, previous: 1000, current: 1100 };
  next.commodity_prices.silver = { ...next.commodity_prices.silver, previous: 900, current: 850 };
  next.commodity_prices.wheat = { ...next.commodity_prices.wheat, previous: 120, current: 110 };
  next.market_updated_at_j6 = true;
  next.medical_uncertainty_event = true;

  next.decisions.push({
    junction_id: 'J5_MARKETPLACE',
    junction_title: 'The Stationary Financial Marketplace',
    option_id: optionId,
    choice_label: choiceLabel,
    selected_amount: amountUsed,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: `${optionId}_OUTCOME`,
    consequence_message: consequenceMsg,
    concept_tags: ['saving_vs_investing', 'liquidity', 'risk_appetite', 'market_fluctuation'],
  });

  next.stage = 7; // Advance to Junction 6 (Stage 7: Unexpected Expense & Market Update)
  return next;
}

// JUNCTION 6 – UNEXPECTED EXPENSE (₹1,000 diagnostic test) AND MARKET UPDATE
export function applyJunction6(
  state: MisoGameState,
  optionId: 'J6_A' | 'J6_B' | 'J6_C' | 'J6_D' | 'J6_E',
  explicitlyDelayUrgentCare: boolean = false
): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);
  const diagnosticCost = 1000;

  let choiceLabel = '';
  let consequenceMsg = '';

  if (optionId === 'J6_E' && !explicitlyDelayUrgentCare) {
    // Player asked the vet about urgency and options first — return state with vet_urgency_asked = true without advancing stage yet
    next.vet_urgency_asked = true;
    next.information_explored += 1;
    return next;
  }

  if (explicitlyDelayUrgentCare) {
    // Only if player explicitly chooses to skip/delay urgent diagnostic care after clear warning
    next.care_delay_flag = true;
    next.urgent_care_completed = false;
    next.care_status = 'uncertain';
    choiceLabel = 'Delayed recommended diagnostic test despite vet warning';
    consequenceMsg = 'You decided not to proceed with the diagnostic test. The vet notes that missing critical diagnostics creates medical uncertainty.';
  } else if (optionId === 'J6_A') {
    // Use accessible money (wallet first, then savings, then emergency support/loan if still short)
    let remainingToPay = diagnosticCost;
    const fromWallet = Math.min(next.wallet_balance, remainingToPay);
    next.wallet_balance -= fromWallet;
    remainingToPay -= fromWallet;

    if (remainingToPay > 0 && next.savings_balance > 0) {
      const fromSavings = Math.min(next.savings_balance, remainingToPay);
      next.savings_balance -= fromSavings;
      remainingToPay -= fromSavings;
    }

    if (remainingToPay > 0) {
      // Shortfall covered by 0% emergency clinic bridge
      next.borrowed_principal += remainingToPay;
      next.repayment_due += remainingToPay;
      remainingToPay = 0;
    }

    next.unexpected_expense = diagnosticCost;
    next.total_expenses += diagnosticCost;
    next.care_status = 'recovered';
    choiceLabel = 'Used accessible money (Wallet / Savings) for ₹1,000 diagnostic test';
    consequenceMsg = 'You paid ₹1,000 from your liquid funds. The diagnostic test confirms Miso responds well to treatment!';
  } else if (optionId === 'J6_B') {
    // Reorganise budget and cover diagnostic test
    let remainingToPay = diagnosticCost;
    const fromWallet = Math.min(next.wallet_balance, remainingToPay);
    next.wallet_balance -= fromWallet;
    remainingToPay -= fromWallet;

    if (remainingToPay > 0 && next.savings_balance > 0) {
      const fromSavings = Math.min(next.savings_balance, remainingToPay);
      next.savings_balance -= fromSavings;
      remainingToPay -= fromSavings;
    }
    if (remainingToPay > 0) {
      next.borrowed_principal += remainingToPay;
      next.repayment_due += remainingToPay;
    }

    next.unexpected_expense = diagnosticCost;
    next.total_expenses += diagnosticCost;
    next.care_status = 'recovered';
    choiceLabel = 'Reorganised budget reserve to cover ₹1,000 diagnostic test';
    consequenceMsg = 'You reallocated your emergency reserve to cover the ₹1,000 diagnostic test smoothly.';
  } else if (optionId === 'J6_C') {
    // Sell eligible investments (Shares & Commodities) at current game value to raise cash, then pay ₹1,000
    let saleProceeds = 0;
    for (const sId of ['companyA', 'companyB'] as MisoShareId[]) {
      if (next.share_units[sId] > 0) {
        saleProceeds += next.share_units[sId] * next.share_prices[sId].current;
        next.share_units[sId] = 0;
      }
    }
    for (const cId of ['gold', 'silver', 'wheat'] as MisoCommodityId[]) {
      if (next.commodity_units[cId] > 0) {
        saleProceeds += next.commodity_units[cId] * next.commodity_prices[cId].current;
        next.commodity_units[cId] = 0;
      }
    }
    next.wallet_balance += saleProceeds;

    let remainingToPay = diagnosticCost;
    const fromWallet = Math.min(next.wallet_balance, remainingToPay);
    next.wallet_balance -= fromWallet;
    remainingToPay -= fromWallet;

    if (remainingToPay > 0 && next.savings_balance > 0) {
      const fromSavings = Math.min(next.savings_balance, remainingToPay);
      next.savings_balance -= fromSavings;
      remainingToPay -= fromSavings;
    }
    if (remainingToPay > 0) {
      next.borrowed_principal += remainingToPay;
      next.repayment_due += remainingToPay;
    }

    next.unexpected_expense = diagnosticCost;
    next.total_expenses += diagnosticCost;
    next.care_status = 'recovered';
    choiceLabel = `Sold investments (₹${saleProceeds}) at updated market value to cover ₹1,000 test`;
    consequenceMsg = `You liquidated eligible investments for ₹${saleProceeds} and paid ₹1,000 for Miso's diagnostic test.`;
  } else if (optionId === 'J6_D') {
    // Explore additional support: Welfare clinic diagnostic fund covers ₹500, player covers ₹500
    const grant = 500;
    next.support_received += grant;
    next.player_sought_help = true;
    let playerPortion = diagnosticCost - grant; // ₹500

    const fromWallet = Math.min(next.wallet_balance, playerPortion);
    next.wallet_balance -= fromWallet;
    playerPortion -= fromWallet;

    if (playerPortion > 0 && next.savings_balance > 0) {
      const fromSavings = Math.min(next.savings_balance, playerPortion);
      next.savings_balance -= fromSavings;
      playerPortion -= fromSavings;
    }
    if (playerPortion > 0) {
      next.borrowed_principal += playerPortion;
      next.repayment_due += playerPortion;
    }

    next.unexpected_expense = 500;
    next.total_expenses += 500;
    next.care_status = 'recovered';
    choiceLabel = 'Combined ₹500 diagnostic support grant with ₹500 from your funds';
    consequenceMsg = 'The clinic charitable diagnostic fund contributed ₹500, and you covered the remaining ₹500!';
  }

  next.decisions.push({
    junction_id: 'J6_UNEXPECTED_EXPENSE',
    junction_title: 'Unexpected Diagnostic Expense & Market Update',
    option_id: optionId,
    choice_label: choiceLabel,
    selected_amount: next.unexpected_expense,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: `${optionId}_OUTCOME`,
    consequence_message: consequenceMsg,
    concept_tags: ['emergency_planning', 'liquidity', 'market_fluctuation', 'adaptability'],
  });

  next.stage = 8; // Advance to Junction 7 (Stage 8: Final Allocation)
  return next;
}

// JUNCTION 7 – FINAL ALLOCATION AND REFLECTION
export interface FinalAllocationInput {
  repaymentAmount: number;
  savingsAmount: number;
  accessibleWalletAmount: number;
  investmentAmount: number;
}

export function applyJunction7(
  state: MisoGameState,
  allocation: FinalAllocationInput
): MisoGameState {
  const before = snapshotBefore(state);
  const next = structuredClone(state);

  // Pool accessible liquid money (wallet + savings) for final redistribution
  const totalLiquid = next.wallet_balance + next.savings_balance;
  const actualRepay = Math.min(allocation.repaymentAmount, next.repayment_due, totalLiquid);
  let remainingLiquid = totalLiquid - actualRepay;

  const actualInvest = Math.min(allocation.investmentAmount, remainingLiquid);
  remainingLiquid -= actualInvest;

  const actualSavings = Math.min(allocation.savingsAmount, remainingLiquid);
  const actualWallet = remainingLiquid - actualSavings;

  next.repayment_due -= actualRepay;
  next.savings_balance = actualSavings;
  next.wallet_balance = actualWallet;

  if (actualInvest > 0) {
    // Invest into Company A units or FD value
    next.fd_balance += actualInvest;
    next.fd_current_value += actualInvest;
  }

  // Mature existing FD at the end of the story journey
  if (next.fd_balance > 0 && !next.fd_matured) {
    next.fd_matured = true;
  }

  next.decisions.push({
    junction_id: 'J7_FINAL_ALLOCATION',
    junction_title: 'Final Resource Allocation',
    option_id: 'J7_ALLOCATE',
    choice_label: `Allocated: ₹${actualRepay} Repayment · ₹${actualSavings} Savings · ₹${actualWallet} Cash · ₹${actualInvest} Investment`,
    selected_amount: totalLiquid,
    information_cards_opened: [...next.opened_info_cards],
    financial_state_before: before,
    financial_state_after: snapshotBefore(next),
    consequence_id: 'J7_COMPLETE',
    consequence_message: 'Final allocation complete. Generating your personal Decision Blueprint.',
    concept_tags: ['repayment', 'rebuilding_savings', 'financial_planning'],
  });

  next.stage = 9; // Ending & Blueprint
  return next;
}

// SECTION 8: EXACT CONSEQUENCE AND ENDING ENGINE
export function calculateCareScore(state: MisoGameState): number {
  let score = 0;
  if (state.vet_consultation_completed) score += 1; // Milestone 1: Vet reached
  if (state.urgent_care_completed && !state.care_delay_flag) score += 1; // Milestone 2: Urgent care arranged
  if (state.follow_up_completed) score += 1; // Milestone 3: Follow-up completed
  return score;
}

export type FinancialOutcomeCategory =
  | 'Financially prepared'
  | 'Financially stable'
  | 'Financially stretched';

export function getFinancialOutcomeCategory(state: MisoGameState): FinancialOutcomeCategory {
  const netPos = getFinalNetPosition(state);
  const accessible = getAccessibleResources(state);

  if (state.repayment_due > 500 || netPos < 0 || accessible < 200) {
    return 'Financially stretched';
  }
  if (state.repayment_due === 0 && accessible >= 500 && netPos >= 500) {
    return 'Financially prepared';
  }
  return 'Financially stable';
}

export interface MisoEndingResult {
  endingId: 'ENDING_A' | 'ENDING_B' | 'ENDING_C' | 'ENDING_D';
  title: string;
  subtitle: string;
  careScore: number;
  careOutcomeLabel: string;
  financialCategory: FinancialOutcomeCategory;
  finalNetPosition: number;
  narrative: string;
  blueprintFocus: string[];
  observations: string[];
}

export function evaluateMisoEnding(state: MisoGameState): MisoEndingResult {
  const careScore = calculateCareScore(state);
  const financialCategory = getFinancialOutcomeCategory(state);
  const finalNetPosition = getFinalNetPosition(state);

  // Generate 2 observations based on actual player decisions (Section 9, Section 2)
  const observations: string[] = [];
  const j1 = state.decisions.find((d) => d.junction_id === 'J1_FEEDING');
  const j4 = state.decisions.find((d) => d.junction_id === 'J4_FINANCIAL_GAP');
  const j5 = state.decisions.find((d) => d.junction_id === 'J5_MARKETPLACE');
  const j6 = state.decisions.find((d) => d.junction_id === 'J6_UNEXPECTED_EXPENSE');

  if (state.player_sought_help || state.support_received > 0) {
    observations.push('You actively considered community support and shared resources before taking on heavy debt.');
  } else if (j1?.option_id === 'J1_A') {
    observations.push('You prioritised immediate out-of-pocket action for Miso’s needs before exploring external products.');
  }

  if (j5?.option_id === 'J5_A' || j5?.option_id === 'J5_B') {
    observations.push('You preferred keeping money liquid and accessible instead of locking it away during an active medical situation.');
  } else if (j5?.option_id === 'J5_C') {
    observations.push('You explored a locked Fixed Deposit for higher returns, experiencing the trade-off between yield and liquidity.');
  } else if (j5?.option_id === 'J5_D' || j5?.option_id === 'J5_E') {
    observations.push('You tested market-linked assets (shares or commodities) and experienced how price fluctuations affect short-term funds.');
  }

  if (observations.length < 2) {
    if (j6?.option_id === 'J6_B' || j4?.option_id === 'J4_D') {
      observations.push('You adjusted and reorganised your budget allocations when unexpected expenses appeared.');
    } else {
      observations.push('You balanced immediate veterinary expenses against your remaining commitments.');
    }
  }

  // Matrix rules (Section 8.5):
  // 1. If careScore <= 1 (or care_delay_flag triggered): Ending D – An Uncertain Outcome
  if (careScore <= 1 || state.care_delay_flag) {
    return {
      endingId: 'ENDING_D',
      title: 'Ending D – An Uncertain Outcome',
      subtitle: 'Quiet Reflection on Timely Care & Resources',
      careScore,
      careOutcomeLabel: 'Miso’s recovery remains uncertain due to delayed diagnostics',
      financialCategory,
      finalNetPosition,
      narrative:
        'Not every outcome is within our control. Look back at the information you had, the choices you made and what you might consider in a future situation.',
      blueprintFocus: [
        'Information gathered before acting',
        'Decisions made under uncertainty',
        'Whether timely professional help was sought',
        'What support options were available',
        'What was outside the player’s control',
      ],
      observations: observations.slice(0, 2),
    };
  }

  // 2. If Miso recovers with significant community support (support_received > 0 or transport_support or community_food_help)
  // Let's check if community support was a key driver OR if Ending A / B applies
  if (state.support_received >= 500 && (state.transport_support || state.community_food_help || state.rescuer_contacted)) {
    return {
      endingId: 'ENDING_C',
      title: 'Ending C – Strength in Support',
      subtitle: 'Miso Recovers with Community & Shared Resources',
      careScore,
      careOutcomeLabel: 'Miso recovers with the help of community resources',
      financialCategory,
      finalNetPosition,
      narrative:
        'Miso completes her treatment and curls up comfortably in a warm recovery basket. By reaching out to the tea stall owner, rescuers, and welfare groups, you ensured Miso received full care while keeping your personal finances sustainable.',
      blueprintFocus: [
        'Seeking timely help and guidance',
        'Combining personal money with shared community resources',
        'Exploring low-cost safe alternatives',
        'Understanding that financial decisions are not always solo decisions',
      ],
      observations: observations.slice(0, 2),
    };
  }

  // 3. Miso recovers + Financially stretched -> Ending B – Care Comes First
  if (financialCategory === 'Financially stretched') {
    return {
      endingId: 'ENDING_B',
      title: 'Ending B – Care Comes First',
      subtitle: 'Miso Recovers Fully · Rebuilding Your Financial Buffer',
      careScore,
      careOutcomeLabel: 'Miso completes her care journey and recovers',
      financialCategory,
      finalNetPosition,
      narrative:
        'Miso is healthy, purring, and safe! You prioritised every stage of her veterinary care without hesitation. While your accessible savings are currently low or you have a remaining repayment commitment, you have a clear plan to rebuild.',
      blueprintFocus: [
        'Balancing immediate urgent needs versus future commitments',
        'Understanding borrowing costs and repayment obligations',
        'Steps for rebuilding an emergency savings buffer',
        'Planning ahead for unexpected expenses',
      ],
      observations: observations.slice(0, 2),
    };
  }

  // 4. Default when Miso recovers + Financially prepared / stable -> Ending A – A Balanced Recovery
  return {
    endingId: 'ENDING_A',
    title: 'Ending A – A Balanced Recovery',
    subtitle: 'Miso Recovers & Your Finances Remain Resilient',
    careScore,
    careOutcomeLabel: 'Miso completes the planned care journey and recovers',
    financialCategory,
    finalNetPosition,
    narrative:
      'Miso recovers completely, her orange patch bright and her eyes lively again! You navigated every medical expense thoughtfully, kept track of your liquidity, and maintained a balanced financial position.',
    blueprintFocus: [
      'Thoughtful budgeting and expense planning',
      'Prioritising urgent needs while preserving liquidity',
      'Maintaining accessible resources for surprises',
      'Managing unexpected expenses without panic',
    ],
    observations: observations.slice(0, 2),
  };
}
