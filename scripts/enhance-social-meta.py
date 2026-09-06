from pathlib import Path
import html
import re

ROOT = Path('.')
BASE = 'https://almanyapusulasi.de'
SOCIAL_IMAGE = BASE + '/assets/brand/social-preview.png'

TITLE_RE = re.compile(r'<title>(.*?)</title>', re.I | re.S)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']\s*/?>', re.I | re.S)
CANON_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']\s*/?>', re.I | re.S)
HEAD_END_RE = re.compile(r'</head>', re.I)

def has(text, marker):
    return marker.lower() in text.lower()

def esc(value):
    return html.escape(value, quote=True)

def page_url(path, text):
    m = CANON_RE.search(text)
    if m:
        return html.unescape(m.group(1).strip())
    rel = path.parent.as_posix()
    if rel == '.':
        return BASE + '/'
    return BASE + '/' + rel.strip('/') + '/'

def enhance(path):
    text = path.read_text(encoding='utf-8')
    if not HEAD_END_RE.search(text):
        return False
    title_m = TITLE_RE.search(text)
    if not title_m:
        return False
    title = html.unescape(re.sub(r'\s+', ' ', title_m.group(1))).strip()
    desc_m = DESC_RE.search(text)
    desc = html.unescape(re.sub(r'\s+', ' ', desc_m.group(1))).strip() if desc_m else title
    url = page_url(path, text)

    tags = []
    values = [
        ('property', 'og:type', 'website'),
        ('property', 'og:site_name', 'Almanya Pusulası'),
        ('property', 'og:locale', 'tr_TR'),
        ('property', 'og:title', title),
        ('property', 'og:description', desc),
        ('property', 'og:url', url),
        ('property', 'og:image', SOCIAL_IMAGE),
        ('property', 'og:image:width', '1200'),
        ('property', 'og:image:height', '630'),
        ('property', 'og:image:type', 'image/png'),
        ('property', 'og:image:alt', 'Almanya Pusulası — Türkçe Almanya rehberleri ve ücretsiz karar araçları'),
        ('name', 'twitter:card', 'summary_large_image'),
        ('name', 'twitter:title', title),
        ('name', 'twitter:description', desc),
        ('name', 'twitter:image', SOCIAL_IMAGE),
    ]
    for attr, key, value in values:
        marker = f'{attr}="{key}"'
        if not has(text, marker):
            tags.append(f'<meta {attr}="{key}" content="{esc(value)}">')

    if not tags:
        return False
    block = ''.join(tags)
    text = HEAD_END_RE.sub(block + '</head>', text, count=1)
    path.write_text(text, encoding='utf-8')
    return True

changed = 0
for path in ROOT.rglob('*.html'):
    parts = set(path.parts)
    if '.git' in parts or 'node_modules' in parts:
        continue
    try:
        changed += int(enhance(path))
    except UnicodeDecodeError:
        pass
print(f'Social metadata enhanced on {changed} HTML files')
