'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Store,
  Sparkles,
  Trophy,
  RefreshCcw,
  Heart,
} from 'lucide-react';
import {
  FunfairGameState,
  StallType,
  LocationId,
  PricingStrategy,
  FunfairProductId,
  selectFunfairStall,
  selectFunfairLocation,
  purchaseInitialStock,
  selectPricingStrategy,
  applyFunfairJunction5,
  applyFunfairJunction6,
  applyFunfairJunction7,
  applyFunfairJunction8,
  applyFunfairFinalSettlement,
  getEligibleProductsForStall,
  getTotalRemainingStockUnits,
  getSellableInventoryValue,
  getFunfairShareValue,
  getFunfairCommodityValue,
  getFinalBusinessValue,
  getGrowthMultiple,
  evaluateFunfairOutcome,
} from '@/lib/funfair-engine';
import { FunfairIllustrationPanel } from './GraphicIllustrations';
import { StopMotionVideoFrame } from './StopMotionVideoFrame';
import { InteractiveDecisionMotionStage, DecisionCutscene } from './InteractiveDecisionMotionStage';
import { LiveSimulationStage, SimulationOption } from './LiveSimulationStage';
import { soundFX } from '@/lib/sound';
import { VictoryCard } from './VictoryCard';
import { FlatGameIllustration } from './FlatGameIllustration';

interface FunfairGameViewProps {
  playerName: string;
  state: FunfairGameState;
  setState: React.Dispatch<React.SetStateAction<FunfairGameState>>;
  onOpenMarketplace: () => void;
  onRestart: () => void;
  onSwitchToMiso: () => void;
}

export function FunfairGameView({
  playerName,
  state,
  setState,
  onOpenMarketplace,
  onRestart,
  onSwitchToMiso,
}: FunfairGameViewProps) {
  // Junction 3 state (Initial Stock Quantities)
  const [j3Quantities, setJ3Quantities] = useState<Record<FunfairProductId, number>>({
    lemonade: 22,
    popcorn: 12,
    sandwich: 0,
    ring_toss: 25,
    lucky_cups: 12,
    mini_target: 0,
  });
  const [j3BulkOffer, setJ3BulkOffer] = useState<boolean>(true);
  const [j3UseCredit, setJ3UseCredit] = useState<boolean>(true);

  // Junction 5 state (Period 1 Decisions)
  const [j5DecA, setJ5DecA] = useState<'promote' | 'combo' | 'keep' | 'observe'>('promote');
  const [j5DecB, setJ5DecB] = useState<'small_discount' | 'maintain_price' | 'bundle'>('bundle');

  // Junction 6 state (Surplus Allocation)
  const [j6Option, setJ6Option] = useState<'wallet' | 'savings' | 'fd' | 'commodities' | 'shares'>(
    'wallet'
  );
  const [j6Amount, setJ6Amount] = useState<number>(200);
  const [j6AssetKey] = useState<string>('sugar');

  // Junction 7 state (Period 2 Market Challenge)
  const [j7Response, setJ7Response] = useState<
    'restock_popular' | 'maintain_stock' | 'change_mix' | 'revisit_pricing' | 'use_existing'
  >('restock_popular');
  const [j7RestockMain, setJ7RestockMain] = useState<number>(35);
  const [j7RestockSec, setJ7RestockSec] = useState<number>(25);

  // Junction 8 state (Period 3 Competition & Bulk Twist)
  const [j8Comp, setJ8Comp] = useState<'reduce_price' | 'bundle' | 'differentiate' | 'maintain'>(
    'differentiate'
  );
  const [j8AcceptBulk, setJ8AcceptBulk] = useState<boolean>(true);
  const [j8RestockUnits, setJ8RestockUnits] = useState<number>(30);

  // Final Stage settlement state
  const [liquidateAssets, setLiquidateAssets] = useState<boolean>(true);
  const [repayDebt, setRepayDebt] = useState<boolean>(true);
  const [finalSavingsDeposit, setFinalSavingsDeposit] = useState<number>(500);

  // Blueprint reflection & compact tabs
  const [reportTab, setReportTab] = useState<'summary' | 'trail' | 'reflect'>('summary');
  const [selectedReflection, setSelectedReflection] = useState<string>(
    'Use bulk purchasing and restock high-demand products right before the Peak Crowd period.'
  );

  const lastLog = state.period_logs[state.period_logs.length - 1];

  // Interactive Visual Motion Cutscene State
  const [activeCutscene, setActiveCutscene] = useState<DecisionCutscene | null>(null);

  // ============================================================================
  // STAGE RENDERER (WRAPPED BY CONTINUOUS STOP-MOTION VIDEO REEL FRAME)
  // ============================================================================
  const renderCurrentStage = () => {
    // ============================================================================
    // STAGE 1 & 2: JUNCTION 1 – CHOOSE YOUR STALL (STARTS IMMEDIATELY)
    // ============================================================================
    if (state.stage <= 2) {
      const options: SimulationOption[] = [
        {
          id: 'food',
          title: 'Food & Refreshments Stall',
          badge: '₹350 Setup · High Repeat',
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          description: 'Chilled Lemonade, Popcorn & Chaat with strong peak crowd demand.',
          icon: '🍋',
          previewDialogue: 'Chacha Builder: Refreshment counters with ice box ready to frame!',
          actionDialogue: 'Canopy is anchored and counters polished! Chilled Lemonade & Chaat stall ready for inventory!',
          actionImpactText: 'Food stall constructed! (-₹350 Setup)',
          costBadge: '-₹350',
          costAmount: 350,
        },
        {
          id: 'game',
          title: 'Carnival Game Stall',
          badge: '₹350 Setup · High Margin',
          badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          description: 'Ring Toss, Lucky Cups & Target with zero spoilage risk.',
          icon: '🎯',
          previewDialogue: 'Chacha Builder: Target booth with wooden pegs and prize racks!',
          actionDialogue: 'Ring toss frame assembled with bright carnival bunting! Ready for prize stock.',
          actionImpactText: 'Game stall constructed! (-₹350 Setup)',
          costBadge: '-₹350',
          costAmount: 350,
        },
        {
          id: 'hybrid',
          title: 'Hybrid Snacks & Games Stall',
          badge: '₹500 Setup · Dual Traffic',
          badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
          description: 'Combines popular lemonade & snacks with fun game targets.',
          icon: '🎪',
          previewDialogue: 'Chacha Builder: Double-width booth capturing food & play crowds!',
          actionDialogue: 'Double-width hybrid stall framed! Best of both worlds anchored under the lights.',
          actionImpactText: 'Hybrid booth constructed! (-₹500 Setup)',
          costBadge: '-₹500',
          costAmount: 500,
        },
      ];

      return (
        <LiveSimulationStage
          story="funfair"
          stage={state.stage}
          totalStages={8}
          levelNumber={1}
          sceneTitle="Carnival Entrance · Shivaji Park"
          sceneSubtitle={`Mela Day 1! Wallet: ₹${state.wallet_balance.toLocaleString('en-IN')}`}
          walletBalance={state.wallet_balance}
          promptQuestion="What kind of stall would you like to build?"
          promptDescription="Watch the carnival grounds and master builder react as you explore stall types."
          actor={{
            name: 'Chacha Builder',
            role: 'Mela Master Carpenter',
            avatar: '🎪',
          }}
          options={options}
          onSelectOption={(optionId) => {
            setState((prev) => selectFunfairStall(prev, optionId as StallType));
          }}
        />
      );
    }

  // ============================================================================
  // STAGE 3: JUNCTION 2 – WHERE SHOULD YOU SET UP?
  // ============================================================================
  if (state.stage === 3) {
    const options: SimulationOption[] = [
      {
        id: 'entrance',
        title: 'Main Entrance Gate',
        badge: '₹250 Rent · 1.25× Flow',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Steady visitor flow as crowds enter the festival grounds.',
        icon: '⛩️',
        previewDialogue: 'Organizer: Every single visitor walks past your front counter.',
        actionDialogue: 'Prime entrance spot booked! Banner pinned right beneath the grand mela arch.',
        actionImpactText: 'Entrance spot secured! (-₹250 Rent)',
        costBadge: '-₹250',
        costAmount: 250,
      },
      {
        id: 'main_stage',
        title: 'Main Stage Arena',
        badge: '₹350 Rent · 1.50× Peak Flow',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Highest crowd surge during peak performances and evening events.',
        icon: '🎭',
        previewDialogue: 'Organizer: Busy picnic tables and non-stop hungry visitors.',
        actionDialogue: 'Main stage spot claimed! Surrounded by event crowds and cheering spectators.',
        actionImpactText: 'Main stage arena secured! (-₹350 Rent)',
        costBadge: '-₹350',
        costAmount: 350,
      },
      {
        id: 'activity_corner',
        title: 'Community Activity Corner',
        badge: '₹150 Rent · Budget Friendly',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Lowest rent overhead, preserving maximum cash for wholesale stock.',
        icon: '🎢',
        previewDialogue: 'Organizer: Low rent preserves working capital for inventory stock.',
        actionDialogue: 'Corner booth locked in! Low rent leaves healthy cash for wholesale stock.',
        actionImpactText: 'Corner booth secured! (-₹150 Rent)',
        costBadge: '-₹150',
        costAmount: 150,
      },
    ];

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={2}
        sceneTitle="Mela Grounds · Location Booking"
        sceneSubtitle="Balance rent expense against visitor footfall."
        walletBalance={state.wallet_balance}
        promptQuestion="Where on the carnival grounds will you anchor your stall?"
        promptDescription="Watch the carnival map diorama react as you evaluate location footfall vs rent."
        actor={{
          name: 'Mela Organizer',
          role: 'Festival Ground Manager',
          avatar: '🗺️',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) => selectFunfairLocation(prev, optionId as LocationId));
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 4: JUNCTION 3 – BUY YOUR STOCK
  // ============================================================================
  if (state.stage === 4) {
    const eligibleIds = getEligibleProductsForStall(state.stall_type);
    const creditBoost = j3UseCredit ? 150 : 0;
    const effectiveBudget = state.wallet_balance + creditBoost;

    let grossCost = 0;
    for (const id of eligibleIds) {
      grossCost += (j3Quantities[id] || 0) * state.catalog[id].currentUnitCost;
    }
    const qualifiesBulk = j3BulkOffer && grossCost >= 300;
    const netCost = qualifiesBulk ? Math.round(grossCost * 0.9) : grossCost;
    const canAfford = netCost > 0 && netCost <= effectiveBudget;

    const stockControls = (
      <div className="space-y-3">
        {/* Budget & Cart Balance Header */}
        <div className="flex items-center justify-between text-xs font-mono font-bold bg-slate-950/90 p-3 rounded-2xl border border-amber-400/40 text-slate-200 shadow-inner">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span>BUDGET:</span>
            <strong className="text-amber-400 text-sm font-black">₹{effectiveBudget}</strong>
          </span>
          <span
            className={`font-black text-xs ${
              netCost > effectiveBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            CART: ₹{netCost} {qualifiesBulk ? '(10% bulk discount applied)' : ''}
          </span>
        </div>

        {/* Product Inventory Stocking Cards */}
        <div className="space-y-2">
          {eligibleIds.map((prodId, idx) => {
            const item = state.catalog[prodId];
            const qty = j3Quantities[prodId] || 0;
            const emojis = ['📦', '🛒', '🔄', '🍿', '🎯', '✨'];
            return (
              <div
                key={prodId}
                className="rounded-2xl border-2 border-slate-700 bg-slate-800/90 hover:border-amber-400/50 p-3 flex items-center justify-between gap-3 shadow-md transition-all"
              >
                {/* Product Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-900 border border-slate-700 text-amber-300 shrink-0 shadow-inner">
                    {emojis[idx % emojis.length]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-title text-white truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-300">
                        Cost <strong className="text-amber-400 font-bold">₹{item.currentUnitCost}</strong>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-[11px] text-slate-300">
                        Sell <strong className="text-emerald-400 font-bold">₹{item.prices.suggested}</strong>
                      </span>
                      <span className="font-mono text-[10px] text-emerald-300 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        +₹{item.prices.suggested - item.currentUnitCost} profit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Steppers & Line Total */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name}`}
                    onClick={() =>
                      setJ3Quantities((prev) => ({
                        ...prev,
                        [prodId]: Math.max(0, (prev[prodId] || 0) - 5),
                      }))
                    }
                    className="h-8 w-8 rounded-xl bg-slate-700 hover:bg-amber-400 hover:text-slate-950 border border-slate-600 font-mono text-xs font-black text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    -5
                  </button>
                  <span className="font-mono text-sm font-black tabular-nums min-w-[2.5rem] text-center px-2 py-1 rounded-xl bg-slate-950 border border-amber-400/40 text-amber-300 shadow-inner">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name}`}
                    onClick={() =>
                      setJ3Quantities((prev) => ({
                        ...prev,
                        [prodId]: (prev[prodId] || 0) + 5,
                      }))
                    }
                    className="h-8 w-8 rounded-xl bg-slate-700 hover:bg-amber-400 hover:text-slate-950 border border-slate-600 font-mono text-xs font-black text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    +5
                  </button>
                  <span className="font-mono text-xs font-black text-white min-w-[3.5rem] text-right bg-slate-950/80 px-2 py-1.5 rounded-xl border border-slate-700 shadow-inner">
                    ₹{qty * item.currentUnitCost}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supplier Offers */}
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2.5 rounded-2xl border-2 border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 p-2.5 cursor-pointer text-xs transition-colors text-white">
            <input
              type="checkbox"
              checked={j3BulkOffer}
              onChange={(e) => setJ3BulkOffer(e.target.checked)}
              className="accent-amber-400 h-4 w-4 rounded"
            />
            <div>
              <strong className="block text-amber-300 font-title text-xs">10% Bulk Discount</strong>
              <span className="text-slate-300 text-[10px]">Orders ₹300+ qualify</span>
            </div>
          </label>
          <label className="flex items-center gap-2.5 rounded-2xl border-2 border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 p-2.5 cursor-pointer text-xs transition-colors text-white">
            <input
              type="checkbox"
              checked={j3UseCredit}
              onChange={(e) => setJ3UseCredit(e.target.checked)}
              className="accent-emerald-400 h-4 w-4 rounded"
            />
            <div>
              <strong className="block text-emerald-300 font-title text-xs">+₹150 Supplier Credit</strong>
              <span className="text-slate-300 text-[10px]">8% fee (Repay ₹162)</span>
            </div>
          </label>
        </div>

        {/* Purchase Action Button */}
        <button
          type="button"
          disabled={!canAfford}
          onClick={() => {
            soundFX.playClick();
            soundFX.playStageAdvance();
            const filtered: Partial<Record<FunfairProductId, number>> = {};
            for (const id of eligibleIds) {
              filtered[id] = j3Quantities[id] || 0;
            }
            setState((prev) =>
              purchaseInitialStock(prev, filtered, j3BulkOffer, j3UseCredit ? 150 : 0)
            );
          }}
          className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 px-4 py-3.5 text-xs md:text-sm font-title font-black text-slate-950 disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-400/20 active:scale-[0.98] transition-all"
        >
          <span>Purchase Stock (₹{netCost} / ₹{effectiveBudget})</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={3}
        sceneTitle="Wholesale Depot · Inventory Stocking"
        sceneSubtitle="Order ₹300+ stock to unlock the Supplier's 10% Bulk Discount!"
        walletBalance={state.wallet_balance}
        promptQuestion="Select Starting Inventory Units"
        promptDescription="Stock items with strong margins. Bulk orders over ₹300 save 10%!"
        actor={{
          name: 'Wholesale Depot',
          role: 'Festival Depot Hub',
          avatar: '📦',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={stockControls}
      />
    );
  }

  // ============================================================================
  // STAGE 5: JUNCTION 4 – SET YOUR SELLING PRICE
  // ============================================================================
  if (state.stage === 5) {
    const options: SimulationOption[] = [
      {
        id: 'lower',
        title: 'Crowd-Friendly Price',
        badge: '1.3× Volume · Quick Cash',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        description: 'Higher customer volume with smaller unit margin to turn stock fast.',
        icon: '📉',
        previewDialogue: 'Chacha Builder: Fast sales keeping lines moving and generating high turnover.',
        actionDialogue: 'Crowd-friendly prices announced! Long customer lines form immediately.',
        actionImpactText: 'Crowd-friendly pricing activated! (1.3× volume surge)',
      },
      {
        id: 'suggested',
        title: 'Balanced Fair Price',
        badge: 'Balanced Margin · Steady Flow',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        description: 'Healthy unit profit and steady fairground demand throughout the day.',
        icon: '💡',
        previewDialogue: 'Chacha Builder: Proven market price with steady reliable turnover.',
        actionDialogue: 'Balanced price tags pinned up! Steady stream of satisfied carnival visitors.',
        actionImpactText: 'Balanced fair pricing active! (Stable demand & margins)',
      },
      {
        id: 'premium',
        title: 'Festival Special Price',
        badge: 'Max Margin/Unit · High Profit',
        badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
        description: 'Highest profit per sale, slightly lower volume with gourmet appeal.',
        icon: '💰',
        previewDialogue: 'Chacha Builder: Gourmet presentation justifies festival premium.',
        actionDialogue: 'Festival Special gold signage unveiled! High margin per sale secured.',
        actionImpactText: 'Premium pricing active! (Maximum margin per unit)',
      },
    ];

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={4}
        sceneTitle="Stall Counter · Pricing Strategy"
        sceneSubtitle={`Stock Ready: ${getTotalRemainingStockUnits(state)} units.`}
        walletBalance={state.wallet_balance}
        promptQuestion="How will you price your inventory?"
        promptDescription="Unit Profit = Selling Price − Unit Cost. Balance customer volume with profit margin."
        actor={{
          name: 'Chacha Builder',
          role: 'Carnival Consultant',
          avatar: '💡',
        }}
        options={options}
        onSelectOption={(optionId) => {
          setState((prev) => selectPricingStrategy(prev, optionId as PricingStrategy));
        }}
      />
    );
  }

  // ============================================================================
  // STAGE 6: JUNCTION 5 – FIRST BUSINESS PERIOD: OPENING RUSH
  // ============================================================================
  if (state.stage === 6) {
    const rushControls = (
      <div className="space-y-3">
        {/* Compact 4-pill KPI row */}
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
          <div className="rounded-xl bg-slate-950 border border-amber-400/40 py-2 shadow-xs">
            <span className="block text-[8px] text-amber-400 font-bold uppercase tracking-wider">FOOTFALL</span>
            <strong className="text-amber-300 font-black text-xs">{state.footfall_multiplier}×</strong>
          </div>
          <div className="rounded-xl bg-slate-950 border border-emerald-400/40 py-2 shadow-xs">
            <span className="block text-[8px] text-emerald-400 font-bold uppercase tracking-wider">STOCK</span>
            <strong className="text-emerald-300 font-black text-xs">{getTotalRemainingStockUnits(state)}u</strong>
          </div>
          <div className="rounded-xl bg-slate-950 border border-cyan-400/40 py-2 shadow-xs">
            <span className="block text-[8px] text-cyan-400 font-bold uppercase tracking-wider">PRICE</span>
            <strong className="uppercase text-cyan-300 font-black text-xs">{state.pricing_strategy.slice(0, 4)}</strong>
          </div>
          <div className="rounded-xl bg-slate-950 border border-slate-700 py-2 shadow-xs">
            <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">CASH</span>
            <strong className="text-white font-black text-xs">₹{state.wallet_balance}</strong>
          </div>
        </div>

        {/* Decision A */}
        <div>
          <h3 className="text-xs font-title text-slate-100 mb-1.5">
            1. Opening Rush Focus:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'promote' as const, emoji: '📢', title: 'Active Promotion', badge: '+25% Footfall · -₹40' },
              { id: 'combo' as const, emoji: '🎁', title: 'Small Combo', badge: '+22% Volume' },
              { id: 'keep' as const, emoji: '🤝', title: 'Steady Service', badge: 'Standard Service' },
              { id: 'observe' as const, emoji: '👁️', title: 'Observe & Learn', badge: '+15% Conversion' },
            ].map((opt) => {
              const active = j5DecA === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setJ5DecA(opt.id);
                  }}
                  className={`text-left rounded-xl p-2.5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    active
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg"><FlatGameIllustration title={opt.title} /></span>
                    <span className="text-xs font-bold truncate">{opt.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-300">
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Decision B */}
        <div>
          <h3 className="text-xs font-title text-slate-100 mb-1.5">
            2. Group Discount Request:
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'bundle' as const, emoji: '🎁', title: 'Bundle', sub: 'High Volume' },
              { id: 'maintain_price' as const, emoji: '🏷️', title: 'Full Price', sub: 'Keep Margin' },
              { id: 'small_discount' as const, emoji: '📉', title: '8% Off', sub: 'Quick Cash' },
            ].map((opt) => {
              const active = j5DecB === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setJ5DecB(opt.id);
                  }}
                  className={`text-center rounded-xl p-2 border-2 transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                    active
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base"><FlatGameIllustration title={opt.title} /></span>
                  <div className="text-[10px] font-bold">{opt.title}</div>
                  <span className="text-[8px] font-mono text-slate-400">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            soundFX.playStageAdvance();
            setState((prev) => applyFunfairJunction5(prev, j5DecA, j5DecB));
          }}
          className="btn-tactile-yellow w-full flex items-center justify-between rounded-xl bg-brand-yellow px-4 py-3 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <span>Run Period 1 Sales Simulation</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={5}
        sceneTitle="Mela Main Lane · Period 1 Opening Rush"
        sceneSubtitle="First wave of visitors is approaching your stall!"
        walletBalance={state.wallet_balance}
        promptQuestion="Period 1 Opening Rush: Tactics & Customer Handling"
        promptDescription="Choose your active promotion focus and customer group discount strategy."
        actor={{
          name: 'Festival Attendees',
          role: 'Period 1 Rush Crowd',
          avatar: '🏃‍♂️',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={rushControls}
      />
    );
  }

  // ============================================================================
  // STAGE 7: JUNCTION 6 – YOUR MONEY CAN WORK TOO (SURPLUS ALLOCATION)
  // ============================================================================
  if (state.stage === 7) {
    const surplusControls = (
      <div className="space-y-2.5">
        {/* KPI Banner / Liquid Cash status */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="block text-[8px] uppercase tracking-wider font-mono font-bold text-slate-400">
              SURPLUS WALLET CASH
            </span>
            <span className="text-sm font-mono font-black text-amber-300">
              ₹{state.wallet_balance.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenMarketplace}
            className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] font-bold text-amber-300 cursor-pointer hover:bg-amber-400/20 transition-all"
          >
            <Store className="h-3 w-3" />
            <span>Full Market</span>
          </button>
        </div>

        <div className="rounded-lg bg-slate-800/80 border border-slate-700/80 p-2">
          <p className="text-[11px] font-chunky text-slate-200">
            💡 Keep cash liquid in Wallet or Savings to restock for the Period 2 Peak Crowd!
          </p>
        </div>

        {/* 5 Allocation Option Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: 'wallet' as const,
              emoji: '💵',
              title: 'Keep in Wallet',
              sub: '100% Liquid for Restock',
            },
            {
              id: 'savings' as const,
              emoji: '🐷',
              title: 'Savings Account',
              sub: '+2% / Period · Liquid',
            },
            {
              id: 'fd' as const,
              emoji: '🔒',
              title: 'Fixed Deposit',
              sub: '+5% · Locked till close',
            },
            {
              id: 'commodities' as const,
              emoji: '🌾',
              title: 'Buy Commodities',
              sub: 'Sugar ₹120 / Corn ₹80',
            },
            {
              id: 'shares' as const,
              emoji: '📈',
              title: 'Buy Festival Shares',
              sub: 'FunFoods ₹100',
            },
          ].map((opt) => {
            const active = j6Option === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setJ6Option(opt.id);
                }}
                className={`text-left rounded-xl p-2.5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-sm ${
                  active
                    ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                } ${opt.id === 'shares' ? 'col-span-2' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    <FlatGameIllustration title={opt.title} />
                  </span>
                  <span className="text-xs font-bold leading-tight text-white">{opt.title}</span>
                </div>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-950/80 border border-slate-700 text-amber-300 self-start">
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Amount Selector if not wallet */}
        {j6Option !== 'wallet' && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-200">Allocate Amount:</span>
            <div className="flex gap-1.5">
              {[120, 200, 300].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setJ6Amount(amt)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] font-bold cursor-pointer transition-all ${
                    j6Amount === amt
                      ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            soundFX.playStageAdvance();
            setState((prev) => applyFunfairJunction6(prev, j6Option, j6Amount, j6AssetKey));
          }}
          className="btn-tactile-yellow w-full flex items-center justify-between rounded-xl bg-brand-yellow px-4 py-3 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <span>Confirm &amp; Enter Period 2 (Peak Crowd)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={6}
        sceneTitle="Mela Concourse · Surplus Allocation"
        sceneSubtitle={
          lastLog
            ? `Opening Rush sold ${lastLog.unitsSold} units → ₹${lastLog.revenue} revenue (+₹${lastLog.grossProfit} profit)!`
            : 'Opening Rush complete! Allocate your surplus before the Peak Crowd.'
        }
        walletBalance={state.wallet_balance}
        promptQuestion="Decision 6 OF 8 · Surplus Allocation"
        promptDescription={`Surplus Cash: ₹${state.wallet_balance.toLocaleString('en-IN')}. How will you hold it?`}
        actor={{
          name: 'Festival Treasury',
          role: 'Shivaji Park Finance Desk',
          avatar: '💰',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={surplusControls}
      />
    );
  }

  // ============================================================================
  // STAGE 8: JUNCTION 7 – UNEXPECTED MARKET CHALLENGE (PERIOD 2: PEAK CROWD)
  // ============================================================================
  if (state.stage === 8) {
    const eligible = getEligibleProductsForStall(state.stall_type);
    const mainProd = state.catalog[eligible[0]];
    const secProd = state.catalog[eligible[1] || eligible[0]];

    const grossRestock =
      j7RestockMain * mainProd.currentUnitCost + j7RestockSec * secProd.currentUnitCost;
    const discountedRestock =
      state.bulk_discount || grossRestock >= 300 ? Math.round(grossRestock * 0.9) : grossRestock;
    const accessibleCash = state.wallet_balance + state.savings_balance;

    const peakCrowdControls = (
      <div className="space-y-2.5">
        {/* Ticker & Liquid Cash */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="block text-[8px] uppercase tracking-wider font-mono font-bold text-slate-400">
              AVAILABLE LIQUID CASH
            </span>
            <span className="text-sm font-mono font-black text-emerald-400">
              ₹{accessibleCash.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex gap-2 font-mono text-[10px] font-bold">
            <span className="rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5">
              Sugar ₹150 (+25%)
            </span>
            <span className="rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 px-1.5 py-0.5">
              Wheat ₹90 (-10%)
            </span>
          </div>
        </div>

        {/* 4 Strategy Options */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: 'restock_popular' as const,
              emoji: '📦',
              title: 'Restock Popular',
              desc: 'Capture 1.5× Peak Crowd surge with fresh inventory',
              badge: 'Recommended',
            },
            {
              id: 'change_mix' as const,
              emoji: '🔄',
              title: 'Shift High-Margin',
              desc: 'Focus on products with lowest input costs',
              badge: 'Cost-Optimised',
            },
            {
              id: 'revisit_pricing' as const,
              emoji: '💡',
              title: 'Adjust Peak Price',
              desc: 'Update prices while restocking moderate units',
              badge: 'Margin Boost',
            },
            {
              id: 'maintain_stock' as const,
              emoji: '🛒',
              title: 'Use Existing Stock',
              desc: 'Preserve cash (₹0 spend), but risk stockout',
              badge: 'Zero Risk',
            },
          ].map((opt) => {
            const active = j7Response === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setJ7Response(opt.id);
                  if (opt.id === 'maintain_stock') {
                    setJ7RestockMain(0);
                    setJ7RestockSec(0);
                  } else {
                    setJ7RestockMain(35);
                    setJ7RestockSec(25);
                  }
                }}
                className={`text-left rounded-xl p-2.5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-sm ${
                  active
                    ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">
                    <FlatGameIllustration title={opt.title} />
                  </span>
                  <span className="text-xs font-bold truncate text-white">{opt.title}</span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">
                  {opt.desc}
                </p>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-950/80 border border-slate-700 text-amber-300 self-start">
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Restock Batch Selector */}
        {j7Response !== 'maintain_stock' && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2.5 flex items-center justify-between gap-2">
            <div className="text-[10px] font-bold">
              <span className="block text-slate-200">
                Batch: +{j7RestockMain} {mainProd.name.split(' ')[0]} &amp; +{j7RestockSec} {secProd.name.split(' ')[0]}
              </span>
              <span className="font-mono text-emerald-400 font-extrabold">Cost: ₹{discountedRestock} (10% Off)</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setJ7RestockMain(20);
                  setJ7RestockSec(15);
                }}
                className={`rounded-lg border px-2 py-1 text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  j7RestockMain === 20
                    ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                +35u
              </button>
              <button
                type="button"
                onClick={() => {
                  setJ7RestockMain(35);
                  setJ7RestockSec(25);
                }}
                className={`rounded-lg border px-2 py-1 text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  j7RestockMain === 35
                    ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                +60u Peak
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveCutscene({
              actorName: 'Peak Fair Crowd',
              actorRole: 'Midday Festival Rush',
              actorAvatar: '🎡',
              actorBg: 'bg-purple-100',
              dialogue:
                'Huge surge at the stall! Queue is 20 people deep! Your restocking prevented stockout and cash is stacking up fast!',
              actionTitle: 'Period 2 Peak Rush Active',
              actionImpactText: 'Peak volume sales banked!',
              impactType: 'positive',
              costBadge: 'Peak Sales 🪙',
              environment: 'funfair_rush',
              onContinue: () => {
                soundFX.playCoin();
                setState((prev) =>
                  applyFunfairJunction7(prev, j7Response, {
                    [eligible[0]]: j7RestockMain,
                    [eligible[1] || eligible[0]]: j7RestockSec,
                  })
                );
                setActiveCutscene(null);
              },
            });
          }}
          className="btn-tactile-yellow w-full flex items-center justify-between rounded-xl bg-brand-yellow px-4 py-3 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <span>Run Period 2 (Peak Crowd) Sales</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={7}
        sceneTitle="Mela Main Lane · Period 2 Peak Crowd Surge"
        sceneSubtitle={`Peak Crowd Surge! Demand high for ${mainProd.name.split(' ')[0]} & ${secProd.name.split(' ')[0]}.`}
        walletBalance={state.wallet_balance}
        promptQuestion="Decision 7 of 8 · Peak Crowd Challenge"
        promptDescription="How will you respond to the Peak Crowd surge? Balance restock costs against selling out."
        actor={{
          name: 'Peak Fair Crowd',
          role: 'Midday Festival Surge',
          avatar: '🎡',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={peakCrowdControls}
      />
    );
  }

  // ============================================================================
  // STAGE 9: JUNCTION 8 – COMPETITION & FINAL OPPORTUNITY (PERIOD 3: FINAL RUSH)
  // ============================================================================
  if (state.stage === 9) {
    const finalRushControls = (
      <div className="space-y-2.5">
        {/* Header Cash Pill */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 flex items-center justify-between shadow-xs">
          <div>
            <span className="block text-[8px] uppercase tracking-wider font-mono font-bold text-slate-400">
              CURRENT STALL CASH
            </span>
            <span className="text-sm font-mono font-black text-amber-300">
              ₹{state.wallet_balance.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold px-2.5 py-0.5">
            ⚔️ Rival Stall Active Nearby
          </span>
        </div>

        {/* 1. Competitor Response (4 options) */}
        <div>
          <h3 className="text-xs font-title text-slate-100 mb-1.5">
            1. Formulate Counter-Strategy:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'differentiate' as const, emoji: '🎪', title: 'Differentiate', badge: '1.25× Surge · -₹60' },
              { id: 'reduce_price' as const, emoji: '📉', title: 'Cut Price', badge: '1.20× Quick Sales' },
              { id: 'bundle' as const, emoji: '🎁', title: 'Combo Bundle', badge: '1.15× Margin Boost' },
              { id: 'maintain' as const, emoji: '🛡️', title: 'Keep Current', badge: '0.85× Footfall' },
            ].map((opt) => {
              const active = j8Comp === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setJ8Comp(opt.id);
                  }}
                  className={`text-left rounded-xl p-2.5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-sm ${
                    active
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">
                      <FlatGameIllustration title={opt.title} />
                    </span>
                    <span className="text-xs font-bold text-white truncate">{opt.title}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-300">
                    {opt.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Cultural Troupe Bulk Order Twist */}
        <div className="rounded-xl border border-amber-400/40 bg-slate-800/90 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-amber-300 uppercase tracking-wider font-mono">
              TWIST · CULTURAL TROUPE BULK ORDER
            </span>
            <span className="font-mono text-emerald-400 font-extrabold">+₹1,100 Net Profit</span>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={j8AcceptBulk}
              onChange={(e) => setJ8AcceptBulk(e.target.checked)}
              className="accent-amber-400 h-4 w-4"
            />
            <span>Accept 55-Unit Bulk Order (₹1,650 Rev − ₹550 Cost)</span>
          </label>
        </div>

        {/* 3. Final Walk-In Restock */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-200">Final Walk-in Restock:</span>
          <div className="flex gap-1.5">
            {[0, 20, 30].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setJ8RestockUnits(u)}
                className={`rounded-lg border px-2.5 py-0.5 font-mono text-[10px] font-bold cursor-pointer transition-all ${
                  j8RestockUnits === u
                    ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                +{u}u
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveCutscene({
              actorName: 'Evening Fair Crowd & Bulk Buyers',
              actorRole: 'Festival Grand Finale',
              actorAvatar: '🎆',
              actorBg: 'bg-purple-100',
              dialogue:
                'Night carnival lights glowing! Fireworks popping in the sky, and every single remaining unit sold out to enthusiastic festival visitors!',
              actionTitle: 'Period 3 Rush Cleared',
              actionImpactText: 'Grand finale crowd cleared stock! Final cash banked.',
              impactType: 'positive',
              costBadge: 'Sold Out! 🎆',
              environment: 'funfair_rush',
              onContinue: () => {
                soundFX.playCoin();
                setState((prev) =>
                  applyFunfairJunction8(prev, j8Comp, j8AcceptBulk, j8RestockUnits)
                );
                setActiveCutscene(null);
              },
            });
          }}
          className="btn-tactile-yellow w-full flex items-center justify-between rounded-xl bg-brand-yellow px-4 py-3 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <span>Execute Final Rush &amp; Close Stall</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={8}
        sceneTitle="Mela Finale · Period 3 Final Rush & Rival Stall"
        sceneSubtitle={
          lastLog
            ? `Peak Crowd sold ${lastLog.unitsSold} units → ₹${lastLog.revenue} revenue! Now enter the Final Rush.`
            : 'A rival stall opens nearby right as the Final Rush begins!'
        }
        walletBalance={state.wallet_balance}
        promptQuestion="Decision 8 of 8 · Final Rush & Rival Stall"
        promptDescription="Rival stall opened nearby! Choose your counter-strategy and capitalize on bulk orders."
        actor={{
          name: 'Evening Fair Crowd',
          role: 'Festival Grand Finale',
          avatar: '🎆',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={finalRushControls}
      />
    );
  }

  // ============================================================================
  // STAGE 10: CLOSE YOUR STALL AND CALCULATE BUSINESS VALUE
  // ============================================================================
  if (state.stage === 10) {
    const shareAndCommVal = getFunfairShareValue(state) + getFunfairCommodityValue(state);
    const sellableInvVal = getSellableInventoryValue(state);
    const projectedNetVal = getFinalBusinessValue(state);

    const settlementControls = (
      <div className="space-y-2.5">
        {/* 4-KPI Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2.5">
            <span className="block text-[9px] font-sans font-bold text-slate-400">
              Total Revenue
            </span>
            <strong className="text-amber-300 text-sm">
              ₹{state.total_revenue.toLocaleString('en-IN')}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2.5">
            <span className="block text-[9px] font-sans font-bold text-rose-400">
              Total Expenses
            </span>
            <strong className="text-rose-400 text-sm">
              ₹{state.total_expenses.toLocaleString('en-IN')}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2.5">
            <span className="block text-[9px] font-sans font-bold text-emerald-400">
              Cash + Savings
            </span>
            <strong className="text-emerald-400 text-sm">
              ₹{(state.wallet_balance + state.savings_balance).toLocaleString('en-IN')}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/90 p-2.5">
            <span className="block text-[9px] font-sans font-bold text-cyan-400">
              Stall &amp; Stock Value
            </span>
            <strong className="text-cyan-400 text-sm">
              ₹{sellableInvVal.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Settlement Checkboxes & Savings */}
        <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-xs">
          <label className="flex items-center gap-2.5 font-bold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={repayDebt}
              onChange={(e) => setRepayDebt(e.target.checked)}
              className="accent-amber-400 h-4 w-4"
            />
            <span>Repay supplier credit (Due: ₹{state.repayment_due})</span>
          </label>

          <label className="flex items-center gap-2.5 font-bold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={liquidateAssets}
              onChange={(e) => setLiquidateAssets(e.target.checked)}
              className="accent-amber-400 h-4 w-4"
            />
            <span>Liquidate shares &amp; commodities (₹{shareAndCommVal})</span>
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-[10px] font-bold text-slate-300">Move to Savings:</span>
            <div className="flex gap-1.5">
              {[0, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFinalSavingsDeposit(amt)}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] font-bold cursor-pointer transition-all ${
                    finalSavingsDeposit === amt
                      ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setActiveCutscene({
              actorName: 'Mela Committee & Festival Master',
              actorRole: 'Grand Awards Stage',
              actorAvatar: '🏆',
              actorBg: 'bg-amber-100',
              dialogue:
                'Confetti falling! Outstanding stall management! Your capital growth and operational performance are ranked at the top of the festival!',
              actionTitle: 'Mela Complete!',
              actionImpactText: 'All accounts reconciled! Generating 4× Blueprint.',
              impactType: 'positive',
              costBadge: 'Champion 🏆',
              environment: 'funfair_stall',
              onContinue: () => {
                soundFX.playComplete();
                setState((prev) =>
                  applyFunfairFinalSettlement(prev, {
                    liquidateSharesAndCommodities: liquidateAssets,
                    repayAllDebt: repayDebt,
                    depositSurplusToSavings: finalSavingsDeposit,
                  })
                );
                setActiveCutscene(null);
              },
            });
          }}
          className="btn-tactile-yellow w-full flex items-center justify-between rounded-xl bg-brand-yellow px-4 py-3 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <span>Close Stall &amp; View 4× Report</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );

    return (
      <LiveSimulationStage
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={8}
        sceneTitle="Shivaji Park Anand Mela · Stall Closing & Settlement"
        sceneSubtitle={`Funfair Closing! Projected Value: ₹${projectedNetVal.toLocaleString('en-IN')} (${getGrowthMultiple(state)}×).`}
        walletBalance={state.wallet_balance}
        promptQuestion="Final Settlement · Reconcile Accounts"
        promptDescription="Settle debts, liquidate remaining commodities, and deposit profits into savings."
        actor={{
          name: 'Mela Committee',
          role: 'Grand Awards Stage',
          avatar: '🏆',
        }}
        options={[]}
        onSelectOption={() => {}}
        customControls={settlementControls}
      />
    );
  }

  // ============================================================================
  // STAGE 11: WINNING CRITERIA (THE 4× CHALLENGE) & COMPACT BUSINESS BLUEPRINT
  // ============================================================================
  const report = evaluateFunfairOutcome(state);
  const reflectionOptions = [
    'Use bulk purchasing and restock high-demand products right before the Peak Crowd period.',
    'Balance fixed location rent against working capital so the stall never runs out of inventory.',
    'Differentiate the stall and accept profitable bulk orders when competition increases.',
  ];

  return (
    <div className="game-results-scroll flex flex-col gap-2 overflow-y-auto pr-1">
      <VictoryCard
        story="funfair"
        playerName={playerName}
        title={report.won4xChallenge ? '4× Challenge Champion' : report.outcomeTier}
        subtitle={`${report.outcomeTier} · ${state.units_sold} units sold · ${report.growthMultiple}× multiplier`}
        score={report.finalBusinessValue}
        multiplier={report.growthMultiple}
        totalSeconds={270}
        remainingSeconds={state.game_timer}
      />
      <FunfairIllustrationPanel
        stallType={state.stall_type}
        period={3}
        caption={`${report.outcomeTier} — Final Business Value: ₹${report.finalBusinessValue.toLocaleString('en-IN')} (${report.growthMultiple}×)`}
      />

      <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-1">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#C85A3A]">
              DECISION BLUEPRINT · {report.won4xChallenge ? '4× CHALLENGE CHAMPION' : 'BUSINESS PERFORMANCE'}
            </span>
            <h1 className="text-base font-extrabold text-[#1E1B18] leading-tight">
              {report.outcomeTier}
            </h1>
          </div>
          <span className="rounded-md bg-emerald-100 border border-emerald-400 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-900">
            Net: ₹{report.finalBusinessValue.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Sub-tabs to match Miso Blueprint layout */}
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { id: 'summary' as const, label: '1. Summary' },
            { id: 'trail' as const, label: '2. Money Trail' },
            { id: 'reflect' as const, label: '3. Reflection' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setReportTab(t.id)}
              className={`rounded-md py-1 text-[11px] font-chunky font-bold cursor-pointer ${
                reportTab === t.id
                  ? 'bg-white text-slate-950 shadow-2xs border border-slate-300'
                  : 'text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {reportTab === 'summary' && (
          <div className="space-y-2">
            <p className="text-xs text-[#1E1B18] leading-snug bg-[#F9F6F0] p-2.5 rounded-lg border border-slate-200">
              {report.won4xChallenge
                ? `Outstanding performance! You successfully crossed the 4× target, growing your initial ₹1,000 capital into ₹${report.finalBusinessValue.toLocaleString('en-IN')} (${report.growthMultiple}×) across all 3 festival selling periods with ${state.units_sold} units sold.`
                : `Great effort at the Shivaji Park Anand Mela! You grew your starting capital into ₹${report.finalBusinessValue.toLocaleString('en-IN')} (${report.growthMultiple}×) with ${state.units_sold} units sold.`}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-slate-200 bg-[#FFFBEB] p-2">
                <span className="text-[10px] font-bold text-[#78716C]">Wallet Cash</span>
                <p className="font-mono text-sm font-extrabold text-[#1E1B18]">
                  ₹{state.wallet_balance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#F0FDF4] p-2">
                <span className="text-[10px] font-bold text-[#065F46]">Savings + Invest</span>
                <p className="font-mono text-sm font-extrabold text-[#065F46]">
                  ₹
                  {(
                    state.savings_balance +
                    state.fd_balance +
                    getFunfairShareValue(state) +
                    getFunfairCommodityValue(state)
                  ).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#FEF2F2] p-2">
                <span className="text-[10px] font-bold text-[#991B1B]">Total Expenses</span>
                <p className="font-mono text-sm font-extrabold text-[#DC2626]">
                  ₹{state.total_expenses.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#EFF6FF] p-2">
                <span className="text-[10px] font-bold text-[#1E40AF]">Final Net Worth</span>
                <p className="font-mono text-sm font-extrabold text-[#1E40AF]">
                  ₹{report.finalBusinessValue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {reportTab === 'trail' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <div className="rounded-lg bg-[#F9F6F0] p-2 border border-slate-200">
                <span className="block text-[9px] text-[#78716C]">START → REVENUE</span>
                <strong>
                  ₹1,000 → ₹{state.total_revenue.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="rounded-lg bg-[#F9F6F0] p-2 border border-slate-200">
                <span className="block text-[9px] text-[#059669]">COSTS / PROFIT</span>
                <strong>
                  -₹{state.total_expenses.toLocaleString('en-IN')} / +₹{state.gross_profit.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
            <div className="space-y-1.5">
              {report.observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-[#F9F6F0] p-2 flex items-start gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C85A3A] mt-0.5" />
                  <p className="text-[11px] font-medium text-[#1E1B18] leading-snug">
                    &ldquo;{obs}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportTab === 'reflect' && (
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-950 text-white p-3 shadow-md">
              <h3 className="font-title text-sm">
                What would you consider differently next time?
              </h3>
              <p className="font-chunky text-xs text-slate-300 mt-0.5">
                Select your key business takeaway from the 4× Funfair challenge.
              </p>
            </div>
            <div className="space-y-2">
              {reflectionOptions.map((opt, idx) => {
                const emojis = ['📦', '⚖️', '🎪'];
                const gradients = [
                  'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300',
                  'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300',
                  'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-300',
                ];
                const selected = selectedReflection === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedReflection(opt);
                      setState((prev) => ({ ...prev, reflection_note: opt }));
                    }}
                    className={`w-full text-left rounded-xl border p-3 text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-3 shadow-sm hover:scale-[1.01] hover:shadow-md active:scale-[0.99] ${
                      selected
                        ? `${gradients[idx % gradients.length]} ring-2 ring-slate-900 shadow-md`
                        : gradients[idx % gradients.length]
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white/80 border-2 border-current shadow-sm shrink-0">
                      {emojis[idx % emojis.length]}
                    </div>
                    <span className="flex-1 text-[#1E1B18] leading-snug">
                      {selected ? `✓ ${opt}` : opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onRestart}
            data-start="true"
            className="btn-tactile-white flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-chunky font-bold text-slate-900 cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Replay Funfair</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToMiso}
            className="btn-tactile-yellow flex items-center justify-center gap-1.5 rounded-lg bg-brand-yellow py-2 text-xs font-chunky font-extrabold text-slate-950 cursor-pointer"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Play Miso Story</span>
          </button>
        </div>
      </div>
    </div>
    );
  };

  const levelNum = Math.max(1, Math.min(8, state.stage - 1));
  const sceneTitle =
    state.stage <= 2
      ? 'Choose Your Stall Concept'
      : state.stage === 3
      ? 'Secure Your Mela Location'
      : state.stage === 4
      ? 'Period 1 Pricing Strategy'
      : state.stage === 5
      ? 'Period 1 Rush Results'
      : state.stage === 6
      ? 'Period 2 Pricing & Promotion'
      : state.stage === 7
      ? 'Period 2 Rush & Restocking'
      : state.stage === 8
      ? 'Period 3 Pricing & Commodities'
      : state.stage === 9
      ? 'Period 3 Rush Results'
      : state.stage === 10
      ? 'Liquidation & Debt Settlement'
      : 'Funfair 4× Business Blueprint';

  return (
    <>
      <InteractiveDecisionMotionStage
        cutscene={activeCutscene}
        onDismiss={() => setActiveCutscene(null)}
      />
      <StopMotionVideoFrame
        story="funfair"
        stage={state.stage}
        totalStages={8}
        levelNumber={levelNum}
        sceneTitle={sceneTitle}
      >
        {renderCurrentStage()}
      </StopMotionVideoFrame>
    </>
  );
}
