/**
 * Script -> Google Flow shot list (copy-paste prompts, one per 8-second Veo clip).
 * Usage: npm run flow -- content/scripts/vs-001.json
 *   - splits `voiceover` into short spoken lines (<= MAX_WORDS each, sentence/comma boundaries)
 *   - saves them as `shots` in the script JSON (edit.py checks each clip against its line)
 *   - writes flow/prompts/<id>.md
 */
import * as fs from 'node:fs';
import { readScript, Script } from './lib';

const MAX_WORDS = 14; // packing target: ~5-6 s of calm speech per clip
const MAX_SENTENCE = 18; // one whole sentence may go up to ~7 s; longer ones must be rewritten

// Continuity: one look, a set per pillar. Must match persona/VANCE-STERLING.md §5.
const LOOK =
  'Vance Sterling, a fictional man in his mid-30s with short dark hair and neat light stubble, wearing a navy fine-knit sweater over an open-collar white shirt';
const SETS: Record<Script['pillar'], string> = {
  'money-myths': 'a private library with dark wood shelves and a warm desk lamp, soft cinematic key light',
  'capital-allocation': 'a dark executive office high in a skyscraper at night, city lights through the window behind him, soft key light',
  'cashflow-systems': 'a clean modern desk with one monitor showing a simple line chart, dark room, soft cinematic key light',
  'business-teardowns': 'a dark executive office high in a skyscraper at night, city lights behind him, soft key light',
};
const FRAMES = [
  { framing: 'Close-up', action: 'He leans slightly toward the camera, eyebrows slightly raised' },
  { framing: 'Medium shot', action: 'He gestures calmly with one hand' },
  { framing: 'Close-up', action: 'He holds eye contact, slight nod' },
  { framing: 'Medium-wide shot', action: 'He sits back, relaxed and confident' },
];

export const splitLines = (text: string, max = MAX_WORDS): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+["”]?|[^.!?]+$/g)?.map((s) => s.trim()) ?? [text];
  // Each clip is its own performance, so keep whole sentences. Only sentences over
  // MAX_SENTENCE get broken at commas (with a warning: better to rewrite the script).
  const pieces = sentences.flatMap((s) => {
    if (s.split(/\s+/).length <= MAX_SENTENCE) return [s];
    console.warn(`⚠️  Sentence over ${MAX_SENTENCE} words, split at commas (rewrite it shorter): "${s}"`);
    const parts = s.split(/(?<=,)\s+/);
    return parts.flatMap((p) => {
      const w = p.split(/\s+/);
      const out: string[] = [];
      for (let i = 0; i < w.length; i += max) out.push(w.slice(i, i + max).join(' '));
      return out;
    });
  });
  // Pack pieces greedily up to max words; the first shot is the hook on its own.
  const words = (t: string) => t.split(/\s+/).length;
  const lines: string[] = [];
  for (const p of pieces) {
    const last = lines[lines.length - 1];
    if (lines.length > 1 && last && words(last) + words(p) <= max) lines[lines.length - 1] = `${last} ${p}`;
    else lines.push(p);
  }
  // Fold orphans (< 5 words) into the previous shot when that stays under max + 4.
  for (let i = lines.length - 1; i > 1; i--) {
    if (words(lines[i]) < 5 && words(lines[i - 1]) + words(lines[i]) <= max + 4) {
      lines[i - 1] = `${lines[i - 1]} ${lines[i]}`;
      lines.splice(i, 1);
    }
  }
  return lines;
};

// Flow length options (Omni Flash): 4/6/8/10 s. Calm speech ~2.4 words/s + 1.5 s of air.
export const clipSeconds = (line: string) => {
  const need = line.split(/\s+/).length / 2.4 + 1.5;
  return [4, 6, 8, 10].find((s) => s >= need) ?? 10;
};

// `@Vance` = the saved Flow Character (face + clothes + voice locked). Look text repeats it for continuity.
export const shotPrompt = (s: Script, shot: { line: string; framing: string; action: string }) =>
  [
    `@Vance. ${shot.framing}, vertical 9:16. ${LOOK}, in ${SETS[s.pillar]}.`,
    `${shot.action}. He looks straight into the camera and says, calm and confident:`,
    `"${shot.line}"`,
    'Realistic lip sync, natural pace. Ambient noise: quiet room tone only, no music. (no subtitles)',
  ].join(' ');

export const NEGATIVE = 'subtitles, captions, on-screen text, logos, watermark text, music, extra people';

function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: npm run flow -- content/scripts/<id>.json');
  const s = readScript(file);
  const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const shots = splitLines(s.voiceover).map((line, i) => ({ line, ...FRAMES[i % FRAMES.length] }));
  raw.shots = shots;
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + '\n');

  const md = [
    `# ${s.id} — Flow shot list`,
    '',
    `**Hook:** ${s.hook} · **Pillar:** ${s.pillar} · **Shots:** ${shots.length}`,
    '',
    'Flow settings: project **Vance Sterling** · model **Omni Flash 720p** · **9:16** · outputs **1** · length as listed per shot.',
    `Negative prompt (every shot): \`${NEGATIVE}\``,
    `Credit estimate (Omni 720p, 1 take each): ${shots.reduce((t, x) => t + ({ 4: 7, 6: 10, 8: 12, 10: 15 } as Record<number, number>)[clipSeconds(x.line)], 0)} credits.`,
    'Download each keeper as `shot-NN.mp4` into Drive folder `Vance Sterling/flow/' + s.id + '/`. Re-roll any shot with burned-in text, face drift or a wrong word.',
    '',
    ...shots.flatMap((shot, i) => [
      `## shot-${String(i + 1).padStart(2, '0')} · ${shot.framing} · ${clipSeconds(shot.line)} s`,
      `Says: *${shot.line}*`,
      '',
      '```',
      shotPrompt(s, shot),
      '```',
      '',
    ]),
  ].join('\n');
  fs.writeFileSync(`flow/prompts/${s.id}.md`, md);
  console.log(`✅ flow/prompts/${s.id}.md — ${shots.length} shots (max ${Math.max(...shots.map((x) => x.line.split(/\s+/).length))} words each)`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(`❌ ${(e as Error).message}`);
    process.exit(1);
  }
}
