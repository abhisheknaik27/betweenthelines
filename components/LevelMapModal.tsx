'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  RotateCcw,
  Play,
  CheckCircle2,
  MapPin,
  Sparkles,
  Award,
  TrendingUp,
  Wallet,
  BookOpen,
  Home,
} from 'lucide-react';
import { MisoGameState, MisoDecisionRecord, getFinalNetPosition } from '@/lib/miso-engine';
import {
  FunfairGameState,
  FunfairDecisionRecord,
  getFinalBusinessValue,
} from '@/lib/funfair-engine';
import { soundFX } from '@/lib/sound';

interface LevelMetadata {
  level: number;
  junctionId: string;
  title: string;
  shortLabel: string;
  location: string;
  icon: string;
  budgetHint: string;
  conceptSkill: string;
  challengeSummary: string;
  proTip: string;
  // Percentage coordinates along the winding trail in /assets/aistudio/image_23f889f2.png
  x: number;
  y: number;
}

const MISO_LEVELS: LevelMetadata[] = [
  {
    level: 1,
    junctionId: 'J1',
    title: 'First Aid & Roadside Food',
    shortLabel: 'First Aid',
    location: 'Ramesh Kaka’s Chai Tapri · NH-48',
    icon: '🐱',
    budgetHint: '₹0 – ₹100',
    conceptSkill: 'Resourcefulness & Cash Preservation',
    challengeSummary:
      'Miso is hungry and limping by the tea stall. Decide whether to spend cash on store food or coordinate safe community help.',
    proTip:
      'Asking Ramesh Kaka or the animal helpline feeds Miso safely for ₹0, preserving 100% of your ₹5,000 wallet for urgent vet care!',
    x: 58,
    y: 87,
  },
  {
    level: 2,
    junctionId: 'J2',
    title: 'Safe Transport to Clinic',
    shortLabel: 'Transport',
    location: '4 km Highway Stretch to Vet Clinic',
    icon: '🛺',
    budgetHint: '₹150 – ₹800',
    conceptSkill: 'Need vs. Comfort Trade-Off',
    challengeSummary:
      'Transport Miso 4 km to Dr. Kavita’s clinic without exhausting the money needed for her medical treatment.',
    proTip:
      'Shared auto or rescuer-assisted transport (₹150–₹250) gets Miso to the clinic safely while saving ₹550+ compared to a private cab.',
    x: 38,
    y: 74,
  },
  {
    level: 3,
    junctionId: 'J3',
    title: 'Vet Triage & Care Budget',
    shortLabel: 'Vet Triage',
    location: 'Dr. Kavita’s Veterinary Clinic',
    icon: '🩺',
    budgetHint: '~₹2,200 Triage',
    conceptSkill: 'Prioritisation & Multi-Step Budgeting',
    challengeSummary:
      'Dr. Kavita estimates full recovery could reach ~₹6,350. Choose immediate consultation & pain relief while planning ahead.',
    proTip:
      'Prioritise urgent vet consultation and essential stabilization so Miso recovers steadily without medical delay penalties.',
    x: 41,
    y: 60,
  },
  {
    level: 4,
    junctionId: 'J4',
    title: 'Town Financial Bazaar',
    shortLabel: 'Bank & FD',
    location: 'Community Bank & Savings Desk',
    icon: '🏦',
    budgetHint: '3% Save / 5% FD',
    conceptSkill: 'Liquidity vs. Locked Returns',
    challengeSummary:
      'Decide how much idle cash to keep liquid in a 3% Savings Account versus locking in a 5% Fixed Deposit.',
    proTip:
      'Savings (3%) stays liquid for sudden lab tests, whereas Fixed Deposits (5%) lock your cash until the end of the story.',
    x: 26,
    y: 46,
  },
  {
    level: 5,
    junctionId: 'J5',
    title: 'Shares & Commodity Mandi',
    shortLabel: 'Market',
    location: 'Town Exchange & Mandi',
    icon: '📈',
    budgetHint: 'Optional Invest',
    conceptSkill: 'Market Risk & Diversification',
    challengeSummary:
      'Explore buying fictional company shares or commodities (Gold, Silver, Wheat) before market prices shift.',
    proTip:
      'Only invest surplus cash that you will not immediately need for Miso’s upcoming ₹1,000 diagnostic lab test.',
    x: 47,
    y: 35,
  },
  {
    level: 6,
    junctionId: 'J6',
    title: 'Urgent Diagnostic Lab Test',
    shortLabel: 'Lab Test',
    location: 'Veterinary Diagnostic Lab',
    icon: '🔬',
    budgetHint: '₹1,000 Test',
    conceptSkill: 'Emergency Liquidity & Credit Management',
    challengeSummary:
      'Miso needs an urgent ₹1,000 blood and X-ray test! Fund it using wallet cash, liquid savings, or a 10% bank loan.',
    proTip:
      'Using liquid wallet + savings avoids the 10% simple-interest loan fee and keeps your final net position higher.',
    x: 69,
    y: 23,
  },
  {
    level: 7,
    junctionId: 'J7',
    title: 'Final Recovery & Settlement',
    shortLabel: 'Recovery',
    location: 'Miso’s New Home & Final Ledger',
    icon: '💖',
    budgetHint: 'Final Care',
    conceptSkill: 'Complete Care & Debt Settlement',
    challengeSummary:
      'Complete Miso’s recovery medicines and follow-up checkup, mature your FD, and settle any outstanding bank loans.',
    proTip:
      'Completing all recommended care with zero unpaid debt unlocks the highest Golden Rescue Champion ending!',
    x: 32,
    y: 12,
  },
];

const FUNFAIR_LEVELS: LevelMetadata[] = [
  {
    level: 1,
    junctionId: 'J1',
    title: 'Stall Concept Selection',
    shortLabel: 'Stall Type',
    location: 'Mela Grounds Entry Gate',
    icon: '🎪',
    budgetHint: '₹350 – ₹500',
    conceptSkill: 'Capital Allocation & Business Model',
    challengeSummary:
      'Choose between a Food & Refreshments Stall, Carnival Game Stall, or Hybrid Stall to launch your mela business.',
    proTip:
      'Food stalls drive high repeat volume, Game stalls have zero spoilage, and Hybrid stalls capture both crowds!',
    x: 58,
    y: 89,
  },
  {
    level: 2,
    junctionId: 'J2',
    title: 'Mela Ground Location',
    shortLabel: 'Location',
    location: 'Main Stage vs. Entrance vs. Corner',
    icon: '📍',
    budgetHint: '₹100 – ₹250 Rent',
    conceptSkill: 'Fixed Cost vs. Footfall Multiplier',
    challengeSummary:
      'Pick your stall pitch. Higher rent locations bring a bigger visitor multiplier across all 3 rushes.',
    proTip:
      'Main Stage or Entrance pitches cost more upfront rent but multiply your customer demand during Peak Crowd.',
    x: 37,
    y: 77,
  },
  {
    level: 3,
    junctionId: 'J3',
    title: 'Opening Rush Stock & Pricing',
    shortLabel: 'Rush 1 Stock',
    location: 'Period 1 · Opening Rush Wholesale',
    icon: '🍋',
    budgetHint: 'Working Capital',
    conceptSkill: 'COGS, Bulk Discount & Pricing Margin',
    challengeSummary:
      'Stock up on inventory units and set your selling price strategy (Lower Volume, Suggested Balanced, or Premium Margin).',
    proTip:
      'Buying 30+ total units unlocks a 10% wholesale bulk discount on Cost of Goods Sold (COGS)!',
    x: 43,
    y: 64,
  },
  {
    level: 4,
    junctionId: 'J4',
    title: 'Period 1 Banking & Market',
    shortLabel: 'Bank & FD',
    location: 'Mela Merchant Banking Desk',
    icon: '🏦',
    budgetHint: '2% Save / 5% FD',
    conceptSkill: 'Idle Cash Yield vs. Restock Liquidity',
    challengeSummary:
      'Put idle Period 1 revenue to work in Savings, Fixed Deposits, Shares, or Commodities—or keep cash ready for Period 2.',
    proTip:
      'Keep enough liquid cash in your Wallet or Savings so you can restock heavily before the big Peak Crowd rush!',
    x: 26,
    y: 51,
  },
  {
    level: 5,
    junctionId: 'J5',
    title: 'Peak Crowd Restock & Promo',
    shortLabel: 'Peak Rush',
    location: 'Period 2 · Mid-Day Peak Crowd',
    icon: '🔥',
    budgetHint: 'Restock + Promo',
    conceptSkill: 'Demand Scaling & Promotional ROI',
    challengeSummary:
      'Visitor footfall surges in Period 2! Restock high-demand items and decide whether to run a banner or announcer promotion.',
    proTip:
      'Matching a high-traffic promotion with sufficient inventory prevents stockouts during Peak Crowd.',
    x: 47,
    y: 38,
  },
  {
    level: 6,
    junctionId: 'J6',
    title: 'Market & Weather Shift',
    shortLabel: 'Event Shift',
    location: 'Afternoon Mela Weather & Mandi',
    icon: '⚡',
    budgetHint: 'Adapt Strategy',
    conceptSkill: 'Risk Mitigation & Dynamic Adaptation',
    challengeSummary:
      'Respond to mid-fair commodity price changes and crowd shifts by adjusting your stall upgrade or reserve cash.',
    proTip:
      'Selling appreciated shares or commodities at the right moment boosts your liquid cash for the Final Rush.',
    x: 70,
    y: 27,
  },
  {
    level: 7,
    junctionId: 'J7',
    title: 'Final Rush Clearance Push',
    shortLabel: 'Final Rush',
    location: 'Period 3 · Evening Finale',
    icon: '🚀',
    budgetHint: 'Clearance Push',
    conceptSkill: 'Perishable Spoilage & Inventory Turnover',
    challengeSummary:
      'Evening lanterns light up for the Final Rush! Price and stock smartly so perishable food items sell out before closing.',
    proTip:
      'Avoid overstocking perishables in Period 3—unsold perishable food spoils at closing, while game stock retains asset value.',
    x: 31,
    y: 17,
  },
  {
    level: 8,
    junctionId: 'J8',
    title: 'Final Mela Settlement',
    shortLabel: 'Settlement',
    location: 'Mela Committee Trophy Stage',
    icon: '🏆',
    budgetHint: '4× Growth Goal',
    conceptSkill: 'Net Business Valuation & Debt Settlement',
    challengeSummary:
      'Settle any bank loans, mature your FD, value your remaining usable kit, and calculate your final Net Business Value.',
    proTip:
      'Growing your net business value while keeping debt low earns the prestigious Funfair Founder Champion trophy!',
    x: 52,
    y: 7,
  },
];

interface LevelMapModalProps {
  isOpen: boolean;
  initialStory: 'miso' | 'funfair';
  onClose: () => void;
  misoState: MisoGameState;
  funfairState: FunfairGameState;
  onPlayLevel: (story: 'miso' | 'funfair', levelNumber: number) => void;
  onReplayStory: (story: 'miso' | 'funfair') => void;
  onGoHome?: () => void;
}

export function LevelMapModal({
  isOpen,
  initialStory,
  onClose,
  misoState,
  funfairState,
  onPlayLevel,
  onReplayStory,
  onGoHome,
}: LevelMapModalProps) {
  const [overrideStory, setOverrideStory] = useState<'miso' | 'funfair' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  if (!isOpen) return null;

  const mapStory = overrideStory ?? initialStory;
  const isMiso = mapStory === 'miso';
  const levels = isMiso ? MISO_LEVELS : FUNFAIR_LEVELS;

  const handleClose = () => {
    setOverrideStory(null);
    setSelectedLevel(null);
    onClose();
  };

  // Current active level (1-based)
  const currentActiveLevel = isMiso
    ? misoState.stage >= 9
      ? 8 // All 7 completed
      : Math.max(1, Math.min(7, misoState.stage - 1))
    : funfairState.stage >= 10
    ? 9 // All 8 completed
    : Math.max(1, Math.min(8, funfairState.stage - 1));

  // Helper to lookup decision log record for a given level
  const getMisoRecord = (levelNum: number): MisoDecisionRecord | undefined => {
    const prefix = `J${levelNum}`;
    return [...misoState.decisions]
      .reverse()
      .find((d) => d.junction_id === prefix || d.junction_id.startsWith(`${prefix}_`));
  };

  const getFunfairRecord = (levelNum: number): FunfairDecisionRecord | undefined => {
    const prefix = `J${levelNum}`;
    const ffPrefix = `FF_J${levelNum}`;
    return [...funfairState.decisions]
      .reverse()
      .find(
        (d) =>
          d.junctionId === prefix ||
          d.junctionId.startsWith(`${prefix}_`) ||
          d.junctionId.startsWith(`${ffPrefix}_`)
      );
  };

  const isLevelCompleted = (levelNum: number): boolean => {
    if (isMiso) {
      return Boolean(getMisoRecord(levelNum)) || misoState.stage > levelNum + 1;
    }
    return Boolean(getFunfairRecord(levelNum)) || funfairState.stage > levelNum + 1;
  };

  const getLevelStars = (levelNum: number): number => {
    if (!isLevelCompleted(levelNum)) return 0;
    if (isMiso) {
      const rec = getMisoRecord(levelNum);
      if (!rec) return 3;
      if (rec.selected_amount <= 250) return 3;
      if (rec.selected_amount <= 600) return 2;
      return 2;
    } else {
      const rec = getFunfairRecord(levelNum);
      if (!rec) return 3;
      return 3;
    }
  };

  const completedCount = levels.filter((l) => isLevelCompleted(l.level)).length;
  const activeLevelMeta = selectedLevel
    ? levels.find((l) => l.level === selectedLevel) || null
    : null;

  const selectedMisoRec =
    selectedLevel && isMiso ? getMisoRecord(selectedLevel) : undefined;
  const selectedFunfairRec =
    selectedLevel && !isMiso ? getFunfairRecord(selectedLevel) : undefined;
  const selectedCompleted = selectedLevel ? isLevelCompleted(selectedLevel) : false;
  const selectedStars = selectedLevel ? getLevelStars(selectedLevel) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-0 sm:p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Story Level Map"
    >
      <div className="relative w-full max-w-[440px] sm:max-w-lg md:max-w-2xl h-[100dvh] sm:h-[92dvh] max-h-[920px] bg-[#1E293B] overflow-hidden sm:rounded-2xl shadow-xl flex flex-col justify-between border-2 border-slate-900">
        {/* ====================================================================
            TOP MAP HEADER BAR
           ==================================================================== */}
        <header className="relative z-30 bg-[#FFFDF9] border-b-2 border-slate-900 px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-slate-900 bg-[#FFD214] text-sm shadow-[0_2px_0_#111827]">
                🗺️
              </div>
              <div className="min-w-0">
                <span className="block font-sans text-[9px] font-black uppercase tracking-wider text-[#C85A3A]">
                  Interactive Trail · Tap Any Level
                </span>
                <h2 className="font-title text-sm text-slate-950 uppercase leading-tight truncate">
                  Adventure Level Map
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onReplayStory(mapStory);
                  handleClose();
                }}
                title="Replay Story from Level 1"
                className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-900 bg-white hover:bg-amber-50 px-2 py-1 font-chunky text-[11px] font-extrabold text-slate-900 shadow-[0_2px_0_#111827] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Play Again</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Level Map"
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-900 bg-[#FFFBEB] text-slate-900 shadow-[0_2px_0_#111827] hover:bg-red-100 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Story Selector Tabs + Progress Pill */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="grid grid-cols-2 gap-1.5 flex-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setOverrideStory('miso');
                  setSelectedLevel(null);
                }}
                className={`rounded-md py-1 px-2 font-chunky text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isMiso
                    ? 'bg-emerald-500 text-slate-950 border border-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>🐱</span>
                <span>Miso (7 Lv)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setOverrideStory('funfair');
                  setSelectedLevel(null);
                }}
                className={`rounded-md py-1 px-2 font-chunky text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  !isMiso
                    ? 'bg-[#FFD214] text-slate-950 border border-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>🎪</span>
                <span>Funfair (8 Lv)</span>
              </button>
            </div>

            <div className="shrink-0 rounded-lg border border-slate-300 bg-[#F9F6F0] px-2.5 py-1 text-right">
              <span className="block text-[8px] font-sans font-extrabold uppercase text-slate-500">
                Completed
              </span>
              <strong className="font-mono text-xs font-extrabold text-slate-950">
                {completedCount}/{levels.length} ★
              </strong>
            </div>
          </div>
        </header>

        {/* ====================================================================
            INTERACTIVE WINDING MAP CANVAS (GREEN VALLEY & RIVER STEPPING STONES)
           ==================================================================== */}
        <div
          className="relative flex-1 w-full overflow-hidden bg-[#7ED944]"
          data-testid="interactive-map-canvas"
        >
          {/* Illustrated Valley, Winding Trail, River Stepping Stones, Trees & Landmarks */}
          <svg
            viewBox="0 0 400 700"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 w-full h-full select-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="valleySkyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE17D" />
                <stop offset="14%" stopColor="#B4F05A" />
                <stop offset="55%" stopColor="#7AD63B" />
                <stop offset="100%" stopColor="#58B327" />
              </linearGradient>
              <linearGradient id="riverBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#73E6FF" />
                <stop offset="50%" stopColor="#35BAFF" />
                <stop offset="100%" stopColor="#1B9CE5" />
              </linearGradient>
              <linearGradient id="cliffTan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D7A15C" />
                <stop offset="100%" stopColor="#9C6B34" />
              </linearGradient>
            </defs>

            {/* Base lush green hills */}
            <rect width="400" height="700" fill="url(#valleySkyGlow)" />

            {/* Soft rolling hill contours */}
            <ellipse cx="90" cy="180" rx="140" ry="70" fill="#8FE548" opacity="0.7" />
            <ellipse cx="310" cy="240" rx="130" ry="65" fill="#8FE548" opacity="0.65" />
            <ellipse cx="120" cy="430" rx="160" ry="85" fill="#6EC732" opacity="0.65" />
            <ellipse cx="295" cy="540" rx="150" ry="80" fill="#85DC42" opacity="0.6" />

            {/* Top-right serene pond */}
            <path
              d="M 290,72 Q 340,60 400,52 L 400,98 Q 340,104 295,86 Z"
              fill="url(#riverBlue)"
              stroke="#559E2A"
              strokeWidth="4"
            />

            {/* Sparkling Blue River Winding Top-Left to Center-Right */}
            <path
              d="M 0,68 C 75,65 110,95 135,145 C 162,198 130,225 148,255 C 170,288 265,305 400,340 L 400,305 C 275,272 195,258 176,232 C 160,210 188,182 162,132 C 132,76 85,44 0,42 Z"
              fill="url(#riverBlue)"
              stroke="#50A828"
              strokeWidth="4"
            />

            {/* Sandy Winding Adventure Trail (Bottom to Top) */}
            <path
              d="M 225,700 C 235,615 190,565 150,510 C 110,455 155,410 135,355 C 112,295 100,255 155,235 C 215,212 275,180 268,132 C 260,85 165,98 122,108 C 145,75 195,42 225,0"
              fill="none"
              stroke="#BA9258"
              strokeWidth="44"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 225,700 C 235,615 190,565 150,510 C 110,455 155,410 135,355 C 112,295 100,255 155,235 C 215,212 275,180 268,132 C 260,85 165,98 122,108 C 145,75 195,42 225,0"
              fill="none"
              stroke="#ECD599"
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* River Stepping Stones (Lower Crossing) */}
            <g fill="#EDEAE2" stroke="#8C7A6B" strokeWidth="2">
              <polygon points="155,232 172,226 178,238 160,244" />
              <polygon points="176,240 194,234 198,246 180,252" />
              <polygon points="164,250 182,246 186,258 168,262" />
              <polygon points="188,252 205,248 208,260 192,264" />
            </g>

            {/* River Stepping Stones (Upper Crossing) */}
            <g fill="#EDEAE2" stroke="#8C7A6B" strokeWidth="2">
              <polygon points="102,96 118,92 122,104 106,108" />
              <polygon points="116,108 132,104 136,116 120,120" />
              <polygon points="104,118 120,114 124,126 108,130" />
              <polygon points="124,122 140,118 144,130 128,134" />
            </g>

            {/* Sacred Lotus Island Landmark (Upper Center) */}
            <g transform="translate(215, 142)">
              <ellipse cx="0" cy="12" rx="36" ry="18" fill="#8E9AAF" />
              <ellipse cx="0" cy="8" rx="34" ry="15" fill="#52B788" />
              <path d="M -20,4 Q -8,-24 0,4 Z" fill="#9D8DF1" />
              <path d="M 20,4 Q 8,-24 0,4 Z" fill="#9D8DF1" />
              <path d="M -12,6 Q 0,-32 12,6 Z" fill="#B8B8FF" />
              <circle cx="14" cy="10" r="4" fill="#C77DFF" />
            </g>

            {/* Wishing Well (Top Left) */}
            <g transform="translate(56, 108)">
              <ellipse cx="0" cy="8" rx="20" ry="11" fill="#7F8C8D" stroke="#4A5568" strokeWidth="2" />
              <ellipse cx="0" cy="6" rx="14" ry="7" fill="#4FC3F7" />
              <rect x="-15" y="-16" width="4" height="22" fill="#A0522D" />
              <rect x="11" y="-16" width="4" height="22" fill="#A0522D" />
              <rect x="-19" y="-18" width="38" height="5" rx="2" fill="#CD853F" />
            </g>

            {/* Cute Yellow Duck in the River */}
            <g transform="translate(232, 268)">
              <ellipse cx="0" cy="4" rx="7" ry="4.5" fill="#FFD214" stroke="#B45309" strokeWidth="1" />
              <circle cx="-3" cy="-1" r="4" fill="#FFD214" stroke="#B45309" strokeWidth="1" />
              <polygon points="-7,-1 -10,0 -7,1.5" fill="#FF6B00" />
              <circle cx="-4" cy="-2" r="0.8" fill="#111827" />
            </g>

            {/* Rocky Cliffs (Right & Bottom-Left) */}
            <polygon points="315,345 400,335 400,435 305,405" fill="url(#cliffTan)" />
            <polygon points="0,565 135,575 115,650 0,635" fill="url(#cliffTan)" />

            {/* Lush Pine & Deciduous Trees along the Hills */}
            {[
              { x: 42, y: 215, scale: 1 },
              { x: 38, y: 345, scale: 1.15 },
              { x: 108, y: 405, scale: 1 },
              { x: 268, y: 365, scale: 1.1 },
              { x: 345, y: 445, scale: 1.2 },
              { x: 65, y: 535, scale: 1.15 },
              { x: 335, y: 635, scale: 1.15 },
            ].map((tree, idx) => (
              <g key={idx} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`}>
                <rect x="-4" y="8" width="8" height="12" fill="#7C4722" />
                <polygon points="0,-28 -20,0 20,0" fill="#1B7A43" />
                <polygon points="0,-16 -24,10 24,10" fill="#146336" />
                <polygon points="0,-34 -14,-12 14,-12" fill="#28965A" />
              </g>
            ))}

            {/* Wooden Trail Fences */}
            <g stroke="#B87333" strokeWidth="2.5" strokeLinecap="round">
              <line x1="152" y1="365" x2="184" y2="388" />
              <line x1="152" y1="372" x2="184" y2="395" />
              <line x1="242" y1="538" x2="282" y2="578" />
              <line x1="242" y1="546" x2="282" y2="586" />
            </g>
          </svg>

          {/* Subtle vignette for high-contrast node legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/20" />

          {/* SVG Dotted Trail Connecting Level Coordinates */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 w-full h-full z-10"
          >
            <polyline
              fill="none"
              stroke="#111827"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2.2 2.2"
              points={levels.map((l) => `${l.x},${l.y}`).join(' ')}
            />
            <polyline
              fill="none"
              stroke="#FFD214"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2.2 2.2"
              points={levels.map((l) => `${l.x},${l.y}`).join(' ')}
            />
          </svg>

          {/* Interactive Level Nodes along the Winding Path */}
          {levels.map((lvl) => {
            const completed = isLevelCompleted(lvl.level);
            const isCurrent = lvl.level === currentActiveLevel;
            const stars = getLevelStars(lvl.level);
            const isSelected = selectedLevel === lvl.level;

            return (
              <div
                key={lvl.level}
                style={{ left: `${lvl.x}%`, top: `${lvl.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              >
                {/* Floating "YOU ARE HERE" Banner on Current Active Level */}
                {isCurrent && (
                  <div className="mb-1 animate-bounce rounded-md border border-slate-900 bg-[#FF7B00] px-1.5 py-0.5 text-[8px] font-sans font-black uppercase tracking-wider text-white shadow-xs whitespace-nowrap">
                    📍 Current
                  </div>
                )}

                <button
                  type="button"
                  data-testid={`map-level-node-${lvl.level}`}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedLevel(lvl.level);
                  }}
                  className={`group relative flex items-center gap-1.5 rounded-xl border-2 border-slate-900 px-2.5 py-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF7B00] text-white scale-110 shadow-[0_4px_0_#111827]'
                      : completed
                      ? 'bg-[#FFD214] text-slate-950 hover:scale-105 shadow-[0_3px_0_#111827]'
                      : isCurrent
                      ? 'bg-emerald-400 text-slate-950 hover:scale-105 shadow-[0_3px_0_#111827] ring-4 ring-white/70'
                      : 'bg-white/95 text-slate-900 hover:bg-amber-50 hover:scale-105 shadow-[0_3px_0_#111827]'
                  }`}
                >
                  {/* Level Number Circle */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-900 font-title text-xs ${
                      completed
                        ? 'bg-slate-950 text-[#FFD214]'
                        : isCurrent
                        ? 'bg-white text-slate-950'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {lvl.level}
                  </span>

                  {/* Compact Label + Stars */}
                  <div className="text-left pr-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs leading-none">{lvl.icon}</span>
                      <span className="font-chunky text-[11px] font-extrabold leading-none whitespace-nowrap">
                        {lvl.shortLabel}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-0.5">
                      {completed ? (
                        <>
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`h-2.5 w-2.5 ${
                                s <= stars
                                  ? 'fill-amber-600 text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            />
                          ))}
                          <span className="ml-0.5 text-[8px] font-sans font-black uppercase text-emerald-950">
                            Report
                          </span>
                        </>
                      ) : (
                        <span className="text-[8px] font-mono font-bold opacity-80 whitespace-nowrap">
                          {lvl.budgetHint}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* ====================================================================
            BOTTOM MAP FOOTER BAR
           ==================================================================== */}
        <footer className="relative z-30 bg-[#FFFDF9] border-t-2 border-slate-900 px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block font-chunky text-xs font-extrabold text-slate-950 truncate">
              👆 Tap any level for its Report Card
            </span>
            <span className="block text-[10px] font-medium text-slate-500 truncate">
              Inspect choices, grades &amp; replay any stage anytime
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              const targetLvl = Math.min(levels.length, currentActiveLevel);
              onPlayLevel(mapStory, targetLvl);
              onClose();
            }}
            className="shrink-0 rounded-xl border-2 border-slate-900 bg-[#FFD214] hover:bg-yellow-300 px-3.5 py-2 font-chunky text-xs font-extrabold text-slate-950 shadow-[0_3px_0_#111827] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-slate-950" />
            <span>
              Play Lv.{Math.min(levels.length, currentActiveLevel)}
            </span>
          </button>
        </footer>

        {/* ====================================================================
            LEVEL REPORT CARD SHEET (OPENS ON TAPPING ANY LEVEL NODE)
           ==================================================================== */}
        {activeLevelMeta && (
          <div
            className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-slate-950/65 p-3 animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-label={`Level ${activeLevelMeta.level} Report Card`}
            data-testid="level-report-card-modal"
          >
            <div className="w-full max-w-[390px] max-h-[85vh] overflow-y-auto rounded-xl border-2 border-slate-900 bg-[#FFFDF9] p-4 shadow-[0_6px_0_#111827]">
              {/* Report Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[#E5DEC9] pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-[#FFD214] text-lg shadow-[0_2px_0_#111827]">
                    {activeLevelMeta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block rounded bg-slate-900 px-1.5 py-0.5 font-sans text-[9px] font-black uppercase tracking-wider text-[#FFD214]">
                        Level {activeLevelMeta.level} Report Card
                      </span>
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 font-sans text-[9px] font-black uppercase ${
                          selectedCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                            : activeLevelMeta.level === currentActiveLevel
                            ? 'bg-amber-100 text-amber-900 border border-amber-400'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {selectedCompleted
                          ? '✓ Completed'
                          : activeLevelMeta.level === currentActiveLevel
                          ? '📍 Current Stage'
                          : 'Unlocked'}
                      </span>
                    </div>
                    <h3 className="mt-1 font-chunky text-base font-extrabold text-slate-950 leading-tight">
                      {activeLevelMeta.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#C85A3A] shrink-0" />
                      <span className="truncate">{activeLevelMeta.location}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  aria-label="Close Report Card"
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-900 bg-[#FFFBEB] text-slate-900 shadow-[0_2px_0_#111827] hover:bg-red-100 cursor-pointer"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Grade & Performance Banner */}
              <div className="mt-3 rounded-lg border border-[#E5DEC9] bg-[#F5EFE6] p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#B45309]" />
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-[#78716C]">
                      Financial Skill Tested
                    </span>
                    <strong className="text-xs font-extrabold text-slate-900">
                      {activeLevelMeta.conceptSkill}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 bg-white border border-[#E5DEC9] rounded-md px-2 py-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        selectedCompleted && s <= selectedStars
                          ? 'fill-[#FFD214] text-amber-600'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Decision & Financial Breakdown Section */}
              {selectedCompleted && (selectedMisoRec || selectedFunfairRec) ? (
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-lg border-2 border-emerald-600/40 bg-emerald-50/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Decision Recorded
                      </span>
                      {selectedMisoRec && (
                        <span className="font-mono text-xs font-extrabold text-slate-950">
                          Spent: ₹{selectedMisoRec.selected_amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 font-chunky text-sm font-extrabold text-slate-950">
                      {selectedMisoRec
                        ? selectedMisoRec.choice_label
                        : selectedFunfairRec?.choiceLabel}
                    </p>

                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      {selectedMisoRec
                        ? selectedMisoRec.consequence_message
                        : selectedFunfairRec?.financialImpact}
                    </p>
                  </div>

                  {/* Before / After Ledger Snapshot for Miso or Current Balance for Funfair */}
                  {selectedMisoRec ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Wallet Before
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-slate-900">
                          ₹{selectedMisoRec.financial_state_before.wallet_balance.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Wallet After
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-emerald-700">
                          ₹{selectedMisoRec.financial_state_after.wallet_balance.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Total Spent
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-[#C85A3A]">
                          ₹{selectedMisoRec.financial_state_after.total_expenses.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Wallet Cash
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-slate-900">
                          ₹{funfairState.wallet_balance.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Revenue
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-emerald-700">
                          ₹{funfairState.total_revenue.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-[#E5DEC9] bg-white p-2">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Net Value
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-[#205EE8]">
                          ₹{getFinalBusinessValue(funfairState).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Concept Tags */}
                  <div className="flex flex-wrap gap-1">
                    {(selectedMisoRec?.concept_tags || selectedFunfairRec?.conceptTags || []).map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 font-sans text-[9px] font-extrabold uppercase text-amber-950"
                        >
                          #{tag}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-lg border border-[#E5DEC9] bg-[#F9F6F0] p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#C85A3A]">
                        <BookOpen className="h-3.5 w-3.5" />
                        Stage Mission &amp; Challenge
                      </span>
                      <span className="rounded bg-white border border-[#E5DEC9] px-2 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                        Est: {activeLevelMeta.budgetHint}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                      {activeLevelMeta.challengeSummary}
                    </p>
                  </div>

                  {/* Current Portfolio Snapshot */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[#E5DEC9] bg-white p-2.5 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-slate-700 shrink-0" />
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Available Wallet
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-slate-950">
                          ₹
                          {(isMiso
                            ? misoState.wallet_balance
                            : funfairState.wallet_balance
                          ).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#E5DEC9] bg-white p-2.5 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="block text-[9px] font-bold uppercase text-slate-500">
                          Net Balance
                        </span>
                        <strong className="font-mono text-xs font-extrabold text-emerald-700">
                          ₹
                          {(isMiso
                            ? getFinalNetPosition(misoState)
                            : getFinalBusinessValue(funfairState)
                          ).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mentor Pro Tip Box */}
              <div className="mt-2.5 rounded-lg border border-amber-300 bg-[#FFFBEB] p-2.5 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#44403C] leading-snug">
                  <strong className="text-slate-950">Mentor Tip: </strong>
                  {activeLevelMeta.proTip}
                </p>
              </div>

              {/* Action Buttons: Play / Play Again + Restart Story + Back to Map */}
              <div className="mt-3.5 space-y-2">
                <button
                  type="button"
                  data-testid="report-card-play-level-btn"
                  onClick={() => {
                    soundFX.playClick();
                    onPlayLevel(mapStory, activeLevelMeta.level);
                    handleClose();
                  }}
                  className="w-full rounded-xl border-2 border-slate-900 bg-[#FFD214] hover:bg-yellow-300 py-2.5 px-4 font-chunky text-sm font-extrabold text-slate-950 shadow-[0_3px_0_#111827] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {selectedCompleted ? (
                    <>
                      <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                      <span>Play Level {activeLevelMeta.level} Again</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-slate-950" />
                      <span>Play Level {activeLevelMeta.level} Now</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      onReplayStory(mapStory);
                      handleClose();
                    }}
                    className="rounded-lg border-2 border-slate-900 bg-white hover:bg-slate-50 py-2 px-3 font-chunky text-xs font-bold text-slate-900 shadow-[0_2px_0_#111827] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restart Story (Lv.1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLevel(null)}
                    className="rounded-lg border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 py-2 px-3 font-chunky text-xs font-bold text-white shadow-[0_2px_0_#374151] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    ← Back to Map
                  </button>
                </div>

                {onGoHome && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      handleClose();
                      onGoHome();
                    }}
                    className="w-full rounded-lg border-2 border-slate-900 bg-amber-400 hover:bg-amber-300 py-2 px-3 font-chunky text-xs font-extrabold text-slate-950 shadow-[0_2px_0_#111827] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Go Back to Home</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
