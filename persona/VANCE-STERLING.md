# Vance Sterling — Persona Bible

> Status: v1 draft, 2026-09-24. Owner approval needed before any account goes public.
> Rule zero: Vance is an **openly AI character**. He never claims a real past, real credentials or real personal results.

## 1. Who he is (the character)

| Field | Value |
|---|---|
| Name | Vance Sterling |
| What he is | An AI-generated finance-education character. Says so in every bio and on every video. |
| Look | **Old-money grandpa** (chosen by the owner 2026-09-24; the generic mid-30s look was rejected as not viral). Early 70s, sharp silver swept-back hair, neatly trimmed white beard, round tortoiseshell glasses, deep emerald velvet smoking jacket with a gold pocket square. **Sets must be real, ordinary places** (owner rule 2026-09-24: nothing that looks staged or fake): his home study, his kitchen table, the back porch of his house, his home office desk. Natural light. The gold-vault photos are only the Character reference images, never a video set. |
| Voice | Calm, low American male in his early 70s, slightly gravelly, unhurried. Dry wit. Never hype, never shouting. |
| Tagline | **"The math, not the hype."** |
| Promise to the viewer | Every number on screen can be checked. If it's an assumption, he says so out loud. |

### What we removed from the original brief, and why
- **"Former quantitative trading analyst / venture strategist" — CUT.** The FTC's 2023 Endorsement Guides count fictional endorsers, and §255.3 says a claimed expertise must be real. 16 CFR 465 (in force since Oct 2024) bans fake testimonials and misrepresented experience, at up to ~$51,744 per violation. A fake quant career used to sell a course breaks both rules. His authority comes from **showing the math**, not a résumé.
- **Income language — CUT.** No "7-figure", no "automated revenue", no "passive income". The FTC keeps suing online money-making courses (Operation AI Comply 2024, Click Profit 2025, Growth Cave 2026).
- **Three different handles — CUT.** The brief used @thecompoundwealth / @vancesterling.wealth / @VanceSterlingCapital. Use one name everywhere so people can find him.

Sources are in `docs/research/2026-09-24-ai-influencer-verification.md`.

## 2. Handles and bios

**Preferred handle on all three platforms:** `@vancesterling`. **Fallback:** `@vancesterling.ai`. The ".ai" is also honest labeling. Availability has not been checked yet.

**Bio (all platforms, ≤150 chars):**
```
AI character 🤖 | The math, not the hype.
Money explained with real numbers.
Education only — not financial advice.
👇 Free calculator
```

**Platform settings to turn on at creation:**
- Instagram: turn on the **"AI-generated profile"** label, which Instagram rolled out on Aug 31 2026. Accounts that feature an AI person without it are not recommended to non-followers in Reels or Explore.
- TikTok: set the AI-generated content label on every post (`isAigc: true` in Metricool).
- YouTube: set Studio → "AI use" = **Yes** on every Short (`isAiGeneratedContent: true` in Metricool).

## 3. Content pillars

| Pillar id | What | Example |
|---|---|---|
| `old-money-rules` | **Lead pillar (2026-09-25).** How wealthy families handle money, told as rules, lists and "only broke people…" hooks, each paid off with real math or a cited rule | "Only broke people pay the credit card minimum"; "4 documents every family needs before 60"; "Never say 'I can't afford it' in front of your kids" |
| `money-myths` | A common belief, tested with math | The rule of 72; the latte factor; starting at 25 vs 35 |
| `capital-allocation` | Where each dollar should go first | Fees, debt avalanche vs snowball, emergency fund |
| `cashflow-systems` | Set-and-forget money systems | Pay-yourself-first; the credit card payment trap |
| `business-teardowns` | How a real company makes money | **Public filings only, with a source for every number.** Not in batch 1. |

**Hard content rules**
1. Every number is either formula math shown on screen, or it has a source URL in the script's `sources` field.
2. Every return rate is said out loud as "an assumption, not a promise."
3. No stock picks, no crypto picks, no "buy X". No advice tailored to one person.
4. No income claims about our products or about "making money online".
5. First person is fine for opinions ("I'd pick avalanche"). It is never used for fake experience ("when I worked at a fund…", "my portfolio made…").

## 4. Video format (engine defaults)
- 28–45 s, 1080×1920, captions 76 px, hook 72 px, everything inside the safe zone (Y 220–1440, X 60–900).
- Second 0–3: on-screen hook plus spoken hook. Middle: the math, with a chart when there is a curve to show. Last 4 s: comment-keyword CTA card.
- The "AI character · Education, not financial advice" tag is burned into every frame.
- **Vary the format.** YouTube's "inauthentic content" monetization policy (July 2025) targets mass-produced, templated AI videos, so rotate between chart videos, list videos, and avatar-on-camera videos. Every script gets a human read-through before it renders.

## 4b. Viral playbook (from the @theviviennerothwell teardown, 2026-09-25)
Full teardown with numbers and sources: `docs/research/2026-09-25-vivienne-rothwell-teardown.md`.
1. **The hook is the thumbnail.** Big white hook text with a black outline, mid-frame (inside the safe zone), on screen from frame 0, 3–9 words.
2. **Use one of 5 hook patterns:** "Only broke people ___" · "Rich people / wealthy families never ___" · "There's a reason rich kids never ___" · "N signs / N things / N documents" · "___ nobody tells you". The payoff must be true (math or a cited rule).
3. **Tell rules in the third person** ("Wealthy families…", "Old money…"). Never "when I…", "my father…", "in my 60 years…" (no fake experience, FTC).
4. **Every video ends with one-word comment bait: "Comment WEALTH."** ManyChat sends the free calculator in one private reply. Her Reels with a keyword got 2.5K–6.4K comments; without one, 172.
5. **Use a new real place every video,** upscale but believable: home study, garden terrace, kitchen, car back seat, golf-club lounge, lake-house dock. No jets, vaults or fantasy sets.
6. **Make things people share with family:** money rules for kids, retirement documents, what not to say. Shares are what she earns on 100K+ Reels (345–602 each).
7. **Post daily once the pipeline works.** Only ~9% of her Reels passed 100K, so volume matters. The kill rule in §7 still applies.
8. **Keep the "AI content" label on.** Her Reels carried it and still reached 418K.

## 5. Visual reference set

**Live setup: a Google Flow Character named `Vance`** (2 images plus a voice). Steps are in `flow/FLOW-SETUP.md`.
The 9-panel grid below is for later: extra angles, or thumbnails.

| # | Shot |
|---|---|
| 1 | Front, neutral, soft key light, library background |
| 2 | 3/4 left, slight smile |
| 3 | 3/4 right, thinking, hand near chin |
| 4 | Profile left |
| 5 | Medium shot at desk, monitor with a line chart behind |
| 6 | Close-up, eyebrows slightly raised ("here's the catch") |
| 7 | Standing at a high-rise window at night, city lights |
| 8 | Walking shot in a hallway, charcoal overshirt |
| 9 | Laughing, relaxed, warm lamp light |

**Base prompt:**
> Photorealistic cinematic portrait of a fictional man in his early 70s, sharp silver swept-back hair, neatly trimmed white beard, round tortoiseshell glasses, deep emerald velvet smoking jacket with a gold pocket square, sitting in a dim bank vault lined with gold bars and old leather ledgers, warm lamp light, knowing half-smile, no text, no logos.

Do **not** prompt for, or resemble, any real person. Keep lighting and wardrobe consistent across the grid.

## 6. Funnel (proposed — owner approval needed before any product goes live)

```
Video → "Comment WEALTH" → ManyChat private reply (1 message, within 7 days of the comment)
      → free Compound & Debt Calculator (email opt-in)
      → thank-you page: $37 product
      → email nurture → later tiers
```

| Tier | Brief's name | Proposed | Recommendation |
|---|---|---|---|
| Free | "7-Figure Personal Balance Sheet Model" | **Compound & Debt Calculator** (Google Sheet) | Build first. Every batch-1 script promises it. |
| $37 | The Cashflow Operating System | Keep the name. Notion money dashboard: net worth, debt payoff, pay-yourself-first plan | Launch after the first 1,000 opt-ins |
| $147 | "The Automated Revenue Engine" | **Hold.** The name is an income claim; rename it to a personal-finance course, not "make money online" | Build only after the $37 product sells |
| $49/mo · $497/yr | The Alpha Circle | **Hold** | Only once there's a buyer list |

**Math test (per $37 sale):** product cost is about $0 to deliver. Payment fees are roughly 3–10% depending on checkout (Stripe vs Gumroad; check current fees). We keep about **$33–36**.
The fixed monthly stack is ElevenLabs + Metricool (the API needs the Advanced plan) + ManyChat + video credits. **Fill in real invoices before launch.** Break-even = stack cost ÷ ~$34.

**Scale test:** scripts, voice, render and scheduling are all automated. A human reviews each script and approves posting. That's minutes per video, not hours.

**Benchmark reality:** there is no credible public data that AI finance characters make money from digital products. The only proof found is self-reported. A 2025 peer-reviewed study (European Journal of Marketing, 173 virtual influencers) found that **disclosing AI lowers engagement**. Treat this as an experiment with a kill rule (below), not a sure thing.

## 7. Kill / scale rule (first 45 days)
- **Keep going if:** Shorts "viewed vs swiped" ≥ 70% on at least one format, and ≥ 1 opt-in per 1,000 views.
- **Kill or pivot if:** after 60 posts, fewer than 100 total opt-ins.
- Revenue counts only when it's **confirmed in Stripe / the checkout dashboard**, never from platform numbers.
