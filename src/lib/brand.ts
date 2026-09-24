// Vance Sterling visual identity. Separate from JegoDigital branding on purpose.
export const BRAND = {
  ink: '#0A0D12',
  inkSoft: '#141A22',
  ivory: '#F4EFE6',
  muted: '#9AA4B2',
  money: '#3DDC97', // highlight: active caption word, growth line
  gold: '#D8B46A', // secondary accent: contributions line, CTA border
  danger: '#FF6B6B',
};

// Universal safe zone on the 1080x1920 master (max envelope of TikTok / Reels / Shorts UI).
export const CANVAS = { width: 1080, height: 1920, fps: 30 };
export const SAFE = { top: 220, bottom: 1440, left: 60, right: 900 };
export const SAFE_W = SAFE.right - SAFE.left; // 840
export const SAFE_H = SAFE.bottom - SAFE.top; // 1220

export const TYPE = { hookMin: 72, captionMin: 48 };
