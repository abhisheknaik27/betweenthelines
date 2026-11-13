'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, Sparkles, AlertCircle, Phone, Stethoscope, Car, Store, DollarSign } from 'lucide-react';
import { soundFX } from '@/lib/sound';
import { FlatGameIllustration } from './FlatGameIllustration';
import { ChoiceReaction } from './ChoiceReaction';
import { gameRuntime } from '@/lib/game-runtime';

export interface DecisionCutscene {
  actorName: string;
  actorRole: string;
  actorAvatar: string; // Emoji or asset
  actorBg: string;
  dialogue: string;
  actionTitle: string;
  actionImpactText: string;
  impactType: 'positive' | 'neutral' | 'cost' | 'warning';
  costBadge?: string;
  environment: 'tea_stall' | 'highway_auto' | 'vet_clinic' | 'bank_bazaar' | 'diagnostic_lab' | 'recovery_home' | 'funfair_stall' | 'funfair_rush';
  onContinue: () => void;
}

interface InteractiveDecisionMotionStageProps {
  cutscene: DecisionCutscene | null;
  onDismiss: () => void;
}

export function InteractiveDecisionMotionStage({
  cutscene,
  onDismiss,
}: InteractiveDecisionMotionStageProps) {
  const [progress, setProgress] = useState(0);
  const continuedRef = React.useRef(false);

  useEffect(() => {
    continuedRef.current = false;
    if (!cutscene) return;

    let elapsed = 0;
    const duration = 3.8;
    const unsubscribe = gameRuntime.subscribe((dt) => {
      elapsed += dt;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration && !continuedRef.current) {
        continuedRef.current = true;
        cutscene.onContinue();
      }
    });
    return () => {
      unsubscribe();
      setProgress(0);
    };
  }, [cutscene]);

  const handleManualContinue = () => {
    if (!cutscene || continuedRef.current) return;
    continuedRef.current = true;
    soundFX.playClick();
    cutscene.onContinue();
  };

  return (
    <AnimatePresence>
      {cutscene && (
        <motion.div
          key="decision-cutscene-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none"
        >
        <motion.div
          initial={{ scale: 0.88, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="relative w-full max-w-[420px] sm:max-w-md rounded-2xl bg-white border-3 border-slate-900 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* =====================================================================
              TOP CUTSCENE BANNER (Action Header & Film Reel Marker)
             ===================================================================== */}
          <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between border-b-2 border-slate-900 text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-title text-xs tracking-wider uppercase text-brand-yellow">
                Action Unfolding
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 font-bold">
              SCENE MOTION · 24 FPS
            </span>
          </div>

          {/* =====================================================================
              INTERACTIVE ANIMATED MOTION STAGE (Dynamic Visual World)
             ===================================================================== */}
          <div className="relative w-full h-44 overflow-hidden border-b-2 border-slate-900 bg-slate-900">
            <ChoiceReaction title={cutscene.actionTitle} impact={cutscene.actionImpactText} />
            {/* Background Environment Layers */}
            {cutscene.environment === 'tea_stall' && (
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/90 via-orange-700/80 to-amber-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start opacity-70">
                  <span className="text-xs font-bold text-amber-200">☕ Ramesh Chai Tapri · NH-48</span>
                  <div className="flex gap-1 text-sm">☁️ ☁️</div>
                </div>
                {/* Stall awning */}
                <div className="w-full h-4 bg-stripes-amber opacity-60 rounded-xs border-b border-amber-400" />
                <div className="flex items-end justify-between">
                  <div className="text-3xl animate-bounce">🫖</div>
                  <div className="text-2xl animate-pulse">♨️</div>
                  <div className="text-4xl">🏪</div>
                </div>
              </div>
            )}

            {cutscene.environment === 'highway_auto' && (
              <div className="absolute inset-0 bg-gradient-to-b from-sky-700 via-blue-800 to-slate-900 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-sky-200 text-xs font-bold">
                  <span>🛣️ Highway Stretch to Vet Clinic</span>
                  <span>💨 45 km/h</span>
                </div>
                {/* Road and dashed center lines */}
                <div className="relative w-full h-10 bg-slate-800 border-t-2 border-slate-700 flex items-center justify-around">
                  <div className="w-8 h-1 bg-yellow-400 animate-pulse" />
                  <div className="w-8 h-1 bg-yellow-400 animate-pulse" />
                  <div className="w-8 h-1 bg-yellow-400 animate-pulse" />
                  <div className="w-8 h-1 bg-yellow-400 animate-pulse" />
                </div>
              </div>
            )}

            {cutscene.environment === 'vet_clinic' && (
              <div className="absolute inset-0 bg-gradient-to-b from-teal-700 via-emerald-800 to-teal-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-teal-100 text-xs font-bold">
                  <span>🏥 Dr. Kavita’s Veterinary Clinic</span>
                  <span className="text-emerald-300">💓 Vital: Stable</span>
                </div>
                {/* Clinic interior props */}
                <div className="flex items-center justify-around text-2xl opacity-80">
                  <span>🩺</span>
                  <span>💊</span>
                  <span>🩹</span>
                  <span>📋</span>
                </div>
                <div className="w-full h-6 bg-teal-900/80 rounded-t-lg border-t border-teal-500/40" />
              </div>
            )}

            {cutscene.environment === 'bank_bazaar' && (
              <div className="absolute inset-0 bg-gradient-to-b from-blue-700 via-indigo-900 to-slate-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-blue-200 text-xs font-bold">
                  <span>🏦 Town Financial Bazaar & Mandi</span>
                  <span>⚖️ Liquidity Desk</span>
                </div>
                <div className="flex items-center justify-around text-2xl">
                  <span>🏛️</span>
                  <span>🪙</span>
                  <span>📊</span>
                  <span>🔐</span>
                </div>
                <div className="w-full h-5 bg-blue-950 border-t border-blue-400" />
              </div>
            )}

            {cutscene.environment === 'diagnostic_lab' && (
              <div className="absolute inset-0 bg-gradient-to-b from-purple-800 via-indigo-950 to-slate-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-purple-200 text-xs font-bold">
                  <span>🔬 Diagnostic & X-Ray Unit</span>
                  <span className="animate-pulse text-amber-300">⚡ Test Active</span>
                </div>
                <div className="flex items-center justify-around text-2xl">
                  <span>🩻</span>
                  <span>🔬</span>
                  <span>🧪</span>
                  <span>📑</span>
                </div>
                <div className="w-full h-5 bg-purple-950 border-t border-purple-400" />
              </div>
            )}

            {cutscene.environment === 'recovery_home' && (
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-teal-700 to-teal-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-emerald-100 text-xs font-bold">
                  <span>🏡 Safe Recovery Corner</span>
                  <span className="text-pink-300">💖 Happy & Healing</span>
                </div>
                <div className="flex items-center justify-around text-2xl">
                  <span>🛋️</span>
                  <span>🧶</span>
                  <span>🥣</span>
                  <span>✨</span>
                </div>
                <div className="w-full h-5 bg-emerald-950 border-t border-emerald-400" />
              </div>
            )}

            {cutscene.environment === 'funfair_stall' && (
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-orange-700 to-red-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-amber-200 text-xs font-bold">
                  <span>🎪 Mela Fairgrounds · Stall Lane</span>
                  <span>🎪 Grand Setup</span>
                </div>
                <div className="flex items-center justify-around text-2xl">
                  <span>🏮</span>
                  <span>🎡</span>
                  <span>🎯</span>
                  <span>🍿</span>
                </div>
                <div className="w-full h-6 bg-amber-950 border-t-2 border-amber-400" />
              </div>
            )}

            {cutscene.environment === 'funfair_rush' && (
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-purple-700 to-slate-950 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start text-sky-200 text-xs font-bold">
                  <span>🎪 Festival Rush Active!</span>
                  <span className="text-yellow-300">🔥 High Footfall</span>
                </div>
                <div className="flex items-center justify-around text-2xl">
                  <span className="animate-bounce">🏃</span>
                  <span className="animate-pulse">👨‍👩‍👧</span>
                  <span className="animate-bounce">🏃‍♀️</span>
                  <span>🪙</span>
                </div>
                <div className="w-full h-6 bg-slate-950 border-t border-purple-400" />
              </div>
            )}

            {/* =====================================================================
                ANIMATED ACTORS IN MOTION (Characters Arriving on Screen)
               ===================================================================== */}
            <div className="absolute inset-x-0 bottom-2 px-4 flex items-end justify-between pointer-events-none z-10">
              {/* Left Actor: Aarav & Miso */}
              <motion.div
                initial={{ x: -60, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className="flex items-end gap-1.5"
              >
                <div className="relative">
                  <img
                    src="/assets/miso-hero-sticker.png"
                    alt="Miso and Aarav"
                    className="w-16 h-16 object-contain drop-shadow-md stop-motion-actor"
                  />
                  {/* Reaction Bubble above Miso */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45, type: 'spring' }}
                    className="absolute -top-3 -right-2 bg-white rounded-full px-1.5 py-0.5 border border-slate-900 text-[10px] font-black shadow-xs"
                  >
                    💖
                  </motion.div>
                </div>
              </motion.div>

              {/* Interaction Center Particle FX */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="flex flex-col items-center justify-center pb-2"
              >
                <span className="text-2xl animate-spin">✨</span>
                {cutscene.costBadge && (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-brand-yellow border border-slate-900 font-mono text-[10px] font-black text-slate-950 shadow-xs">
                    {cutscene.costBadge}
                  </span>
                )}
              </motion.div>

              {/* Right Actor: Arriving Character (Doctor, Ramesh Kaka, Auto, Rescuer) */}
              <motion.div
                initial={{ x: 80, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                {/* Speech Bubble attached to the arriving character */}
                <motion.div
                  initial={{ y: 10, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', damping: 12 }}
                  className="relative -top-1 bg-white border-2 border-slate-900 rounded-lg px-2 py-1 shadow-md text-slate-900 text-[10px] font-extrabold max-w-[140px] text-center leading-tight"
                >
                  <span className="block truncate">{cutscene.actorName.split(' ')[0]} arrived!</span>
                  <div className="absolute -bottom-1.5 right-6 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
                </motion.div>

                {/* Arriving Actor Figure */}
                <div
                  className={`w-14 h-14 rounded-2xl border-2 border-slate-900 ${cutscene.actorBg} flex items-center justify-center text-3xl shadow-lg stop-motion-actor`}
                >
                  <FlatGameIllustration title={cutscene.actionTitle} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* =====================================================================
              ACTION DETAILS & INTERACTIVE DIALOGUE BOX
             ===================================================================== */}
          <div className="p-3.5 flex flex-col gap-2.5 bg-white">
            {/* Actor identity & Action Label */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand-yellow/30 border border-slate-900 flex items-center justify-center text-sm font-black">
                  <FlatGameIllustration title={cutscene.actionTitle} />
                </span>
                <div>
                  <h3 className="font-title text-xs text-slate-950 uppercase leading-none">
                    {cutscene.actorName}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 leading-none">
                    {cutscene.actorRole}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 font-sans text-[10px] font-extrabold text-slate-800">
                {cutscene.actionTitle}
              </span>
            </div>

            {/* Comic Dialogue Balloon */}
            <div className="relative rounded-xl border-2 border-slate-900 bg-[#FFFBF0] p-2.5 shadow-2xs">
              <p className="font-chunky text-xs text-slate-900 leading-relaxed font-semibold">
                💬 &ldquo;{cutscene.dialogue}&rdquo;
              </p>
            </div>

            {/* Impact feedback notification */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600 flex items-center gap-1">
                <span>⚡ Impact:</span>
                <span className="text-slate-950 font-extrabold">{cutscene.actionImpactText}</span>
              </span>
              {cutscene.costBadge && (
                <span className="font-mono text-emerald-700 font-extrabold">
                  {cutscene.costBadge}
                </span>
              )}
            </div>

            {/* =====================================================================
                CONTINUE BUTTON & AUTO-PROGRESS BAR
               ===================================================================== */}
            <div className="pt-1 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleManualContinue}
                className="btn-tactile-yellow w-full min-h-[42px] rounded-xl bg-brand-yellow py-2 px-4 font-chunky text-sm font-extrabold text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                <span>Continue to Next Level</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Progress timer track */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

