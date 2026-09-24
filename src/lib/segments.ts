export type Segment = { src: string; fromMs: number; toMs: number };

// Frame-rounded length of one kept piece (must match SegmentTrack exactly).
export const segmentFrames = (s: Segment, fps: number) =>
  Math.max(1, Math.round((s.toMs / 1000) * fps) - Math.round((s.fromMs / 1000) * fps));

export const segmentsDurationMs = (segments: Segment[], fps: number) =>
  (segments.reduce((t, s) => t + segmentFrames(s, fps), 0) / fps) * 1000;
