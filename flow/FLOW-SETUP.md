# Google Flow — Vance Sterling project setup

> One-time setup, about 20 minutes, done in your browser at labs.google/flow. After that, every video is: paste prompts → download clips → drop them in Drive → I edit.
> Facts checked 2026-09-24 against Google's Flow help pages (links at the bottom). If a button is named differently on your screen, tell me what you see.

## Step 1 — New project
1. In Flow, click **New project** and name it **Vance Sterling**.
2. Profile picture → turn **Visible watermarking** off. The invisible SynthID watermark always stays, and our "AI character" tag is burned into every frame anyway.

## Step 2 — Make Vance's face (2 images)
In the prompt box, pick the image model (**Nano Banana Pro**) and aspect ratio **9:16**. Generate these two images and keep the best of each.

**Image A — front, plain background**
```
Photorealistic portrait of a fictional man in his mid-30s, calm composed expression, short dark hair, neat light stubble, navy fine-knit sweater over an open-collar white shirt, facing the camera straight on, plain soft grey studio background, even soft light, 85mm, natural skin texture, no text, no logos.
```

**Image B — 3/4 angle, same man**
Use Image A as the ingredient, then:
```
The same man, three-quarter view turned slightly to his left, slight confident smile, same clothes, same hair, same plain soft grey background, same lighting, photorealistic, no text.
```
He must not look like any real person. If he does, re-roll.

## Step 3 — Create the Character "Vance"
1. Create a **Character** from Image A and Image B. Name it exactly **Vance**; the prompts call him with `@Vance`.
2. Voice: start from a male preset, then add this description:
   > Calm, low-mid American male voice, mid-30s. Measured pace, clear and warm, confident but never hype. Sounds like a smart friend explaining money.
3. Save it. From now on, `@Vance` locks his face, clothes and voice.

## Step 4 — Video settings (set these once per session)
Click the model name in the prompt box:
- Model: **Omni Flash 720p**. It's the only model that uses Character voices. Use 360p for cheap drafts if you like.
- Aspect ratio: **9:16**
- Outputs: **1**
- Length: as listed on each shot (4 / 6 / 8 / 10 s)
- Negative prompt: `subtitles, captions, on-screen text, logos, watermark text, music, extra people`

## Step 5 — Make a video
1. Open the shot list, e.g. `flow/prompts/vs-001.md`, which has 8 shots and costs about 90 credits.
2. Paste each shot prompt, one clip per shot.
3. Re-roll any clip that has burned-in text, a different face, or a wrong or missing word.
4. Download each keeper and name it `shot-01.mp4`, `shot-02.mp4`, … in order.
5. Drop them into Drive → **Vance Sterling / flow / vs-001**.
6. Tell me "vs-001 clips are in". I pull them, cut the dead air with Whisper, add captions, chart and CTA in Remotion, check the audio loudness, and put the finished video in **Vance Sterling / renders (for your review)**.

## Credit math (Pro plan)
- Omni Flash 720p costs 7 / 10 / 12 / 15 credits for 4 / 6 / 8 / 10 s clips.
- One video is roughly 7–10 shots, so about **70–110 credits with 1 take each**, and double that if you re-roll everything.
- Pro includes 1,000 credits a month plus 50 free a day. That's about **15–25 videos a month**.

## Sources
- Credits and models: https://support.google.com/flow/answer/16526234
- Aspect ratio, ingredients and models: https://support.google.com/flow/answer/16352836 · https://support.google.com/flow/answer/16353334
- Characters: https://support.google.com/flow/answer/16935308
- Watermark: https://support.google.com/flow/answer/16353333
