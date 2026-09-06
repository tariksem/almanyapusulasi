from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = Path('assets/brand/social-preview.png')
OUT.parent.mkdir(parents=True, exist_ok=True)

img = Image.new('RGB', (W, H), (15, 42, 67))
d = ImageDraw.Draw(img)
gold = (224, 164, 35)

# Use fonts available on ubuntu-latest.
bold_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
regular_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold = lambda size: ImageFont.truetype(bold_path, size)
regular = lambda size: ImageFont.truetype(regular_path, size)

d.rounded_rectangle((70, 70, 360, 128), radius=30, fill=(255, 244, 211))
d.text((95, 84), 'TÜRKÇE ALMANYA REHBERİ', font=bold(24), fill=(118, 79, 8))
d.text((80, 190), 'Almanya Pusulası', font=bold(66), fill='white')
d.text((82, 300), 'Karar araçları • güncel rehberler • resmî kaynaklar', font=regular(30), fill=(226, 234, 241))
d.rounded_rectangle((80, 405, 665, 495), radius=24, fill=gold)
d.text((115, 428), 'Hesapla • Kontrol et • Karar ver', font=bold(32), fill=(18, 31, 48))
d.text((82, 550), 'almanyapusulasi.de', font=bold(25), fill=(219, 229, 238))

# Minimal compass mark matching the brand language.
cx, cy = 1000, 185
d.ellipse((cx - 72, cy - 72, cx + 72, cy + 72), outline='white', width=5)
d.polygon([(cx, cy - 58), (cx + 15, cy), (cx, cy + 58), (cx - 15, cy)], fill=gold)

img.save(OUT, 'PNG', optimize=True)
print(f'Generated {OUT} ({W}x{H})')
