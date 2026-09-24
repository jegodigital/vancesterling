import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';

// One script = one video. Lives in content/scripts/<id>.json.
export const scriptSchema = z.object({
  id: z.string().regex(/^vs-\d{3}$/),
  pillar: z.enum(['cashflow-systems', 'capital-allocation', 'business-teardowns', 'money-myths']),
  status: z.enum(['draft', 'approved', 'rendered', 'scheduled', 'posted']),
  hook: z.string().max(40), // on-screen, first 3s
  voiceover: z.string(), // exactly what gets spoken
  chart: z
    .object({ start: z.number(), monthly: z.number(), ratePct: z.number(), years: z.number(), label: z.string(), fromMs: z.number(), toMs: z.number() })
    .optional(),
  ctaKeyword: z.string(),
  ctaText: z.string(),
  caption: z.string(), // post text (all platforms)
  youtubeTitle: z.string().max(100),
  hashtags: z.array(z.string()).max(5),
  sources: z.array(z.string()), // every number in the script must trace to one of these (or to on-screen math)
  backgroundVideoSrc: z.string().optional(),
});
export type Script = z.infer<typeof scriptSchema>;

export const readScript = (file: string): Script => scriptSchema.parse(JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8')));

// Minimal .env loader (no dependency). Real env vars win.
export const loadEnv = (file = '.env') => {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
};
