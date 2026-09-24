import React from 'react';
import { Composition } from 'remotion';
import { MainShort } from './compositions/MainShort';
import { CANVAS } from './lib/brand';
import { estimateTimings } from './lib/captions';
import { mainShortSchema, MainShortProps } from './lib/schema';

const demoText =
  'Put two hundred dollars a month into an index fund at seven percent. After thirty years you put in seventy-two thousand. The math says about two hundred forty-four thousand.';
const demoCaptions = estimateTimings(demoText);

const defaultProps: MainShortProps = {
  scriptId: 'studio-demo',
  hook: '$200/month. 30 years.',
  captions: demoCaptions,
  durationMs: demoCaptions[demoCaptions.length - 1].endMs + 4500,
  musicVolume: 0.08,
  chart: { start: 0, monthly: 200, ratePct: 7, years: 30, label: '$200/mo · 30 yrs', fromMs: 3000, toMs: 11000 },
  ctaKeyword: 'CASH',
  ctaText: 'I’ll DM you the free calculator',
  disclosure: 'AI character · Education, not financial advice',
  showSafeZone: false,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MainShort"
    component={MainShort}
    schema={mainShortSchema}
    width={CANVAS.width}
    height={CANVAS.height}
    fps={CANVAS.fps}
    durationInFrames={Math.ceil((defaultProps.durationMs / 1000) * CANVAS.fps)}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil((props.durationMs / 1000) * CANVAS.fps) })}
  />
);
