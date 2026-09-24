#!/usr/bin/env python3
"""
Fallback word-level alignment for audio that did NOT come from `npm run voice`
(e.g. an uploaded or re-recorded voiceover). ElevenLabs with-timestamps is the default path.

Usage: python3 scripts/transcribe.py --audio public/audio/vs-001.mp3 --output public/captions/vs-001.json
Output shape matches scripts/voiceover.ts: {"source", "durationMs", "captions": [{text,startMs,endMs}]}
"""
import argparse
import json
import os
import sys


def transcribe(audio_path: str, output_path: str, model_size: str) -> None:
    if not os.path.exists(audio_path):
        sys.exit(f"Audio not found: {audio_path}")
    from faster_whisper import WhisperModel  # imported late so --help works without the dependency

    cuda = os.environ.get("USE_CUDA") == "1"
    model = WhisperModel(model_size, device="cuda" if cuda else "cpu", compute_type="float16" if cuda else "int8")
    segments, info = model.transcribe(
        audio_path,
        language="en",
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 200},
    )

    words = []
    for segment in segments:  # generator: transcription runs while iterating
        for w in segment.words or []:
            text = w.word.strip()
            if text:
                words.append({"text": text, "startMs": int(w.start * 1000), "endMs": int(w.end * 1000)})

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"source": "faster-whisper", "durationMs": int(info.duration * 1000), "captions": words}, f, indent=2)
    print(f"✅ {len(words)} words -> {output_path}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="faster-whisper word alignment")
    p.add_argument("--audio", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--model", default="small.en")
    a = p.parse_args()
    transcribe(a.audio, a.output, a.model)
