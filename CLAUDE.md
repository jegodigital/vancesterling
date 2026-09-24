# CLAUDE.md — Vance Sterling video engine

Vance Sterling is an **openly AI** finance-education character. This repo turns a script JSON into a finished 9:16 master MP4 and schedules it to TikTok, Reels and Shorts.
Read `persona/VANCE-STERLING.md` before writing any script. Research and sources are in `docs/research/`.

## Non-negotiables
1. **Disclosure everywhere.** Every frame has the burned-in tag "AI character · Education, not financial advice". Every post sets the platform AI flag (`isAigc`, `isAiGenerated`, `isAiGeneratedContent`). The Instagram profile uses the "AI-generated profile" label.
2. **No fake experience or credentials.** Vance never claims a past job, degree, portfolio or personal result (FTC 16 CFR 255.3 / 465).
3. **No income claims.** Nothing like "make $X", "7-figure", or "passive income" in scripts, captions or product names.
4. **Every number is traceable.** Either it is formula math (`src/lib/compound.ts`, or a calculation written in `sources`) or it has a source URL in the script's `sources`. Return rates are always called an "assumption".
5. **Nothing is posted without the owner's approval.** `schedule.ts` defaults to a dry run. `--live` creates Metricool drafts. `--live --approved` actually schedules, and only after the owner has approved that exact video.
6. **Never post a `--preview` render.** Previews use estimated timings and a red safe-zone overlay. `schedule.ts` refuses them.
7. No secrets in the repo. Keys live in `.env` (gitignored); see `.env.example`.

## Pipeline
```
content/scripts/vs-NNN.json            # 1 script = 1 video (schema: scripts/lib.ts)
  └─ npm run voice -- <script>         # ElevenLabs with-timestamps → public/audio/<id>.mp3 + public/captions/<id>.json
  └─ npm run render -- <script>        # Remotion → public/renders/<id>.mp4 + <id>.meta.json
       (--preview: no voice needed; estimated timings + safe-zone overlay; for layout checks only)
  └─ npm run schedule -- public/renders/<id>.meta.json --media-url <https> --start YYYY-MM-DDTHH:mm:ss
       # TikTok T, IG Reel T+45m, YT Short T+90m via Metricool REST (Advanced plan)
```
For audio we didn't generate (e.g. a re-record), use `pip install -r scripts/requirements.txt`, then `python3 scripts/transcribe.py --audio … --output public/captions/<id>.json`.

Script status flow: `draft → approved → rendered → scheduled → posted`. Update `status` in the JSON at each step.

## Canvas and safe zone
- Master: 1080×1920, 30 fps, 9:16.
- All text/UI goes inside the `<SafeZone>` box: **X 60–900, Y 220–1440** (right 180 px and bottom 480 px are platform UI). Never position against the raw canvas.
- Type minimums: captions 48 px (engine uses 76), hook 72 px.
- Check a new layout with `npx remotion still src/index.ts MainShort out/f.png --frame=N --props='{"showSafeZone":true}'`. Nothing may sit in the red area.

## Encoding (set in remotion.config.ts + scripts/render.ts)
- H.264, yuv420p (bt709, TV range), CRF 18. Simple motion-graphics renders come out around 1–2 Mbps, which is expected. Footage-heavy renders run higher.
- Audio: AAC-LC 48 kHz stereo 192 kbps, loudness-normalized to **-14 LUFS** (`loudnorm`) on real renders.
- `-movflags +faststart` (moov before mdat) and `-map_metadata -1` (strip metadata).
- ffmpeg comes bundled: `npx remotion ffmpeg …` / `npx remotion ffprobe …`. No system ffmpeg needed.
- Fonts are vendored in `public/fonts` (Inter, OFL). Renders must not depend on the network.

## Platform rules that shape content (verified 2026-09-24, re-check quarterly)
- Instagram recommends only originals: never upload a file downloaded from another platform, only our own master. Reels up to 3 min get recommended.
- YouTube demonetizes mass-produced, templated AI content. Rotate formats (chart / list / avatar), keep every video genuinely educational, and have a human read every script.
- ManyChat comment trigger → **one** private reply within 7 days. The DM must deliver the link in that single message.

## Commands
- `npm run studio` — live preview
- `npm run typecheck`
- `npm run render -- content/scripts/vs-001.json --preview`
