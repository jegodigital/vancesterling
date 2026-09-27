import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// On-screen hook for the first 3 seconds (the drop-off filter window).
// Style from the viral playbook (persona §4b.1): big white text, black outline, no box, below the face.
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
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 80,
        fontWeight: 900,
        lineHeight: 1.08,
        textAlign: 'center',
        letterSpacing: -1,
        maxWidth: 820,
        textWrap: 'balance',
        WebkitTextStroke: '10px #000',
        paintOrder: 'stroke fill',
        textShadow: '0 6px 24px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  );
};
