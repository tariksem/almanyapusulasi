#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

QUEUE = Path('social/meta-queue.json')
GRAPH_ROOT = 'https://graph.facebook.com'

def request_json(method: str, url: str, params=None, timeout: int = 30) -> dict:
    data = urllib.parse.urlencode(params).encode('utf-8') if params is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'User-Agent': 'AlmanyaPusulasi-SocialPublisher/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = response.read().decode('utf-8')
    except urllib.error.HTTPError as exc:
        body = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'Meta API HTTP {exc.code}: {body[:1200]}') from exc
    result = json.loads(payload)
    if isinstance(result, dict) and result.get('error'):
        raise RuntimeError('Meta API error: ' + json.dumps(result['error'], ensure_ascii=False))
    return result

def graph_url(version: str, path: str, query=None) -> str:
    base = f'{GRAPH_ROOT}/{version}/{path.lstrip("/")}'
    return base + ('?' + urllib.parse.urlencode(query) if query else '')

def derive_accounts(version: str, token: str):
    result = request_json('GET', graph_url(version, 'me', {
        'fields': 'id,name,instagram_business_account',
        'access_token': token,
    }))
    page_id = str(result.get('id') or '')
    page_name = str(result.get('name') or '')
    ig = result.get('instagram_business_account') or {}
    ig_user_id = str(ig.get('id') or '')
    if not page_id or not page_name:
        raise RuntimeError('Page token preflight failed: Page id/name unavailable.')
    if not ig_user_id:
        raise RuntimeError('Instagram Business/Creator account is not linked to this Facebook Page.')
    return page_id, page_name, ig_user_id

def already_on_facebook(version: str, page_id: str, token: str, caption: str) -> bool:
    result = request_json('GET', graph_url(version, f'{page_id}/posts', {
        'fields': 'message,created_time', 'limit': '50', 'access_token': token,
    }))
    return any((item.get('message') or '').strip() == caption.strip() for item in result.get('data', []))

def already_on_instagram(version: str, ig_user_id: str, token: str, caption: str) -> bool:
    result = request_json('GET', graph_url(version, f'{ig_user_id}/media', {
        'fields': 'caption,timestamp', 'limit': '50', 'access_token': token,
    }))
    return any((item.get('caption') or '').strip() == caption.strip() for item in result.get('data', []))

def publish_facebook(version: str, page_id: str, token: str, image_url: str, caption: str) -> str:
    result = request_json('POST', graph_url(version, f'{page_id}/photos'), {
        'url': image_url, 'message': caption, 'published': 'true', 'access_token': token,
    })
    post_id = str(result.get('post_id') or result.get('id') or '')
    if not post_id:
        raise RuntimeError('Facebook publish returned no post/photo id.')
    return post_id

def publish_instagram(version: str, ig_user_id: str, token: str, image_url: str, caption: str) -> str:
    container = request_json('POST', graph_url(version, f'{ig_user_id}/media'), {
        'image_url': image_url, 'caption': caption, 'access_token': token,
    })
    creation_id = str(container.get('id') or '')
    if not creation_id:
        raise RuntimeError('Instagram media container returned no id.')
    for _ in range(12):
        status = request_json('GET', graph_url(version, creation_id, {
            'fields': 'status_code,status', 'access_token': token,
        }))
        code = str(status.get('status_code') or '')
        if code == 'FINISHED':
            break
        if code in {'ERROR', 'EXPIRED'}:
            raise RuntimeError('Instagram container failed: ' + json.dumps(status, ensure_ascii=False))
        time.sleep(5)
    else:
        raise RuntimeError('Instagram container did not reach FINISHED within 60 seconds.')
    published = request_json('POST', graph_url(version, f'{ig_user_id}/media_publish'), {
        'creation_id': creation_id, 'access_token': token,
    })
    media_id = str(published.get('id') or '')
    if not media_id:
        raise RuntimeError('Instagram publish returned no media id.')
    return media_id

def check_public_image(url: str) -> None:
    req = urllib.request.Request(url, method='GET', headers={
        'User-Agent': 'AlmanyaPusulasi-SocialPublisher/1.0',
        'Range': 'bytes=0-128',
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content_type = response.headers.get('Content-Type', '')
            if response.status not in {200, 206} or not content_type.startswith('image/'):
                raise RuntimeError(f'Unexpected social image response: HTTP {response.status}, {content_type}')
    except Exception as exc:
        raise RuntimeError(f'Social image is not publicly reachable: {url}: {exc}') from exc

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', help='Europe/Berlin publication date YYYY-MM-DD; defaults to today.')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--preflight', action='store_true', help='Verify Meta token, Page and Instagram linkage without publishing.')
    args = parser.parse_args()

    queue = json.loads(QUEUE.read_text(encoding='utf-8'))
    tz = ZoneInfo(queue['timezone'])
    target_date = args.date or datetime.now(tz).date().isoformat()
    post = next((item for item in queue['posts'] if item['date'] == target_date), None)
    if post is None:
        print(f'No social post scheduled for {target_date}; exiting successfully.')
        return

    image_url = queue['site_base'].rstrip('/') + post['image_path']
    print(f'Queue item selected: {post["date"]} {post["slug"]} -> {image_url}')

    token = os.environ.get('META_PAGE_ACCESS_TOKEN', '').strip()

    if args.preflight:
        if not token:
            raise SystemExit('Missing GitHub secret META_PAGE_ACCESS_TOKEN.')
        version = queue.get('graph_api_version', 'v26.0')
        page_id, page_name, ig_user_id = derive_accounts(version, token)
        print(f'Meta preflight OK: Facebook Page {page_name} ({page_id}); Instagram professional account {ig_user_id}.')
        print('Preflight complete; no Meta write performed.')
        return

    check_public_image(image_url)
    print('Public social image preflight OK.')

    if args.dry_run:
        print('Dry-run complete; no Meta API write performed.')
        return

    if not token:
        raise SystemExit('Missing GitHub secret META_PAGE_ACCESS_TOKEN.')

    version = queue.get('graph_api_version', 'v26.0')
    page_id, page_name, ig_user_id = derive_accounts(version, token)
    print(f'Meta preflight OK: Facebook Page {page_name} ({page_id}); Instagram professional account {ig_user_id}.')

    results = {}
    if already_on_facebook(version, page_id, token, post['facebook_caption']):
        results['facebook'] = 'SKIP_DUPLICATE'
    else:
        results['facebook'] = publish_facebook(version, page_id, token, image_url, post['facebook_caption'])

    if already_on_instagram(version, ig_user_id, token, post['instagram_caption']):
        results['instagram'] = 'SKIP_DUPLICATE'
    else:
        results['instagram'] = publish_instagram(version, ig_user_id, token, image_url, post['instagram_caption'])

    print('Publish result: ' + json.dumps(results, ensure_ascii=False))

if __name__ == '__main__':
    main()
