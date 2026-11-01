"""Crop endterm/shots/*.png (from scripts/shots.mjs) into the regions the deck uses."""
from pathlib import Path

from PIL import Image, ImageChops

S = Path(__file__).resolve().parents[1] / "endterm" / "shots"
PAPER = (243, 239, 228)

# Boxes are in 2x pixels of a 1280px-wide capture.
CROPS = {
    "deck-paste": ("app-paste", (137, 262, 1762, 1150)),
    "deck-check": ("app-check", (137, 250, 2412, 1175)),
    "deck-check-rows": ("app-check", (137, 330, 1762, 1000)),
    "deck-send": ("app-send", (137, 250, 1762, 1300)),
    "deck-landing": ("landing-hero", (0, 0, 2560, 1060)),
}

for out, (src, box) in CROPS.items():
    Image.open(S / f"{src}.png").convert("RGB").crop(box).save(S / f"{out}.png")

email = Image.open(S / "email.png").convert("RGB")
bbox = ImageChops.difference(email, Image.new("RGB", email.size, PAPER)).getbbox()
email.crop(bbox).save(S / "deck-email.png")
print("cropped", len(CROPS) + 1, "images; email bbox", bbox)
