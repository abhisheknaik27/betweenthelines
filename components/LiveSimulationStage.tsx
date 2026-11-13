'use client';

import React, { useState } from 'react';
import { Remotion3DStage, Remotion3DStageProps } from './remotion/Remotion3DStage';
import { Poly2DGameStage } from './poly2d/Poly2DGameStage';

export interface SimulationOption {
  id: string;
  title: string;
  badge: string;
  badgeColor?: string;
  description: string;
  icon: string;
  previewDialogue?: string;
  previewImpact?: string;
  actionDialogue: string;
  actionImpactText: string;
  costBadge?: string;
  costAmount?: number;
}

export type LiveSimulationStageProps = Remotion3DStageProps;

/**
 * LiveSimulationStage:
 * Defaults to the rich Poly 2D Animated Game Stage with faceted polygon art,
 * continuous idle animations (swishing tail, boiling kettle steam, drifting clouds),
 * responsive hover reactions (ambulance sirens, auto-rickshaw headlight),
 * celebratory confetti explosions, screen shake, and arcade RPG card deck.
 * Supports instant toggle to 3D diorama mode.
 */
export function LiveSimulationStage(props: LiveSimulationStageProps) {
  const [viewMode, setViewMode] = useState<'poly2d' | '3d'>('poly2d');

  if (viewMode === '3d') {
    return (
      <div className="relative w-full h-full">
        <Remotion3DStage {...props} />
        {/* Quick toggle pill back to Poly 2D */}
        <button
          type="button"
          onClick={() => setViewMode('poly2d')}
          className="absolute top-2.5 right-14 z-50 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-title text-[10px] font-black uppercase shadow-lg flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>🎨 2D POLY</span>
        </button>
      </div>
    );
  }

  return (
    <Poly2DGameStage
      {...props}
      currentViewMode={viewMode}
      onToggleViewMode={() => setViewMode('3d')}
    />
  );
}
