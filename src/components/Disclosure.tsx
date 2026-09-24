import React from 'react';
import { BRAND } from '../lib/brand';

// Always-on AI + not-advice tag. Burned into every frame so it survives any repost.
export const Disclosure: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: 0.5,
      color: BRAND.ivory,
      background: 'rgba(10,13,18,0.72)',
      border: `2px solid ${BRAND.muted}`,
      borderRadius: 999,
      padding: '8px 18px',
    }}
  >
    {text}
  </div>
);
