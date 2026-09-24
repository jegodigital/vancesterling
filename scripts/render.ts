/**
 * Script JSON -> finished master MP4 (+ meta.json for distribution).
 * Usage:
 *   npm run render -- content/scripts/vs-001.json            (needs public/audio/<id>.mp3 + public/captions/<id>.json from `npm run voice`)
 *   npm run render -- content/scripts/vs-001.json --preview  (no voice: estimated timings, safe-zone overlay; NEVER post a preview)
 * Output: public/renders/<id>.mp4 (or <id>.preview.mp4) and public/renders/<id>.meta.json
 */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { estimateTimings } from '../src/lib/captions';
import { MainShortProps } from '../src/lib/schema';
import { readScript } from './lib';

const run = (args: string[]) => execFileSync('npx', args, { stdio: 'inherit' });

function main() {
  const file = process.argv[2];
  const preview = process.argv.includes('--preview');
  if (!file) throw new Error('Usage: npm run render -- content/scripts/<id>.json [--preview]');
  const s = readScript(file);

  let captions: { text: string; startMs: number; endMs: number }[];
  let voiceoverSrc: string | undefined;
  if (preview) {
    captions = estimateTimings(s.voiceover);
  } else {
    const capFile = `public/captions/${s.id}.json`;
    const audioFile = `public/audio/${s.id}.mp3`;
    if (!fs.existsSync(capFile) || !fs.existsSync(audioFile)) throw new Error(`Run \`npm run voice -- ${file}\` first (missing ${capFile} or ${audioFile}).`);
    captions = JSON.parse(fs.readFileSync(capFile, 'utf-8')).captions;
    voiceoverSrc = `audio/${s.id}.mp3`;
  }

  const durationMs = captions[captions.length - 1].endMs + 1200;
  // Chart must clear out before the CTA card (last 4s).
  const chart = s.chart ? { ...s.chart, toMs: Math.min(s.chart.toMs, durationMs - 4500) } : undefined;

  const props: MainShortProps = {
    scriptId: s.id,
    hook: s.hook,
    captions,
    durationMs,
    voiceoverSrc,
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
  const audioArgs = voiceoverSrc
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
