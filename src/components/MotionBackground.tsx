import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BRAND } from '../lib/brand';

// Faceless fallback background: slow-drifting ledger grid over a dark gradient.
export const MotionBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1800], [0, -240]);
  const glow = interpolate(Math.sin(frame / 45), [-1, 1], [0.18, 0.3]);
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${BRAND.inkSoft} 2px, transparent 2px), linear-gradient(90deg, ${BRAND.inkSoft} 2px, transparent 2px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: `0px ${drift}px`,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 38%, rgba(61,220,151,${glow}) 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};
