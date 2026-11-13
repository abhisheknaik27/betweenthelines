'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  Info,
  ArrowLeftRight,
  ChevronDown,
  Check,
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
} from 'lucide-react';
import { SimpleFinancialIcon } from './GraphicIllustrations';
import { gameRuntime } from '@/lib/game-runtime';
import {
  MisoGameState,
  MisoShareId,
  MisoCommodityId,
  marketplaceDepositSavings,
  marketplaceWithdrawSavings,
  marketplaceOpenFD,
  marketplaceBuyShare,
  marketplaceSellShare,
  marketplaceBuyCommodity,
  marketplaceSellCommodity,
  getShareCurrentValue,
  getCommodityCurrentValue,
  getTotalCommodityUnits,
  getInvestmentCurrentValue,
  getAccessibleResources,
  getFinalNetPosition,
} from '@/lib/miso-engine';
import {
  FunfairGameState,
  FunfairShareId,
  FunfairCommodityId,
  funfairBuyCommodity,
  funfairSellCommodity,
  funfairBuyShare,
  funfairSellShare,
  getFunfairShareValue,
  getFunfairCommodityValue,
  getSellableInventoryValue,
  getFinalBusinessValue,
  getGrowthMultiple,
} from '@/lib/funfair-engine';
import { soundFX } from '@/lib/sound';

interface OverlayDrawersProps {
  activeGame: 'miso' | 'funfair';
  openDrawer: 'marketplace' | 'dashboard' | 'concepts' | 'about' | 'settings' | null;
  onClose: () => void;
  misoState: MisoGameState;
  setMisoState: React.Dispatch<React.SetStateAction<MisoGameState>>;
  funfairState: FunfairGameState;
  setFunfairState: React.Dispatch<React.SetStateAction<FunfairGameState>>;
  playerName?: string;
  onChangePlayerName?: (nextName: string) => void;
  muted?: boolean;
  onToggleMute?: () => void;
  onSwitchActiveGame?: (game: 'miso' | 'funfair') => void;
  onResetStory?: (game: 'miso' | 'funfair') => void;
  onOpenAbout?: () => void;
}

type MarketTabId = 'bank' | 'savings' | 'fd' | 'shares' | 'commodities' | 'barter';

export function OverlayDrawers({
  activeGame,
  openDrawer,
  onClose,
  misoState,
  setMisoState,
  funfairState,
  setFunfairState,
  playerName = 'Aarav Sharma',
  onChangePlayerName,
  muted = false,
  onToggleMute,
  onSwitchActiveGame,
  onResetStory,
  onOpenAbout,
}: OverlayDrawersProps) {
  const [marketTab, setMarketTab] = useState<MarketTabId>('bank');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<number>(500);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>(playerName);

  if (!openDrawer) return null;

  const triggerFeedback = (msg: string) => {
    soundFX.playCoin();
    setFeedbackBanner(msg);
    gameRuntime.schedule(3.2, () => setFeedbackBanner(null));
  };

  // RENDER SETTINGS DRAWER
  if (openDrawer === 'settings') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
        role="dialog"
        aria-modal="true"
        aria-label="Game Settings"
      >
        <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border-2 border-[#111827] bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
          {/* Header with Cross pinned to Top-Right */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E5DEC9] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFD214] shadow-[0_2px_0_#111827]">
                <Settings className="h-4.5 w-4.5 text-[#111827] stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="block font-chunky text-[10px] font-bold uppercase tracking-wider text-[#C85A3A]">
                  Player &amp; App Preferences
                </span>
                <h2 className="font-title text-base font-extrabold text-[#111827] leading-tight uppercase">
                  Settings
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Settings"
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFFBEB] text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#FEE2E2] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          {feedbackBanner && (
            <div className="mt-2.5 rounded-lg border-2 border-[#059669] bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#065F46]">
              {feedbackBanner}
            </div>
          )}

          {/* 1. Player Profile Name */}
          <div className="mt-3 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57534E]">
              <User className="h-3.5 w-3.5 text-[#C85A3A]" />
              <span>Player Profile Name</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="text"
                value={nameDraft}
                maxLength={22}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 rounded-lg border-2 border-[#111827] bg-white px-2.5 py-1.5 font-chunky text-xs font-bold text-[#111827] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = nameDraft.trim() || 'Aarav Sharma';
                  onChangePlayerName?.(trimmed);
                  triggerFeedback(`Saved player name: ${trimmed}`);
                }}
                className="shrink-0 rounded-lg border-2 border-[#111827] bg-[#FFD214] px-3 py-1.5 font-chunky text-xs font-extrabold text-[#111827] shadow-[0_2px_0_#111827] active:translate-y-0.5 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          {/* 2. Sound & Audio Toggle */}
          <div className="mt-2.5 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#111827] bg-white">
                {muted ? (
                  <VolumeX className="h-4 w-4 text-[#DC2626]" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#059669]" />
                )}
              </div>
              <div>
                <h3 className="font-chunky text-xs font-extrabold text-[#111827]">
                  Sound Effects &amp; Audio
                </h3>
                <p className="text-[10px] text-[#57534E]">
                  {muted ? 'Audio is currently muted' : 'Interactive game sounds enabled'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onToggleMute?.();
              }}
              className={`rounded-lg border-2 border-[#111827] px-3 py-1.5 font-chunky text-xs font-extrabold shadow-[0_2px_0_#111827] active:translate-y-0.5 cursor-pointer ${
                muted ? 'bg-white text-[#111827]' : 'bg-[#059669] text-white'
              }`}
            >
              {muted ? '🔇 OFF' : '🔊 ON'}
            </button>
          </div>

          {/* 3. Active Story Focus */}
          <div className="mt-2.5 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#57534E] mb-1.5">
              Active Story Focus (For Ledger &amp; Map)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSwitchActiveGame?.('miso');
                  triggerFeedback('Switched active focus to Helping Miso.');
                }}
                className={`rounded-lg border-2 border-[#111827] py-1.5 px-2 font-chunky text-xs font-extrabold cursor-pointer ${
                  activeGame === 'miso'
                    ? 'bg-emerald-400 text-[#111827] shadow-[0_2px_0_#111827]'
                    : 'bg-white text-[#57534E]'
                }`}
              >
                🐱 Helping Miso
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSwitchActiveGame?.('funfair');
                  triggerFeedback('Switched active focus to Funfair Founder.');
                }}
                className={`rounded-lg border-2 border-[#111827] py-1.5 px-2 font-chunky text-xs font-extrabold cursor-pointer ${
                  activeGame === 'funfair'
                    ? 'bg-[#FFD214] text-[#111827] shadow-[0_2px_0_#111827]'
                    : 'bg-white text-[#57534E]'
                }`}
              >
                🎪 Funfair Founder
              </button>
            </div>
          </div>

          {/* 4. Reset Story Progress */}
          <div className="mt-2.5 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#57534E] mb-1.5">
              Reset Story Progress (Starts Fresh at ₹5,000)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onResetStory?.('miso');
                  triggerFeedback('Helping Miso reset to Level 1 (₹5,000).');
                }}
                className="flex items-center justify-center gap-1 rounded-lg border border-[#111827] bg-white hover:bg-red-50 py-1.5 px-2 font-chunky text-[11px] font-bold text-[#111827] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Miso</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onResetStory?.('funfair');
                  triggerFeedback('Funfair Founder reset to Level 1 (₹5,000).');
                }}
                className="flex items-center justify-center gap-1 rounded-lg border border-[#111827] bg-white hover:bg-red-50 py-1.5 px-2 font-chunky text-[11px] font-bold text-[#111827] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Funfair</span>
              </button>
            </div>
          </div>

          {/* 5. About Between The Lines & Developer */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenAbout?.();
              }}
              className="flex-1 rounded-lg border-2 border-[#111827] bg-[#FFFBEB] hover:bg-amber-100 py-2 px-3 font-chunky text-xs font-bold text-[#111827] shadow-[0_2px_0_#111827] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Info className="h-3.5 w-3.5 text-[#B45309]" />
              <span>About Webapp &amp; Developer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-[#111827] bg-[#111827] py-2 px-4 font-chunky text-xs font-extrabold text-white shadow-[0_2px_0_#374151] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER ABOUT WEBAPP & DEVELOPER DRAWER
  if (openDrawer === 'about') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
        role="dialog"
        aria-modal="true"
        aria-label="About Between The Lines"
      >
        <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border-2 border-[#111827] bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
          {/* Header with Cross pinned to Top-Right */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E5DEC9] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFD214] shadow-[0_2px_0_#111827]">
                <Info className="h-4.5 w-4.5 text-[#111827] stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="block font-chunky text-[10px] font-bold uppercase tracking-wider text-[#C85A3A]">
                  About Webapp &amp; Creator
                </span>
                <h2 className="font-title text-base font-extrabold text-[#111827] leading-tight uppercase">
                  Between The Lines
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close About Modal"
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFFBEB] text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#FEE2E2] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          {/* About the Webapp Card */}
          <div className="mt-3 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
            <span className="inline-block rounded bg-[#FEF3C7] border border-[#F59E0B]/40 px-2 py-0.5 font-chunky text-[10px] font-bold uppercase tracking-wider text-[#B45309]">
              Interactive Finance Adventure
            </span>
            <p className="mt-1.5 text-xs text-[#2B241F] leading-relaxed font-medium">
              <strong>Between The Lines</strong> is an interactive financial literacy webapp crafted in an expressive Indian graphic-novel aesthetic. Players manage a shared real-time portfolio across two immersive story worlds:
            </p>
            <div className="mt-2.5 space-y-2">
              <div className="rounded-md border border-[#E5DEC9] bg-white p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-chunky text-xs font-extrabold text-teal-800">
                    🐱 Story 1 · Helping Miso
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#57534E]">7 Levels</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#57534E] leading-snug">
                  Rescue a stray cat at Ramesh Kaka’s chai stall while balancing ~₹6,350 in vet care, liquid savings, fixed deposits, and bank loans.
                </p>
              </div>
              <div className="rounded-md border border-[#E5DEC9] bg-white p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-chunky text-xs font-extrabold text-[#205EE8]">
                    🎪 Story 2 · Funfair Founder
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#57534E]">8 Levels</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#57534E] leading-snug">
                  Launch and scale a mela stall across 3 crowd rushes, managing working capital, COGS, inventory restocks, and market investments.
                </p>
              </div>
            </div>
          </div>

          {/* Developer Credit Card */}
          <div className="mt-3 rounded-lg border-2 border-[#111827] bg-[#FFFBEB] p-3 shadow-[0_2px_0_#111827]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#B45309]">
                  Designed &amp; Developed By
                </span>
                <h3 className="mt-0.5 font-chunky text-base font-extrabold text-[#111827]">
                  Abhi Naik
                </h3>
                <p className="text-[11px] font-medium text-[#57534E]">
                  Lead UI/UX &amp; Full-Stack Web Developer
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFD214] font-title text-sm text-[#111827]">
                AN
              </div>
            </div>
          </div>

          <div className="mt-3.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border-2 border-[#111827] bg-[#111827] py-2.5 font-chunky text-xs font-extrabold text-white shadow-[0_2px_0_#374151] hover:bg-[#374151] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Close &amp; Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FINANCIAL DASHBOARD DRAWER (Section 4.2 of Miso PRD & Rule 4 of Funfair PRD)
  if (openDrawer === 'dashboard') {
    const isMiso = activeGame === 'miso';
    const misoNet = getFinalNetPosition(misoState);
    const misoAccessible = getAccessibleResources(misoState);
    const misoInvestments = getInvestmentCurrentValue(misoState);
    const misoCommoditiesVal = getCommodityCurrentValue(misoState);
    const misoCommodityUnits = getTotalCommodityUnits(misoState);

    const ffNetValue = getFinalBusinessValue(funfairState);
    const ffGrowth = getGrowthMultiple(funfairState);
    const ffShares = getFunfairShareValue(funfairState);
    const ffCommodities = getFunfairCommodityValue(funfairState);
    const ffInventoryVal = getSellableInventoryValue(funfairState);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
        role="dialog"
        aria-modal="true"
        aria-label="Player Financial Dashboard"
      >
        <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border-2 border-[#111827] bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
          {/* Header with Cross pinned to Top-Right */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E5DEC9] pb-3">
            <div className="min-w-0 pr-2">
              <span className="inline-block rounded bg-[#FEF3C7] px-2 py-0.5 font-chunky text-[10px] font-bold uppercase tracking-wider text-[#B45309] border border-[#F59E0B]/40">
                {isMiso ? 'Ledger · Separate Accounts' : 'Business & Financial Ledger'}
              </span>
              <h2 className="mt-1 font-chunky text-lg font-extrabold leading-tight text-[#111827]">
                {isMiso ? "Player's Financial Ledger" : 'Stall Business Ledger'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Financial Dashboard"
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFFBEB] text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#FEE2E2] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          <p className="mt-2.5 text-xs text-[#57534E] leading-relaxed">
            {isMiso
              ? 'Investments, locked deposits, and borrowed money are tracked separately from wallet cash.'
              : 'Sales revenue and profit are tracked separately. Unsold stock and kit remain business assets.'}
          </p>

          {isMiso ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-[#E5DEC9] bg-[#F7EFE2] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="money" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#5C5248]">Wallet Cash</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#111827]">
                  ₹{misoState.wallet_balance.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Immediate cash</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#E9F1EC] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="savings" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#2F5746]">Savings (3%)</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#2F5746]">
                  ₹{misoState.savings_balance.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Liquid bank savings</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#E9EFF5] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="shares" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#344E68]">Shares + FD</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#344E68]">
                  ₹{misoInvestments.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">
                  Shares ₹{getShareCurrentValue(misoState)} · FD ₹{misoState.fd_current_value}
                </span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F6ECDC] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="commodities" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#7C5324]">Commodities</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#7C5324]">
                  ₹{misoCommoditiesVal.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">{misoCommodityUnits} total units held</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F6E6E4] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="bank" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#8C383A]">Loan Principal</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#8C383A]">
                  ₹{misoState.borrowed_principal.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Interest: ₹{misoState.interest_amount}</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F6E6E4] p-2.5">
                <div className="flex items-center gap-1.5">
                  <SimpleFinancialIcon type="bank" className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-[#9E3F42]">Repayment Due</span>
                </div>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#9E3F42]">
                  ₹{misoState.repayment_due.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Principal + 10% rate</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F3EEE7] p-2.5">
                <span className="text-[11px] font-bold text-[#5C5248]">Total Care Spent</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#2B241F]">
                  ₹{misoState.total_expenses.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Miso care expenses</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#E9F1EC] p-2.5">
                <span className="text-[11px] font-bold text-[#2F5746]">Accessible Cash</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#2F5746]">
                  ₹{misoAccessible.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#5C5248]">Wallet + Savings</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-[#E5DEC9] bg-[#FFFBEB] p-2.5">
                <span className="text-[11px] font-bold text-[#78716C]">Wallet Cash</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#111827]">
                  ₹{funfairState.wallet_balance.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">Working capital</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F0FDF4] p-2.5">
                <span className="text-[11px] font-bold text-[#065F46]">Sales Revenue</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#065F46]">
                  ₹{funfairState.total_revenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">{funfairState.units_sold} units sold</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#EFF6FF] p-2.5">
                <span className="text-[11px] font-bold text-[#1E40AF]">Gross Profit</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#1E40AF]">
                  ₹{funfairState.gross_profit.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">COGS: ₹{funfairState.cost_of_goods_sold}</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#F5EFE6] p-2.5">
                <span className="text-[11px] font-bold text-[#57534E]">Total Expenses</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#111827]">
                  ₹{funfairState.total_expenses.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">Fixed + Variable</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#FEF3C7] p-2.5">
                <span className="text-[11px] font-bold text-[#92400E]">Inventory &amp; Kit</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#92400E]">
                  ₹{ffInventoryVal.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">Sellable stock value</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#ECFDF5] p-2.5">
                <span className="text-[11px] font-bold text-[#047857]">Savings &amp; FD</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#047857]">
                  ₹{(funfairState.savings_balance + funfairState.fd_balance).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">
                  Sav ₹{funfairState.savings_balance} · FD ₹{funfairState.fd_balance}
                </span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#EFF6FF] p-2.5">
                <span className="text-[11px] font-bold text-[#1D4ED8]">Market Assets</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#1D4ED8]">
                  ₹{(ffShares + ffCommodities).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">Shares + Commodities</span>
              </div>

              <div className="rounded-lg border border-[#E5DEC9] bg-[#FEF2F2] p-2.5">
                <span className="text-[11px] font-bold text-[#DC2626]">Debt Due</span>
                <p className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#DC2626]">
                  ₹{funfairState.repayment_due.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#57534E]">Deducted from net</span>
              </div>
            </div>
          )}

          {/* Net Position Formula Summary */}
          <div className="mt-3.5 rounded-lg border-2 border-[#111827] bg-[#F5EFE6] p-3 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#57534E] block">
                {isMiso ? 'Net Financial Balance' : 'Net Business Balance'}
              </span>
              <p className="font-mono text-lg font-extrabold tabular-nums text-[#111827]">
                ₹{(isMiso ? misoNet : ffNetValue).toLocaleString('en-IN')}
                {!isMiso && (
                  <span className="ml-1.5 text-xs font-bold text-[#C85A3A]">({ffGrowth}×)</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-[#111827] bg-[#FFD214] px-3.5 py-2 font-chunky text-xs font-bold text-[#111827] shadow-[0_2px_0_#111827] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Back to Story
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FINANCIAL CONCEPTS GUIDE DRAWER (Information Icon)
  if (openDrawer === 'concepts') {
    const concepts = [
      {
        title: 'Liquidity & Accessible Money',
        formula: 'Accessible Cash = Wallet + Savings Account',
        explanation:
          'Liquidity means how quickly you can use your money for an urgent expense. Cash in your wallet and savings is liquid; Fixed Deposits are locked until maturity.',
      },
      {
        title: 'Simple Interest & Borrowing',
        formula: 'Interest = Principal × 10% · Repayment = Principal + Interest',
        explanation:
          'Borrowed money is not wealth! A ₹1,000 bank loan at 10% interest adds ₹100 in interest, creating a ₹1,100 repayment obligation.',
      },
      {
        title: 'Saving vs. Investing',
        formula: 'Savings: Steady 2%–3% · Shares/Goods: Fluctuating Value',
        explanation:
          'Savings accounts protect your principal and earn steady interest. Shares and commodities can grow faster, but prices can also dip when you need cash.',
      },
      {
        title: 'Revenue vs. Profit',
        formula: 'Gross Profit = Revenue − Cost of Goods Sold (COGS)',
        explanation:
          'Selling ₹2,000 worth of snacks does not mean ₹2,000 profit. Subtract raw ingredient costs, setup, and rent to know your true Net Profit.',
      },
    ];

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
        role="dialog"
        aria-modal="true"
        aria-label="Financial Concepts Reference"
      >
        <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border-2 border-[#111827] bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
          {/* Header with Cross pinned to Top-Right */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E5DEC9] pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#111827] bg-[#FEF3C7]">
                <Info className="h-4 w-4 text-[#B45309]" />
              </div>
              <div>
                <span className="block font-chunky text-[10px] font-bold uppercase tracking-wider text-[#C85A3A]">
                  How To Play &amp; Rules
                </span>
                <h2 className="font-chunky text-lg font-extrabold text-[#111827] leading-tight">
                  Finance Field Guide
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Concepts Guide"
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFFBEB] text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#FEE2E2] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {concepts.map((c) => (
              <div key={c.title} className="rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
                <h3 className="font-chunky text-sm font-bold text-[#111827]">{c.title}</h3>
                <p className="mt-0.5 font-mono text-[11px] font-bold text-[#C85A3A]">{c.formula}</p>
                <p className="mt-1 text-xs text-[#44403C] leading-relaxed">{c.explanation}</p>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border-2 border-[#111827] bg-[#FFD214] py-2 font-chunky text-xs font-bold text-[#111827] shadow-[0_2px_0_#111827] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Got It, Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER STATIONARY FINANCIAL MARKETPLACE DRAWER (Section 6 of Miso PRD & Section 17 of Funfair PRD)
  const isMiso = activeGame === 'miso';
  const walletBalance = isMiso ? misoState.wallet_balance : funfairState.wallet_balance;
  const savingsBalance = isMiso ? misoState.savings_balance : funfairState.savings_balance;
  const fdBalance = isMiso ? misoState.fd_balance : funfairState.fd_balance;
  const repaymentDue = isMiso ? misoState.repayment_due : funfairState.repayment_due;
  const sharesVal = isMiso ? getShareCurrentValue(misoState) : getFunfairShareValue(funfairState);
  const commVal = isMiso ? getCommodityCurrentValue(misoState) : getFunfairCommodityValue(funfairState);

  const marketOptions: Array<{
    id: MarketTabId;
    label: string;
    shortDesc: string;
    badge: string;
    iconType: 'bank' | 'savings' | 'fd' | 'shares' | 'commodities' | null;
  }> = [
    {
      id: 'bank',
      label: '1. Bank & Loans',
      shortDesc: 'Borrow cash at 10% simple interest',
      badge: repaymentDue > 0 ? `Due ₹${repaymentDue}` : '10% Rate',
      iconType: 'bank',
    },
    {
      id: 'savings',
      label: '2. Savings Account',
      shortDesc: `Liquid savings (${isMiso ? '3%' : '2%'} return)`,
      badge: `₹${savingsBalance.toLocaleString('en-IN')}`,
      iconType: 'savings',
    },
    {
      id: 'fd',
      label: '3. Fixed Deposit (FD)',
      shortDesc: '5% return · Locked until maturity',
      badge: `₹${fdBalance.toLocaleString('en-IN')}`,
      iconType: 'fd',
    },
    {
      id: 'shares',
      label: '4. Share Market',
      shortDesc: 'Buy & sell fictional company stocks',
      badge: `₹${sharesVal.toLocaleString('en-IN')}`,
      iconType: 'shares',
    },
    {
      id: 'commodities',
      label: '5. Commodity Market',
      shortDesc: isMiso ? 'Trade Gold, Silver & Wheat units' : 'Trade Wheat, Sugar & Corn units',
      badge: `₹${commVal.toLocaleString('en-IN')}`,
      iconType: 'commodities',
    },
    {
      id: 'barter',
      label: '6. Commodity Exchange (Barter)',
      shortDesc: 'Compare direct non-cash trade values',
      badge: 'Preview',
      iconType: null,
    },
  ];

  const activeOption = marketOptions.find((o) => o.id === marketTab) || marketOptions[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Stationary Financial Marketplace"
    >
      <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border-2 border-[#111827] bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
        {/* Top Header: Title on left, Cross (X) strictly pinned to top-right corner */}
        <div className="flex items-start justify-between gap-2.5 border-b border-[#E5DEC9] pb-3">
          <div className="min-w-0 pr-1">
            <div className="inline-flex items-center gap-1 rounded bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B45309] border border-[#F59E0B]/40">
              <Sparkles className="h-3 w-3 text-[#D97706]" />
              <span>Financial Marketplace</span>
            </div>
            <h2 className="mt-1 font-chunky text-lg font-extrabold leading-tight text-[#111827]">
              Bank, Savings, FD &amp; Market
            </h2>
            <p className="text-[11px] font-medium text-[#57534E]">
              Explore or transact anytime without losing story progress
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Marketplace"
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#111827] bg-[#FFFBEB] text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#FEE2E2] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Live Compact Wallet & Portfolio Strip */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 rounded-lg border border-[#E5DEC9] bg-[#F5EFE6] p-2">
          <div className="rounded bg-white px-2 py-1 border border-[#E5DEC9]">
            <span className="block text-[9px] font-bold uppercase text-[#78716C]">Wallet</span>
            <span className="font-mono text-xs font-extrabold text-[#111827]">
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="rounded bg-white px-2 py-1 border border-[#E5DEC9]">
            <span className="block text-[9px] font-bold uppercase text-[#047857]">Savings</span>
            <span className="font-mono text-xs font-extrabold text-[#047857]">
              ₹{savingsBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="rounded bg-white px-2 py-1 border border-[#E5DEC9]">
            <span className="block text-[9px] font-bold uppercase text-[#1D4ED8]">Invest/FD</span>
            <span className="font-mono text-xs font-extrabold text-[#1D4ED8]">
              ₹{(fdBalance + sharesVal + commVal).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="rounded bg-white px-2 py-1 border border-[#E5DEC9]">
            <span className="block text-[9px] font-bold uppercase text-[#DC2626]">Debt</span>
            <span className="font-mono text-xs font-extrabold text-[#DC2626]">
              ₹{repaymentDue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {feedbackBanner && (
          <div className="mt-2.5 rounded-lg border-2 border-[#059669] bg-[#ECFDF5] px-3 py-2 text-xs font-bold text-[#065F46] flex items-center justify-between">
            <span>{feedbackBanner}</span>
          </div>
        )}

        {/* DROPDOWN SELECTOR FOR ALL 6 MARKET OPTIONS */}
        <div className="mt-3 relative">
          <label
            htmlFor="market-desk-dropdown"
            className="block text-[10px] font-extrabold uppercase tracking-wider text-[#57534E] mb-1"
          >
            Select Financial Desk (Dropdown)
          </label>

          <button
            id="market-desk-dropdown"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            onClick={() => {
              soundFX.playClick();
              setIsDropdownOpen((prev) => !prev);
            }}
            className="w-full flex items-center justify-between gap-2.5 rounded-lg border-2 border-[#111827] bg-[#FFFBEB] px-3 py-2.5 text-left shadow-[0_2px_0_#111827] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#111827] bg-white">
                {activeOption.iconType ? (
                  <SimpleFinancialIcon type={activeOption.iconType} className="w-5 h-5" />
                ) : (
                  <ArrowLeftRight className="h-4 w-4 text-[#111827]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-chunky text-sm font-extrabold text-[#111827] truncate">
                  {activeOption.label}
                </span>
                <span className="block text-[11px] font-medium text-[#57534E] truncate">
                  {activeOption.shortDesc}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded bg-[#111827] px-2 py-0.5 font-mono text-[10px] font-bold text-[#FFD214]">
                {activeOption.badge}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#111827] transition-transform duration-150 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu List */}
          {isDropdownOpen && (
            <div
              role="listbox"
              aria-label="Marketplace Options"
              className="absolute left-0 right-0 z-30 mt-1.5 rounded-lg border-2 border-[#111827] bg-[#FFFDF9] p-1.5 shadow-[0_6px_0_#111827] space-y-1"
            >
              {marketOptions.map((option) => {
                const isSelected = option.id === marketTab;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      soundFX.playClick();
                      setMarketTab(option.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#B85A3A] text-white'
                        : 'bg-transparent text-[#111827] hover:bg-[#F5ECE0]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-white/40 bg-white/15'
                            : 'border-[#D6CFC2] bg-white'
                        }`}
                      >
                        {option.iconType ? (
                          <SimpleFinancialIcon type={option.iconType} className="w-4 h-4" />
                        ) : (
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold truncate">
                          {option.label}
                        </span>
                        <span
                          className={`block text-[10px] truncate ${
                            isSelected ? 'text-white/85' : 'text-[#57534E]'
                          }`}
                        >
                          {option.shortDesc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          isSelected
                            ? 'bg-black/25 text-[#FFD214]'
                            : 'bg-[#F5EFE6] text-[#57534E]'
                        }`}
                      >
                        {option.badge}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#FFD214] stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Desk Content Card */}
        <div className="mt-3 rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3.5">
          {marketTab === 'bank' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
                <div>
                  <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                    Community Bank &amp; Credit Desk
                  </h3>
                  <p className="text-[11px] text-[#57534E]">
                    Standard 10% simple interest per game period.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="block text-[9px] font-bold uppercase text-[#78716C]">Repayment Due</span>
                  <span className="text-xs font-extrabold text-[#DC2626]">
                    ₹{repaymentDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { principal: 500, interest: 50, total: 550 },
                  { principal: 1000, interest: 100, total: 1100 },
                  { principal: 1500, interest: 150, total: 1650 },
                ].map((tier) => (
                  <div
                    key={tier.principal}
                    className="rounded-lg border border-[#E5DEC9] bg-white p-2.5 flex items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-base font-extrabold text-[#111827]">
                          ₹{tier.principal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-semibold text-[#78716C]">Loan</span>
                      </div>
                      <p className="font-mono text-[10px] text-[#57534E]">
                        +₹{tier.interest} interest (10%) →{' '}
                        <strong className="text-[#DC2626]">Repay ₹{tier.total}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isMiso) {
                          setMisoState((prev) => ({
                            ...prev,
                            wallet_balance: prev.wallet_balance + tier.principal,
                            borrowed_principal: prev.borrowed_principal + tier.principal,
                            interest_amount: prev.interest_amount + tier.interest,
                            repayment_due: prev.repayment_due + tier.total,
                          }));
                        } else {
                          setFunfairState((prev) => ({
                            ...prev,
                            wallet_balance: prev.wallet_balance + tier.principal,
                            borrowed_principal: prev.borrowed_principal + tier.principal,
                            interest_amount: prev.interest_amount + tier.interest,
                            repayment_due: prev.interest_amount + tier.interest + prev.borrowed_principal + tier.principal,
                          }));
                        }
                        triggerFeedback(
                          `Borrowed ₹${tier.principal}. Repayment due increased by ₹${tier.total}.`
                        );
                      }}
                      className="shrink-0 rounded-lg border-2 border-[#111827] bg-[#FFD214] px-3 py-1.5 font-chunky text-xs font-extrabold text-[#111827] shadow-[0_2px_0_#111827] hover:bg-[#F59E0B] active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      Borrow ₹{tier.principal}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {marketTab === 'savings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
                <div>
                  <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                    Liquid Savings Account ({isMiso ? '3%' : '2%'} Rate)
                  </h3>
                  <p className="text-[11px] text-[#57534E]">
                    Earns steady interest &amp; can be withdrawn anytime.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="block text-[9px] font-bold uppercase text-[#78716C]">Saved Balance</span>
                  <span className="text-sm font-extrabold text-[#059669]">
                    ₹{savingsBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-[#57534E] mb-1.5">
                  Choose Amount
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountInput(amt)}
                      className={`rounded-lg border py-1.5 font-mono text-xs font-extrabold transition-colors cursor-pointer ${
                        amountInput === amt
                          ? 'border-[#111827] bg-[#111827] text-[#FFD214]'
                          : 'border-[#D6CFC2] bg-white text-[#111827] hover:bg-[#F5EFE6]'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={walletBalance < amountInput}
                  onClick={() => {
                    if (isMiso) {
                      setMisoState((prev) => marketplaceDepositSavings(prev, amountInput));
                    } else {
                      setFunfairState((prev) => {
                        if (prev.wallet_balance < amountInput) return prev;
                        return {
                          ...prev,
                          wallet_balance: prev.wallet_balance - amountInput,
                          savings_balance: prev.savings_balance + amountInput,
                        };
                      });
                    }
                    triggerFeedback(`Deposited ₹${amountInput} into Savings Account.`);
                  }}
                  className="rounded-lg border-2 border-[#111827] bg-[#059669] py-2 px-2.5 font-chunky text-xs font-bold text-white shadow-[0_2px_0_#111827] disabled:opacity-40 hover:bg-[#047857] cursor-pointer"
                >
                  Deposit ₹{amountInput}
                </button>
                <button
                  type="button"
                  disabled={savingsBalance <= 0}
                  onClick={() => {
                    const withdrawAmt = Math.min(amountInput, savingsBalance);
                    if (isMiso) {
                      setMisoState((prev) => marketplaceWithdrawSavings(prev, withdrawAmt));
                    } else {
                      setFunfairState((prev) => ({
                        ...prev,
                        savings_balance: prev.savings_balance - withdrawAmt,
                        wallet_balance: prev.wallet_balance + withdrawAmt,
                      }));
                    }
                    triggerFeedback(`Withdrew ₹${withdrawAmt} from Savings to Wallet.`);
                  }}
                  className="rounded-lg border-2 border-[#111827] bg-white py-2 px-2.5 font-chunky text-xs font-bold text-[#111827] shadow-[0_2px_0_#111827] disabled:opacity-40 hover:bg-[#F5EFE6] cursor-pointer"
                >
                  Withdraw ₹{Math.min(amountInput, savingsBalance || amountInput)}
                </button>
              </div>
            </div>
          )}

          {marketTab === 'fd' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
                <div>
                  <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                    Fixed Deposit (FD) · 5% Return
                  </h3>
                  <p className="text-[11px] text-[#57534E]">
                    Higher guaranteed return, but locked until game end.
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="block text-[9px] font-bold uppercase text-[#78716C]">Locked FD</span>
                  <span className="text-sm font-extrabold text-[#B45309]">
                    ₹{fdBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={walletBalance < amt}
                    onClick={() => {
                      if (isMiso) {
                        setMisoState((prev) => marketplaceOpenFD(prev, amt));
                      } else {
                        setFunfairState((prev) => {
                          if (prev.wallet_balance < amt) return prev;
                          return {
                            ...prev,
                            wallet_balance: prev.wallet_balance - amt,
                            fd_balance: prev.fd_balance + amt,
                            fd_maturity_period: 3,
                          };
                        });
                      }
                      triggerFeedback(
                        `Locked ₹${amt} in Fixed Deposit (Matures to ₹${Math.round(amt * 1.05)}).`
                      );
                    }}
                    className="flex items-center justify-between rounded-lg border-2 border-[#111827] bg-[#FFFBEB] px-3 py-2.5 text-left shadow-[0_2px_0_#111827] disabled:opacity-40 hover:bg-[#FEF3C7] cursor-pointer"
                  >
                    <div>
                      <span className="block font-chunky text-xs font-extrabold text-[#111827]">
                        Lock ₹{amt.toLocaleString('en-IN')} in Fixed Deposit
                      </span>
                      <span className="block text-[10px] text-[#57534E]">
                        Matures to <strong className="text-[#059669]">₹{Math.round(amt * 1.05)}</strong> (+5%)
                      </span>
                    </div>
                    <span className="rounded bg-[#D97706] px-2.5 py-1 font-chunky text-[11px] font-bold text-white">
                      Lock ₹{amt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {marketTab === 'shares' && (
            <div className="space-y-2.5">
              <div className="border-b border-[#E5DEC9] pb-2">
                <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                  Fictional Share Market
                </h3>
                <p className="text-[11px] text-[#57534E]">
                  Buy or sell company shares at current market prices.
                </p>
              </div>

              <div className="space-y-2">
                {isMiso
                  ? (['companyA', 'companyB'] as MisoShareId[]).map((id) => {
                      const info = misoState.share_prices[id];
                      const owned = misoState.share_units[id];
                      const diff = info.current - info.previous;
                      const pct = Math.round((diff / info.previous) * 100);
                      return (
                        <div key={id} className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#78716C]">
                                {info.sector}
                              </span>
                              <h4 className="font-chunky text-xs font-extrabold text-[#111827]">
                                {info.name}
                              </h4>
                            </div>
                            <span
                              className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold ${
                                diff >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {diff >= 0 ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              )}
                              {diff >= 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-baseline justify-between font-mono">
                            <div>
                              <span className="text-sm font-extrabold text-[#111827]">
                                ₹{info.current}
                              </span>
                              <span className="ml-1.5 text-[10px] text-[#78716C]">
                                Prev ₹{info.previous}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-[#1E40AF]">
                              Owned: {owned} (₹{owned * info.current})
                            </span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={misoState.wallet_balance < info.current}
                              onClick={() => {
                                setMisoState((prev) => marketplaceBuyShare(prev, id, 1));
                                triggerFeedback(`Bought 1 share of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-[#C85A3A] py-1.5 text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer"
                            >
                              Buy 1 (₹{info.current})
                            </button>
                            <button
                              type="button"
                              disabled={owned <= 0}
                              onClick={() => {
                                setMisoState((prev) => marketplaceSellShare(prev, id, 1));
                                triggerFeedback(`Sold 1 share of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-white py-1.5 text-[11px] font-bold text-[#111827] disabled:opacity-40 cursor-pointer"
                            >
                              Sell 1
                            </button>
                          </div>
                        </div>
                      );
                    })
                  : (['funFoods', 'playWorks'] as FunfairShareId[]).map((id) => {
                      const info = funfairState.share_prices[id];
                      const owned = funfairState.share_units[id];
                      const diff = info.current - info.previous;
                      const pct = Math.round((diff / info.previous) * 100);
                      return (
                        <div key={id} className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                          <div className="flex items-start justify-between">
                            <h4 className="font-chunky text-xs font-extrabold text-[#111827]">
                              {info.name}
                            </h4>
                            <span
                              className={`font-mono text-xs font-bold ${
                                diff >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {diff >= 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-baseline justify-between font-mono">
                            <div>
                              <span className="text-sm font-extrabold text-[#111827]">
                                ₹{info.current}
                              </span>
                              <span className="ml-1.5 text-[10px] text-[#78716C]">
                                Prev ₹{info.previous}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-[#1E40AF]">
                              Owned: {owned} (₹{owned * info.current})
                            </span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={funfairState.wallet_balance < info.current}
                              onClick={() => {
                                setFunfairState((prev) => funfairBuyShare(prev, id, 1));
                                triggerFeedback(`Bought 1 share of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-[#C85A3A] py-1.5 text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer"
                            >
                              Buy 1 (₹{info.current})
                            </button>
                            <button
                              type="button"
                              disabled={owned <= 0}
                              onClick={() => {
                                setFunfairState((prev) => funfairSellShare(prev, id, 1));
                                triggerFeedback(`Sold 1 share of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-white py-1.5 text-[11px] font-bold text-[#111827] disabled:opacity-40 cursor-pointer"
                            >
                              Sell 1
                            </button>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}

          {marketTab === 'commodities' && (
            <div className="space-y-2.5">
              <div className="border-b border-[#E5DEC9] pb-2">
                <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                  Commodity Market
                </h3>
                <p className="text-[11px] text-[#57534E]">
                  Trade physical commodity units whose prices shift with supply &amp; demand.
                </p>
              </div>

              <div className="space-y-2">
                {isMiso
                  ? (['gold', 'silver', 'wheat'] as MisoCommodityId[]).map((id) => {
                      const info = misoState.commodity_prices[id];
                      const owned = misoState.commodity_units[id];
                      const diff = info.current - info.previous;
                      const pct = Math.round((diff / info.previous) * 100);
                      return (
                        <div key={id} className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-chunky text-xs font-extrabold text-[#111827]">
                              {info.name}
                            </h4>
                            <span
                              className={`font-mono text-xs font-bold ${
                                diff >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {diff >= 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between font-mono">
                            <span className="text-sm font-extrabold text-[#111827]">
                              ₹{info.current}{' '}
                              <span className="text-[10px] font-normal text-[#78716C]">
                                (Prev ₹{info.previous})
                              </span>
                            </span>
                            <span className="text-[11px] font-bold text-[#92400E]">
                              Held: {owned} (₹{owned * info.current})
                            </span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={misoState.wallet_balance < info.current}
                              onClick={() => {
                                setMisoState((prev) => marketplaceBuyCommodity(prev, id, 1));
                                triggerFeedback(`Bought 1 unit of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-[#C85A3A] py-1.5 text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer"
                            >
                              Buy 1 (₹{info.current})
                            </button>
                            <button
                              type="button"
                              disabled={owned <= 0}
                              onClick={() => {
                                setMisoState((prev) => marketplaceSellCommodity(prev, id, 1));
                                triggerFeedback(`Sold 1 unit of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-white py-1.5 text-[11px] font-bold text-[#111827] disabled:opacity-40 cursor-pointer"
                            >
                              Sell 1
                            </button>
                          </div>
                        </div>
                      );
                    })
                  : (['wheat', 'sugar', 'corn'] as FunfairCommodityId[]).map((id) => {
                      const info = funfairState.commodity_prices[id];
                      const owned = funfairState.commodity_units[id];
                      const diff = info.current - info.previous;
                      const pct = Math.round((diff / info.previous) * 100);
                      return (
                        <div key={id} className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-chunky text-xs font-extrabold text-[#111827]">
                              {info.name}
                            </h4>
                            <span
                              className={`font-mono text-xs font-bold ${
                                diff >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
                              }`}
                            >
                              {diff >= 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between font-mono">
                            <span className="text-sm font-extrabold text-[#111827]">
                              ₹{info.current}{' '}
                              <span className="text-[10px] font-normal text-[#78716C]">
                                (Prev ₹{info.previous})
                              </span>
                            </span>
                            <span className="text-[11px] font-bold text-[#92400E]">
                              Held: {owned} (₹{owned * info.current})
                            </span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              disabled={funfairState.wallet_balance < info.current}
                              onClick={() => {
                                setFunfairState((prev) => funfairBuyCommodity(prev, id, 1));
                                triggerFeedback(`Bought 1 unit of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-[#C85A3A] py-1.5 text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer"
                            >
                              Buy 1 (₹{info.current})
                            </button>
                            <button
                              type="button"
                              disabled={owned <= 0}
                              onClick={() => {
                                setFunfairState((prev) => funfairSellCommodity(prev, id, 1));
                                triggerFeedback(`Sold 1 unit of ${info.name} for ₹${info.current}.`);
                              }}
                              className="flex-1 rounded-md border border-[#111827] bg-white py-1.5 text-[11px] font-bold text-[#111827] disabled:opacity-40 cursor-pointer"
                            >
                              Sell 1
                            </button>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}

          {marketTab === 'barter' && (
            <div className="space-y-2.5">
              <div className="border-b border-[#E5DEC9] pb-2">
                <h3 className="font-chunky text-sm font-extrabold text-[#111827]">
                  Commodity Exchange &amp; Barter Simulator
                </h3>
                <p className="text-[11px] text-[#57534E]">
                  Compare how two players exchange goods based on market value without cash.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                  <span className="text-[9px] font-bold uppercase text-[#78716C]">Player A Gives</span>
                  <p className="mt-0.5 text-xs font-extrabold text-[#111827]">2 Wheat + 1 Silver</p>
                  <p className="mt-1 font-mono text-[11px] text-[#57534E]">
                    Value: <strong className="text-[#111827]">₹1,140</strong>
                  </p>
                </div>
                <div className="rounded-lg border border-[#E5DEC9] bg-white p-2.5">
                  <span className="text-[9px] font-bold uppercase text-[#78716C]">Player B Gives</span>
                  <p className="mt-0.5 text-xs font-extrabold text-[#111827]">1 Gold Unit</p>
                  <p className="mt-1 font-mono text-[11px] text-[#57534E]">
                    Value: <strong className="text-[#111827]">₹1,100</strong>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-[#D6D3D1] bg-[#FFFBEB] p-2.5 text-[11px] text-[#44403C]">
                <strong>Value Difference: ₹40.</strong> In a barter trade, players weigh scarcity and immediate utility alongside market price.
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border-2 border-[#111827] bg-[#111827] py-2.5 font-chunky text-xs font-extrabold text-white shadow-[0_2px_0_#374151] hover:bg-[#374151] active:translate-y-0.5 transition-all cursor-pointer"
          >
            Return to Story
          </button>
        </div>
      </div>
    </div>
  );
}
