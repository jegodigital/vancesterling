# Vance Sterling

An openly AI finance-education character — **"The math, not the hype."**
This repo is the character's persona bible plus an automated short-video engine (script → voice → Remotion render → Metricool schedule).

| What | Where |
|---|---|
| Persona, handles, bios, visual prompts, funnel, kill rule | `persona/VANCE-STERLING.md` |
| Research fact-check with sources | `docs/research/2026-09-24-ai-influencer-verification.md` |
| First 8 scripts (drafts, need approval) | `content/scripts/vs-001…008.json` |
| Engine rules | `CLAUDE.md` |

Quick start:
```bash
npm install
npm run render -- content/scripts/vs-001.json --preview   # layout preview, no keys needed
cp .env.example .env                                      # add ElevenLabs + Metricool keys
npm run voice  -- content/scripts/vs-001.json
npm run render -- content/scripts/vs-001.json
```
