import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SAFE, SAFE_H, SAFE_W } from '../lib/brand';

// Every text/UI element renders inside this box. Nothing is positioned against the raw canvas.
export const SafeZone: React.FC<{ children: React.ReactNode; debug?: boolean }> = ({ children, debug }) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE.left,
      top: SAFE.top,
      width: SAFE_W,
      height: SAFE_H,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      outline: debug ? '4px dashed rgba(255,0,0,0.8)' : undefined,
    }}
  >
    {children}
  </div>
);

// Debug overlay: shades the platform-UI zones red so a preview frame shows what gets covered.
export const SafeZoneOverlay: React.FC = () => {
  const shade = 'rgba(255,0,0,0.22)';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: shade }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: shade }} />
      <div style={{ position: 'absolute', left: SAFE.right, right: 0, top: SAFE.top, height: SAFE_H, background: shade }} />
      <div style={{ position: 'absolute', left: 0, width: SAFE.left, top: SAFE.top, height: SAFE_H, background: shade }} />
    </AbsoluteFill>
  );
};
