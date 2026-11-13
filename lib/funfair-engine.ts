// Pure game state & rule engine for Game 2: FUNFAIR FOUNDER – Build, Sell, Grow!

export type StallType = 'food' | 'game' | 'hybrid';
export type LocationId = 'entrance' | 'main_stage' | 'activity_corner';
export type PricingStrategy = 'lower' | 'suggested' | 'premium';
export type FunfairProductId =
  | 'lemonade'
  | 'popcorn'
  | 'sandwich'
  | 'ring_toss'
  | 'lucky_cups'
  | 'mini_target';

export type FunfairShareId = 'funFoods' | 'playWorks';
export type FunfairCommodityId = 'wheat' | 'sugar' | 'corn';

export interface ProductCatalogItem {
  id: FunfairProductId;
  name: string;
  category: 'food' | 'game';
  baseUnitCost: number;
  currentUnitCost: number;
  prices: Record<PricingStrategy, number>;
  perishable: boolean;
  demandWeight: number;
  shelfNote: string;
}

export interface FunfairPeriodLog {
  period: 1 | 2 | 3;
  periodName: string;
  visitors: number;
  unitsSold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  spoiledUnits: number;
  highlightNote: string;
}

export interface FunfairDecisionRecord {
  junctionId: string;
  title: string;
  choiceLabel: string;
  financialImpact: string;
  conceptTags: string[];
}

export interface FunfairGameState {
  stage: number; // 1 (Intro) to 11 (Blueprint)
  game_timer: number; // 270 seconds (4m 30s)
  business_period: 1 | 2 | 3;

  // 15.1 & 15.3 Financial variables
  starting_capital: number;
  wallet_balance: number;
  savings_balance: number;
  savings_interest: number;
  fd_balance: number;
  fd_maturity_period: number;
  fd_matured: boolean;
  borrowed_principal: number;
  interest_amount: number;
  repayment_due: number; // outstanding_debt

  // Shares & Commodities
  share_units: Record<FunfairShareId, number>;
  share_prices: Record<FunfairShareId, { previous: number; current: number; name: string }>;
  commodity_units: Record<FunfairCommodityId, number>;
  commodity_prices: Record<FunfairCommodityId, { previous: number; current: number; name: string }>;

  // 15.2 Business variables
  stall_type: StallType | null;
  stall_location: LocationId | null;
  setup_cost: number;
  rent_paid: number;
  footfall_multiplier: number;
  competition_level: 'High' | 'Medium' | 'Low';
  bulk_discount: boolean;
  pricing_strategy: PricingStrategy;

  // Inventory tracking per product
  catalog: Record<FunfairProductId, ProductCatalogItem>;
  inventory: Record<FunfairProductId, number>;
  units_sold_by_product: Record<FunfairProductId, number>;
  revenue_by_product: Record<FunfairProductId, number>;

  // Cumulative accounting
  total_revenue: number;
  cost_of_goods_sold: number;
  fixed_expenses: number; // setup + rent
  variable_expenses: number; // inventory purchases + restock + promotions + differentiation
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  units_sold: number;
  stock_spoiled: number;

  // Decisions & Events
  promotion_selected: string;
  discount_selected: string;
  period2_response: string;
  competition_response: string;
  accepted_bulk_order: boolean;
  customer_insight_unlocked: boolean;
  market_event_triggered: boolean;
  period_logs: FunfairPeriodLog[];
  decisions: FunfairDecisionRecord[];
  reflection_note: string;
}

export const INITIAL_CATALOG: Record<FunfairProductId, ProductCatalogItem> = {
  lemonade: {
    id: 'lemonade',
    name: 'Chilled Nimbu Lemonade',
    category: 'food',
    baseUnitCost: 10,
    currentUnitCost: 10,
    prices: { lower: 20, suggested: 25, premium: 35 },
    perishable: true,
    demandWeight: 1.35,
    shelfNote: 'High afternoon demand · Perishable ice & lemons',
  },
  popcorn: {
    id: 'popcorn',
    name: 'Caramel & Masala Popcorn',
    category: 'food',
    baseUnitCost: 15,
    currentUnitCost: 15,
    prices: { lower: 28, suggested: 35, premium: 45 },
    perishable: false,
    demandWeight: 1.2,
    shelfNote: 'Great crowd aroma · Stays fresh all evening',
  },
  sandwich: {
    id: 'sandwich',
    name: 'Grilled Chutney Sandwich',
    category: 'food',
    baseUnitCost: 25,
    currentUnitCost: 25,
    prices: { lower: 40, suggested: 50, premium: 65 },
    perishable: true,
    demandWeight: 0.9,
    shelfNote: 'Higher ticket value · Perishable fresh bread',
  },
  ring_toss: {
    id: 'ring_toss',
    name: 'Ring Toss Prize Challenge',
    category: 'game',
    baseUnitCost: 8,
    currentUnitCost: 8,
    prices: { lower: 22, suggested: 30, premium: 40 },
    perishable: false,
    demandWeight: 1.35,
    shelfNote: 'High repeat plays · Non-perishable prizes',
  },
  lucky_cups: {
    id: 'lucky_cups',
    name: 'Lucky Cups Mystery Spin',
    category: 'game',
    baseUnitCost: 12,
    currentUnitCost: 12,
    prices: { lower: 28, suggested: 35, premium: 48 },
    perishable: false,
    demandWeight: 1.15,
    shelfNote: 'Attracts groups · Non-perishable prizes',
  },
  mini_target: {
    id: 'mini_target',
    name: 'Mini Target Dart Challenge',
    category: 'game',
    baseUnitCost: 10,
    currentUnitCost: 10,
    prices: { lower: 24, suggested: 30, premium: 42 },
    perishable: false,
    demandWeight: 1.2,
    shelfNote: 'Fast turnover · Non-perishable prizes',
  },
};

export const INITIAL_FUNFAIR_STATE: FunfairGameState = {
  stage: 1,
  game_timer: 270,
  business_period: 1,

  starting_capital: 1000,
  wallet_balance: 1000,
  savings_balance: 0,
  savings_interest: 0,
  fd_balance: 0,
  fd_maturity_period: 0,
  fd_matured: false,
  borrowed_principal: 0,
  interest_amount: 0,
  repayment_due: 0,

  share_units: { funFoods: 0, playWorks: 0 },
  share_prices: {
    funFoods: { previous: 100, current: 100, name: 'FunFoods Festival Corp' },
    playWorks: { previous: 120, current: 120, name: 'PlayWorks Carnival Rides' },
  },
  commodity_units: { wheat: 0, sugar: 0, corn: 0 },
  commodity_prices: {
    wheat: { previous: 100, current: 100, name: 'Wheat Flour Sack' },
    sugar: { previous: 120, current: 120, name: 'Refined Sugar Crate' },
    corn: { previous: 80, current: 80, name: 'Golden Popcorn Kernels' },
  },

  stall_type: null,
  stall_location: null,
  setup_cost: 0,
  rent_paid: 0,
  footfall_multiplier: 1.0,
  competition_level: 'Medium',
  bulk_discount: false,
  pricing_strategy: 'suggested',

  catalog: structuredClone(INITIAL_CATALOG),
  inventory: {
    lemonade: 0,
    popcorn: 0,
    sandwich: 0,
    ring_toss: 0,
    lucky_cups: 0,
    mini_target: 0,
  },
  units_sold_by_product: {
    lemonade: 0,
    popcorn: 0,
    sandwich: 0,
    ring_toss: 0,
    lucky_cups: 0,
    mini_target: 0,
  },
  revenue_by_product: {
    lemonade: 0,
    popcorn: 0,
    sandwich: 0,
    ring_toss: 0,
    lucky_cups: 0,
    mini_target: 0,
  },

  total_revenue: 0,
  cost_of_goods_sold: 0,
  fixed_expenses: 0,
  variable_expenses: 0,
  total_expenses: 0,
  gross_profit: 0,
  net_profit: 0,
  units_sold: 0,
  stock_spoiled: 0,

  promotion_selected: '',
  discount_selected: '',
  period2_response: '',
  competition_response: '',
  accepted_bulk_order: false,
  customer_insight_unlocked: false,
  market_event_triggered: false,
  period_logs: [],
  decisions: [],
  reflection_note: '',
};

export function getEligibleProductsForStall(stallType: StallType | null): FunfairProductId[] {
  if (stallType === 'food') return ['lemonade', 'popcorn', 'sandwich'];
  if (stallType === 'game') return ['ring_toss', 'lucky_cups', 'mini_target'];
  return ['lemonade', 'popcorn', 'ring_toss', 'lucky_cups']; // hybrid gets top 2 food + top 2 games
}

export function getFunfairShareValue(state: FunfairGameState): number {
  return (
    state.share_units.funFoods * state.share_prices.funFoods.current +
    state.share_units.playWorks * state.share_prices.playWorks.current
  );
}

export function getFunfairCommodityValue(state: FunfairGameState): number {
  return (
    state.commodity_units.wheat * state.commodity_prices.wheat.current +
    state.commodity_units.sugar * state.commodity_prices.sugar.current +
    state.commodity_units.corn * state.commodity_prices.corn.current
  );
}

export function getSellableInventoryValue(state: FunfairGameState): number {
  let total = 0;
  for (const key of Object.keys(state.inventory) as FunfairProductId[]) {
    const qty = state.inventory[key];
    if (qty > 0) {
      const item = state.catalog[key];
      // Non-perishable retains 100% unit cost value; perishable retains 60% salvage value
      const factor = item.perishable ? 0.6 : 1.0;
      total += Math.round(qty * item.currentUnitCost * factor);
    }
  }
  // Reusable stall kit & counter equipment retains 80% resale/deposit value at fair close
  if (state.setup_cost > 0) {
    total += Math.round(state.setup_cost * 0.8);
  }
  return total;
}

export function getTotalRemainingStockUnits(state: FunfairGameState): number {
  return Object.values(state.inventory).reduce((acc, v) => acc + v, 0);
}

// Section 14 & 16.I: final_business_value = wallet_balance + savings_balance + matured_fd_value + share_value + commodity_value + sellable_inventory_value - outstanding_debt - unpaid_expenses
export function getFinalBusinessValue(state: FunfairGameState): number {
  const fdVal = state.fd_matured ? Math.round(state.fd_balance * 1.05) : state.fd_balance;
  return (
    state.wallet_balance +
    state.savings_balance +
    fdVal +
    getFunfairShareValue(state) +
    getFunfairCommodityValue(state) +
    getSellableInventoryValue(state) -
    state.repayment_due
  );
}

export function getGrowthMultiple(state: FunfairGameState): number {
  return Number((getFinalBusinessValue(state) / state.starting_capital).toFixed(2));
}

// JUNCTION 1 – CHOOSE YOUR STALL
export function selectFunfairStall(state: FunfairGameState, stallType: StallType): FunfairGameState {
  const next = structuredClone(state);
  const setupCost = stallType === 'hybrid' ? 500 : 350;
  next.stall_type = stallType;
  next.setup_cost = setupCost;
  next.wallet_balance -= setupCost;
  next.fixed_expenses += setupCost;
  next.total_expenses += setupCost;
  next.net_profit = next.total_revenue - next.total_expenses;

  const labelMap: Record<StallType, string> = {
    food: 'Option A – Food Stall (₹350 setup)',
    game: 'Option B – Game Stall (₹350 setup)',
    hybrid: 'Option C – Hybrid Food + Game Stall (₹500 setup)',
  };

  next.decisions.push({
    junctionId: 'FF_J1_STALL',
    title: 'Choose Your Stall Type',
    choiceLabel: labelMap[stallType],
    financialImpact: `-₹${setupCost} setup cost · ₹${next.wallet_balance} working capital remaining`,
    conceptTags: ['business_models', 'initial_capital', 'diversification'],
  });

  next.stage = 3; // Move to Junction 2 (Location)
  return next;
}

// JUNCTION 2 – WHERE SHOULD YOU SET UP?
export function selectFunfairLocation(
  state: FunfairGameState,
  locationId: LocationId
): FunfairGameState {
  const next = structuredClone(state);
  const config: Record<
    LocationId,
    { rent: number; multiplier: number; comp: 'High' | 'Medium' | 'Low'; label: string }
  > = {
    entrance: {
      rent: 250,
      multiplier: 1.25,
      comp: 'High',
      label: 'Location A – Near the Entrance (₹250 rent · 1.25× footfall)',
    },
    main_stage: {
      rent: 350,
      multiplier: 1.5,
      comp: 'Medium',
      label: 'Location B – Near the Main Stage (₹350 rent · 1.5× peak footfall)',
    },
    activity_corner: {
      rent: 150,
      multiplier: 1.0,
      comp: 'Low',
      label: 'Location C – Near the Activity Corner (₹150 rent · Low competition)',
    },
  };

  const chosen = config[locationId];
  next.stall_location = locationId;
  next.rent_paid = chosen.rent;
  next.footfall_multiplier = chosen.multiplier;
  next.competition_level = chosen.comp;
  next.wallet_balance -= chosen.rent;
  next.fixed_expenses += chosen.rent;
  next.total_expenses += chosen.rent;
  next.net_profit = next.total_revenue - next.total_expenses;

  next.decisions.push({
    junctionId: 'FF_J2_LOCATION',
    title: 'Stall Location Selection',
    choiceLabel: chosen.label,
    financialImpact: `-₹${chosen.rent} rent · ₹${next.wallet_balance} left for stock`,
    conceptTags: ['fixed_costs', 'location_strategy', 'customer_footfall'],
  });

  next.stage = 4; // Move to Junction 3 (Buy Stock)
  return next;
}

// JUNCTION 3 – BUY YOUR STOCK
export function purchaseInitialStock(
  state: FunfairGameState,
  quantities: Partial<Record<FunfairProductId, number>>,
  useBulkOffer: boolean,
  supplierCreditLoan: number = 0 // Optional working capital boost if player wants bulk inventory
): FunfairGameState {
  const next = structuredClone(state);

  if (supplierCreditLoan > 0) {
    const interest = Math.round(supplierCreditLoan * 0.08);
    next.wallet_balance += supplierCreditLoan;
    next.borrowed_principal += supplierCreditLoan;
    next.interest_amount += interest;
    next.repayment_due += supplierCreditLoan + interest;
  }

  let grossCost = 0;
  let totalUnits = 0;
  for (const [k, qty] of Object.entries(quantities)) {
    const prodId = k as FunfairProductId;
    const count = Math.max(0, Math.floor(qty || 0));
    if (count > 0) {
      grossCost += count * next.catalog[prodId].currentUnitCost;
      totalUnits += count;
    }
  }

  const qualifiesForBulk = useBulkOffer && grossCost >= 300;
  const finalCost = qualifiesForBulk ? Math.round(grossCost * 0.9) : grossCost;

  if (finalCost > next.wallet_balance) {
    // Clamp quantities proportionally if exceeding wallet
    return state;
  }

  for (const [k, qty] of Object.entries(quantities)) {
    const prodId = k as FunfairProductId;
    const count = Math.max(0, Math.floor(qty || 0));
    next.inventory[prodId] += count;
  }

  next.bulk_discount = qualifiesForBulk;
  next.wallet_balance -= finalCost;
  next.variable_expenses += finalCost;
  next.total_expenses += finalCost;
  next.net_profit = next.total_revenue - next.total_expenses;

  next.decisions.push({
    junctionId: 'FF_J3_STOCK',
    title: 'Initial Inventory Purchase',
    choiceLabel: `Purchased ${totalUnits} units across stall items${qualifiesForBulk ? ' (10% Bulk Discount applied)' : ''}`,
    financialImpact: `-₹${finalCost} inventory cost · ₹${next.wallet_balance} cash left`,
    conceptTags: ['inventory_management', 'variable_costs', 'bulk_purchasing', 'working_capital'],
  });

  next.stage = 5; // Move to Junction 4 (Pricing)
  return next;
}

// JUNCTION 4 – SET YOUR SELLING PRICE
export function selectPricingStrategy(
  state: FunfairGameState,
  strategy: PricingStrategy
): FunfairGameState {
  const next = structuredClone(state);
  next.pricing_strategy = strategy;

  const labels: Record<PricingStrategy, string> = {
    lower: 'Option A – Value / Lower Price (Higher volume, tighter margin)',
    suggested: 'Option B – Suggested Balanced Price (Healthy margin & steady demand)',
    premium: 'Option C – Premium Price (Highest margin per sale, selective demand)',
  };

  next.decisions.push({
    junctionId: 'FF_J4_PRICING',
    title: 'Product Pricing Strategy',
    choiceLabel: labels[strategy],
    financialImpact: `Set selling prices to ${strategy.toUpperCase()} tier`,
    conceptTags: ['pricing', 'profit_margin', 'revenue_vs_profit'],
  });

  next.stage = 6; // Move to Junction 5 (Period 1: Opening Rush)
  return next;
}

// Helper to simulate a Business Period's sales (Period 1, 2, or 3)
function runSalesSimulation(
  state: FunfairGameState,
  period: 1 | 2 | 3,
  periodName: string,
  baseVisitors: number,
  demandBoostMultiplier: number,
  priceDiscountFactor: number,
  highlightNote: string
): FunfairGameState {
  const next = structuredClone(state);
  const priceSensitivity: Record<PricingStrategy, number> = {
    lower: 1.3,
    suggested: 1.1,
    premium: next.competition_level === 'Low' ? 1.0 : 0.85,
  };

  const stratMult = priceSensitivity[next.pricing_strategy];
  let periodUnitsSold = 0;
  let periodRevenue = 0;
  let periodCogs = 0;
  let periodSpoiled = 0;

  const eligible = getEligibleProductsForStall(next.stall_type);
  for (const prodId of eligible) {
    const stock = next.inventory[prodId];
    if (stock <= 0) continue;

    const item = next.catalog[prodId];
    const rawDemand =
      baseVisitors *
      0.78 *
      next.footfall_multiplier *
      item.demandWeight *
      stratMult *
      demandBoostMultiplier;

    const calculatedDemand = Math.max(1, Math.round(rawDemand));
    const sold = Math.min(stock, calculatedDemand);
    const effectivePrice = Math.round(item.prices[next.pricing_strategy] * priceDiscountFactor);
    const rev = sold * effectivePrice;
    const cogs = sold * item.currentUnitCost;

    next.inventory[prodId] -= sold;
    next.units_sold_by_product[prodId] += sold;
    next.revenue_by_product[prodId] += rev;

    periodUnitsSold += sold;
    periodRevenue += rev;
    periodCogs += cogs;

    // Small spoilage on unsold perishable food at end of period (10%)
    if (item.perishable && next.inventory[prodId] > 4) {
      const spoiled = Math.min(next.inventory[prodId], Math.floor(next.inventory[prodId] * 0.1));
      next.inventory[prodId] -= spoiled;
      periodSpoiled += spoiled;
    }
  }

  next.wallet_balance += periodRevenue;
  next.total_revenue += periodRevenue;
  next.cost_of_goods_sold += periodCogs;
  next.gross_profit = next.total_revenue - next.cost_of_goods_sold;
  next.net_profit = next.total_revenue - next.total_expenses;
  next.units_sold += periodUnitsSold;
  next.stock_spoiled += periodSpoiled;

  next.period_logs.push({
    period,
    periodName,
    visitors: Math.round(baseVisitors * next.footfall_multiplier),
    unitsSold: periodUnitsSold,
    revenue: periodRevenue,
    cogs: periodCogs,
    grossProfit: periodRevenue - periodCogs,
    spoiledUnits: periodSpoiled,
    highlightNote,
  });

  return next;
}

// JUNCTION 5 – FIRST BUSINESS PERIOD: OPENING RUSH
export function applyFunfairJunction5(
  state: FunfairGameState,
  decisionA: 'promote' | 'combo' | 'keep' | 'observe',
  decisionB: 'small_discount' | 'maintain_price' | 'bundle'
): FunfairGameState {
  let next = structuredClone(state);
  next.promotion_selected = decisionA;
  next.discount_selected = decisionB;

  let demandMult = 1.1;
  let marginFactor = 1.0;

  if (decisionA === 'promote') {
    demandMult += 0.25;
    if (next.wallet_balance >= 40) {
      next.wallet_balance -= 40;
      next.variable_expenses += 40;
      next.total_expenses += 40;
    }
  } else if (decisionA === 'combo') {
    demandMult += 0.22;
    marginFactor *= 0.95;
  } else if (decisionA === 'observe') {
    demandMult += 0.15;
    next.customer_insight_unlocked = true;
  }

  if (decisionB === 'small_discount') {
    demandMult += 0.18;
    marginFactor *= 0.92;
  } else if (decisionB === 'bundle') {
    demandMult += 0.22;
    marginFactor *= 0.96;
  }

  next = runSalesSimulation(
    next,
    1,
    'Round 1: Opening Rush',
    32,
    demandMult,
    marginFactor,
    'Opening crowd explored your stall and responded strongly to your launch setup!'
  );

  const lastLog = next.period_logs[next.period_logs.length - 1];
  next.decisions.push({
    junctionId: 'FF_J5_OPENING_RUSH',
    title: 'Period 1: Opening Rush Operations',
    choiceLabel: `Focus: ${decisionA.toUpperCase()} · Customer request: ${decisionB.replace('_', ' ').toUpperCase()}`,
    financialImpact: `Sold ${lastLog.unitsSold} units · +₹${lastLog.revenue} Revenue (₹${lastLog.grossProfit} Gross Profit)`,
    conceptTags: ['demand_and_supply', 'sales', 'customer_behaviour', 'gross_profit'],
  });

  next.business_period = 2;
  next.stage = 7; // Move to Junction 6 (Your Money Can Work Too)
  return next;
}

// JUNCTION 6 – YOUR MONEY CAN WORK TOO (SURPLUS ALLOCATION)
export function applyFunfairJunction6(
  state: FunfairGameState,
  option: 'wallet' | 'savings' | 'fd' | 'commodities' | 'shares',
  amount: number = 0,
  assetKey?: string
): FunfairGameState {
  const next = structuredClone(state);
  const safeAmount = Math.max(0, Math.min(amount, next.wallet_balance));
  let label = '';

  if (option === 'wallet' || safeAmount === 0) {
    label = `Kept ₹${next.wallet_balance} liquid in wallet for Peak Crowd restocking`;
  } else if (option === 'savings') {
    next.wallet_balance -= safeAmount;
    next.savings_balance += safeAmount;
    label = `Deposited ₹${safeAmount} in Savings Account (2% return per business period)`;
  } else if (option === 'fd') {
    next.wallet_balance -= safeAmount;
    next.fd_balance += safeAmount;
    next.fd_maturity_period = 3;
    label = `Locked ₹${safeAmount} in Fixed Deposit (5% return at Period 3 maturity)`;
  } else if (option === 'commodities') {
    const commId: FunfairCommodityId =
      assetKey === 'sugar' ? 'sugar' : assetKey === 'corn' ? 'corn' : 'wheat';
    const price = next.commodity_prices[commId].current;
    const units = Math.max(1, Math.floor(safeAmount / price));
    const cost = units * price;
    if (cost <= next.wallet_balance) {
      next.wallet_balance -= cost;
      next.commodity_units[commId] += units;
      label = `Bought ${units} unit(s) of ${next.commodity_prices[commId].name} for ₹${cost}`;
    } else {
      label = 'Explored commodities marketplace';
    }
  } else if (option === 'shares') {
    const shareId: FunfairShareId = assetKey === 'playWorks' ? 'playWorks' : 'funFoods';
    const price = next.share_prices[shareId].current;
    const units = Math.max(1, Math.floor(safeAmount / price));
    const cost = units * price;
    if (cost <= next.wallet_balance) {
      next.wallet_balance -= cost;
      next.share_units[shareId] += units;
      label = `Bought ${units} share(s) of ${next.share_prices[shareId].name} for ₹${cost}`;
    } else {
      label = 'Explored shares marketplace';
    }
  }

  // Trigger Period 2 predefined market event (Section 11):
  // Sugar: ₹120 -> ₹150, Wheat: ₹100 -> ₹90, Corn: ₹80 -> ₹100
  // Shares: FunFoods ₹100 -> ₹115, PlayWorks ₹120 -> ₹145
  next.commodity_prices.sugar = { ...next.commodity_prices.sugar, previous: 120, current: 150 };
  next.commodity_prices.wheat = { ...next.commodity_prices.wheat, previous: 100, current: 90 };
  next.commodity_prices.corn = { ...next.commodity_prices.corn, previous: 80, current: 100 };
  next.share_prices.funFoods = { ...next.share_prices.funFoods, previous: 100, current: 115 };
  next.share_prices.playWorks = { ...next.share_prices.playWorks, previous: 120, current: 145 };
  next.market_event_triggered = true;

  // Lemonade demand surges, sandwich demand drops
  next.catalog.lemonade.demandWeight = 1.75;
  next.catalog.popcorn.demandWeight = 1.45;
  next.catalog.sandwich.demandWeight = 0.65;
  next.catalog.ring_toss.demandWeight = 1.65;
  next.catalog.lucky_cups.demandWeight = 1.4;

  next.decisions.push({
    junctionId: 'FF_J6_SURPLUS',
    title: 'Surplus Capital Allocation',
    choiceLabel: label,
    financialImpact: `Wallet: ₹${next.wallet_balance} · Savings: ₹${next.savings_balance} · FD: ₹${next.fd_balance}`,
    conceptTags: ['savings', 'interest', 'fixed_deposits', 'liquidity', 'asset_value'],
  });

  next.stage = 8; // Move to Junction 7 (Unexpected Market Challenge & Period 2 Peak Crowd)
  return next;
}

// JUNCTION 7 – UNEXPECTED MARKET CHALLENGE (PERIOD 2: PEAK CROWD)
export function applyFunfairJunction7(
  state: FunfairGameState,
  responseOption: 'restock_popular' | 'maintain_stock' | 'change_mix' | 'revisit_pricing' | 'use_existing',
  restockQuantities: Partial<Record<FunfairProductId, number>> = {},
  newPricing?: PricingStrategy
): FunfairGameState {
  let next = structuredClone(state);
  next.period2_response = responseOption;

  // Credit 2% savings interest for simulated business period
  if (next.savings_balance > 0) {
    const interest = Math.round(next.savings_balance * 0.02);
    next.savings_balance += interest;
    next.savings_interest += interest;
  }

  // Calculate restock cost if any (10% bulk discount applies if restock >= ₹300 or bulk_discount unlocked)
  let grossRestockCost = 0;
  let restockedUnits = 0;
  for (const [k, qty] of Object.entries(restockQuantities)) {
    const prodId = k as FunfairProductId;
    const count = Math.max(0, Math.floor(qty || 0));
    if (count > 0) {
      grossRestockCost += count * next.catalog[prodId].currentUnitCost;
      restockedUnits += count;
    }
  }
  const restockCost =
    next.bulk_discount || grossRestockCost >= 300
      ? Math.round(grossRestockCost * 0.9)
      : grossRestockCost;

  // Allow using accessible savings if wallet needs a top-up for restock
  if (restockCost > next.wallet_balance && restockCost <= next.wallet_balance + next.savings_balance) {
    const neededFromSavings = restockCost - next.wallet_balance;
    next.savings_balance -= neededFromSavings;
    next.wallet_balance += neededFromSavings;
  }

  if (restockCost <= next.wallet_balance && restockedUnits > 0) {
    for (const [k, qty] of Object.entries(restockQuantities)) {
      const prodId = k as FunfairProductId;
      const count = Math.max(0, Math.floor(qty || 0));
      next.inventory[prodId] += count;
    }
    next.wallet_balance -= restockCost;
    next.variable_expenses += restockCost;
    next.total_expenses += restockCost;
  }

  if (responseOption === 'revisit_pricing' && newPricing) {
    next.pricing_strategy = newPricing;
  }

  let demandMult = 1.25;
  if (responseOption === 'restock_popular') demandMult = 1.5;
  else if (responseOption === 'change_mix') demandMult = 1.45;
  else if (responseOption === 'revisit_pricing') demandMult = 1.35;

  next = runSalesSimulation(
    next,
    2,
    'Round 2: Peak Crowd',
    45,
    demandMult,
    1.0,
    'Peak evening crowd surged through the fairgrounds during the main stage performances!'
  );

  const lastLog = next.period_logs[next.period_logs.length - 1];
  next.decisions.push({
    junctionId: 'FF_J7_MARKET_CHALLENGE',
    title: 'Period 2: Peak Crowd & Raw Material Shift',
    choiceLabel: `Response: ${responseOption.replace('_', ' ').toUpperCase()}${restockedUnits > 0 ? ` (+${restockedUnits} units restocked for ₹${restockCost})` : ''}`,
    financialImpact: `Sold ${lastLog.unitsSold} units · +₹${lastLog.revenue} Revenue`,
    conceptTags: ['supply_and_demand', 'inflation_and_input_costs', 'adaptability', 'cash_flow'],
  });

  next.business_period = 3;
  next.stage = 9; // Move to Junction 8 (Competition & Final Opportunity)
  return next;
}

// JUNCTION 8 – COMPETITION AND A FINAL OPPORTUNITY (PERIOD 3: FINAL RUSH)
export function applyFunfairJunction8(
  state: FunfairGameState,
  compResponse: 'reduce_price' | 'bundle' | 'differentiate' | 'maintain',
  acceptBulkOrder: boolean,
  finalRestockUnits: number = 0
): FunfairGameState {
  let next = structuredClone(state);
  next.competition_response = compResponse;
  next.accepted_bulk_order = acceptBulkOrder;

  // Credit 2% savings interest for Period 3
  if (next.savings_balance > 0) {
    const interest = Math.round(next.savings_balance * 0.02);
    next.savings_balance += interest;
    next.savings_interest += interest;
  }

  // Mature Fixed Deposit at Period 3 (+5% return)
  if (next.fd_balance > 0 && !next.fd_matured) {
    next.fd_matured = true;
  }

  // Optional quick restock across top 2 eligible stall products before final rush
  const eligible = getEligibleProductsForStall(next.stall_type);
  const flagship = eligible[0];
  const secondary = eligible[1] || eligible[0];
  if (finalRestockUnits > 0) {
    const cost1 = finalRestockUnits * next.catalog[flagship].currentUnitCost;
    const cost2 = Math.round(finalRestockUnits * 0.6) * next.catalog[secondary].currentUnitCost;
    if (cost1 + cost2 <= next.wallet_balance) {
      next.wallet_balance -= cost1 + cost2;
      next.inventory[flagship] += finalRestockUnits;
      next.inventory[secondary] += Math.round(finalRestockUnits * 0.6);
      next.variable_expenses += cost1 + cost2;
      next.total_expenses += cost1 + cost2;
    } else if (cost1 <= next.wallet_balance) {
      next.wallet_balance -= cost1;
      next.inventory[flagship] += finalRestockUnits;
      next.variable_expenses += cost1;
      next.total_expenses += cost1;
    }
  }

  let demandMult = 0.85;
  let marginFactor = 1.0;

  if (compResponse === 'reduce_price') {
    demandMult = 1.2;
    marginFactor = 0.88;
  } else if (compResponse === 'bundle') {
    demandMult = 1.15;
    marginFactor = 0.93;
  } else if (compResponse === 'differentiate') {
    demandMult = 1.25;
    if (next.wallet_balance >= 60) {
      next.wallet_balance -= 60;
      next.variable_expenses += 60;
      next.total_expenses += 60;
    }
  }

  // Additional Twist: Bulk Order from Festival Cultural Troupe
  // Total selling amount: ₹1,650 | Total cost: ₹550 | Net profit after discount: +₹1,100
  let bulkNote = '';
  if (acceptBulkOrder) {
    const bulkUnits = 55;
    const bulkRevenue = 1650;
    const bulkCost = 550;
    next.variable_expenses += bulkCost;
    next.total_expenses += bulkCost;
    next.cost_of_goods_sold += bulkCost;
    next.wallet_balance += bulkRevenue - bulkCost;
    next.total_revenue += bulkRevenue;
    next.units_sold += bulkUnits;
    next.units_sold_by_product[flagship] += bulkUnits;
    next.revenue_by_product[flagship] += bulkRevenue;
    bulkNote = ' + Accepted 55-unit Festival Troupe Bulk Order (+₹1,100 profit)';
  }

  next = runSalesSimulation(
    next,
    3,
    'Round 3: Final Rush',
    42,
    demandMult,
    marginFactor,
    `Final closing rush before the fairgrounds shut down!${bulkNote}`
  );

  const lastLog = next.period_logs[next.period_logs.length - 1];
  next.decisions.push({
    junctionId: 'FF_J8_COMPETITION',
    title: 'Period 3: Competition & Bulk Order Twist',
    choiceLabel: `Strategy: ${compResponse.toUpperCase()}${acceptBulkOrder ? ' · Accepted Bulk Order' : ' · Declined Bulk Order'}`,
    financialImpact: `Final Rush + Bulk Revenue: ₹${lastLog.revenue + (acceptBulkOrder ? 1650 : 0)}`,
    conceptTags: ['competition', 'differentiation', 'bulk_sales', 'customer_retention'],
  });

  next.stage = 10; // Move to Section 13: Final Stage (Close Stall & Settle Accounts)
  return next;
}

// SECTION 13 – FINAL STAGE: CLOSE YOUR STALL AND CALCULATE BUSINESS VALUE
export interface FunfairFinalSettlementInput {
  liquidateSharesAndCommodities: boolean;
  repayAllDebt: boolean;
  depositSurplusToSavings: number;
}

export function applyFunfairFinalSettlement(
  state: FunfairGameState,
  input: FunfairFinalSettlementInput
): FunfairGameState {
  const next = structuredClone(state);

  // Mature FD if any
  if (next.fd_balance > 0) {
    const maturedVal = Math.round(next.fd_balance * 1.05);
    next.wallet_balance += maturedVal;
    next.fd_balance = 0;
    next.fd_matured = true;
  }

  if (input.liquidateSharesAndCommodities) {
    const shareVal = getFunfairShareValue(next);
    const commVal = getFunfairCommodityValue(next);
    next.wallet_balance += shareVal + commVal;
    next.share_units = { funFoods: 0, playWorks: 0 };
    next.commodity_units = { wheat: 0, sugar: 0, corn: 0 };
  }

  if (input.repayAllDebt && next.repayment_due > 0) {
    const pay = Math.min(next.wallet_balance, next.repayment_due);
    next.wallet_balance -= pay;
    next.repayment_due -= pay;
  }

  if (input.depositSurplusToSavings > 0) {
    const dep = Math.min(input.depositSurplusToSavings, next.wallet_balance);
    next.wallet_balance -= dep;
    next.savings_balance += dep;
  }

  next.net_profit = next.total_revenue - next.total_expenses;

  next.decisions.push({
    junctionId: 'FF_J9_SETTLEMENT',
    title: 'Close Stall & Settle Accounts',
    choiceLabel: `${input.liquidateSharesAndCommodities ? 'Sold Market Assets · ' : ''}${input.repayAllDebt ? 'Cleared Debt · ' : ''}Settled Final Ledger`,
    financialImpact: `Final Net Business Value: ₹${getFinalBusinessValue(next).toLocaleString('en-IN')} (${getGrowthMultiple(next)}×)`,
    conceptTags: ['net_worth', 'accounting_settlement', 'business_valuation'],
  });

  next.stage = 11; // Move to Results & Decision Blueprint
  return next;
}

// Stationary Marketplace actions during Funfair game
export function funfairBuyCommodity(
  state: FunfairGameState,
  commId: FunfairCommodityId,
  units: number
): FunfairGameState {
  if (units <= 0) return state;
  const cost = units * state.commodity_prices[commId].current;
  if (cost > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= cost;
  next.commodity_units[commId] += units;
  return next;
}

export function funfairSellCommodity(
  state: FunfairGameState,
  commId: FunfairCommodityId,
  units: number
): FunfairGameState {
  if (units <= 0 || units > state.commodity_units[commId]) return state;
  const val = units * state.commodity_prices[commId].current;
  const next = structuredClone(state);
  next.commodity_units[commId] -= units;
  next.wallet_balance += val;
  return next;
}

export function funfairBuyShare(
  state: FunfairGameState,
  shareId: FunfairShareId,
  units: number
): FunfairGameState {
  if (units <= 0) return state;
  const cost = units * state.share_prices[shareId].current;
  if (cost > state.wallet_balance) return state;
  const next = structuredClone(state);
  next.wallet_balance -= cost;
  next.share_units[shareId] += units;
  return next;
}

export function funfairSellShare(
  state: FunfairGameState,
  shareId: FunfairShareId,
  units: number
): FunfairGameState {
  if (units <= 0 || units > state.share_units[shareId]) return state;
  const val = units * state.share_prices[shareId].current;
  const next = structuredClone(state);
  next.share_units[shareId] -= units;
  next.wallet_balance += val;
  return next;
}

// SECTION 14 & 18: WINNING CRITERIA & DECISION BLUEPRINT EVALUATION
export type FunfairOutcomeTier =
  | '4× Champion'
  | 'Strong Growth'
  | 'Growing Business'
  | 'Break-even / Limited Growth'
  | 'Business Under Pressure';

export interface FunfairBlueprintReport {
  finalBusinessValue: number;
  growthMultiple: number;
  won4xChallenge: boolean;
  outcomeTier: FunfairOutcomeTier;
  mostProfitableProduct: string;
  highestExpenseCategory: string;
  mostSuccessfulPeriod: string;
  observations: string[];
}

export function evaluateFunfairOutcome(state: FunfairGameState): FunfairBlueprintReport {
  const finalBusinessValue = getFinalBusinessValue(state);
  const growthMultiple = getGrowthMultiple(state);
  const won4xChallenge = finalBusinessValue >= 4000;

  let outcomeTier: FunfairOutcomeTier = 'Business Under Pressure';
  if (finalBusinessValue >= 4000) outcomeTier = '4× Champion';
  else if (finalBusinessValue >= 3000) outcomeTier = 'Strong Growth';
  else if (finalBusinessValue >= 2000) outcomeTier = 'Growing Business';
  else if (finalBusinessValue >= 1000) outcomeTier = 'Break-even / Limited Growth';

  // Find most profitable product
  let bestProdId: FunfairProductId = 'lemonade';
  let bestRev = -1;
  for (const [k, rev] of Object.entries(state.revenue_by_product)) {
    if (rev > bestRev) {
      bestRev = rev;
      bestProdId = k as FunfairProductId;
    }
  }
  const mostProfitableProduct =
    bestRev > 0
      ? `${state.catalog[bestProdId].name} (₹${bestRev.toLocaleString('en-IN')} revenue)`
      : 'Stall Flagship Assortment';

  const highestExpenseCategory =
    state.variable_expenses >= state.fixed_expenses
      ? `Inventory & Restocking (₹${state.variable_expenses.toLocaleString('en-IN')})`
      : `Fixed Setup & Rent (₹${state.fixed_expenses.toLocaleString('en-IN')})`;

  let bestPeriod = state.period_logs[0];
  for (const log of state.period_logs) {
    if (!bestPeriod || log.revenue > bestPeriod.revenue) {
      bestPeriod = log;
    }
  }
  const mostSuccessfulPeriod = bestPeriod
    ? `${bestPeriod.periodName} (₹${bestPeriod.revenue.toLocaleString('en-IN')} sales)`
    : 'Round 2: Peak Crowd';

  const observations: string[] = [];
  if (state.stall_location === 'main_stage' || state.stall_location === 'entrance') {
    observations.push('You invested more in high-visibility location footfall to maximize customer volume.');
  } else {
    observations.push('You chose the lower-rent Activity Corner to preserve working capital for inventory.');
  }

  if (state.bulk_discount) {
    observations.push('You used bulk purchasing to reduce unit costs by 10% and boost gross margins.');
  } else if (state.pricing_strategy === 'lower') {
    observations.push('You chose lower prices to attract higher customer volume in a competitive fair.');
  } else {
    observations.push('You maintained balanced or premium pricing to protect unit profit margins.');
  }

  if (state.period2_response === 'restock_popular' || state.period2_response === 'change_mix') {
    observations.push('You actively adapted and restocked your product mix when customer demand shifted in Period 2.');
  } else {
    observations.push('You prioritised preserving liquid cash over aggressive restocking during market shifts.');
  }

  return {
    finalBusinessValue,
    growthMultiple,
    won4xChallenge,
    outcomeTier,
    mostProfitableProduct,
    highestExpenseCategory,
    mostSuccessfulPeriod,
    observations,
  };
}
