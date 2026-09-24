/**
 * Voiceover + exact word timings in one call (ElevenLabs "with-timestamps").
 * Usage: npm run voice -- content/scripts/vs-001.json
 * Writes: public/audio/<id>.mp3 and public/captions/<id>.json
 * Needs: ELEVENLABS_API_KEY, VANCE_VOICE_ID (optional ELEVENLABS_MODEL_ID) in env or .env
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadEnv, readScript } from './lib';

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

// Character-level alignment -> word tokens (same shape transcribe.py emits).
export const alignmentToWords = (a: Alignment) => {
  const words: { text: string; startMs: number; endMs: number }[] = [];
  let buf = '';
  let start = 0;
  let end = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (buf) words.push({ text: buf, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000) });
      buf = '';
      return;
    }
    if (!buf) start = a.character_start_times_seconds[i];
    buf += ch;
    end = a.character_end_times_seconds[i];
  });
  if (buf) words.push({ text: buf, startMs: Math.round(start * 1000), endMs: Math.round(end * 1000) });
  return words;
};

async function main() {
  loadEnv();
  const file = process.argv[2];
  if (!file) throw new Error('Usage: npm run voice -- content/scripts/<id>.json');
  const script = readScript(file);
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.VANCE_VOICE_ID;
  if (!key || !voice) throw new Error('Missing ELEVENLABS_API_KEY or VANCE_VOICE_ID (see .env.example).');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: script.voiceover,
      model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { audio_base64: string; alignment: Alignment };

  const audioOut = path.join('public/audio', `${script.id}.mp3`);
  const capOut = path.join('public/captions', `${script.id}.json`);
  fs.writeFileSync(audioOut, Buffer.from(data.audio_base64, 'base64'));
  const words = alignmentToWords(data.alignment);
  const durationMs = words.length ? words[words.length - 1].endMs : 0;
  fs.writeFileSync(capOut, JSON.stringify({ source: 'elevenlabs-alignment', durationMs, captions: words }, null, 2));
  console.log(`✅ ${audioOut} + ${capOut} (${words.length} words, ${(durationMs / 1000).toFixed(1)}s)`);
}

if (require.main === module) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
