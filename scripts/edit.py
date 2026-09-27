#!/usr/bin/env python3
"""
Flow clips -> tight edit. Whisper decides WHERE the words are (so breaths, lip noise and room tone
drop out); the audio level gives the exact cut points and the real pauses.
Whisper also supplies the captions and a check that each shot said its line.

Usage:
  python3 scripts/edit.py --script content/scripts/vs-001.json
    reads   public/flow/<id>/shot-01.mp4, shot-02.mp4, ...   (downloaded from Google Flow, in order)
    writes  public/edits/<id>.json  -> segments to play + captions on the output timeline + per-shot QA

Rules (see CLAUDE.md):
  - speech = 20 ms windows louder than max(-45 dBFS, clip peak - 35 dB) that overlap a Whisper word;
    sound with no word in it (breath, click, room tone) is cut
  - keep LEAD_MS before the first word and TAIL_MS after the last word of each shot
  - any pause longer than MAX_GAP_MS is cut down to KEEP_GAP_MS; cuts land in silence, never mid-word
  - each shot's transcript is compared with the line it was supposed to say;
    below MIN_MATCH the shot is flagged REGENERATE (Veo garbled or cut off the line)
"""
import argparse
import difflib
import glob
import json
import os
import re
import sys

LEAD_MS = 60  # before the first word of a shot
TAIL_MS = 140  # after the last word of a shot
MAX_GAP_MS = 250  # pauses longer than this get shortened (2026-09-26: was 400 -> 2 s dead spots survived)
KEEP_GAP_MS = 140  # ...to this
MIN_MATCH = 0.80


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n: int) -> str:
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    for size, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand"), (100, "hundred")):
        if n >= size:
            rest = n % size
            return f"{num_words(n // size)} {name}" + (f" {num_words(rest)}" if rest else "")
    return str(n)


def norm(text: str) -> list[str]:
    """Compare what was said, not how Whisper spelled it: '$72,000' == 'seventy-two thousand dollars'."""
    t = text.lower().replace("-", " ")
    t = re.sub(r"(\d)\s*,\s*(\d{3})", r"\1\2", t)  # 72 ,000 -> 72000
    t = re.sub(r"\$(\d+)", lambda m: f"{m.group(1)} dollars", t)
    t = t.replace("%", " percent")
    t = re.sub(r"\d+", lambda m: num_words(int(m.group(0))), t)
    return re.sub(r"[^a-z' ]+", " ", t).replace("'", "").split()


def punctuate(caps, line):
    """Copy the script line's sentence ends onto Whisper's caption words (Whisper drops a period
    when the pause after it is short, so caption pages ran across sentences: "MONEY STARTS 30")."""
    exp, ends = [], []
    for word in line.split():
        toks = norm(word)
        if toks:
            exp += toks
            ends += [None] * (len(toks) - 1) + [word[-1] if word[-1] in ".!?" else None]
    cap, owner = [], []
    for ci, c in enumerate(caps):
        for t in norm(c["text"]):
            cap.append(t)
            owner.append(ci)
    for a, b, n in difflib.SequenceMatcher(None, cap, exp, autojunk=False).get_matching_blocks():
        for k in range(n):
            mark, ci = ends[b + k], owner[a + k]
            if mark and (a + k + 1 == len(owner) or owner[a + k + 1] != ci):
                caps[ci]["text"] = re.sub(r"[,;:.!?]$", "", caps[ci]["text"]) + mark


def speech_ranges(path: str):
    """Loud-enough regions of the clip's audio, in ms. Returns (ranges, clip_ms)."""
    import numpy as np
    from faster_whisper.audio import decode_audio

    audio = decode_audio(path, sampling_rate=16000)
    clip_ms = int(len(audio) / 16)
    win = 320  # 20 ms
    n = len(audio) // win
    if n == 0:
        return [], clip_ms
    rms = np.sqrt(np.mean(audio[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    thresh = max(-45.0, float(db.max()) - 35.0)
    loud = db > thresh
    ranges, start = [], None
    for i, on in enumerate(loud):
        if on and start is None:
            start = i
        if not on and start is not None:
            ranges.append([start * 20, i * 20])
            start = None
    if start is not None:
        ranges.append([start * 20, n * 20])
    # Merge sub-gap blips (plosives, breaths inside words) and drop clicks shorter than 60 ms.
    merged = []
    for r in ranges:
        if merged and r[0] - merged[-1][1] <= MAX_GAP_MS:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    return [r for r in merged if r[1] - r[0] >= 60], clip_ms


def transcribe(model, path: str):
    segments, info = model.transcribe(path, language="en", word_timestamps=True, vad_filter=True)
    words = []
    for seg in segments:
        for w in seg.words or []:
            t = w.word.strip()
            if not t:
                continue
            # Whisper splits "$72,000" into "$72" + ",000": glue fragments back onto the previous word.
            if words and re.match(r"^[,.]?\d|^[^\w$]+$", t) and not re.match(r"^\d", t):
                words[-1]["text"] += t
                words[-1]["endMs"] = int(w.end * 1000)
                continue
            words.append({"text": t, "startMs": int(w.start * 1000), "endMs": int(w.end * 1000)})
    return words, int(info.duration * 1000)


def word_speech(words, loud):
    """Loud regions that contain a Whisper word. The audio level gives exact edges and real pauses
    (Whisper word timings run together and swallow pauses); Whisper tells us which sounds are words,
    so breaths, clicks and room tone after the line are dropped."""
    return [r for r in loud if any(w["startMs"] < r[1] and w["endMs"] > r[0] for w in words)]


def keep_ranges(speech, clip_ms):
    """Speech regions -> ranges to keep: padded at the shot edges, long pauses shrunk to KEEP_GAP_MS."""
    if not speech:
        return []
    half = KEEP_GAP_MS // 2
    out = []
    for i, (a, b) in enumerate(speech):
        start = max(0, a - (LEAD_MS if i == 0 else half))
        end = min(clip_ms, b + (TAIL_MS if i == len(speech) - 1 else half))
        out.append((start, end))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", required=True)
    ap.add_argument("--clips-dir")
    ap.add_argument("--model", default="small.en")
    a = ap.parse_args()

    script = json.load(open(a.script, encoding="utf-8"))
    sid = script["id"]
    clips_dir = a.clips_dir or f"public/flow/{sid}"
    clips = sorted(glob.glob(os.path.join(clips_dir, "shot-*.mp4")))
    if not clips:
        sys.exit(f"No clips in {clips_dir} (expected shot-01.mp4, shot-02.mp4, ...)")
    expected = [s["line"] for s in script.get("shots", [])]
    if expected and len(expected) != len(clips):
        print(f"⚠️  {len(clips)} clips but script has {len(expected)} shots — check nothing is missing.")

    from faster_whisper import WhisperModel  # late import so --help works without it

    model = WhisperModel(a.model, device="cpu", compute_type="int8")

    segments, captions, qa = [], [], []
    out_ms = 0
    for i, clip in enumerate(clips):
        words, _ = transcribe(model, clip)
        loud, clip_ms = speech_ranges(clip)
        speech = word_speech(words, loud)
        said = " ".join(w["text"] for w in words)
        want = expected[i] if i < len(expected) else ""
        match = difflib.SequenceMatcher(None, norm(said), norm(want)).ratio() if want else None
        verdict = "OK" if match is None or match >= MIN_MATCH else "REGENERATE"
        rel = os.path.relpath(clip, "public")
        kept = 0
        shot_first_caption = len(captions)
        ranges = keep_ranges(speech, clip_ms)
        # Every word goes to the kept range it overlaps most (nearest if none): Whisper's word edges
        # spill into the pauses, so a midpoint test used to drop words like "That's" at a cut.
        home = {}
        for wi, w in enumerate(words):
            ov = [min(w["endMs"], b) - max(w["startMs"], a) for a, b in ranges]
            best = max(range(len(ranges)), key=lambda k: ov[k]) if ranges else None
            if best is not None and ov[best] <= 0:
                best = min(range(len(ranges)), key=lambda k: min(abs(w["startMs"] - ranges[k][1]), abs(w["endMs"] - ranges[k][0])))
            home.setdefault(best, []).append(w)
        for k, (start, end) in enumerate(ranges):
            segments.append({"src": rel, "fromMs": start, "toMs": end})
            for w in home.get(k, []):
                ws = min(max(w["startMs"], start), end - 40)
                we = max(min(w["endMs"], end), ws + 40)
                captions.append({"text": w["text"], "startMs": out_ms + ws - start, "endMs": out_ms + we - start})
            out_ms += end - start
            kept += end - start
        if want:
            punctuate(captions[shot_first_caption:], want)
        # Each shot is its own sentence: Whisper often drops the final period at a clip end,
        # which made caption pages run across two shots ("TOTAL ASSUME A").
        if captions and words and not re.search(r"[.!?]$", captions[-1]["text"]):
            end_punct = want.strip()[-1:] if want.strip()[-1:] in ".!?" else "."
            captions[-1]["text"] = re.sub(r"[,;:]$", "", captions[-1]["text"]) + end_punct
        qa.append({
            "shot": os.path.basename(clip),
            "clipMs": clip_ms,
            "keptMs": kept,
            "cutMs": clip_ms - kept,
            "said": said,
            "expected": want,
            "match": None if match is None else round(match, 2),
            "verdict": verdict if words and speech else "REGENERATE (no speech found)",
        })

    os.makedirs("public/edits", exist_ok=True)
    out = f"public/edits/{sid}.json"
    json.dump({"id": sid, "durationMs": out_ms, "segments": segments, "captions": captions, "qa": qa}, open(out, "w"), indent=2)

    total = sum(q["clipMs"] for q in qa)
    print(f"{'shot':<14}{'clip':>7}{'kept':>7}{'match':>7}  verdict")
    for q in qa:
        m = "-" if q["match"] is None else f"{q['match']:.2f}"
        print(f"{q['shot']:<14}{q['clipMs']/1000:>6.1f}s{q['keptMs']/1000:>6.1f}s{m:>7}  {q['verdict']}")
    print(f"✅ {out}: {total/1000:.1f}s of clips -> {out_ms/1000:.1f}s edit ({(total-out_ms)/1000:.1f}s dead air cut)")
    if any(q["verdict"] != "OK" for q in qa):
        print("⚠️  Some shots need regenerating in Flow before the final render.")


if __name__ == "__main__":
    main()
