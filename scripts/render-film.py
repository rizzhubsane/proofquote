"""Render the fallback 2-minute Proofquote film from app screenshots + a synthetic voice-over.

Needs: endterm/shots/*.png (node scripts/shots.mjs), macOS `say`, ffmpeg.
Writes: endterm/film-frames/scene-NN.png, endterm/film-vo.txt, endterm/Proofquote-launch-2min.mp4
"""
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "endterm" / "shots"
FRAMES = ROOT / "endterm" / "film-frames"
STILL = ROOT / "public" / "brand" / "launch-16x9.jpg"
OUT_MP4 = ROOT / "endterm" / "Proofquote-launch-2min.mp4"
VOICE = "Rishi"
RATE = "152"

W, H = 1920, 1080
INK = (28, 25, 20)
PAPER = (243, 239, 228)
CARD = (255, 253, 248)
MUTED = (106, 100, 88)
STAMP = (154, 31, 31)
OK = (31, 77, 58)

# (caption, voice-over, visual)
SCENES = [
    (
        "9:40 pm. Sharma wants the quote tonight.",
        "Nine forty at night. Ravi does inside sales at a steel distributor in Ambala. "
        "Sharma Traders wants four hundred kilos of M S angle and twenty litres of primer. "
        "Then a WhatsApp: twelve percent lagao, eighteen nahi chalega.",
        "still",
    ),
    (
        "The list says 18%. The draft says 12%.",
        "Ravi's price list says G S T eighteen percent. The draft he is about to send says twelve. "
        "It reads like a normal quote. Ask a chatbot to tidy it up, and the twelve comes back cleaner. "
        "And what is on the quote becomes the invoice.",
        "draft",
    ),
    (
        "Two inputs. The list is the only source of truth.",
        "Proofquote takes two things. This week's price list, which is the only source of truth. And the draft.",
        "app-paste",
    ),
    (
        "Every ₹, GST % and HSN must be on the list line.",
        "Press check. For every line in the draft, Proofquote finds the price list line for that item, "
        "and checks that every rupee amount, every G S T rate and every H S N code is on it. "
        "Four steps, in order, once. The lookup is plain code, not a model, "
        "so no prompt can talk it into twelve percent.",
        "app-check",
    ),
    (
        "12% isn't on the list line for MS angle.",
        "Three lines pass. Two don't. Twelve percent is not on the list line for M S angle. The list says eighteen. "
        "The fifteen percent festive scheme isn't there either. The list says no scheme this week.",
        "app-check-zoom",
    ),
    (
        "Remove it, or fix the list. Send stays shut.",
        "Proofquote never types eighteen in for you. Ravi removes the lines, "
        "or adds the missing line to the list if it is real. Until then, send stays shut.",
        "app-send",
    ),
    (
        "n8n emails the checked quote.",
        "Then n eight n emails the checked quote to the sales lead. "
        "Every rate sits next to the list line behind it, and what was removed is shown, struck through.",
        "email",
    ),
    (
        "Other tools write the quote. Proofquote checks it.",
        "Other tools write the quote. Proofquote checks it. No list, no rate.",
        "end",
    ),
]


def font(size, bold=False):
    names = (
        ["/System/Library/Fonts/Supplemental/Georgia Bold.ttf", "/Library/Fonts/Georgia Bold.ttf"]
        if bold
        else ["/System/Library/Fonts/Supplemental/Georgia.ttf", "/Library/Fonts/Georgia.ttf"]
    )
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def caption(im, text, label):
    d = ImageDraw.Draw(im, "RGBA")
    d.rectangle((0, H - 170, W, H), fill=INK + (235,))
    d.text((90, H - 140), text, font=font(52, True), fill=PAPER)
    d.text((90, H - 62), label, font=font(22), fill=(170, 162, 148))


def fit(path, box_w, box_h):
    im = Image.open(path).convert("RGB")
    im.thumbnail((box_w, box_h), Image.LANCZOS)
    return im


def on_paper(shot, crop=None, label="Screen capture of the working app"):
    im = Image.new("RGB", (W, H), PAPER)
    src = Image.open(SHOTS / f"{shot}.png").convert("RGB")
    if crop:
        src = src.crop(crop)
    src.thumbnail((W - 180, H - 230), Image.LANCZOS)
    x = (W - src.width) // 2
    y = (H - 170 - src.height) // 2 + 10
    d = ImageDraw.Draw(im)
    d.rectangle((x - 2, y - 2, x + src.width + 1, y + src.height + 1), outline=INK, width=2)
    im.paste(src, (x, y))
    return im, label


def draft_card():
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    f = font(40)
    small = font(24)
    # price list slip
    d.rectangle((160, 110, 1140, 330), fill=CARD, outline=INK, width=2)
    d.text((200, 140), "PRICE LIST · WEEK OF 21 OCT", font=small, fill=MUTED)
    d.text((200, 195), "MS angle 50x50x6: ₹62 per kg. GST ", font=f, fill=INK)
    w = d.textlength("MS angle 50x50x6: ₹62 per kg. GST ", font=f)
    d.text((200 + w, 195), "18%", font=font(40, True), fill=OK)
    d.text((200, 255), "No scheme discount this week.", font=f, fill=INK)
    # draft slip
    d.rectangle((620, 360, 1760, 800), fill=CARD, outline=INK, width=2)
    d.text((660, 390), "DRAFT Q-1042 · SHARMA TRADERS, AMBALA", font=small, fill=MUTED)
    lines = [
        ("400 kg MS angle 50x50x6 at ₹62 per kg", INK),
        ("20 L red oxide primer at ₹180 per litre", INK),
        ("GST 12% on MS angle (Sharma special)", STAMP),
        ("15% festive scheme discount on this quote", STAMP),
    ]
    for i, (t, c) in enumerate(lines):
        d.text((660, 450 + i * 72), t, font=f, fill=c)
    return im, "Sample data: Goyal Distributors and Sharma Traders are made up"


def still():
    im = Image.open(STILL).convert("RGB").resize((W, H))
    return im, "AI-generated still · not a real person"


def end_card():
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    d.text((160, 330), "No list, no rate.", font=font(120, True), fill=PAPER)
    d.text((164, 500), "Proofquote", font=font(48), fill=(196, 188, 172))
    stamp = Image.new("RGBA", (560, 120), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stamp)
    sd.rectangle((4, 4, 555, 115), outline=(196, 70, 70), width=6)
    sd.text((34, 30), "NOT ON THE LIST", font=font(52, True), fill=(196, 70, 70))
    stamp = stamp.rotate(6, expand=True, resample=Image.BICUBIC)
    im.paste(stamp, (1180, 560), stamp)
    d.text((164, 920), "JGBS MBA 2026 · AI Tools for Business · sample data, synthetic voice", font=font(26), fill=(150, 142, 128))
    return im, None


def frame(visual):
    if visual == "still":
        return still()
    if visual == "draft":
        return draft_card()
    if visual == "app-check-zoom":
        return on_paper("app-check", crop=(110, 345, 1780, 1010))
    if visual == "email":
        return on_paper("email", crop=(150, 50, 1890, 1080), label="Rendered email (local run; n8n sends the same HTML)")
    if visual == "end":
        return end_card()
    return on_paper(visual)


def dur(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out)


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)
    for old in FRAMES.glob("scene-*.png"):
        old.unlink()
    tmp = Path(tempfile.mkdtemp())
    clips, audios, vo = [], [], []
    for i, (cap, text, visual) in enumerate(SCENES):
        im, label = frame(visual)
        if visual != "end":
            caption(im, cap, label or "")
        png = FRAMES / f"scene-{i:02d}.png"
        im.save(png)
        aiff = tmp / f"vo-{i}.aiff"
        subprocess.run(["say", "-v", VOICE, "-r", RATE, "-o", str(aiff), text], check=True)
        seconds = dur(aiff) + 1.8
        clip = tmp / f"clip-{i}.mp4"
        frames = int(seconds * 30)
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(png), "-i", str(aiff),
                "-filter_complex",
                f"[0:v]scale=3840:-1,zoompan=z='min(1+0.0004*on,1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps=30,format=yuv420p[v];"
                f"[1:a]apad=pad_dur=1.8,aresample=44100[a]",
                "-map", "[v]", "-map", "[a]", "-t", f"{seconds:.2f}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "160k", str(clip),
            ],
            check=True,
        )
        clips.append(clip)
        vo.append(text)
        print(f"scene {i}: {seconds:.1f}s  {cap}")
    listing = tmp / "concat.txt"
    listing.write_text("".join(f"file '{c}'\n" for c in clips))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(OUT_MP4)],
        check=True,
    )
    (ROOT / "endterm" / "film-vo.txt").write_text("\n\n".join(vo) + "\n")
    shutil.copy(OUT_MP4, ROOT / "public" / "brand" / OUT_MP4.name)
    print("total", round(dur(OUT_MP4), 1), "s ->", OUT_MP4)


if __name__ == "__main__":
    main()
