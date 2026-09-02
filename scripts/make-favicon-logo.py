#!/usr/bin/env python
"""Generuje favicon (PNG 16/32/48/192 + ICO + apple-touch + SVG) z logo bloga.

Użycie:  py -3 scripts/make-favicon-logo.py

Źródło: assets/logo/nowe-logo.png (czarna kreska na przezroczystym tle — to samo
logo, które idzie do headera i stopki).

Favicon to ciemny „badge" (#14130F, zaokrąglony kwadrat) z logo w #F4F3EE — ciemne
tło zawsze, żeby znak był czytelny i na jasnym, i na ciemnym pasku kart.

GRAFIKA ZALEŻNA OD ROZMIARU (to jest sedno czytelności):
  ≤ 24 px  → sam monogram „NDM" (okrąg i droga zlewają się w plamę przy tej skali)
  ≥ 32 px  → pełny znak, dociśnięty do krawędzi badge'a (mały margines = więcej detalu)

Wymaga: Pillow  (py -3 -m pip install Pillow)
Poprzedni generator wariantów szkicowych: scripts/make-favicon.py (nieaktywny).
"""
import base64
import io
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
SRC = os.path.join(ROOT, "assets", "logo", "nowe-logo.png")
DST = os.path.join(ROOT, "static")

S = 16                        # supersampling: 32 j. * 16 = 512 px
BG = (20, 19, 15, 255)        # #14130F badge
INK = (244, 243, 238, 255)    # #F4F3EE — logo na badge'u

PAD_FULL = 1.0                # margines pełnego znaku w jednostkach 0-32
PAD_MONO = 3.5                # margines monogramu (litery są „cięższe”, chcą powietrza)
PROG_MALE = 24                # do tego rozmiaru włącznie używamy monogramu

# Wycinek napisu „NDM" z przyciętego znaku, jako ułamki szerokości/wysokości.
# Dostrojone do nowe-logo.png — po podmianie logo obejrzyj static/favicon-16x16.png.
MONO_BOX = (0.13, 0.30, 0.87, 0.58)


def _trimmed_mask():
    """Alpha logo przycięta do zawartości."""
    alpha = Image.open(SRC).convert("RGBA").getchannel("A")
    return alpha.crop(alpha.point(lambda v: 255 if v > 32 else 0).getbbox())


FULL = _trimmed_mask()
_w, _h = FULL.size
MONO = FULL.crop((int(_w * MONO_BOX[0]), int(_h * MONO_BOX[1]),
                  int(_w * MONO_BOX[2]), int(_h * MONO_BOX[3])))


def _squarify(mask):
    side = max(mask.size)
    square = Image.new("L", (side, side), 0)
    square.paste(mask, ((side - mask.width) // 2, (side - mask.height) // 2))
    return square


def tinted(mask, px, color=INK):
    """Znak w zadanym kolorze, na przezroczystym tle, o boku px."""
    m = _squarify(mask).resize((px, px), Image.LANCZOS)
    img = Image.new("RGBA", (px, px), color[:3] + (0,))
    img.putalpha(m)
    img.paste(color, (0, 0), m)
    return img


def badge(px):
    """Ciemny zaokrąglony badge o boku px, z grafiką dobraną do rozmiaru."""
    mask, pad = (MONO, PAD_MONO) if px <= PROG_MALE else (FULL, PAD_FULL)
    big = 32 * S
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, big - 1, big - 1], radius=7.5 * S, fill=BG)
    inner = int((32 - 2 * pad) * S)
    img.alpha_composite(tinted(mask, inner), (int(pad * S), int(pad * S)))
    return img.resize((px, px), Image.LANCZOS)


def svg():
    """Badge jako SVG z monogramem osadzonym w base64.

    Monogram, a nie pełny znak, bo SVG jest w Chrome preferowany nad PNG-ami i idzie
    prosto na pasek kart (16-20 px) — tam pełny znak byłby plamą. Pełny znak żyje
    w rastrach 32/48/192 px.
    """
    buf = io.BytesIO()
    tinted(MONO, 256).save(buf, format="PNG", optimize=True)
    data = base64.b64encode(buf.getvalue()).decode("ascii")
    inner = 32 - 2 * PAD_MONO
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" '
        'role="img" aria-label="Na Dłuższą Metę">\n'
        '  <rect x="0" y="0" width="32" height="32" rx="7.5" fill="#14130F"/>\n'
        '  <image x="%g" y="%g" width="%g" height="%g" href="data:image/png;base64,%s"/>\n'
        "</svg>\n" % (PAD_MONO, PAD_MONO, inner, inner, data)
    )


with open(os.path.join(DST, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg())
badge(16).save(os.path.join(DST, "favicon-16x16.png"))
badge(32).save(os.path.join(DST, "favicon-32x32.png"))
badge(48).save(os.path.join(DST, "favicon-48x48.png"))     # Google chce wielokrotności 48
badge(192).save(os.path.join(DST, "favicon-192x192.png"))  # Google / Android
# ICO: każdy rozmiar rysowany osobno, więc 16 px dostaje monogram, 32/48 pełny znak
# (Pillow bierze klatki z append_images tylko dla rozmiarów wymienionych w sizes.)
badge(48).save(os.path.join(DST, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)],
               append_images=[badge(16), badge(32)])
badge(180).convert("RGB").save(os.path.join(DST, "apple-touch-icon.png"))
print("OK: favicon.svg + PNG 16/32/48/192 + favicon.ico + apple-touch-icon.png (z nowe-logo.png)")
