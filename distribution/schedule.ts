/**
 * Staggered tri-platform scheduling via Metricool REST API (Advanced/Custom plan only).
 * Field names verified against https://app.metricool.com/api/swagger.json on 2026-09-24.
 *
 * Usage:
 *   npm run schedule -- public/renders/vs-001.meta.json --media-url https://... --start 2026-10-01T12:00:00 [--tz America/New_York]
 *     -> DRY RUN (default): prints the 3 payloads, sends nothing.
 *   add --live            -> creates them in Metricool as DRAFTS (draft:true), nothing publishes.
 *   add --live --approved -> schedules for real. Only after the owner approved this exact video.
 *
 * Stagger: TikTok at T, Instagram Reel at T+45m, YouTube Short at T+90m.
 * Every post carries the platform AI-content flag (required for an AI character).
 */
import * as fs from 'node:fs';
import { loadEnv } from '../scripts/lib';

type Meta = { id: string; preview: boolean; caption: string; youtubeTitle: string; aiGenerated: boolean };

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const flag = (name: string) => process.argv.includes(`--${name}`);

// Add minutes to a local wall-clock "YYYY-MM-DDTHH:mm:ss" string (timezone is sent separately).
const addMinutes = (local: string, mins: number) => {
  const d = new Date(`${local}Z`);
  d.setUTCMinutes(d.getUTCMinutes() + mins);
  return d.toISOString().slice(0, 19);
};

export const buildPosts = (meta: Meta, mediaUrl: string, start: string, timezone: string, draft: boolean) => {
  const base = { text: meta.caption, media: [mediaUrl], draft, autoPublish: true, shortener: false };
  return [
    {
      ...base,
      providers: [{ network: 'tiktok' }],
      publicationDate: { dateTime: start, timezone },
      tiktokData: { privacyOption: 'PUBLIC_TO_EVERYONE', isAigc: true, disableComment: false, disableDuet: false, disableStitch: false },
    },
    {
      ...base,
      providers: [{ network: 'instagram' }],
      publicationDate: { dateTime: addMinutes(start, 45), timezone },
      instagramData: { type: 'REEL', showReelOnFeed: true, isAiGenerated: true },
    },
    {
      ...base,
      providers: [{ network: 'youtube' }],
      publicationDate: { dateTime: addMinutes(start, 90), timezone },
      youtubeData: { type: 'short', title: meta.youtubeTitle.slice(0, 100), privacy: 'public', madeForKids: false, isAiGeneratedContent: true },
    },
  ];
};

async function main() {
  loadEnv();
  const metaPath = process.argv[2];
  const mediaUrl = arg('media-url');
  const start = arg('start');
  const tz = arg('tz') || 'America/New_York';
  const live = flag('live');
  const approved = flag('approved');

  if (!metaPath || !fs.existsSync(metaPath)) throw new Error('Usage: npm run schedule -- public/renders/<id>.meta.json --media-url <public https url> --start YYYY-MM-DDTHH:mm:ss');
  if (!mediaUrl?.startsWith('https://')) throw new Error('--media-url must be a public https URL to the final MP4 (Metricool fetches it).');
  if (!start || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(start)) throw new Error('--start must look like 2026-10-01T12:00:00');

  const meta: Meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  if (meta.preview) throw new Error('This is a PREVIEW render (estimated timings, safe-zone overlay). Render the real master first.');
  if (!meta.aiGenerated) throw new Error('meta.aiGenerated must be true for Vance Sterling content.');

  const posts = buildPosts(meta, mediaUrl, start, tz, !approved);
  if (!live) {
    console.log(JSON.stringify(posts, null, 2));
    console.log('\nDRY RUN — nothing sent. Add --live to create drafts in Metricool.');
    return;
  }

  const { METRICOOL_USER_TOKEN: token, METRICOOL_USER_ID: userId, METRICOOL_BLOG_ID: blogId } = process.env;
  if (!token || !userId || !blogId) throw new Error('Missing METRICOOL_USER_TOKEN / METRICOOL_USER_ID / METRICOOL_BLOG_ID (see .env.example).');

  for (const post of posts) {
    const url = `https://app.metricool.com/api/v2/scheduler/posts?userId=${encodeURIComponent(userId)}&blogId=${encodeURIComponent(blogId)}`;
    const res = await fetch(url, { method: 'POST', headers: { 'X-Mc-Auth': token, 'Content-Type': 'application/json' }, body: JSON.stringify(post) });
    const body = await res.text();
    if (!res.ok) throw new Error(`Metricool ${res.status} on ${post.providers[0].network}: ${body}`);
    console.log(`✅ ${post.providers[0].network} ${approved ? 'scheduled' : 'draft'} for ${post.publicationDate.dateTime} ${tz}`);
  }
}

if (require.main === module) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
