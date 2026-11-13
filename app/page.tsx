'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store,
  LayoutDashboard,
  Info,
  BookOpen,
  Home,
  Settings,
  Clock3,
  AlertTriangle,
} from 'lucide-react';
import {
  INITIAL_MISO_STATE,
  MisoGameState,
  getShareCurrentValue,
  getCommodityCurrentValue,
} from '@/lib/miso-engine';
import {
  INITIAL_FUNFAIR_STATE,
  FunfairGameState,
  getFunfairShareValue,
  getFunfairCommodityValue,
  getSellableInventoryValue,
} from '@/lib/funfair-engine';
import { MisoGameView } from '@/components/MisoGameView';
import { FunfairGameView } from '@/components/FunfairGameView';
import { OverlayDrawers } from '@/components/StationaryMarketplaceDrawer';
import { UnifiedPlayerPortfolioBar } from '@/components/GraphicIllustrations';
import { LevelMapModal } from '@/components/LevelMapModal';
import { soundFX } from '@/lib/sound';
import { AssetLoader, GAME_ASSETS, gameRuntime } from '@/lib/game-runtime';

type ShellState = 'loading' | 'title' | 'playing' | 'paused' | 'gameover';
type TitleScreenView = 'home' | 'miso-splash' | 'funfair-splash';

function MobileStatusBar({
  timerText,
  onOpenAbout: _onOpenAbout,
}: {
  timerText?: string;
  onOpenAbout?: () => void;
}) {
  return (
    <header
      className="relative z-20 pt-2.5 pb-1 px-3.5 flex items-center justify-between"
      data-purpose="ios-status-bar"
    >
      <span className="font-title text-lg sm:text-xl tracking-wider text-white select-none uppercase drop-shadow-xs">
        Between The Lines
      </span>

      {timerText && (
        <div
          className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-extrabold text-white tracking-wider px-2.5 py-0.5 rounded-md bg-slate-950/50 border border-white/20 select-none shadow-xs"
          title="Session Timer"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tabular-nums">{timerText}</span>
        </div>
      )}
    </header>
  );
}

export default function BetweenTheLinesApp() {
  const [shellState, setShellState] = useState<ShellState>('title');
  const [titleView, setTitleView] = useState<TitleScreenView>('home');
  const [activeGame, setActiveGame] = useState<'miso' | 'funfair'>('miso');
  const [playerName, setPlayerName] = useState<string>('Aarav Sharma');

  // Shared initial financial state so both stories start with the same ₹5,000 wallet balance
  const [misoState, setMisoState] = useState<MisoGameState>(() =>
    structuredClone(INITIAL_MISO_STATE)
  );
  const [funfairState, setFunfairState] = useState<FunfairGameState>(() => ({
    ...structuredClone(INITIAL_FUNFAIR_STATE),
    starting_capital: INITIAL_MISO_STATE.wallet_balance,
    wallet_balance: INITIAL_MISO_STATE.wallet_balance,
  }));

  const [openDrawer, setOpenDrawer] = useState<
    'marketplace' | 'dashboard' | 'concepts' | 'about' | 'settings' | null
  >(null);
  const [mapStoryOpen, setMapStoryOpen] = useState<'miso' | 'funfair' | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [showTimerStarted, setShowTimerStarted] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const timerStartedCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Non-blocking warm-up of game assets in the background
    const loader = new AssetLoader();
    loader.preload(GAME_ASSETS).catch(() => {});
  }, []);

  const announceTimerStart = useCallback(() => {
    timerStartedCancelRef.current?.();
    setShowTimerStarted(true);
    timerStartedCancelRef.current = gameRuntime.schedule(2.2, () => setShowTimerStarted(false));
  }, []);

  // Load saved player name if available
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('btl_player_name');
    if (saved && saved.trim()) {
      const timer = window.setTimeout(() => setPlayerName(saved.trim()), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleUpdatePlayerName = useCallback((nextName: string) => {
    setPlayerName(nextName);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('btl_player_name', nextName);
    }
  }, []);

  /**
   * Synchronized State Logic:
   * Keep player's core wallet, savings, FD and debt balances synchronized across both stories
   * cleanly in a passive effect, avoiding any re-entrant setState or concurrent rendering race conditions.
   */
  const prevMisoSyncRef = useRef({
    wallet_balance: misoState.wallet_balance,
    savings_balance: misoState.savings_balance,
    fd_current_value: misoState.fd_current_value,
    borrowed_principal: misoState.borrowed_principal,
    interest_amount: misoState.interest_amount,
    repayment_due: misoState.repayment_due,
  });

  useEffect(() => {
    if (activeGame === 'miso') {
      const cur = {
        wallet_balance: misoState.wallet_balance,
        savings_balance: misoState.savings_balance,
        fd_current_value: misoState.fd_current_value,
        borrowed_principal: misoState.borrowed_principal,
        interest_amount: misoState.interest_amount,
        repayment_due: misoState.repayment_due,
      };
      if (
        cur.wallet_balance !== prevMisoSyncRef.current.wallet_balance ||
        cur.savings_balance !== prevMisoSyncRef.current.savings_balance ||
        cur.fd_current_value !== prevMisoSyncRef.current.fd_current_value ||
        cur.borrowed_principal !== prevMisoSyncRef.current.borrowed_principal ||
        cur.interest_amount !== prevMisoSyncRef.current.interest_amount ||
        cur.repayment_due !== prevMisoSyncRef.current.repayment_due
      ) {
        prevMisoSyncRef.current = cur;
        setFunfairState((prevFF) => ({
          ...prevFF,
          wallet_balance: cur.wallet_balance,
          savings_balance: cur.savings_balance,
          fd_balance: cur.fd_current_value,
          borrowed_principal: cur.borrowed_principal,
          interest_amount: cur.interest_amount,
          repayment_due: cur.repayment_due,
        }));
      }
    }
  }, [activeGame, misoState]);

  const prevFFSyncRef = useRef({
    wallet_balance: funfairState.wallet_balance,
    savings_balance: funfairState.savings_balance,
    fd_balance: funfairState.fd_balance,
    borrowed_principal: funfairState.borrowed_principal,
    interest_amount: funfairState.interest_amount,
    repayment_due: funfairState.repayment_due,
  });

  useEffect(() => {
    if (activeGame === 'funfair') {
      const cur = {
        wallet_balance: funfairState.wallet_balance,
        savings_balance: funfairState.savings_balance,
        fd_balance: funfairState.fd_balance,
        borrowed_principal: funfairState.borrowed_principal,
        interest_amount: funfairState.interest_amount,
        repayment_due: funfairState.repayment_due,
      };
      if (
        cur.wallet_balance !== prevFFSyncRef.current.wallet_balance ||
        cur.savings_balance !== prevFFSyncRef.current.savings_balance ||
        cur.fd_balance !== prevFFSyncRef.current.fd_balance ||
        cur.borrowed_principal !== prevFFSyncRef.current.borrowed_principal ||
        cur.interest_amount !== prevFFSyncRef.current.interest_amount ||
        cur.repayment_due !== prevFFSyncRef.current.repayment_due
      ) {
        prevFFSyncRef.current = cur;
        const fdVal = funfairState.fd_matured ? Math.round(cur.fd_balance * 1.05) : cur.fd_balance;
        setMisoState((prevMiso) => ({
          ...prevMiso,
          wallet_balance: cur.wallet_balance,
          savings_balance: cur.savings_balance,
          fd_principal: cur.fd_balance,
          fd_current_value: fdVal,
          borrowed_principal: cur.borrowed_principal,
          interest_amount: cur.interest_amount,
          repayment_due: cur.repayment_due,
        }));
      }
    }
  }, [activeGame, funfairState]);

  const handleSetMisoState = setMisoState;
  const handleSetFunfairState = setFunfairState;

  const isBlueprintStage =
    (activeGame === 'miso' && misoState.stage === 9) ||
    (activeGame === 'funfair' && funfairState.stage === 11);
  const effectiveShellState: ShellState =
    shellState === 'playing' && isBlueprintStage ? 'gameover' : shellState;

  const shellStateRef = useRef<ShellState>(effectiveShellState);

  useEffect(() => {
    shellStateRef.current = effectiveShellState;
    gameRuntime.setPhase(
      effectiveShellState === 'playing' ? 'PLAYING' :
      effectiveShellState === 'paused' ? 'PAUSED' :
      effectiveShellState === 'gameover' ? 'GAME_OVER' :
      effectiveShellState === 'loading' ? 'LOADING' : 'MENU'
    );
    if (typeof document !== 'undefined') {
      document.body.dataset.state = effectiveShellState;
    }
  }, [effectiveShellState]);

  // Check URL query params for ?autostart=1 and ?game=funfair or ?game=miso or ?screen=miso|funfair
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    const screenParam = params.get('screen');
    const autostart = params.get('autostart') === '1';
    if (!gameParam && !screenParam && !autostart) return;

    const timer = window.setTimeout(() => {
      if (gameParam === 'funfair' || screenParam === 'funfair') {
        setActiveGame('funfair');
        if (screenParam === 'funfair') setTitleView('funfair-splash');
      } else if (gameParam === 'miso' || screenParam === 'miso') {
        setActiveGame('miso');
        if (screenParam === 'miso') setTitleView('miso-splash');
      }
      if (autostart) {
        setShellState('playing');
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleStartGame = useCallback(
    (chosenGame?: 'miso' | 'funfair') => {
      soundFX.playStageAdvance();
      const targetGame = chosenGame || activeGame;
      setActiveGame(targetGame);

      // Ensure if starting Funfair at stage <= 2 after spending in Miso, working capital is at least ₹1,000
      if (targetGame === 'funfair') {
        setFunfairState((prevFF) => {
          if (prevFF.stage <= 2 && prevFF.wallet_balance < 1000) {
            const boosted = 1000;
            queueMicrotask(() => {
              setMisoState((prevM) => ({ ...prevM, wallet_balance: boosted }));
            });
            return { ...prevFF, wallet_balance: boosted, starting_capital: boosted };
          }
          return prevFF;
        });
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      announceTimerStart();
      setShellState('playing');
      if (typeof document !== 'undefined') {
        document.body.dataset.state = 'playing';
      }
    },
    [activeGame, announceTimerStart]
  );

  const resetGame = useCallback(() => {
    soundFX.playClick();
    gameRuntime.reset();
    setOpenDrawer(null);
    const freshMiso = structuredClone(INITIAL_MISO_STATE);
    const freshFF = {
      ...structuredClone(INITIAL_FUNFAIR_STATE),
      starting_capital: INITIAL_MISO_STATE.wallet_balance,
      wallet_balance: INITIAL_MISO_STATE.wallet_balance,
    };
    setMisoState(freshMiso);
    setFunfairState(freshFF);
    announceTimerStart();
    setShellState('playing');
    if (typeof document !== 'undefined') {
      document.body.dataset.state = 'playing';
    }
  }, [announceTimerStart]);

  const handlePlaySpecificLevel = useCallback(
    (story: 'miso' | 'funfair', levelNum: number) => {
      soundFX.playStageAdvance();
      setActiveGame(story);
      const targetStage = levelNum + 1;
      if (story === 'miso') {
        setMisoState((prev) => ({
          ...prev,
          stage: Math.max(2, Math.min(8, targetStage)),
        }));
      } else {
        setFunfairState((prev) => ({
          ...prev,
          stage: Math.max(2, Math.min(9, targetStage)),
          wallet_balance: prev.wallet_balance < 500 ? 1000 : prev.wallet_balance,
        }));
      }
      announceTimerStart();
      setShellState('playing');
      if (typeof document !== 'undefined') {
        document.body.dataset.state = 'playing';
      }
    },
    [announceTimerStart]
  );

  const handleReplayStory = useCallback((story: 'miso' | 'funfair') => {
    soundFX.playStageAdvance();
    setActiveGame(story);
    const freshMiso = structuredClone(INITIAL_MISO_STATE);
    const freshFF = {
      ...structuredClone(INITIAL_FUNFAIR_STATE),
      starting_capital: INITIAL_MISO_STATE.wallet_balance,
      wallet_balance: INITIAL_MISO_STATE.wallet_balance,
    };
    setMisoState(freshMiso);
    setFunfairState(freshFF);
    announceTimerStart();
    setShellState('playing');
    if (typeof document !== 'undefined') {
      document.body.dataset.state = 'playing';
    }
  }, [announceTimerStart]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundFX.muted = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (shellStateRef.current === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (openDrawer) {
          setOpenDrawer(null);
          return;
        }
        if (shellStateRef.current === 'playing') {
          setShellState('paused');
        } else if (shellStateRef.current === 'paused') {
          setShellState('playing');
        }
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyR') {
        if (shellStateRef.current !== 'title') {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleStartGame, resetGame, toggleMute, openDrawer]);

  useEffect(() => {
    if (effectiveShellState !== 'playing' || openDrawer !== null) return;
    let accumulator = 0;
    return gameRuntime.subscribe((dt) => {
      accumulator += dt;
      if (accumulator < 1) return;
      const seconds = Math.floor(accumulator);
      accumulator -= seconds;
      if (activeGame === 'miso') setMisoState(prev => ({ ...prev, timerSeconds: Math.max(0, prev.timerSeconds - seconds) }));
      else setFunfairState(prev => ({ ...prev, game_timer: Math.max(0, prev.game_timer - seconds) }));
    });
  }, [effectiveShellState, activeGame, openDrawer]);

  const requestGameplayBack = useCallback(() => {
    soundFX.playClick();
    // Pausing first guarantees the active story countdown stops before the dialog appears.
    setShellState('paused');
    setBackConfirmOpen(true);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // ============================================================================
  // UNIFIED PORTFOLIO METRICS (SHARED ACROSS HOME, SPLASH SCREENS & ALL LEVELS)
  // ============================================================================
  const isMiso = activeGame === 'miso';
  const walletCash = misoState.wallet_balance;
  const savingsBalance = misoState.savings_balance;
  const fdBalance = isMiso
    ? misoState.fd_current_value
    : funfairState.fd_matured
    ? Math.round(funfairState.fd_balance * 1.05)
    : funfairState.fd_balance;
  const sharesBalance = getShareCurrentValue(misoState) + getFunfairShareValue(funfairState);
  const commoditiesBalance =
    getCommodityCurrentValue(misoState) + getFunfairCommodityValue(funfairState);
  const investmentBalance = fdBalance + sharesBalance + commoditiesBalance;
  const debtBalance = misoState.repayment_due;
  const stallAssets = getSellableInventoryValue(funfairState);
  const netBalance =
    walletCash + savingsBalance + investmentBalance + stallAssets - debtBalance;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const previous = Number(window.localStorage.getItem('btl_high_score') || 0);
    if (netBalance > previous) window.localStorage.setItem('btl_high_score', String(Math.round(netBalance)));
  }, [netBalance]);

  const timerSecs = isMiso ? misoState.timerSeconds : funfairState.game_timer;

  const misoDecisionStep = Math.max(1, Math.min(7, misoState.stage - 1));
  const funfairDecisionStep = Math.max(1, Math.min(8, funfairState.stage - 1));
  const activeLevelLabel =
    shellState === 'title'
      ? titleView === 'home'
        ? 'Main Hub'
        : titleView === 'miso-splash'
        ? 'Story 1 • Helping Miso'
        : 'Story 2 • Funfair Founder'
      : isMiso
      ? misoState.stage === 9
        ? 'Helping Miso • Blueprint'
        : `Helping Miso • Level ${misoDecisionStep}/7`
      : funfairState.stage >= 10
      ? 'Funfair Founder • Settlement'
      : `Funfair Founder • Level ${funfairDecisionStep}/8`;

  // ============================================================================
  if (shellState === 'loading') {
    return <main className="fixed inset-0 w-full h-[100dvh] bg-slate-950 text-white grid place-items-center" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
        <h1 className="font-title text-lg text-amber-300">Loading game assets</h1>
        <p className="mt-2 text-sm text-slate-300">Preparing both adventures…</p>
      </div>
    </main>;
  }

  // PRE-GAME SCREENS:
  // 1. MAIN HOME PAGE ('home') - Select which story world to go to
  // 2. MISO STORY SPLASH SCREEN ('miso-splash') - Dedicated Miso & Chai Wala Splash
  // 3. FUNFAIR FOUNDER SPLASH SCREEN ('funfair-splash') - Dedicated Nimbu & Chat Splash
  // ============================================================================
  if (shellState === 'title') {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-2 md:p-3 select-none overflow-hidden overscroll-none">
        {/* ====================================================================
            1. MAIN HOME PAGE: CHOOSE WHICH GAME TO GO TO
           ==================================================================== */}
        {titleView === 'home' && (
          <main
            className="relative w-full h-full sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl sm:h-[96dvh] max-h-[980px] carnival-pattern-bg overflow-hidden sm:rounded-2xl shadow-2xl flex flex-col justify-between border-0 sm:border-3 border-slate-900"
            data-purpose="main-home-selector"
          >
            {/* Ambient Stars */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-yellow-300/20 via-sky-300/15 to-transparent blur-2xl" />
              <span className="star-pulse absolute top-32 left-5 text-yellow-300 text-lg">✦</span>
              <span
                className="star-pulse absolute top-40 right-6 text-yellow-300 text-base"
                style={{ animationDelay: '1s' }}
              >
                ★
              </span>
            </div>

            <div className="shrink-0">
              <MobileStatusBar
                onOpenAbout={() => {
                  soundFX.playClick();
                  setOpenDrawer('about');
                }}
              />
              <UnifiedPlayerPortfolioBar
                playerName={playerName}
                onChangePlayerName={handleUpdatePlayerName}
                walletCash={walletCash}
                savingsBalance={savingsBalance}
                investmentBalance={investmentBalance}
                debtBalance={debtBalance}
                netBalance={netBalance}
                contextLabel={activeLevelLabel}
                showBackButton={false}
                onOpenMarketplace={() => {
                  soundFX.playClick();
                  setOpenDrawer('marketplace');
                }}
                onOpenDashboard={() => {
                  soundFX.playClick();
                  setOpenDrawer('dashboard');
                }}
                onOpenMap={() => {
                  soundFX.playClick();
                  setMapStoryOpen(activeGame);
                }}
              />
            </div>

            {/* Main Center Content: Single-Line Heading + 2 Story World Cards with Balanced Top & Bottom Spacing */}
            <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-4 py-2">
              {/* Single-Line Title Header with Proper Top & Bottom Spacing */}
              <div className="pt-2 pb-3 text-center shrink-0">
                <h1 className="font-title text-xl sm:text-2xl md:text-3xl leading-none tracking-tight uppercase comic-title-3d whitespace-nowrap select-none">
                  Choose Your Adventure
                </h1>
              </div>

              {/* 2 Interactive Story World Cards with Both Stickers (Side-by-side on desktop!) */}
              <div
                className="flex-1 min-h-0 flex flex-col md:flex-row justify-center items-stretch gap-3 md:gap-5 pb-2 overflow-y-auto md:overflow-visible no-scrollbar"
                data-purpose="game-selection-cards"
              >
                {/* CARD 1: HELPING MISO STORY */}
                <button
                  type="button"
                  data-testid="select-miso-card"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveGame('miso');
                    setTitleView('miso-splash');
                  }}
                  className="group relative text-left overflow-hidden rounded-xl border-3 border-slate-900 bg-[#FFFBF0] p-3 sm:p-4 shadow-[0_4px_0_#0f172a] hover:shadow-[0_2px_0_#0f172a] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-3 md:flex-1 justify-between"
                >
                  {/* Left Sticker Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg miso-pattern-bg border-2 border-slate-900 flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
                    <img
                      src="/assets/miso-hero-sticker.png"
                      alt="Miso's Chai Wala Sticker"
                      className="w-full h-full object-contain character-sticker-glow group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Right Story Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block bg-emerald-400 border border-slate-900 rounded-md px-1.5 py-0.5 text-[9px] font-sans font-black uppercase text-slate-950">
                          Story 1 • Rescue
                        </span>
                        <span className="text-[10px] font-chunky font-bold text-teal-800">
                          7 Care Steps
                        </span>
                      </div>
                      <h2 className="mt-1 font-title text-base sm:text-lg leading-tight text-slate-950 uppercase">
                        Helping Miso
                      </h2>
                      <p className="mt-1 text-xs font-chunky font-medium text-slate-600 line-clamp-2 leading-snug">
                        Help Miso &amp; Ramesh Kaka balance ~₹6,350 in vet care, savings &amp; loans.
                      </p>
                    </div>
                    <div className="mt-2.5 inline-flex items-center justify-between rounded-lg bg-teal-700 hover:bg-teal-600 text-white border-2 border-slate-900 px-3 py-1.5 text-xs font-chunky font-bold shadow-xs">
                      <span>🐱 Play Miso’s Rescue</span>
                      <span>▶</span>
                    </div>
                  </div>
                </button>

                {/* CARD 2: FUNFAIR FOUNDER */}
                <button
                  type="button"
                  data-testid="select-funfair-card"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveGame('funfair');
                    setTitleView('funfair-splash');
                  }}
                  className="group relative text-left overflow-hidden rounded-xl border-3 border-slate-900 bg-[#FFFBF0] p-3 sm:p-4 shadow-[0_4px_0_#0f172a] hover:shadow-[0_2px_0_#0f172a] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-3 md:flex-1 justify-between"
                >
                  {/* Left Sticker Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg carnival-pattern-bg border-2 border-slate-900 flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
                    <img
                      src="/assets/funfair-hero-sticker.png"
                      alt="Funfair Founder Nimbu & Chat Sticker"
                      className="w-full h-full object-contain character-sticker-glow group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Right Story Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block bg-brand-yellow border border-slate-900 rounded-md px-1.5 py-0.5 text-[9px] font-sans font-black uppercase text-slate-950">
                          Story 2 • Tycoon
                        </span>
                        <span className="text-[10px] font-chunky font-bold text-brand-blue">
                          8 Decisions
                        </span>
                      </div>
                      <h2 className="mt-1 font-title text-base sm:text-lg leading-tight text-slate-950 uppercase">
                        Funfair Founder
                      </h2>
                      <p className="mt-1 text-xs font-chunky font-medium text-slate-600 line-clamp-2 leading-snug">
                        Run a mela stall across 3 rushes, restock smartly &amp; grow your net balance.
                      </p>
                    </div>
                    <div className="mt-2.5 inline-flex items-center justify-between rounded-lg bg-brand-blue hover:bg-blue-600 text-white border-2 border-slate-900 px-3 py-1.5 text-xs font-chunky font-bold shadow-xs">
                      <span>🎪 Play Funfair Founder</span>
                      <span>▶</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Navigation Bar: Home, Ledger, How To, Settings */}
            <nav
              aria-label="Home Bottom Navigation"
              data-purpose="home-bottom-navbar"
              className="relative z-20 bg-brand-cream border-t-2 border-slate-900 rounded-t-2xl px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-md shrink-0"
            >
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  data-testid="home-nav-home"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer(null);
                    setTitleView('home');
                  }}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 font-chunky text-[11px] font-extrabold transition-all cursor-pointer ${
                    openDrawer === null
                      ? 'border-slate-900 bg-brand-yellow text-slate-950 shadow-[0_2px_0_#111827]'
                      : 'border-transparent bg-white/80 text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <Home className="h-4 w-4 stroke-[2.5]" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  data-testid="home-nav-ledger"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer((prev) => (prev === 'dashboard' ? null : 'dashboard'));
                  }}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 font-chunky text-[11px] font-extrabold transition-all cursor-pointer ${
                    openDrawer === 'dashboard'
                      ? 'border-slate-900 bg-emerald-400 text-slate-950 shadow-[0_2px_0_#111827]'
                      : 'border-transparent bg-white/80 text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 stroke-[2.5]" />
                  <span>Ledger</span>
                </button>

                <button
                  type="button"
                  data-testid="home-nav-howto"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer((prev) => (prev === 'concepts' ? null : 'concepts'));
                  }}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 font-chunky text-[11px] font-extrabold transition-all cursor-pointer ${
                    openDrawer === 'concepts'
                      ? 'border-slate-900 bg-brand-blue text-white shadow-[0_2px_0_#111827]'
                      : 'border-transparent bg-white/80 text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <BookOpen className="h-4 w-4 stroke-[2.5]" />
                  <span>How To</span>
                </button>

                <button
                  type="button"
                  data-testid="home-nav-settings"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer((prev) => (prev === 'settings' ? null : 'settings'));
                  }}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 font-chunky text-[11px] font-extrabold transition-all cursor-pointer ${
                    openDrawer === 'settings'
                      ? 'border-slate-900 bg-brand-orange text-white shadow-[0_2px_0_#111827]'
                      : 'border-transparent bg-white/80 text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  <Settings className="h-4 w-4 stroke-[2.5]" />
                  <span>Settings</span>
                </button>
              </div>
            </nav>
          </main>
        )}

        {/* ====================================================================
            2. HELPING MISO DEDICATED MOBILE SPLASH SCREEN
           ==================================================================== */}
        {titleView === 'miso-splash' && (
          <main
            className="relative w-full h-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl sm:h-[96dvh] max-h-[980px] miso-pattern-bg overflow-hidden sm:rounded-2xl shadow-2xl flex flex-col justify-between border-0 sm:border-3 border-slate-900"
            data-purpose="miso-mobile-splash-shell"
          >
            {/* Ambient Background Decor Elements */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-yellow-300/25 via-teal-200/15 to-transparent blur-2xl" />
              <span className="star-pulse absolute top-36 left-6 text-yellow-300 text-xl">✦</span>
              <span
                className="star-pulse absolute top-48 right-7 text-yellow-300 text-lg"
                style={{ animationDelay: '1s' }}
              >
                ★
              </span>
            </div>

            <div>
              <MobileStatusBar
                onOpenAbout={() => {
                  soundFX.playClick();
                  setOpenDrawer('about');
                }}
              />
              <UnifiedPlayerPortfolioBar
                playerName={playerName}
                onChangePlayerName={handleUpdatePlayerName}
                walletCash={walletCash}
                savingsBalance={savingsBalance}
                investmentBalance={investmentBalance}
                debtBalance={debtBalance}
                netBalance={netBalance}
                contextLabel={activeLevelLabel}
                showBackButton={true}
                onBack={() => {
                  soundFX.playClick();
                  setTitleView('home');
                }}
                onOpenMarketplace={() => {
                  soundFX.playClick();
                  setOpenDrawer('marketplace');
                }}
                onOpenDashboard={() => {
                  soundFX.playClick();
                  setOpenDrawer('dashboard');
                }}
                onOpenMap={() => {
                  soundFX.playClick();
                  setMapStoryOpen('miso');
                }}
              />
            </div>

            {/* Game Title & Hero Header */}
            <section
              className="relative z-20 px-4 pt-1 text-center"
              data-purpose="game-logo-header"
            >
              <div className="inline-flex items-center space-x-1 bg-brand-yellow text-slate-950 font-sans font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md border border-slate-900 shadow-2xs mb-1">
                <span>✦</span>
                <span>Roadside Rescue • Finance Story</span>
                <span>✦</span>
              </div>
              <h1 className="font-title text-[2.1rem] leading-[1.03] tracking-normal uppercase comic-title-3d select-none">
                Helping
                <br />
                Miso
              </h1>
              <p className="mt-1 text-teal-50 font-chunky font-semibold text-xs tracking-wide">
                Rescue, Budget, Care!{' '}
                <span className="bg-brand-orange text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-slate-900 ml-1">
                  🐾 ~₹6,350 Care
                </span>
              </p>
            </section>

            {/* Character Illustration & Sticker Floating Area */}
            <section
              className="relative z-10 flex-1 flex items-center justify-center px-4 my-0.5"
              data-purpose="hero-character-showcase"
            >
              {/* Floating Speech Bubble Left */}
              <div className="badge-float absolute top-1 left-4 z-20 bg-brand-yellow text-slate-950 border border-slate-900 font-chunky font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-xs flex items-center space-x-1">
                <span>☕</span>
                <span>Miso’s Chai Wala!</span>
              </div>
              {/* Floating Care Tag Right */}
              <div
                className="badge-float absolute bottom-3 right-4 z-20 bg-brand-orange text-white border border-slate-900 font-chunky font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-xs flex items-center space-x-1"
                style={{ animationDelay: '1.2s' }}
              >
                <span>🩺</span>
                <span>7 Care Steps</span>
              </div>
              {/* Main Miso & Chai Wala Sticker Image */}
              <div className="relative w-full max-w-[245px] flex items-center justify-center">
                <img
                  alt="Miso the orange-and-white cat wearing a crown next to Ramesh Kaka at Miso's Chai Wala stall"
                  className="w-full h-auto object-contain max-h-[240px] character-sticker-glow transition-transform duration-300 hover:scale-[1.01]"
                  src="/assets/miso-hero-sticker.png"
                />
              </div>
            </section>

            {/* Bottom Controls & Action Sheet */}
            <section
              className="relative z-20 bg-brand-cream border-t-2 border-slate-900 rounded-t-2xl px-5 pt-3 pb-4 shadow-md"
              data-purpose="bottom-cta-panel"
            >
              <div className="w-10 h-1 bg-slate-300 rounded-sm mx-auto mb-2.5" />

              <div className="space-y-2">
                {/* Primary Tactile Yellow Button: Start Helping Miso */}
                <button
                  type="button"
                  data-start="true"
                  data-testid="start-miso-game-btn"
                  onClick={() => handleStartGame('miso')}
                  className="btn-tactile-yellow w-full bg-brand-yellow hover:bg-yellow-300 text-slate-950 rounded-xl py-2.5 px-4 font-chunky font-extrabold text-base tracking-wide flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 text-brand-yellow flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                      ▶
                    </span>
                    <span>Start Miso’s Journey</span>
                  </span>
                  <span className="text-[11px] font-sans font-black uppercase bg-white/80 px-2 py-0.5 rounded-md border border-slate-900">
                    Lv. 1
                  </span>
                </button>

                {/* Secondary Tactile White Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="back-to-home-miso"
                    onClick={() => {
                      soundFX.playClick();
                      setTitleView('home');
                    }}
                    className="btn-tactile-white bg-white hover:bg-slate-50 text-slate-900 rounded-xl py-2 px-3 font-chunky font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>←</span>
                    <span>All Games Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveGame('funfair');
                      setTitleView('funfair-splash');
                    }}
                    className="btn-tactile-white bg-white hover:bg-slate-50 text-slate-900 rounded-xl py-2 px-3 font-chunky font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🎪</span>
                    <span>Funfair Screen</span>
                  </button>
                </div>
              </div>

              {/* Auxiliary Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-sans font-bold text-slate-600">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex items-center space-x-1.5 hover:text-slate-950 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-800 text-[11px]">
                    {muted ? '🔇' : '🔊'}
                  </span>
                  <span>Audio: {muted ? 'OFF' : 'ON'}</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer('concepts');
                  }}
                  className="flex items-center space-x-1 hover:text-brand-blue cursor-pointer"
                >
                  <span>How to Play</span>
                  <span className="text-brand-orange">📖</span>
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400 font-semibold">v1.0.5 Miso</span>
              </div>
            </section>
          </main>
        )}

        {/* ====================================================================
            3. FUNFAIR FOUNDER DEDICATED MOBILE SPLASH SCREEN
           ==================================================================== */}
        {titleView === 'funfair-splash' && (
          <main
            className="relative w-full h-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl sm:h-[96dvh] max-h-[980px] carnival-pattern-bg overflow-hidden sm:rounded-2xl shadow-2xl flex flex-col justify-between border-0 sm:border-3 border-slate-900"
            data-purpose="funfair-mobile-splash-shell"
          >
            {/* Ambient Background Decor Elements */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-yellow-300/25 via-sky-300/15 to-transparent blur-2xl" />
              <span className="star-pulse absolute top-36 left-6 text-yellow-300 text-xl">✦</span>
              <span
                className="star-pulse absolute top-48 right-7 text-yellow-300 text-lg"
                style={{ animationDelay: '1s' }}
              >
                ★
              </span>
            </div>

            <div>
              <MobileStatusBar
                onOpenAbout={() => {
                  soundFX.playClick();
                  setOpenDrawer('about');
                }}
              />
              <UnifiedPlayerPortfolioBar
                playerName={playerName}
                onChangePlayerName={handleUpdatePlayerName}
                walletCash={walletCash}
                savingsBalance={savingsBalance}
                investmentBalance={investmentBalance}
                debtBalance={debtBalance}
                netBalance={netBalance}
                contextLabel={activeLevelLabel}
                showBackButton={true}
                onBack={() => {
                  soundFX.playClick();
                  setTitleView('home');
                }}
                onOpenMarketplace={() => {
                  soundFX.playClick();
                  setOpenDrawer('marketplace');
                }}
                onOpenDashboard={() => {
                  soundFX.playClick();
                  setOpenDrawer('dashboard');
                }}
                onOpenMap={() => {
                  soundFX.playClick();
                  setMapStoryOpen('funfair');
                }}
              />
            </div>

            {/* Game Title & Hero Header */}
            <section
              className="relative z-20 px-4 pt-1 text-center"
              data-purpose="game-logo-header"
            >
              <div className="inline-flex items-center space-x-1 bg-brand-yellow text-slate-950 font-sans font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md border border-slate-900 shadow-2xs mb-1">
                <span>✦</span>
                <span>Festival Tycoon • Finance Game</span>
                <span>✦</span>
              </div>
              <h1 className="font-title text-[2.1rem] leading-[1.03] tracking-normal uppercase comic-title-3d select-none">
                Funfair
                <br />
                Founder
              </h1>
              <p className="mt-1 text-sky-100 font-chunky font-semibold text-xs tracking-wide">
                Build, Sell, Grow!{' '}
                <span className="bg-brand-orange text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-slate-900 ml-1">
                  🍋 3 Rushes
                </span>
              </p>
            </section>

            {/* Character Illustration & Sticker Floating Area */}
            <section
              className="relative z-10 flex-1 flex items-center justify-center px-4 my-0.5"
              data-purpose="hero-character-showcase"
            >
              <div className="badge-float absolute top-1 left-4 z-20 bg-emerald-400 text-slate-950 border border-slate-900 font-chunky font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-xs flex items-center space-x-1">
                <span>🌶️</span>
                <span>Spicy &amp; Chilled!</span>
              </div>
              <div
                className="badge-float absolute bottom-3 right-4 z-20 bg-brand-orange text-white border border-slate-900 font-chunky font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-xs flex items-center space-x-1"
                style={{ animationDelay: '1.2s' }}
              >
                <span>✨</span>
                <span>Season 1</span>
              </div>
              <div className="relative w-full max-w-[245px] flex items-center justify-center">
                <img
                  alt="Young Indian entrepreneur holding glass of spicy lemon soda at Nimbu and Chat funfair stall"
                  className="w-full h-auto object-contain max-h-[240px] character-sticker-glow transition-transform duration-300 hover:scale-[1.01]"
                  src="/assets/funfair-hero-sticker.png"
                />
              </div>
            </section>

            {/* Bottom Controls & Action Sheet */}
            <section
              className="relative z-20 bg-brand-cream border-t-2 border-slate-900 rounded-t-2xl px-5 pt-3 pb-4 shadow-md"
              data-purpose="bottom-cta-panel"
            >
              <div className="w-10 h-1 bg-slate-300 rounded-sm mx-auto mb-2.5" />

              <div className="space-y-2">
                {/* Primary Tactile Yellow Button: Start Funfair Founder */}
                <button
                  type="button"
                  data-start="true"
                  data-testid="start-funfair-game-btn"
                  onClick={() => handleStartGame('funfair')}
                  className="btn-tactile-yellow w-full bg-brand-yellow hover:bg-yellow-300 text-slate-950 rounded-xl py-2.5 px-4 font-chunky font-extrabold text-base tracking-wide flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 text-brand-yellow flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                      ▶
                    </span>
                    <span>Start Stall Career</span>
                  </span>
                  <span className="text-[11px] font-sans font-black uppercase bg-white/80 px-2 py-0.5 rounded-md border border-slate-900">
                    Lv. 1
                  </span>
                </button>

                {/* Secondary Tactile White Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="back-to-home-funfair"
                    onClick={() => {
                      soundFX.playClick();
                      setTitleView('home');
                    }}
                    className="btn-tactile-white bg-white hover:bg-slate-50 text-slate-900 rounded-xl py-2 px-3 font-chunky font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>←</span>
                    <span>All Games Home</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveGame('miso');
                      setTitleView('miso-splash');
                    }}
                    className="btn-tactile-white bg-white hover:bg-slate-50 text-slate-900 rounded-xl py-2 px-3 font-chunky font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🐱</span>
                    <span>Miso Screen</span>
                  </button>
                </div>
              </div>

              {/* Auxiliary Bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-sans font-bold text-slate-600">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex items-center space-x-1.5 hover:text-slate-950 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-800 text-[11px]">
                    {muted ? '🔇' : '🔊'}
                  </span>
                  <span>Audio: {muted ? 'OFF' : 'ON'}</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setOpenDrawer('concepts');
                  }}
                  className="flex items-center space-x-1 hover:text-brand-blue cursor-pointer"
                >
                  <span>How to Play</span>
                  <span className="text-brand-orange">📖</span>
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400 font-semibold">v1.0.5 Mela</span>
              </div>
            </section>
          </main>
        )}

        {/* Allow How to Play / Marketplace / Ledger / Settings Drawers & Level Map to open from any Title/Splash Screen */}
        <OverlayDrawers
          activeGame={activeGame}
          openDrawer={openDrawer}
          onClose={() => setOpenDrawer(null)}
          misoState={misoState}
          setMisoState={handleSetMisoState}
          funfairState={funfairState}
          setFunfairState={handleSetFunfairState}
          playerName={playerName}
          onChangePlayerName={handleUpdatePlayerName}
          muted={muted}
          onToggleMute={toggleMute}
          onSwitchActiveGame={(game) => setActiveGame(game)}
          onResetStory={(story) => {
            if (story === 'miso') {
              setMisoState(structuredClone(INITIAL_MISO_STATE));
            } else {
              setFunfairState({
                ...structuredClone(INITIAL_FUNFAIR_STATE),
                starting_capital: INITIAL_MISO_STATE.wallet_balance,
                wallet_balance: INITIAL_MISO_STATE.wallet_balance,
              });
            }
          }}
          onOpenAbout={() => setOpenDrawer('about')}
        />

        <LevelMapModal
          isOpen={mapStoryOpen !== null}
          initialStory={mapStoryOpen || activeGame}
          onClose={() => setMapStoryOpen(null)}
          misoState={misoState}
          funfairState={funfairState}
          onPlayLevel={handlePlaySpecificLevel}
          onReplayStory={handleReplayStory}
        />
      </div>
    );
  }

  // ============================================================================
  // ACTIVE GAMEPLAY & GAMEOVER SHELL (SINGLE-SCREEN ARCADE FRAME, UNIFIED HEADER)
  // ============================================================================
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-2 md:p-3 select-none overflow-hidden overscroll-none">
      <div
        className="relative w-full h-full sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl sm:h-[96dvh] max-h-[980px] bg-brand-cream text-slate-950 overflow-hidden sm:rounded-2xl shadow-2xl flex flex-col justify-between border-0 sm:border-3 border-slate-900"
        data-purpose="active-gameplay-arcade-shell"
      >
        {/* Top Colored Header Strip with Status Bar + Identical Unified Player Portfolio Bar */}
        <div
          role="region"
          aria-label="Game Heads-Up Display"
          className={`shrink-0 ${
            isMiso ? 'miso-pattern-bg' : 'carnival-pattern-bg'
          } border-b-2 border-slate-900 pb-2 shadow-2xs`}
        >
          <MobileStatusBar
            timerText={formatTimer(timerSecs)}
            onOpenAbout={() => {
              soundFX.playClick();
              setOpenDrawer('about');
            }}
          />

          <UnifiedPlayerPortfolioBar
            playerName={playerName}
            onChangePlayerName={handleUpdatePlayerName}
            walletCash={walletCash}
            savingsBalance={savingsBalance}
            investmentBalance={investmentBalance}
            debtBalance={debtBalance}
            netBalance={netBalance}
            contextLabel={activeLevelLabel}
            showBackButton={true}
            onBack={() => {
              requestGameplayBack();
            }}
            onOpenMarketplace={() => {
              soundFX.playClick();
              setOpenDrawer('marketplace');
            }}
            onOpenDashboard={() => {
              soundFX.playClick();
              setOpenDrawer('dashboard');
            }}
            onOpenMap={() => {
              soundFX.playClick();
              setMapStoryOpen(activeGame);
            }}
            isPlaying={true}
            activeGame={activeGame}
            onSwitchGame={(target) => {
              soundFX.playClick();
              handleStartGame(target);
            }}
            muted={muted}
            onToggleMute={toggleMute}
            onPause={() => {
              soundFX.playClick();
              setShellState((prev) => (prev === 'paused' ? 'playing' : 'paused'));
            }}
            onRestart={resetGame}
          />
        </div>

        {showTimerStarted && shellState === 'playing' && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[60] -translate-x-1/2 animate-fade-in" role="status" aria-live="polite">
            <div className="flex items-center gap-2 rounded-full border-2 border-emerald-300 bg-slate-950/95 px-4 py-2 text-xs font-extrabold text-white shadow-xl">
              <Clock3 className="h-4 w-4 text-emerald-300" />
              Timer started · {formatTimer(timerSecs)}
            </div>
          </div>
        )}

        {/* Single-Screen Active Gameplay Area */}
        <main className="flex-1 min-h-0 overflow-hidden p-0 sm:p-2.5 flex flex-col">
          {isMiso ? (
            <MisoGameView
              playerName={playerName}
              state={misoState}
              setState={handleSetMisoState}
              onOpenMarketplace={() => setOpenDrawer('marketplace')}
              onRestart={resetGame}
              onSwitchToFunfair={() => {
                handleStartGame('funfair');
              }}
            />
          ) : (
            <FunfairGameView
              playerName={playerName}
              state={funfairState}
              setState={handleSetFunfairState}
              onOpenMarketplace={() => setOpenDrawer('marketplace')}
              onRestart={resetGame}
              onSwitchToMiso={() => {
                handleStartGame('miso');
              }}
            />
          )}
        </main>

        {/* Integrated Bottom Navigation Dock inside the Mobile Frame */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="shrink-0 z-30 bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t border-slate-300 shadow-md"
        >
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setOpenDrawer(null);
              }}
              className={`min-h-[36px] flex items-center justify-center gap-1 rounded-lg px-2 text-xs font-chunky font-bold transition-all cursor-pointer ${
                openDrawer === null
                  ? 'bg-brand-yellow text-slate-950 border border-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>Story</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setOpenDrawer((prev) => (prev === 'marketplace' ? null : 'marketplace'));
              }}
              className={`min-h-[36px] flex items-center justify-center gap-1 rounded-lg px-2 text-xs font-chunky font-bold transition-all cursor-pointer ${
                openDrawer === 'marketplace'
                  ? 'bg-brand-orange text-white border border-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              <span>Market</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setOpenDrawer((prev) => (prev === 'dashboard' ? null : 'dashboard'));
              }}
              className={`min-h-[36px] flex items-center justify-center gap-1 rounded-lg px-2 text-xs font-chunky font-bold transition-all cursor-pointer ${
                openDrawer === 'dashboard'
                  ? 'bg-emerald-400 text-slate-950 border border-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              <span>Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setOpenDrawer((prev) => (prev === 'concepts' ? null : 'concepts'));
              }}
              className={`min-h-[36px] flex items-center justify-center gap-1 rounded-lg px-2 text-xs font-chunky font-bold transition-all cursor-pointer ${
                openDrawer === 'concepts'
                  ? 'bg-brand-blue text-white border border-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Guide</span>
            </button>
          </div>
        </nav>

        {/* Persistent Drawers & Level Map */}
        <OverlayDrawers
          activeGame={activeGame}
          openDrawer={openDrawer}
          onClose={() => setOpenDrawer(null)}
          misoState={misoState}
          setMisoState={handleSetMisoState}
          funfairState={funfairState}
          setFunfairState={handleSetFunfairState}
          playerName={playerName}
          onChangePlayerName={handleUpdatePlayerName}
          muted={muted}
          onToggleMute={toggleMute}
          onSwitchActiveGame={(game) => setActiveGame(game)}
          onResetStory={(story) => {
            if (story === 'miso') {
              setMisoState(structuredClone(INITIAL_MISO_STATE));
            } else {
              setFunfairState({
                ...structuredClone(INITIAL_FUNFAIR_STATE),
                starting_capital: INITIAL_MISO_STATE.wallet_balance,
                wallet_balance: INITIAL_MISO_STATE.wallet_balance,
              });
            }
          }}
          onOpenAbout={() => setOpenDrawer('about')}
        />

        <LevelMapModal
          isOpen={mapStoryOpen !== null}
          initialStory={mapStoryOpen || activeGame}
          onClose={() => setMapStoryOpen(null)}
          misoState={misoState}
          funfairState={funfairState}
          onPlayLevel={handlePlaySpecificLevel}
          onReplayStory={handleReplayStory}
        />

        {/* Pause Modal Sheet */}
        {shellState === 'paused' && !backConfirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Game Paused"
          >
            <div className="w-full max-w-sm rounded-xl bg-brand-cream border-2 border-slate-900 p-5 shadow-lg space-y-4">
              <div className="w-10 h-1 rounded-sm bg-slate-300 mx-auto" />
              <div className="text-center">
                <span className="inline-block bg-brand-yellow border border-slate-900 rounded-md px-2.5 py-0.5 text-[10px] font-sans font-black uppercase tracking-widest text-slate-950">
                  Game Paused • {playerName}
                </span>
                <h2 className="mt-1.5 font-title text-2xl text-slate-950 uppercase">
                  {isMiso ? 'Helping Miso' : 'Funfair Founder'}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white border border-slate-300 p-2.5 shadow-2xs">
                  <span className="block text-[10px] font-sans font-bold text-slate-500 uppercase">
                    Wallet
                  </span>
                  <strong className="font-chunky text-base font-extrabold text-slate-950">
                    ₹{walletCash}
                  </strong>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-2.5 shadow-2xs">
                  <span className="block text-[10px] font-sans font-bold text-emerald-900 uppercase">
                    Balance
                  </span>
                  <strong className="font-chunky text-base font-extrabold text-emerald-950">
                    ₹{netBalance}
                  </strong>
                </div>
                <div className="rounded-lg bg-white border border-slate-300 p-2.5 shadow-2xs">
                  <span className="block text-[10px] font-sans font-bold text-slate-500 uppercase">
                    Timer
                  </span>
                  <strong className="font-chunky text-base font-extrabold text-slate-950">
                    {formatTimer(timerSecs)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShellState('playing')}
                  className="btn-tactile-yellow w-full min-h-[44px] rounded-lg bg-brand-yellow py-2.5 font-chunky text-base font-extrabold text-slate-950 cursor-pointer"
                >
                  ▶ Resume Story
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="btn-tactile-white min-h-[40px] rounded-lg bg-white py-2 px-3 font-chunky text-xs font-bold text-slate-950 cursor-pointer"
                  >
                    {muted ? '🔇 Audio: OFF' : '🔊 Audio: ON'}
                  </button>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="btn-tactile-white min-h-[40px] rounded-lg bg-white py-2 px-3 font-chunky text-xs font-bold text-slate-950 cursor-pointer"
                  >
                    ↻ Restart Story
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    handleStartGame(isMiso ? 'funfair' : 'miso');
                  }}
                  className="btn-tactile-white w-full min-h-[40px] rounded-lg bg-white py-2 font-chunky text-xs font-bold text-slate-950 cursor-pointer"
                >
                  {isMiso ? '🎪 Switch to Funfair Founder' : '🐱 Switch to Helping Miso'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTitleView('home');
                    setShellState('title');
                  }}
                  className="w-full min-h-[38px] rounded-lg bg-transparent py-1.5 font-sans text-xs font-extrabold uppercase tracking-wider text-slate-600 hover:text-slate-950 cursor-pointer"
                >
                  ← Back to Main Home
                </button>
              </div>
            </div>
          </div>
        )}

        {backConfirmOpen && (
          <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="leave-level-title">
            <div className="w-full max-w-sm rounded-2xl border-2 border-amber-400 bg-brand-cream p-5 text-slate-950 shadow-2xl">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border-2 border-amber-400 bg-amber-100 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 id="leave-level-title" className="mt-3 text-center font-title text-xl">Leave this level?</h2>
              <p className="mt-2 text-center text-sm text-slate-600">The {isMiso ? 'Helping Miso' : 'Funfair Founder'} timer is paused at <strong>{formatTimer(timerSecs)}</strong>. Your current progress will stay available.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setBackConfirmOpen(false); setShellState('playing'); }} className="btn-tactile-yellow min-h-[44px] rounded-xl font-extrabold">Keep playing</button>
                <button type="button" onClick={() => { setBackConfirmOpen(false); setTitleView('home'); setShellState('title'); }} className="btn-tactile-white min-h-[44px] rounded-xl font-bold">Leave level</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
