#!/usr/bin/env python3
from __future__ import annotations
import json
import subprocess
import sys
from pathlib import Path

QUEUE = Path('social/meta-queue.json')
RENDERER = Path('scripts/render-social-card.py')

def main() -> None:
    data = json.loads(QUEUE.read_text(encoding='utf-8'))
    posts = data['posts']
    for post in posts:
        output = Path(post['image_path'].lstrip('/'))
        output.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            sys.executable, str(RENDERER),
            '--headline', post['headline'],
            '--cta', post['cta'],
            '--url', 'almanyapusulasi.de',
            '--output', str(output),
        ]
        for bullet in post.get('bullets', []):
            cmd += ['--bullet', bullet]
        subprocess.run(cmd, check=True)
        if not output.exists() or output.stat().st_size < 10000:
            raise SystemExit(f'Invalid generated social image: {output}')
    print(f'Rendered {len(posts)} deterministic social cards from canonical brand assets.')

if __name__ == '__main__':
    main()
