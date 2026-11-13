'use client';

import React, { useState } from 'react';
import { ArrowLeft, Pause, Check, Pencil, Map } from 'lucide-react';

/**
 * Crisp Financial Icons for Money, Bank, Savings, Shares, Commodities, and FD.
 */
export function SimpleFinancialIcon({
  type,
  className = 'w-6 h-6',
}: {
  type: 'money' | 'bank' | 'savings' | 'shares' | 'commodities' | 'fd';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 44 44"
      className={`${className} shrink-0`}
      role="img"
      aria-label={`${type} icon`}
    >
      {type === 'money' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#FFD214" stroke="#1E293B" strokeWidth="1.8" />
          <rect x="8" y="13" width="21" height="14" rx="2" fill="#10B981" stroke="#1E293B" strokeWidth="1.6" />
          <circle cx="30" cy="26" r="7" fill="#FF7B00" stroke="#1E293B" strokeWidth="1.6" />
          <text x="30" y="29.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">
            ₹
          </text>
        </g>
      )}

      {type === 'savings' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#34D399" stroke="#1E293B" strokeWidth="1.8" />
          <path
            d="M13 21 C10 24, 10.5 32, 16 34 L28 34 C33.5 32, 34 24, 31 21 C29.5 18.5, 26.5 17.5, 22 17.5 C17.5 17.5, 14.5 18.5, 13 21 Z"
            fill="#FF7B00"
            stroke="#1E293B"
            strokeWidth="1.6"
          />
          <rect x="16" y="14.5" width="12" height="3.5" rx="1.5" fill="#FFD214" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="22" cy="10" r="3.5" fill="#FFD214" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      )}

      {type === 'bank' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#FB923C" stroke="#1E293B" strokeWidth="1.8" />
          <polygon points="9,18 22,9 35,18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="12" y="18" width="4" height="11" fill="#FFFBF0" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="20" y="18" width="4" height="11" fill="#FFFBF0" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="28" y="18" width="4" height="11" fill="#FFFBF0" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="9" y="29" width="26" height="4" rx="1" fill="#FFD214" stroke="#1E293B" strokeWidth="1.6" />
        </g>
      )}

      {type === 'shares' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#60A5FA" stroke="#1E293B" strokeWidth="1.8" />
          <rect x="9" y="10" width="26" height="24" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.6" />
          <polyline
            points="13,27 19,20 24,23 31,14"
            fill="none"
            stroke="#205EE8"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="31" cy="14" r="3" fill="#FFD214" stroke="#1E293B" strokeWidth="1.5" />
        </g>
      )}

      {type === 'commodities' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.8" />
          <path
            d="M12 20 C10 23, 10 31, 13.5 33 L22.5 33 C25 31, 25 23, 22.5 20 L20.5 15 L14.5 15 Z"
            fill="#FFFBF0"
            stroke="#1E293B"
            strokeWidth="1.6"
          />
          <polygon points="19,25 33,25 35,33 17,33" fill="#FF7B00" stroke="#1E293B" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      )}

      {type === 'fd' && (
        <g>
          <rect x="3" y="3" width="38" height="38" rx="8" fill="#A78BFA" stroke="#1E293B" strokeWidth="1.8" />
          <path
            d="M16.5 19 V14.5 C16.5 10.5, 27.5 10.5, 27.5 14.5 V19"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <rect x="12" y="18.5" width="20" height="14.5" rx="3" fill="#FFD214" stroke="#1E293B" strokeWidth="1.6" />
          <circle cx="22" cy="25" r="2.2" fill="#1E293B" />
        </g>
      )}
    </svg>
  );
}

/**
 * UNIFIED PLAYER PROFILE & FINANCIAL HUD BAR
 * Displays the exact same Player Name + 5 Financial Metrics (Balance, Wallet/Cash, Savings, Investment, Debt)
 * across the Main Home Page, Splash Screens, and every Story / Level.
 */
export function UnifiedPlayerPortfolioBar({
  playerName,
  onChangePlayerName,
  walletCash,
  savingsBalance,
  investmentBalance,
  debtBalance,
  netBalance,
  contextLabel,
  showBackButton = false,
  onBack,
  onOpenMarketplace,
  onOpenDashboard,
  onOpenMap,
  isPlaying = false,
  onPause,
}: {
  playerName: string;
  onChangePlayerName: (name: string) => void;
  walletCash: number;
  savingsBalance: number;
  investmentBalance: number;
  debtBalance: number;
  netBalance: number;
  contextLabel: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onOpenMarketplace: () => void;
  onOpenDashboard: () => void;
  onOpenMap?: () => void;
  isPlaying?: boolean;
  activeGame?: 'miso' | 'funfair';
  onSwitchGame?: (game: 'miso' | 'funfair') => void;
  muted?: boolean;
  onToggleMute?: () => void;
  onPause?: () => void;
  onRestart?: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(playerName);

  const commitName = () => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onChangePlayerName(trimmed);
    } else {
      setDraftName(playerName);
    }
    setEditingName(false);
  };

  const metrics = [
    {
      key: 'balance',
      label: 'Balance',
      value: `₹${Math.round(netBalance).toLocaleString('en-IN')}`,
      testId: 'hud-net-position',
      bg: 'bg-[#FFD214]/25 border-[#FFD214]',
      labelColor: 'text-amber-900',
      valueColor: 'text-slate-950',
    },
    {
      key: 'wallet',
      label: 'Wallet',
      value: `₹${Math.round(walletCash).toLocaleString('en-IN')}`,
      testId: 'hud-wallet-balance',
      bg: 'bg-[#FFFBF0] border-slate-300',
      labelColor: 'text-slate-500',
      valueColor: 'text-slate-950',
    },
    {
      key: 'savings',
      label: 'Savings',
      value: `₹${Math.round(savingsBalance).toLocaleString('en-IN')}`,
      testId: 'hud-savings-balance',
      bg: 'bg-emerald-50 border-emerald-200',
      labelColor: 'text-emerald-700',
      valueColor: 'text-emerald-800',
    },
    {
      key: 'invest',
      label: 'Invest',
      value: `₹${Math.round(investmentBalance).toLocaleString('en-IN')}`,
      testId: 'hud-invest-balance',
      bg: 'bg-blue-50 border-blue-200',
      labelColor: 'text-blue-700',
      valueColor: 'text-[#205EE8]',
    },
    {
      key: 'debt',
      label: 'Debt',
      value: `₹${Math.round(debtBalance).toLocaleString('en-IN')}`,
      testId: 'hud-debt-balance',
      bg: debtBalance > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200',
      labelColor: debtBalance > 0 ? 'text-red-600' : 'text-slate-500',
      valueColor: debtBalance > 0 ? 'text-red-600' : 'text-slate-600',
    },
  ];

  return (
    <section
      aria-label="Player Profile and Financial Portfolio"
      data-testid="unified-player-portfolio-bar"
      className="relative z-20 mx-3 mt-1.5 rounded-xl bg-white/95 backdrop-blur-xs border-2 border-slate-900 p-2 shadow-xs text-slate-950"
    >
      {/* Row 1: Player Identity + Clean Market & Pause Action */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to Home"
              className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-900 shrink-0 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          )}

          {/* Avatar Badge */}
          <div className="w-7 h-7 rounded-lg bg-[#FFD214] border border-slate-900 flex items-center justify-center text-xs font-extrabold shrink-0">
            👤
          </div>

          {/* Player Name & Level Context (Full Width, Uncrowded) */}
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitName();
                  }}
                  aria-label="Edit Player Name"
                  className="w-32 rounded border border-slate-400 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-950 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={commitName}
                  aria-label="Save Player Name"
                  className="h-5 w-5 rounded bg-emerald-500 text-white flex items-center justify-center cursor-pointer"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraftName(playerName);
                  setEditingName(true);
                }}
                title="Click to edit player name"
                className="group flex items-center gap-1 text-left cursor-pointer max-w-full"
              >
                <span
                  data-testid="hud-player-name"
                  className="font-chunky text-[13px] font-extrabold text-slate-950 truncate"
                >
                  {playerName}
                </span>
                <Pencil className="h-2.5 w-2.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
              </button>
            )}
            <span className="block text-[9px] font-sans font-extrabold uppercase tracking-wider text-slate-500 leading-none truncate mt-0.5">
              {contextLabel}
            </span>
          </div>
        </div>

        {/* Right Controls: Clean Map Icon + Market Button + Single Pause/Menu Button when playing */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              aria-label="Open Interactive Level Map"
              title="Open Interactive Level Map & Report Cards"
              data-testid="hud-open-map-btn"
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-400 hover:bg-emerald-300 border border-slate-900 text-slate-950 shadow-2xs cursor-pointer transition-colors"
            >
              <Map className="h-3.5 w-3.5 stroke-[2.25]" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenMarketplace}
            className="rounded-lg bg-[#FFD214] hover:bg-yellow-300 border border-slate-900 px-2.5 py-1 text-[11px] font-chunky font-extrabold text-slate-950 shadow-2xs cursor-pointer transition-colors"
          >
            + Market
          </button>

          {isPlaying && onPause && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Pause & Game Options [P]"
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 cursor-pointer transition-colors"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: 5 Unified Financial Metrics (Balance, Wallet/Cash, Savings, Invest, Debt) */}
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {metrics.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={onOpenDashboard}
            className={`rounded-md border px-1.5 py-1 text-left transition-colors hover:border-slate-500 cursor-pointer ${m.bg}`}
          >
            <span
              className={`block text-[8px] font-sans font-extrabold uppercase tracking-tight leading-none truncate ${m.labelColor}`}
            >
              {m.label}
            </span>
            <strong
              data-testid={m.testId}
              className={`block font-chunky text-[11px] font-extrabold tabular-nums leading-tight mt-0.5 truncate ${m.valueColor}`}
            >
              {m.value}
            </strong>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Compact 1-Line Financial Accounts Bar (Legacy wrapper if needed)
 */
export function ClearFinancialDashboardBar({
  moneyValue,
  savingsValue,
  bankDebtValue,
  sharesAndFdValue,
  commoditiesValue,
  onOpenMarketplace,
  onOpenFullDashboard,
}: {
  moneyValue: number;
  moneySublabel?: string;
  savingsValue: number;
  savingsSublabel?: string;
  bankDebtValue: number;
  bankSublabel?: string;
  sharesAndFdValue: number;
  sharesSublabel?: string;
  commoditiesValue: number;
  commoditiesSublabel?: string;
  onOpenMarketplace: () => void;
  onOpenFullDashboard?: () => void;
}) {
  const items = [
    {
      key: 'money',
      label: 'Wallet',
      value: `₹${moneyValue.toLocaleString('en-IN')}`,
      valueColor: 'text-slate-950',
      bg: 'bg-[#FFFBF0]',
    },
    {
      key: 'savings',
      label: 'Savings',
      value: `₹${savingsValue.toLocaleString('en-IN')}`,
      valueColor: 'text-emerald-700',
      bg: 'bg-emerald-50/90',
    },
    {
      key: 'invest',
      label: 'Invest',
      value: `₹${(sharesAndFdValue + commoditiesValue).toLocaleString('en-IN')}`,
      valueColor: 'text-[#205EE8]',
      bg: 'bg-blue-50/90',
    },
    {
      key: 'bank',
      label: 'Debt',
      value: `₹${bankDebtValue.toLocaleString('en-IN')}`,
      valueColor: bankDebtValue > 0 ? 'text-red-600' : 'text-slate-500',
      bg: bankDebtValue > 0 ? 'bg-red-50/90' : 'bg-slate-50',
    },
  ];

  return (
    <section
      aria-label="Clear Financial Dashboard"
      className="rounded-lg bg-white border border-slate-300 px-2 py-1.5 shadow-2xs flex items-center justify-between gap-1.5"
    >
      <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={onOpenFullDashboard}
            className={`rounded-md border border-slate-200 ${item.bg} px-1.5 py-1 text-left transition-colors hover:border-slate-400 cursor-pointer`}
          >
            <span className="block text-[9px] font-extrabold uppercase text-slate-500 leading-none truncate">
              {item.label}
            </span>
            <strong
              className={`block text-[11px] font-extrabold tabular-nums leading-tight mt-0.5 truncate ${item.valueColor}`}
            >
              {item.value}
            </strong>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenMarketplace}
        className="shrink-0 rounded-md bg-[#FFD214] border border-slate-900 px-2 py-1.5 text-[10px] font-extrabold text-slate-950 shadow-2xs hover:bg-yellow-300 active:translate-y-0.5 cursor-pointer"
      >
        + Market
      </button>
    </section>
  );
}

/**
 * Compact Comic-Style Narrative Strip
 */
export function ComicNarrativePanels({
  panels,
}: {
  panels: Array<{
    panelNumber: string;
    speaker?: string;
    narration: string;
    dialogue?: string;
    tone?: 'ochre' | 'sage' | 'terracotta' | 'indigo';
  }>;
}) {
  const toneStyles = {
    ochre: { bg: 'bg-amber-50/80', badge: 'bg-[#FFD214] text-slate-950' },
    sage: { bg: 'bg-emerald-50/80', badge: 'bg-emerald-400 text-slate-950' },
    terracotta: { bg: 'bg-orange-50/80', badge: 'bg-[#FF7B00] text-white' },
    indigo: { bg: 'bg-blue-50/80', badge: 'bg-[#205EE8] text-white' },
  };

  return (
    <div className="grid grid-cols-1 gap-1.5 my-2">
      {panels.map((p, index) => {
        const tone = p.tone || 'ochre';
        const style = toneStyles[tone];

        return (
          <div
            key={p.panelNumber}
            className={`rounded-lg border border-slate-300 ${style.bg} px-2.5 py-1.5 shadow-2xs`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded-xs border border-slate-800 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider font-sans ${style.badge}`}
              >
                {p.speaker || `Panel ${index + 1}`}
              </span>
              <p className="text-[11px] font-bold text-slate-800 leading-snug line-clamp-2 flex-1">
                {p.narration}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Funfair Founder Scene Header — cinematic illustrated panel
 */
export function FunfairIllustrationPanel({
  stallType,
  period,
  caption,
}: {
  stallType: 'food' | 'game' | 'hybrid' | null;
  period: 1 | 2 | 3;
  caption?: string;
}) {
  const periodLabel =
    period === 1 ? 'Opening Rush' : period === 2 ? 'Peak Crowd' : 'Final Rush';

  const stallLabel =
    stallType === 'food'
      ? '🌶️ Food Stall'
      : stallType === 'game'
      ? '🎯 Game Stall'
      : stallType === 'hybrid'
      ? '🎪 Hybrid Stall'
      : '🌶️ Nimbu & Chat';

  /* Bunting triangle colours */
  const buntingColors = ['#FFD214', '#FF7B00', '#FFFFFF', '#34D399', '#FFD214', '#FB923C', '#FFFFFF', '#60A5FA'];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-900 carnival-pattern-bg shadow-xs flex flex-col">

      {/* SVG decorative bunting line */}
      <svg
        viewBox="0 0 320 24"
        className="absolute top-0 left-0 w-full pointer-events-none z-0 select-none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d="M0 4 Q160 2 320 4" stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none" />
        {buntingColors.map((fill, i) => {
          const x = (i / (buntingColors.length - 1)) * 300 + 10;
          return (
            <polygon
              key={i}
              points={`${x - 7},4 ${x + 7},4 ${x},18`}
              fill={fill}
              opacity="0.85"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      {/* Main content row */}
      <div className="relative z-10 flex items-center gap-3 px-3.5 pt-5 pb-3">
        <img
          src="/assets/funfair-hero-sticker.png"
          alt="Funfair Founder character"
          className="w-20 h-20 object-contain character-sticker-glow shrink-0 select-none pointer-events-none stop-motion-actor"
        />

        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="inline-block bg-emerald-400 border border-slate-900 rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 whitespace-nowrap">
              {stallLabel}
            </span>
            <span
              className="w-10 h-10 rounded-full bg-amber-500 border-2 border-slate-900 font-title text-lg text-white flex items-center justify-center shrink-0 shadow-sm"
              title={`Period ${period}: ${periodLabel}`}
            >
              P{period}
            </span>
          </div>

          <h3
            className="font-title text-base leading-tight text-white uppercase tracking-wide"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
          >
            Funfair <span className="text-brand-yellow">Founder</span>
          </h3>

          <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider text-amber-200 leading-none">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Speech bubble caption */}
      {caption ? (
        <div className="relative z-10 mx-3 mb-2.5">
          <p className="bg-white/90 text-slate-900 text-[11px] rounded-lg px-2 py-1 leading-snug line-clamp-2">
            💬 {caption}
          </p>
        </div>
      ) : (
        <div className="relative z-10 mx-3 mb-2.5">
          <p className="bg-white/90 text-slate-900 text-[11px] rounded-lg px-2 py-1 leading-snug">
            Grow capital across 3 funfair rushes!
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Miso Rescue Story Scene Header — cinematic illustrated panel
 */
export function MisoIllustrationPanel({
  scene,
  mood = 'frightened',
  caption,
}: {
  scene: 'tea_stall' | 'transport' | 'vet_clinic' | 'marketplace' | 'diagnostic' | 'recovery';
  mood?: 'frightened' | 'stabilizing' | 'recovering' | 'recovered' | 'uncertain';
  caption?: string;
}) {
  const sceneMeta: Record<
    typeof scene,
    { title: string; subtitle: string; leftBadge: string; rightBadge: string }
  > = {
    tea_stall: {
      title: 'HELPING MISO',
      subtitle: 'Ramesh Chai Tapri · NH-48',
      leftBadge: '🐱 Stray Rescue',
      rightBadge: 'Roadside Care',
    },
    transport: {
      title: 'SAFE RIDE',
      subtitle: '4 km to Vet Clinic',
      leftBadge: '🛺 Clinic Bound',
      rightBadge: 'Fed & Safe',
    },
    vet_clinic: {
      title: 'VET TRIAGE',
      subtitle: 'Dr. Kavita’s Estimate',
      leftBadge: '🩺 Checkup',
      rightBadge: 'Est. ₹5,000 Bill',
    },
    marketplace: {
      title: 'TOWN BAZAAR',
      subtitle: 'Bank & Mandi',
      leftBadge: '🏦 Liquidity',
      rightBadge: '3% Save / 5% FD',
    },
    diagnostic: {
      title: 'URGENT LAB',
      subtitle: 'Diagnostic Test',
      leftBadge: '🔬 ₹1,000 Test',
      rightBadge: 'Market Updated',
    },
    recovery: {
      title: 'MISO’S HOME',
      subtitle: 'Recovery & Settlement',
      leftBadge: mood === 'uncertain' ? '⚠️ Fragile Care' : '💖 Recovered!',
      rightBadge: 'Final Step',
    },
  };

  /* Mood overlay colour */
  const moodOverlay: Record<typeof mood, string> = {
    frightened:  'bg-red-500/20',
    stabilizing: 'bg-amber-500/20',
    recovering:  'bg-emerald-500/20',
    recovered:   'bg-teal-400/20',
    uncertain:   'bg-purple-500/20',
  };

  const meta = sceneMeta[scene];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-900 miso-pattern-bg shadow-xs flex flex-col">

      {/* Mood tint overlay — top-right corner */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none z-0 ${moodOverlay[mood]}`}
        aria-hidden="true"
      />

      {/* SVG decorative background: road + trees */}
      <svg
        viewBox="0 0 320 60"
        className="absolute bottom-0 left-0 w-full pointer-events-none z-0 select-none opacity-20"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M0 52 Q80 48 160 50 Q240 52 320 48"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 4"
        />
        {[30, 80, 200, 265].map((x) => (
          <g key={x} transform={`translate(${x}, 24)`}>
            <rect x="-2" y="14" width="4" height="10" fill="rgba(255,255,255,0.5)" rx="1" />
            <ellipse cx="0" cy="12" rx="8" ry="11" fill="rgba(255,255,255,0.4)" />
          </g>
        ))}
      </svg>

      {/* Main content row */}
      <div className="relative z-10 flex items-center gap-3 px-3.5 pt-3 pb-2">
        <img
          src="/assets/miso-hero-sticker.png"
          alt="Miso the Cat"
          className="w-20 h-20 object-contain character-sticker-glow shrink-0 select-none pointer-events-none stop-motion-actor"
        />

        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="inline-block bg-emerald-400 border border-slate-900 rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 whitespace-nowrap">
              {meta.leftBadge}
            </span>
            <span className="inline-block bg-orange-500 border border-slate-900 rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-white whitespace-nowrap">
              {meta.rightBadge}
            </span>
          </div>

          <h3
            className="font-title text-base leading-tight text-white uppercase tracking-wide"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.25)' }}
          >
            {meta.title.split(' ')[0]}{' '}
            <span className="text-brand-yellow">{meta.title.split(' ').slice(1).join(' ')}</span>
          </h3>

          <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider text-teal-200 leading-none">
            {meta.subtitle}
          </span>
        </div>
      </div>

      {/* Speech bubble caption */}
      {caption ? (
        <div className="relative z-10 mx-3 mb-2.5">
          <p className="bg-white/90 text-slate-900 text-[11px] rounded-lg px-2 py-1 leading-snug line-clamp-2">
            💬 {caption}
          </p>
        </div>
      ) : (
        <div className="relative z-10 mx-3 mb-2.5">
          <p className="bg-white/90 text-slate-900 text-[11px] rounded-lg px-2 py-1 leading-snug">
            {meta.subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
