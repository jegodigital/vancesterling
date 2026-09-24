import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Segment, segmentFrames } from '../lib/segments';

// Plays the kept pieces of each Flow clip back-to-back (video + its own dialogue audio).
// Boundaries are rounded to whole frames; each piece starts where the previous one ended.
export const SegmentTrack: React.FC<{ segments: Segment[] }> = ({ segments }) => {
  const { fps } = useVideoConfig();
  let cursor = 0;
  return (
    <AbsoluteFill>
      {segments.map((s, i) => {
        const trimBefore = Math.round((s.fromMs / 1000) * fps);
        const length = segmentFrames(s, fps);
        const from = cursor;
        cursor += length;
        return (
          <Sequence key={i} from={from} durationInFrames={length} premountFor={fps}>
            <OffthreadVideo src={staticFile(s.src)} trimBefore={trimBefore} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
