import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND } from '../lib/brand';
import { compoundSeries, CompoundInput, usd } from '../lib/compound';

type Props = CompoundInput & { label: string; fromMs: number; toMs: number };

const W = 800;
const H = 520;
const PAD = { l: 20, r: 20, t: 70, b: 60 };

// Animated balance-vs-contributions chart. Draws in over [fromMs, toMs].
export const CompoundChart: React.FC<Props> = ({ label, fromMs, toMs, ...input }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tMs = (frame / fps) * 1000;
  const series = useMemo(() => compoundSeries(input), [input.start, input.monthly, input.ratePct, input.years]);

  if (tMs < fromMs || tMs > toMs + 400) return null;
  const progress = interpolate(tMs, [fromMs, fromMs + (toMs - fromMs) * 0.75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fade = interpolate(tMs, [fromMs, fromMs + 250, toMs, toMs + 400], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const max = series[series.length - 1].balance;
  const x = (i: number) => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const path = (key: 'balance' | 'contributed') =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

  const shownIdx = Math.max(0, Math.floor(progress * (series.length - 1)));
  const shown = series[shownIdx];

  return (
    <div
      style={{
        opacity: fade,
        width: W,
        background: 'rgba(20,26,34,0.88)',
        border: `2px solid ${BRAND.inkSoft}`,
        borderRadius: 28,
        padding: '18px 0 8px',
      }}
    >
      <div style={{ color: BRAND.muted, fontSize: 30, fontWeight: 700, textAlign: 'center' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 6 }}>
        <span style={{ color: BRAND.money, fontSize: 48, fontWeight: 900 }}>{usd(shown.balance)}</span>
        <span style={{ color: BRAND.gold, fontSize: 48, fontWeight: 900 }}>{usd(shown.contributed)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 36, color: BRAND.muted, fontSize: 24, fontWeight: 600 }}>
        <span>balance · year {shown.year}</span>
        <span>you put in</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id="reveal">
            <rect x={0} y={0} width={PAD.l + progress * (W - PAD.l - PAD.r)} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#reveal)">
          <path d={path('contributed')} stroke={BRAND.gold} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={path('balance')} stroke={BRAND.money} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
        <text x={PAD.l} y={H - 16} fill={BRAND.muted} fontSize={24} fontWeight={600}>
          Year 0
        </text>
        <text x={W - PAD.r} y={H - 16} fill={BRAND.muted} fontSize={24} fontWeight={600} textAnchor="end">
          Year {input.years} · {input.ratePct}%/yr assumed
        </text>
      </svg>
    </div>
  );
};
