/**
 * Script JSON -> finished master MP4 (+ meta.json for distribution).
 * Usage:
 *   npm run render -- content/scripts/vs-001.json            (needs public/audio/<id>.mp3 + public/captions/<id>.json from `npm run voice`)
 *   npm run render -- content/scripts/vs-001.json --preview  (no voice: estimated timings, safe-zone overlay; NEVER post a preview)
 *   npm run render -- content/scripts/vs-001.json --flow     (Flow talking-head edit: needs public/edits/<id>.json from `npm run edit`)
 * Output: public/renders/<id>.mp4 (or <id>.preview.mp4) and public/renders/<id>.meta.json
 */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { segmentsDurationMs } from '../src/lib/segments';
import { estimateTimings } from '../src/lib/captions';
import { MainShortProps } from '../src/lib/schema';
import { readScript } from './lib';

const run = (args: string[]) => execFileSync('npx', args, { stdio: 'inherit' });

function main() {
  const file = process.argv[2];
  const preview = process.argv.includes('--preview');
  const flow = process.argv.includes('--flow');
  if (!file) throw new Error('Usage: npm run render -- content/scripts/<id>.json [--preview]');
  const s = readScript(file);

  let captions: { text: string; startMs: number; endMs: number }[];
  let voiceoverSrc: string | undefined;
  let segments: { src: string; fromMs: number; toMs: number }[] | undefined;
  if (flow) {
    const editFile = `public/edits/${s.id}.json`;
    if (!fs.existsSync(editFile)) throw new Error(`Run \`npm run edit -- ${file}\` first (missing ${editFile}).`);
    const edit = JSON.parse(fs.readFileSync(editFile, 'utf-8'));
    const bad = edit.qa.filter((q: { verdict: string }) => q.verdict !== 'OK');
    if (bad.length && !preview) throw new Error(`Shots flagged for regeneration: ${bad.map((q: { shot: string }) => q.shot).join(', ')}. Fix in Flow, re-run edit.`);
    captions = edit.captions;
    segments = edit.segments;
  } else if (preview) {
    captions = estimateTimings(s.voiceover);
  } else {
    const capFile = `public/captions/${s.id}.json`;
    const audioFile = `public/audio/${s.id}.mp3`;
    if (!fs.existsSync(capFile) || !fs.existsSync(audioFile)) throw new Error(`Run \`npm run voice -- ${file}\` first (missing ${capFile} or ${audioFile}).`);
    captions = JSON.parse(fs.readFileSync(capFile, 'utf-8')).captions;
    voiceoverSrc = `audio/${s.id}.mp3`;
  }

  const durationMs = segments
    ? segmentsDurationMs(segments, 30)
    : captions[captions.length - 1].endMs + 1200;
  // Chart: start on its anchor word if given, and clear out before the CTA card (last 4s).
  let chart: MainShortProps['chart'];
  if (s.chart) {
    const { anchor, ...c } = s.chart;
    const clean = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hit = anchor ? captions.find((w) => clean(w.text) === clean(anchor)) : undefined;
    const fromMs = hit ? hit.startMs : c.fromMs;
    const toMs = Math.min(fromMs + (c.toMs - c.fromMs), durationMs - 4500);
    if (anchor && !hit) console.warn(`⚠️  Chart anchor "${anchor}" not found in captions; using fromMs ${c.fromMs}.`);
    if (toMs - fromMs >= 3000) chart = { ...c, fromMs, toMs };
    else console.warn('⚠️  Not enough room for the chart before the CTA; chart skipped.');
  }

  const props: MainShortProps = {
    scriptId: s.id,
    hook: s.hook,
    captions,
    durationMs,
    voiceoverSrc,
    segments,
    musicVolume: 0.08,
    backgroundVideoSrc: s.backgroundVideoSrc,
    chart,
    ctaKeyword: s.ctaKeyword,
    ctaText: s.ctaText,
    disclosure: 'AI character · Education, not financial advice',
    showSafeZone: preview,
  };

  fs.mkdirSync('out', { recursive: true });
  const propsFile = path.join('out', `${s.id}.props.json`);
  fs.writeFileSync(propsFile, JSON.stringify(props));

  const base = preview ? `${s.id}.preview` : s.id;
  const raw = path.join('out', `${base}.raw.mp4`);
  const final = path.join('public/renders', `${base}.mp4`);
  run(['remotion', 'render', 'src/index.ts', 'MainShort', raw, `--props=${propsFile}`, '--audio-codec=aac', '--audio-bitrate=192k']);

  // Finalize: -14 LUFS, 48 kHz AAC 192k, strip metadata, moov atom first (faststart).
  const audioArgs = voiceoverSrc || segments
    ? ['-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', '-c:a', 'aac', '-b:a', '192k']
    : ['-c:a', 'copy'];
  run(['remotion', 'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', ...audioArgs, '-map_metadata', '-1', '-movflags', '+faststart', final]);
  fs.rmSync(raw);

  const meta = {
    id: s.id,
    video: final,
    preview,
    caption: `${s.caption}\n\n${s.hashtags.join(' ')}`,
    youtubeTitle: s.youtubeTitle,
    ctaKeyword: s.ctaKeyword,
    aiGenerated: true,
  };
  fs.writeFileSync(path.join('public/renders', `${base}.meta.json`), JSON.stringify(meta, null, 2));
  console.log(`✅ ${final}${preview ? '  (PREVIEW — estimated timings, safe-zone overlay, do not post)' : ''}`);
}

try {
  main();
} catch (e) {
  console.error(`❌ ${(e as Error).message}`);
  process.exit(1);
}
