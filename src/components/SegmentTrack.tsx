import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Segment, segmentFrames } from '../lib/segments';

// Punch-in used to hide jump cuts: when a cut stays inside the same Flow clip, every other piece
// is scaled up around his face, so the jump reads as a deliberate camera change.
const PUNCH_IN = 1.12;
const FACE_ORIGIN = '50% 38%';

// Plays the kept pieces of each Flow clip back-to-back (video + its own dialogue audio).
// Boundaries are rounded to whole frames; each piece starts where the previous one ended.
export const SegmentTrack: React.FC<{ segments: Segment[] }> = ({ segments }) => {
  const { fps } = useVideoConfig();
  let cursor = 0;
  let zoomed = false;
  return (
    <AbsoluteFill>
      {segments.map((s, i) => {
        const trimBefore = Math.round((s.fromMs / 1000) * fps);
        const length = segmentFrames(s, fps);
        const from = cursor;
        cursor += length;
        // New shot -> reset to the wide frame; same shot -> alternate framing.
        zoomed = i > 0 && segments[i - 1].src === s.src ? !zoomed : false;
        return (
          <Sequence key={i} from={from} durationInFrames={length} premountFor={fps}>
            <OffthreadVideo
              src={staticFile(s.src)}
              trimBefore={trimBefore}
              // Soften the first and last frame of each piece so hard audio cuts don't click.
              volume={(f) => (f === 0 || f === length - 1 ? 0.5 : 1)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: zoomed ? `scale(${PUNCH_IN})` : undefined,
                transformOrigin: FACE_ORIGIN,
              }}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
