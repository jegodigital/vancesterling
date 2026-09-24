import { z } from 'zod';

export const captionWordSchema = z.object({ text: z.string(), startMs: z.number(), endMs: z.number() });

export const mainShortSchema = z.object({
  scriptId: z.string(),
  hook: z.string().max(60),
  captions: z.array(captionWordSchema),
  durationMs: z.number().positive(),
  voiceoverSrc: z.string().optional(), // path under public/, e.g. "audio/vs-001.mp3"
  musicSrc: z.string().optional(),
  musicVolume: z.number().min(0).max(1).default(0.08),
  backgroundVideoSrc: z.string().optional(), // single looping b-roll clip under public/; falls back to motion background
  // Flow edit (from scripts/edit.py): clips played back-to-back with dead air removed. Audio comes from the clips.
  segments: z.array(z.object({ src: z.string(), fromMs: z.number(), toMs: z.number() })).optional(),
  chart: z
    .object({
      start: z.number(),
      monthly: z.number(),
      ratePct: z.number(),
      years: z.number().int().positive(),
      label: z.string(),
      fromMs: z.number(),
      toMs: z.number(),
    })
    .optional(),
  ctaKeyword: z.string().optional(),
  ctaText: z.string().optional(),
  disclosure: z.string().default('AI character · Education, not financial advice'),
  showSafeZone: z.boolean().default(false),
});

export type MainShortProps = z.infer<typeof mainShortSchema>;
