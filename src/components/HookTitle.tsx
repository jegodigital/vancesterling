import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND } from '../lib/brand';

// On-screen hook for the first 3 seconds (the drop-off filter window).
export const HookTitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 12, mass: 0.5, stiffness: 120 } });
  const out = interpolate(frame, [fps * 2.6, fps * 3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (frame > fps * 3) return null;
  return (
    <div
      style={{
        opacity: out,
        transform: `translateY(${(1 - inS) * 40}px)`,
        background: BRAND.ivory,
        color: BRAND.ink,
        padding: '18px 30px',
        borderRadius: 18,
        fontSize: 72,
        fontWeight: 900,
        lineHeight: 1.05,
        textAlign: 'center',
        letterSpacing: -1.5,
        maxWidth: 820,
        textWrap: 'balance',
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      }}
    >
      {text}
    </div>
  );
};
