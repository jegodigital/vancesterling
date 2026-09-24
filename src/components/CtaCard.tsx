import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND } from '../lib/brand';

// Comment-keyword CTA. Shows for the last ~4s.
export const CtaCard: React.FC<{ keyword: string; text?: string; fromMs: number }> = ({ keyword, text, fromMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round((fromMs / 1000) * fps);
  if (frame < start) return null;
  const s = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 140 } });
  return (
    <div
      style={{
        transform: `scale(${0.7 + 0.3 * s})`,
        opacity: s,
        border: `4px solid ${BRAND.gold}`,
        background: 'rgba(10,13,18,0.9)',
        borderRadius: 26,
        padding: '22px 34px',
        textAlign: 'center',
        maxWidth: 800,
      }}
    >
      <div style={{ color: BRAND.ivory, fontSize: 52, fontWeight: 800 }}>
        Comment <span style={{ color: BRAND.money }}>“{keyword}”</span>
      </div>
      {text ? <div style={{ color: BRAND.muted, fontSize: 34, fontWeight: 600, marginTop: 8 }}>{text}</div> : null}
    </div>
  );
};
