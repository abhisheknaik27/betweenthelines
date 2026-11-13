'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gameRuntime } from '@/lib/game-runtime';

/* ─────────────────────────────────────────────────────────────
   Ambient floating emoji decorations — purely cosmetic
   ───────────────────────────────────────────────────────────── */
const MISO_EMOJIS = ['🐾', '🌿', '🩺', '💊', '🐱', '🌾', '🍵', '💚'];
const FUNFAIR_EMOJIS = ['🎪', '🎯', '🌽', '⭐', '🎠', '🎡', '🍭', '🎶'];

interface FloatingEmojiProps {
  emoji: string;
  style: React.CSSProperties;
}

function FloatingEmoji({ emoji, style }: FloatingEmojiProps) {
  return (
    <span
      className="absolute select-none pointer-events-none z-0 text-base opacity-25 animate-pulse"
      style={style}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Scene Title Card  — animates in, stays 1.6 s, fades behind
   ───────────────────────────────────────────────────────────── */
interface SceneTitleCardProps {
  story: 'miso' | 'funfair';
  levelNumber: number;
  sceneTitle: string;
  sceneSubtitle?: string;
  visible: boolean;
}

function SceneTitleCard({
  story,
  levelNumber,
  sceneTitle,
  sceneSubtitle,
  visible,
}: SceneTitleCardProps) {
  const isMiso = story === 'miso';

  const bgGradient = isMiso
    ? 'from-teal-800 via-teal-700 to-emerald-800'
    : 'from-amber-700 via-orange-700 to-yellow-700';

  const accentColor = isMiso ? 'text-teal-200' : 'text-amber-200';
  const badgeColor = isMiso ? 'bg-teal-500/80' : 'bg-amber-500/80';
  const icon = isMiso ? '🐱' : '🎪';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scene-title-card"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <div
            className={`w-full h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center gap-2 px-6`}
          >
            {/* Icon */}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl drop-shadow-lg"
              aria-hidden="true"
            >
              {icon}
            </motion.span>

            {/* Scene badge */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
              className={`${badgeColor} border border-white/20 rounded-full px-3 py-0.5 text-[10px] font-sans font-extrabold uppercase tracking-widest text-white`}
            >
              Scene {levelNumber}
            </motion.div>

            {/* Main title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-title text-2xl sm:text-3xl text-white text-center leading-tight drop-shadow-lg uppercase tracking-wide"
            >
              {sceneTitle}
            </motion.h2>

            {/* Subtitle */}
            {sceneSubtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={`font-chunky text-sm ${accentColor} text-center`}
              >
                {sceneSubtitle}
              </motion.p>
            )}

            {/* Decorative horizontal rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-0.5 rounded-full bg-white/40 mt-1"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────── */
interface StopMotionVideoFrameProps {
  story: 'miso' | 'funfair';
  stage: number;
  totalStages: number;
  levelNumber: number;
  sceneTitle: string;
  sceneSubtitle?: string;
  children: React.ReactNode;
}

export function StopMotionVideoFrame({
  story,
  stage,
  totalStages,
  levelNumber,
  sceneTitle,
  sceneSubtitle,
  children,
}: StopMotionVideoFrameProps) {
  const [showTitleCard, setShowTitleCard] = useState<boolean>(false);
  const prevStageRef = useRef<number>(stage);

  /* Show the slate/title-card for 1.6 s on every stage change */
  useEffect(() => {
    if (prevStageRef.current !== stage) {
      prevStageRef.current = stage;
      setShowTitleCard(true);
      return gameRuntime.schedule(1.6, () => setShowTitleCard(false));
    }
  }, [stage]);

  const isMiso = story === 'miso';
  const ambientEmojis = isMiso ? MISO_EMOJIS : FUNFAIR_EMOJIS;

  /* Deterministic pseudo-random positions so they don't shift on re-render */
  const emojiPositions: React.CSSProperties[] = [
    { top: '8%',  left: '5%',  animationDelay: '0s',    animationDuration: '2.4s' },
    { top: '12%', right: '7%', animationDelay: '0.6s',  animationDuration: '3.1s' },
    { top: '35%', left: '3%',  animationDelay: '1.1s',  animationDuration: '2.8s' },
    { top: '55%', right: '4%', animationDelay: '0.3s',  animationDuration: '3.4s' },
    { top: '72%', left: '8%',  animationDelay: '1.5s',  animationDuration: '2.6s' },
    { top: '80%', right: '9%', animationDelay: '0.9s',  animationDuration: '3.0s' },
    { top: '25%', left: '45%', animationDelay: '2.0s',  animationDuration: '2.2s' },
    { top: '65%', left: '40%', animationDelay: '0.4s',  animationDuration: '3.5s' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">

      {/* ── Ambient floating emoji layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {ambientEmojis.map((emoji, i) => (
          <FloatingEmoji key={i} emoji={emoji} style={emojiPositions[i]} />
        ))}
      </div>

      {/* ── Animated stage canvas ── */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">

        {/* Scene Title Card (z-20, behind children via z-index layering) */}
        <SceneTitleCard
          story={story}
          levelNumber={levelNumber}
          sceneTitle={sceneTitle}
          sceneSubtitle={sceneSubtitle}
          visible={showTitleCard}
        />

        {/* Stage content slides in/out */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: 30, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, y: -4, scale: 0.97 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-1 min-h-0 h-full flex flex-col relative z-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
