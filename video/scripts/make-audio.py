"""Original bed + UI clicks for the Remotion film. No samples, no voice."""
import array
import json
import math
import random
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CUES = json.loads((ROOT / "src" / "cues.json").read_text())
SR = 44100
N = SR * int(CUES["durationSec"])
rng = random.Random(1042)


def midi(m: float) -> float:
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


bed = array.array("f", [0.0] * N)


def add(buf: array.array, i: int, v: float) -> None:
    if 0 <= i < len(buf):
        buf[i] += v


def hit(buf: array.array, t0: float, freq: float, amp: float, decay: float) -> None:
    start = int(t0 * SR)
    length = int(min(4.5, decay * 3) * SR)
    for n in range(length):
        t = n / SR
        if t < 0.03:
            att = t / 0.03
        else:
            att = math.exp(-(t - 0.03) / decay)
        s = 0.0
        for h, w in ((1, 1.0), (2, 0.32), (3, 0.12), (4, 0.05), (6, 0.02)):
            s += math.sin(2 * math.pi * freq * h * t) * w
        add(buf, start + n, s * att * amp)


# 72 bpm, a new chord every 8 beats. Quiet, close, no melody fighting the picture.
BEAT = 60.0 / 72.0
CHORDS = [
    (45, 60, 64),  # Am
    (41, 57, 65),  # F
    (43, 55, 60),  # C/E
    (43, 55, 59),  # G
    (45, 60, 64),
    (41, 57, 65),
    (38, 57, 62),  # Dm
    (40, 59, 64),  # E, a little tension under the stamp
    (45, 60, 64),
    (41, 57, 65),
    (43, 55, 60),
    (43, 55, 59),
    (45, 60, 64),
    (41, 57, 65),
    (45, 60, 64),
    (45, 52, 60),  # hold
]
for i, notes in enumerate(CHORDS):
    t0 = i * 8 * BEAT
    if t0 >= CUES["durationSec"]:
        break
    for m in notes:
        hit(bed, t0, midi(m), 0.055, 2.4)
    hit(bed, t0, midi(notes[0] - 12), 0.03, 3.2)
    # a softer answer on beat 5, so the bed keeps moving under long holds
    for m in notes:
        hit(bed, t0 + 4 * BEAT, midi(m), 0.022, 1.6)

# Stamp hits duck the piano so the thud reads.
for c in CUES["clicks"]:
    if c["kind"] != "stamp":
        continue
    a = int(c["frame"] / CUES["fps"] * SR)
    b = min(N, a + int(0.45 * SR))
    for i in range(max(0, a), b):
        bed[i] *= 0.5


def burst(buf: array.array, t0: float, kind: str) -> None:
    start = int(t0 * SR)
    if kind == "ui":
        length = int(0.045 * SR)
        for n in range(length):
            t = n / SR
            env = math.exp(-t * 70)
            v = math.sin(2 * math.pi * 1650 * t) * 0.45
            v += (rng.random() * 2 - 1) * math.exp(-t * 120) * 0.35
            add(buf, start + n, v * env)
    elif kind == "tick":
        length = int(0.03 * SR)
        for n in range(length):
            t = n / SR
            env = math.exp(-t * 90)
            v = math.sin(2 * math.pi * 2100 * t) * 0.22
            add(buf, start + n, v * env)
    elif kind == "stamp":
        length = int(0.28 * SR)
        for n in range(length):
            t = n / SR
            env = math.exp(-t * 9)
            v = math.sin(2 * math.pi * 78 * t) * 0.9
            v += math.sin(2 * math.pi * 155 * t) * 0.28
            v += (rng.random() * 2 - 1) * math.exp(-t * 28) * 0.45
            add(buf, start + n, v * env)
    elif kind == "send":
        length = int(0.16 * SR)
        for n in range(length):
            t = n / SR
            env = math.exp(-t * 14)
            v = math.sin(2 * math.pi * 660 * t) * 0.28
            v += math.sin(2 * math.pi * 990 * t) * 0.16
            add(buf, start + n, v * env)


clicks = array.array("f", [0.0] * N)
for c in CUES["clicks"]:
    burst(clicks, c["frame"] / CUES["fps"], c["kind"])

peak = 1e-9
delay = int(0.012 * SR)
for i in range(N):
    bed_s = bed[i]
    clk = clicks[i]
    if i < int(1.2 * SR):
        g = i / (1.2 * SR)
    elif i > N - int(2.5 * SR):
        g = max(0.0, (N - i) / (2.5 * SR))
    else:
        g = 1.0
    left = (bed_s + clk) * g
    src = bed[i - delay] if i >= delay else 0.0
    right = (src * 0.85 + bed_s * 0.15 + clk) * g
    peak = max(peak, abs(left), abs(right))

out = array.array("h")
scale = 0.89 / peak
for i in range(N):
    if i < int(1.2 * SR):
        g = i / (1.2 * SR)
    elif i > N - int(2.5 * SR):
        g = max(0.0, (N - i) / (2.5 * SR))
    else:
        g = 1.0
    bed_s = bed[i]
    clk = clicks[i]
    left = (bed_s + clk) * g * scale
    src = bed[i - delay] if i >= delay else 0.0
    right = (src * 0.85 + bed_s * 0.15 + clk) * g * scale
    out.append(max(-32767, min(32767, int(left * 32767))))
    out.append(max(-32767, min(32767, int(right * 32767))))

dest = ROOT / "public" / "score.wav"
dest.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(dest), "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())
print(f"wrote {dest} peak-in {peak:.3f} scale {scale:.3f} clicks {len(CUES['clicks'])}")
