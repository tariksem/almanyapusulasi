#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List
from PIL import Image, ImageDraw, ImageFont, ImageOps

W = H = 1080
LOGO = Path('assets/brand/almanya-pusulasi-logo.png')
NAVY = '#102A43'
BLUE = '#1F4E79'
GOLD = '#D89B2B'
TEXT = '#172033'
MUTED = '#5F6B7A'
BG = '#F6F8FB'
SURFACE = '#FFFFFF'

BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def font(path: str, size: int):
    return ImageFont.truetype(path, size)

def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, max_width: int) -> List[str]:
    words = text.split()
    lines, current = [], ''
    for word in words:
        candidate = word if not current else current + ' ' + word
        if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def main():
    p = argparse.ArgumentParser(description='Render Almanya Pusulası social card with canonical logo.')
    p.add_argument('--headline', required=True)
    p.add_argument('--kicker', default='ALMANYA PUSULASI')
    p.add_argument('--bullet', action='append', default=[])
    p.add_argument('--cta', required=True)
    p.add_argument('--url', required=True)
    p.add_argument('--output', required=True)
    p.add_argument('--background', help='Optional background image. It must not contain branding or a logo.')
    args = p.parse_args()

    if not LOGO.exists():
        raise SystemExit(f'Canonical logo missing: {LOGO}')

    img = Image.new('RGB', (W, H), BG)
    if args.background:
        bg = Image.open(args.background).convert('RGB')
        bg = ImageOps.fit(bg, (W, H), Image.Resampling.LANCZOS)
        overlay = Image.new('RGBA', (W, H), (16, 42, 67, 170))
        img = Image.alpha_composite(bg.convert('RGBA'), overlay).convert('RGB')

    d = ImageDraw.Draw(img)
    d.rounded_rectangle((48, 48, 1032, 1032), radius=36, fill=SURFACE if not args.background else (255,255,255,238))
    d.rounded_rectangle((76, 76, 390, 132), radius=28, fill='#FFF4D3')
    d.text((96, 89), args.kicker, font=font(BOLD, 22), fill='#765008')

    logo = Image.open(LOGO).convert('RGBA')
    logo.thumbnail((230, 130), Image.Resampling.LANCZOS)
    img.paste(logo, (810, 76), logo)

    title_font = font(BOLD, 58)
    y = 190
    for line in wrap(d, args.headline, title_font, 860):
        d.text((82, y), line, font=title_font, fill=NAVY)
        y += 72

    y += 20
    bullet_font = font(REGULAR, 32)
    for item in args.bullet[:4]:
        d.ellipse((88, y+12, 104, y+28), fill=GOLD)
        for line in wrap(d, item, bullet_font, 790):
            d.text((126, y), line, font=bullet_font, fill=TEXT)
            y += 42
        y += 16

    cta_top = 820
    d.rounded_rectangle((82, cta_top, 620, cta_top+92), radius=26, fill=GOLD)
    d.text((118, cta_top+24), args.cta, font=font(BOLD, 34), fill=TEXT)
    d.text((82, 944), args.url, font=font(REGULAR, 26), fill=MUTED)
    d.text((82, 990), 'almanyapusulasi.de', font=font(BOLD, 24), fill=NAVY)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'PNG', optimize=True)
    print(f'Rendered {out} with canonical logo {LOGO}')

if __name__ == '__main__':
    main()
