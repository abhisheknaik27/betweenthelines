'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Crown, Medal, Timer, TrendingUp, Trophy, Users, X } from 'lucide-react';

type StoryId = 'miso' | 'funfair';
type LeaderboardEntry = { id: string; name: string; story: StoryId; score: number; seconds: number; isPlayer?: boolean };

const BENCHMARKS: LeaderboardEntry[] = [
  { id: 'm1', name: 'Maya', story: 'miso', score: 6550, seconds: 126 },
  { id: 'm2', name: 'Kabir', story: 'miso', score: 5920, seconds: 154 },
  { id: 'm3', name: 'Anaya', story: 'miso', score: 5380, seconds: 181 },
  { id: 'f1', name: 'Ishaan', story: 'funfair', score: 6480, seconds: 142 },
  { id: 'f2', name: 'Diya', story: 'funfair', score: 5310, seconds: 166 },
  { id: 'f3', name: 'Reyansh', story: 'funfair', score: 4420, seconds: 198 },
];

const STORAGE_KEY = 'btl_completed_runs_v1';
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function VictoryCard({ story, playerName, title, subtitle, score, totalSeconds, remainingSeconds, multiplier }: {
  story: StoryId; playerName: string; title: string; subtitle: string; score: number;
  totalSeconds: number; remainingSeconds: number; multiplier?: number;
}) {
  const [open, setOpen] = useState(false);
  const [savedRuns] = useState<LeaderboardEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const seconds = Math.max(0, totalSeconds - remainingSeconds);
  const playerId = `${story}-${playerName}-${Math.round(score)}-${seconds}`;
  const playerEntry = useMemo<LeaderboardEntry>(() => ({ id: playerId, name: playerName || 'Player', story, score: Math.round(score), seconds, isPlayer: true }), [playerId, playerName, score, seconds, story]);

  useEffect(() => {
    let runs = savedRuns;
    if (!runs.some(run => run.id === playerId)) {
      runs = [...runs, playerEntry].slice(-30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    }
  }, [playerEntry, playerId, savedRuns]);

  const leaderboard = useMemo(() => [...BENCHMARKS, ...savedRuns.filter(entry => entry.id !== playerId), playerEntry]
    .filter(entry => entry.story === story)
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds)
    .slice(0, 10), [playerEntry, playerId, savedRuns, story]);
  const rank = Math.max(1, leaderboard.findIndex(entry => entry.id === playerId) + 1);

  return <>
    <section className={`victory-card ${story === 'miso' ? 'victory-card-miso' : 'victory-card-funfair'}`}>
      <div className="victory-rays" aria-hidden="true" />
      <div className="relative z-10 flex items-start gap-3">
        <div className="victory-trophy"><Trophy className="h-8 w-8" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-200">
            <Crown className="h-3.5 w-3.5" /> Adventure complete
          </div>
          <h1 className="mt-1 font-title text-xl sm:text-2xl leading-tight text-white">{title}</h1>
          <p className="mt-1 text-xs text-slate-200">{subtitle}</p>
        </div>
        <div className="victory-rank"><span>#</span>{rank}</div>
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
        <div className="victory-stat"><TrendingUp /><span>Final score</span><strong>₹{Math.round(score).toLocaleString('en-IN')}</strong></div>
        <div className="victory-stat"><Timer /><span>Finish time</span><strong>{formatTime(seconds)}</strong></div>
        <div className="victory-stat"><Medal /><span>{multiplier ? 'Growth' : 'Standing'}</span><strong>{multiplier ? `${multiplier}×` : `Rank ${rank}`}</strong></div>
      </div>

      <button type="button" onClick={() => setOpen(true)} className="victory-leaderboard-btn">
        <Users className="h-4 w-4" /> View leaderboard
      </button>
    </section>

    {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Leaderboard">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-400 bg-[#111d32] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-amber-500/20 to-cyan-500/10 p-4">
          <div><span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">{story === 'miso' ? 'Helping Miso' : 'Funfair Founder'}</span><h2 className="font-title text-xl">Leaderboard</h2></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close leaderboard" className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10"><X className="h-4 w-4" /></button>
        </header>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
          {leaderboard.map((entry, index) => <div key={entry.id} className={`leaderboard-row ${entry.id === playerId ? 'leaderboard-player' : ''}`}>
            <div className="leaderboard-position">{index < 3 ? <Medal className={`h-5 w-5 medal-${index + 1}`} /> : index + 1}</div>
            <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{entry.name}{entry.id === playerId ? ' (You)' : ''}</strong><span className="text-[10px] text-slate-400">Completed in {formatTime(entry.seconds)}</span></div>
            <strong className="font-mono text-sm text-amber-300">₹{entry.score.toLocaleString('en-IN')}</strong>
          </div>)}
        </div>
        <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-relaxed text-slate-400">Ranks include completed runs saved on this device and benchmark players. Connect a shared database to enable live cross-device rankings.</p>
      </div>
    </div>}
  </>;
}
