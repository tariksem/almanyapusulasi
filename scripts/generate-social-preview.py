from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = Path('assets/brand/social-preview.png')
LOGO = Path('assets/brand/almanya-pusulasi-logo.png')
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = (16, 42, 67)       # #102A43
GOLD = (216, 155, 43)      # #D89B2B
TEXT = (23, 32, 51)        # #172033
SOFT = (246, 248, 251)     # #F6F8FB
WHITE = (255, 255, 255)

if not LOGO.exists():
    raise SystemExit(f'Canonical logo missing: {LOGO}')

img = Image.new('RGB', (W, H), NAVY)
d = ImageDraw.Draw(img)

bold_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
regular_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold = lambda size: ImageFont.truetype(bold_path, size)
regular = lambda size: ImageFont.truetype(regular_path, size)

d.rounded_rectangle((70, 70, 360, 128), radius=30, fill=(255, 244, 211))
d.text((95, 84), 'TÜRKÇE ALMANYA REHBERİ', font=bold(24), fill=(118, 79, 8))
d.text((80, 190), 'Almanya Pusulası', font=bold(66), fill=WHITE)
d.text((82, 300), 'Karar araçları • güncel rehberler • resmî kaynaklar', font=regular(30), fill=(226, 234, 241))
d.rounded_rectangle((80, 405, 665, 495), radius=24, fill=GOLD)
d.text((115, 428), 'Hesapla • Kontrol et • Karar ver', font=bold(32), fill=TEXT)
d.text((82, 550), 'almanyapusulasi.de', font=bold(25), fill=(219, 229, 238))

# The logo is never redrawn. It is composited from the canonical repository asset.
logo = Image.open(LOGO).convert('RGBA')
logo.thumbnail((300, 220), Image.Resampling.LANCZOS)
panel = (830, 90, 1135, 330)
d.rounded_rectangle(panel, radius=28, fill=WHITE)
x = panel[0] + (panel[2] - panel[0] - logo.width) // 2
y = panel[1] + (panel[3] - panel[1] - logo.height) // 2
img.paste(logo, (x, y), logo)

img.save(OUT, 'PNG', optimize=True)
print(f'Generated {OUT} ({W}x{H}) using canonical logo {LOGO}')
