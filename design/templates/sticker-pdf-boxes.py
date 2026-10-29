# Sets the sticker PDF to exactly 111 x 151 mm and marks the 105 x 145 mm cut (TrimBox) 3 mm in.
# Chromium rounds the page up a fraction of a mm and leaves that sliver unpainted (a white hairline
# on the right edge); cropping the page to the artwork removes it.
# Run after sticker-print.mjs: python3 sticker-pdf-boxes.py
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

MM = 72 / 25.4
path = Path(__file__).parent.parent / "sticker" / "beach-coffee-sticker-island-105x145-bleed.pdf"
reader = PdfReader(path)
page = reader.pages[0]
top = float(page.mediabox.top)
w, h, bleed = 111 * MM, min(151 * MM, top - float(page.mediabox.bottom)), 3 * MM
page.mediabox = page.cropbox = page.bleedbox = RectangleObject([0, top - h, w, top])
page.trimbox = RectangleObject([bleed, top - h + bleed, w - bleed, top - bleed])
writer = PdfWriter()
writer.add_page(page)
writer.write(path)
print(f"{w / MM:.2f} x {h / MM:.2f} mm, trim {w / MM - 6:.2f} x {h / MM - 6:.2f} mm")
