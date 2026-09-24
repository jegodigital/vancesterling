import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { Captions } from '../components/Captions';
import { CompoundChart } from '../components/CompoundChart';
import { CtaCard } from '../components/CtaCard';
import { Disclosure } from '../components/Disclosure';
import { HookTitle } from '../components/HookTitle';
import { MotionBackground } from '../components/MotionBackground';
import { SafeZone, SafeZoneOverlay } from '../components/SafeZone';
import { MainShortProps } from '../lib/schema';

// Fonts are vendored in public/fonts so renders never depend on the network.
const fontFamily = 'Inter';
for (const weight of ['600', '700', '800', '900']) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight });
}

export const MainShort: React.FC<MainShortProps> = (p) => {
  const ctaFromMs = Math.max(0, p.durationMs - 4000);
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: '#000' }}>
      {p.backgroundVideoSrc ? (
        <OffthreadVideo src={staticFile(p.backgroundVideoSrc)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <MotionBackground />
      )}
      {/* Vignette for caption contrast over any background */}
      <AbsoluteFill
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)' }}
      />

      {p.voiceoverSrc ? <Audio src={staticFile(p.voiceoverSrc)} /> : null}
      {p.musicSrc ? <Audio src={staticFile(p.musicSrc)} volume={p.musicVolume} loop /> : null}

      <SafeZone debug={p.showSafeZone}>
        <Disclosure text={p.disclosure} />
        {/* Upper block: hook, then chart */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <HookTitle text={p.hook} />
          {p.chart ? (
            <div style={{ position: 'absolute' }}>
              <CompoundChart {...p.chart} />
            </div>
          ) : null}
        </div>
        {/* Lower block: CTA sits above captions; captions own the bottom of the safe zone */}
        <div style={{ minHeight: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
          {p.ctaKeyword ? <CtaCard keyword={p.ctaKeyword} text={p.ctaText} fromMs={ctaFromMs} /> : null}
        </div>
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Captions words={p.captions} />
        </div>
      </SafeZone>

      {p.showSafeZone ? <SafeZoneOverlay /> : null}
    </AbsoluteFill>
  );
};
