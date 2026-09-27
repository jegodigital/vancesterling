# Vance Sterling

An openly AI finance-education character — **"The math, not the hype."**
Vance is made on camera in **Google Flow**. This repo writes the Flow shot lists, cuts dead air from the clips (Whisper + audio level), finishes the video in Remotion, and schedules it through Metricool.

| What | Where |
|---|---|
| Persona, handles, bios, visual prompts, funnel, kill rule | `persona/VANCE-STERLING.md` |
| Research fact-check with sources | `docs/research/2026-09-24-ai-influencer-verification.md` |
| First 8 scripts (drafts, need approval) | `content/scripts/vs-001…008.json` |
| Flow project setup (one time) | `flow/FLOW-SETUP.md` |
| Flow shot lists, ready to paste | `flow/prompts/vs-001…008.md` |
| Free Wealth Calculator (the "Comment WEALTH" freebie), live at https://vancesterling-calculator.vercel.app | `calculator/index.html` |
| Viral teardown of @theviviennerothwell | `docs/research/2026-09-25-vivienne-rothwell-teardown.md` |
| Engine rules | `CLAUDE.md` |

Quick start:
```bash
npm install
npm run flow   -- content/scripts/vs-001.json             # Flow shot list
# ...generate clips in Flow → public/flow/vs-001/shot-01.mp4, shot-02.mp4, ...
pip install -r scripts/requirements.txt
npm run edit   -- content/scripts/vs-001.json             # cut dead air + captions + line check
npm run render -- content/scripts/vs-001.json --flow      # final master
# Faceless fallback:
cp .env.example .env                                      # add ElevenLabs + Metricool keys
npm run voice  -- content/scripts/vs-001.json
npm run render -- content/scripts/vs-001.json
```
