export type CaptionWord = { text: string; startMs: number; endMs: number };

export type CaptionPage = { startMs: number; endMs: number; words: CaptionWord[] };

// Group words into short on-screen "pages" (max 3 words). A page also breaks at
// sentence punctuation or a pause >= 300ms, so text never runs across a breath.
export const toPages = (words: CaptionWord[], maxWords = 3, pauseMs = 300): CaptionPage[] => {
  const pages: CaptionPage[] = [];
  let current: CaptionWord[] = [];
  const flush = () => {
    if (current.length === 0) return;
    pages.push({ startMs: current[0].startMs, endMs: current[current.length - 1].endMs, words: current });
    current = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (current.length > 0 && (current.length >= maxWords || (prev && w.startMs - prev.endMs >= pauseMs))) {
      flush();
    }
    current.push(w);
    if (/[.!?]$/.test(w.text)) flush();
  });
  flush();
  return pages;
};

// Page visible at time t: the one covering t, else the last one that started (holds through short gaps).
export const pageAt = (pages: CaptionPage[], tMs: number): CaptionPage | null => {
  let found: CaptionPage | null = null;
  for (const p of pages) {
    if (p.startMs <= tMs) found = p;
    else break;
  }
  if (found && tMs - found.endMs > 700) return null; // hide during long silences
  return found;
};

// Preview-only timing when no voiceover exists yet (~155 wpm). Never ship a render made with this.
export const estimateTimings = (text: string, startMs = 300, wpm = 155): CaptionWord[] => {
  const perWord = 60000 / wpm;
  let t = startMs;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const extra = /[.!?]$/.test(word) ? 350 : /[,:;]$/.test(word) ? 150 : 0;
      const w = { text: word, startMs: Math.round(t), endMs: Math.round(t + perWord * 0.9) };
      t += perWord + extra;
      return w;
    });
};
