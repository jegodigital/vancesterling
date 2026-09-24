import React, { useMemo } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND } from '../lib/brand';
import { CaptionWord, pageAt, toPages } from '../lib/captions';

// Karaoke captions: 1-3 word pages, active word in money-green, pop-in per page.
export const Captions: React.FC<{ words: CaptionWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tMs = (frame / fps) * 1000;
  const pages = useMemo(() => toPages(words), [words]);
  const page = pageAt(pages, tMs);
  if (!page) return null;

  const pageFrame = Math.round((page.startMs / 1000) * fps);
  const pop = spring({ frame: frame - pageFrame, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 22px',
        maxWidth: 800,
        transform: `scale(${0.85 + 0.15 * pop})`,
      }}
    >
      {page.words.map((w, i) => {
        const active = tMs >= w.startMs && tMs <= w.endMs + 60;
        return (
          <span
            key={`${page.startMs}-${i}`}
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: -1,
              textTransform: 'uppercase',
              color: active ? BRAND.money : BRAND.ivory,
              WebkitTextStroke: '3px rgba(0,0,0,0.85)',
              paintOrder: 'stroke fill',
              textShadow: '0 6px 18px rgba(0,0,0,0.6)',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
