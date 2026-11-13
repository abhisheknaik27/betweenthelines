'use client';

import React from 'react';
import { FlatGameIllustration } from './FlatGameIllustration';

const VISIBLE_WORLD_ACTION = /bystander|coordinate|community|volunteer|bus|rescuer|transport|auto|cab|food|feed|kaka|stall|booth|entrance|location|corner|stock|restock|inventory|rush|crowd|promotion|mela complete|finale/i;

/** Only actions that visibly alter the game world receive a full scene reaction. */
export function shouldIllustrateChoice(title: string) {
  return VISIBLE_WORLD_ACTION.test(title);
}

/** Small actors cross the foreground while the selected action resolves. */
export function ChoiceReaction({ title, icon, impact }: { title: string; icon?: string; impact?: string }) {
  if (!shouldIllustrateChoice(title)) return null;
  const actors = [title];

  return <div className="choice-reaction" role="status" aria-label={impact || title}>
    <div className="choice-reaction-actors" aria-hidden="true">
      {actors.map((actor, i) => <span key={i} style={{ animationDelay: `${i * 130}ms` }}><FlatGameIllustration title={actor} className="w-32 h-28 sm:w-44 sm:h-36" /></span>)}
    </div>
    <div className="choice-reaction-caption">{impact || title}</div>
  </div>;
}
