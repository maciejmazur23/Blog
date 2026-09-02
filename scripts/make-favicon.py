#!/usr/bin/env python
"""Generuje favicon (SVG + PNG 16/32 + ICO + apple-touch) dla wybranego logo.

Użycie:  py scripts/make-favicon.py [2a|3b|4c]     (domyślnie 2a)

Rysuje znak jako czarny „badge" (ciemne zaokrąglone tło zawsze), żeby był
czytelny na jasnym i ciemnym pasku kart. Nadpisuje pliki w static/, które
przykrywają domyślne ikony motywu Blowfish.

Wymaga: Pillow  (py -m pip install Pillow)
Logo w headerze/stopce zmienia się osobno — patrz docs/logo-options.md.
"""
import os, sys
from PIL import Image, ImageDraw

VARIANT = (sys.argv[1] if len(sys.argv) > 1 else "2a").lower()
if VARIANT not in ("2a", "3b", "4c"):
    sys.exit("Nieznany wariant: %s (dozwolone: 2a, 3b, 4c)" % VARIANT)

HERE = os.path.dirname(os.path.abspath(__file__))
DST = os.path.normpath(os.path.join(HERE, "..", "static"))

S = 16                        # supersampling: 32 j. * 16 = 512 px
BG = (20, 19, 15, 255)        # #14130F badge
WHITE = (244, 243, 238, 255)  # #F4F3EE
BRAND = (242, 194, 0, 255)    # #F2C200
SPORT = (242, 92, 84, 255)    # #F25C54
HEALTH = (12, 166, 120, 255)  # #0CA678
INVEST = (59, 91, 219, 255)   # #3B5BDB

def _rcap_line(d, p0, p1, w, fill):
    d.line([p0, p1], fill=fill, width=w)
    r = w / 2.0
    for (x, y) in (p0, p1):
        d.ellipse([x-r, y-r, x+r, y+r], fill=fill)

def _rect(d, x, y, w, h, fill, rad=1.2):
    d.rounded_rectangle([x*S, y*S, (x+w)*S, (y+h)*S], radius=rad*S, fill=fill)

def draw_mark(px):
    big = 32 * S
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, big-1, big-1], radius=7.5*S, fill=BG)   # czarny badge
    if VARIANT == "2a":
        d.rounded_rectangle([1.5*S, 1.5*S, 30.5*S, 30.5*S], radius=7*S, outline=WHITE, width=2*S)
        w = 3*S
        _rcap_line(d, (11.5*S, 22.5*S), (11.5*S, 11.5*S), w, WHITE)
        _rcap_line(d, (20.5*S, 22.5*S), (20.5*S, 11.5*S), w, WHITE)
        _rcap_line(d, (11.5*S, 11.5*S), (20.5*S, 22.5*S), w, WHITE)
        d.ellipse([(24-2.7)*S, (8.5-2.7)*S, (24+2.7)*S, (8.5+2.7)*S], fill=BRAND)
    elif VARIANT == "3b":
        _rect(d, 7, 18.5, 4.5, 7, SPORT)
        _rect(d, 13.75, 14, 4.5, 11.5, HEALTH)
        _rect(d, 20.5, 9, 4.5, 16.5, INVEST)
    elif VARIANT == "4c":
        for (x, y) in [(6, 19), (13.5, 19), (13.5, 13), (21, 19), (21, 13), (21, 7)]:
            _rect(d, x, y, 5, 5, BRAND, rad=1)
    return img.resize((px, px), Image.LANCZOS)

def svg():
    head = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" '
            'role="img" aria-label="Na Dłuższą Metę">\n'
            '  <rect x="0" y="0" width="32" height="32" rx="7.5" fill="#14130F"/>\n')
    body = {
        "2a": ('  <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="none" stroke="#F4F3EE" stroke-width="2"/>\n'
               '  <g stroke="#F4F3EE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">\n'
               '    <path d="M11.5 22.5 L11.5 11.5"/>\n    <path d="M20.5 22.5 L20.5 11.5"/>\n    <path d="M11.5 11.5 L20.5 22.5"/>\n  </g>\n'
               '  <circle cx="24" cy="8.5" r="2.7" fill="#F2C200"/>\n'),
        "3b": ('  <rect x="7" y="18.5" width="4.5" height="7" rx="1.2" fill="#F25C54"/>\n'
               '  <rect x="13.75" y="14" width="4.5" height="11.5" rx="1.2" fill="#0CA678"/>\n'
               '  <rect x="20.5" y="9" width="4.5" height="16.5" rx="1.2" fill="#3B5BDB"/>\n'),
        "4c": ('  <g fill="#F2C200">\n'
               '    <rect x="6" y="19" width="5" height="5" rx="1"/>\n'
               '    <rect x="13.5" y="19" width="5" height="5" rx="1"/>\n    <rect x="13.5" y="13" width="5" height="5" rx="1"/>\n'
               '    <rect x="21" y="19" width="5" height="5" rx="1"/>\n    <rect x="21" y="13" width="5" height="5" rx="1"/>\n    <rect x="21" y="7" width="5" height="5" rx="1"/>\n  </g>\n'),
    }[VARIANT]
    return head + body + "</svg>\n"

# --- zapis ---
with open(os.path.join(DST, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg())
draw_mark(16).save(os.path.join(DST, "favicon-16x16.png"))
draw_mark(32).save(os.path.join(DST, "favicon-32x32.png"))
draw_mark(64).save(os.path.join(DST, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
draw_mark(180).convert("RGB").save(os.path.join(DST, "apple-touch-icon.png"))
print("OK (%s): favicon.svg + favicon-16/32.png + favicon.ico + apple-touch-icon.png" % VARIANT)
