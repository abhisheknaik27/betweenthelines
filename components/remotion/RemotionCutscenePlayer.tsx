'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface RemotionVideoCompositionProps {
  title: string;
  subtitle: string;
  actorName: string;
  actorAvatar: string;
  impactText: string;
  costBadge?: string;
  story: 'miso' | 'funfair';
}

/**
 * StorySceneComposition:
 * Pure Remotion programmatic video animation composition.
 * Driven by useCurrentFrame(), spring() curves, film reel grain, and 3D camera zoom.
 */
export const StorySceneComposition: React.FC<RemotionVideoCompositionProps> = ({
  title,
  subtitle,
  actorName,
  actorAvatar,
  impactText,
  costBadge,
  story,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animations for title, card, and particles
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const textOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const cameraZoom = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateRight: 'clamp',
  });

  const isMiso = story === 'miso';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 48px',
        backgroundColor: '#020617',
        backgroundImage: isMiso
          ? 'radial-gradient(circle at 50% 30%, #0c4a6e 0%, #020617 80%)'
          : 'radial-gradient(circle at 50% 30%, #b45309 0%, #020617 80%)',
        color: '#ffffff',
        fontFamily: "'Fredoka', sans-serif",
        overflow: 'hidden',
        position: 'relative',
        transform: `scale(${cameraZoom})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 3D Film Sprockets Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px dashed rgba(255, 255, 255, 0.25)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 12px #10b981',
            }}
          />
          <span
            style={{
              fontFamily: "'Bungee', cursive",
              fontSize: '20px',
              letterSpacing: '2px',
              color: '#ffd214',
              textTransform: 'uppercase',
            }}
          >
            {isMiso ? 'Miso Rescue 3D Reel' : 'Funfair Tycoon 3D Reel'}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#94a3b8',
            fontWeight: 800,
          }}
        >
          FRAME {frame.toString().padStart(3, '0')} · 24 FPS
        </div>
      </div>

      {/* Main Center Video Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '4px solid #ffd214',
          borderRadius: '24px',
          padding: '28px 36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          transform: `scale(${cardScale})`,
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            backgroundColor: '#ffd214',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '52px',
            border: '3px solid #000000',
            boxShadow: '0 8px 0 #000000',
            flexShrink: 0,
          }}
        >
          {actorAvatar}
        </div>

        <div style={{ flex: 1, opacity: textOpacity }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span
              style={{
                fontFamily: "'Bungee', cursive",
                fontSize: '18px',
                color: '#ffd214',
                textTransform: 'uppercase',
              }}
            >
              {actorName}
            </span>
            {costBadge && (
              <span
                style={{
                  backgroundColor: '#fef08a',
                  color: '#713f12',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              >
                {costBadge}
              </span>
            )}
          </div>
          <h2
            style={{
              fontFamily: "'Bungee', cursive",
              fontSize: '28px',
              margin: '0 0 8px 0',
              lineHeight: 1.1,
              color: '#ffffff',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#10b981',
              margin: 0,
              fontWeight: 700,
            }}
          >
            {impactText}
          </p>
        </div>
      </div>

      {/* Footer film ticker */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px dashed rgba(255, 255, 255, 0.25)',
          paddingTop: '12px',
          color: '#64748b',
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        <span>REMOTION ENGINE v4.0 · WEBGL 3D THREE.JS</span>
        <span style={{ color: '#ffd214' }}>{subtitle}</span>
      </div>
    </div>
  );
};

export interface RemotionCutscenePlayerProps {
  title: string;
  subtitle: string;
  actorName: string;
  actorAvatar: string;
  impactText: string;
  costBadge?: string;
  story: 'miso' | 'funfair';
  onComplete?: () => void;
}

export function RemotionCutscenePlayer({
  title,
  subtitle,
  actorName,
  actorAvatar,
  impactText,
  costBadge,
  story,
  onComplete,
}: RemotionCutscenePlayerProps) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-3 border-slate-900 shadow-2xl bg-slate-950 aspect-video max-h-[380px]">
      <Player
        component={StorySceneComposition}
        inputProps={{
          title,
          subtitle,
          actorName,
          actorAvatar,
          impactText,
          costBadge,
          story,
        }}
        durationInFrames={75}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        style={{
          width: '100%',
          height: '100%',
        }}
        autoPlay
        loop={false}
      />
    </div>
  );
}

