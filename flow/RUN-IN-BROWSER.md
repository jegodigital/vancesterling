# Run Flow with Claude in Chrome (session on the owner's computer)

Use this from a Claude session running **on the owner's computer** (Claude Desktop app or `claude` in a terminal) with the **Claude in Chrome** extension connected. Cloud sessions can't reach the browser.

Tell Claude: **"Follow flow/RUN-IN-BROWSER.md for vs-001."**

## What Claude does
1. `git pull` on branch `claude/inspiring-cray-t4xj6n` and read `CLAUDE.md`, `flow/FLOW-SETUP.md` and `flow/prompts/<id>.md`.
2. In Chrome, open a new tab at https://labs.google/flow (the owner is already signed in).
3. **One-time setup (skip once a project "Vance Sterling" with Character "Vance" exists):** follow `flow/FLOW-SETUP.md` steps 1–3.
   - Make 2 images with Nano Banana Pro, 9:16.
   - **Stop and show the owner both faces before creating the Character.** The face is a brand decision, and it must not resemble a real person.
   - Then create Character **Vance** with the voice description from the setup file.
4. Set the video settings: Omni Flash 720p · 9:16 · outputs 1 · length per shot · the negative prompt from the shot list.
5. For each shot in `flow/prompts/<id>.md`, paste the prompt and generate. Then watch the clip and **re-roll** it (max 2 re-rolls, then flag it) if:
   - there is burned-in text or subtitles,
   - the face doesn't match Vance,
   - a word is wrong or missing, or
   - there is more than one person.
6. Download each keeper and save it to `public/flow/<id>/shot-NN.mp4`. Also copy it to Drive → `Vance Sterling/flow/<id>/`, folder id is in `CLAUDE.md`.
7. Run `pip install -r scripts/requirements.txt` (first time only), then `npm run edit -- content/scripts/<id>.json`.
   - If any shot says REGENERATE, go back to step 5 for that shot only.
8. Run `npm run render -- content/scripts/<id>.json --flow`, then upload `public/renders/<id>.mp4` to Drive → `Vance Sterling/renders (for your review)`.
9. Report to the owner: the credits used, the clips re-rolled, the final length, and the Drive link.

## Hard limits
- Stay under **150 Flow credits per video**. If a video needs more, stop and ask.
- Never publish, schedule or share anything. The owner approves every video first.
- Don't change Flow account, billing or plan settings. The only exception is the "Visible watermarking" toggle in `flow/FLOW-SETUP.md` step 1.
