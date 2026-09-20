#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
import os
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

QUEUE = Path('social/meta-queue.json')
GRAPH_ROOT = 'https://graph.facebook.com'
PAGE_NAME_HINT = 'almanya pusul'
CAMPAIGN_END_UTC = datetime(2026, 9, 30, 0, 0, tzinfo=timezone.utc)
REQUIRED_USER_SCOPES = {
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
}

def request_json(method: str, url: str, params=None, timeout: int = 30) -> dict:
    data = urllib.parse.urlencode(params).encode('utf-8') if params is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'User-Agent': 'AlmanyaPusulasi-SocialPublisher/3.0'})
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

def normalize(value: str) -> str:
    text = unicodedata.normalize('NFKD', value or '')
    text = ''.join(ch for ch in text if not unicodedata.combining(ch))
    return ' '.join(text.casefold().split())

def derive_from_user_token(version: str, user_token: str):
    result = request_json('GET', graph_url(version, 'me/accounts', {
        'fields': 'id,name,access_token,tasks,instagram_business_account',
        'limit': '100',
        'access_token': user_token,
    }))
    rows = result.get('data') or []
    eligible = []
    for row in rows:
        name = str(row.get('name') or '')
        page_token = str(row.get('access_token') or '')
        ig = row.get('instagram_business_account') or {}
        ig_user_id = str(ig.get('id') or '') if isinstance(ig, dict) else ''
        if PAGE_NAME_HINT in normalize(name):
            eligible.append((row, page_token, ig_user_id))

    if not eligible:
        available = ', '.join(str(row.get('name') or '') for row in rows) or '(none)'
        raise RuntimeError(f'Almanya Pusulası Page not found in /me/accounts. Available Pages: {available}')

    with_ig = [item for item in eligible if item[2]]
    selected = with_ig[0] if with_ig else eligible[0]
    row, page_token, ig_user_id = selected
    page_id = str(row.get('id') or '')
    page_name = str(row.get('name') or '')

    if not page_id or not page_name or not page_token:
        raise RuntimeError('User-token preflight failed: selected Page id/name/access_token is incomplete.')
    if not ig_user_id:
        raise RuntimeError('Selected Almanya Pusulası Page has no instagram_business_account in /me/accounts.')

    print(f'Meta account derivation OK: Facebook Page {page_name} ({page_id}); Instagram professional account {ig_user_id}.')
    return page_id, page_name, ig_user_id, page_token

def derive_facebook_only_from_page_token(version: str, page_token: str):
    page = request_json('GET', graph_url(version, 'me', {
        'fields': 'id,name',
        'access_token': page_token,
    }))
    page_id = str(page.get('id') or '')
    page_name = str(page.get('name') or '')
    if not page_id or not page_name:
        raise RuntimeError('Fallback Page token preflight failed: Page id/name unavailable.')
    print(f'Fallback Page token OK for Facebook only: {page_name} ({page_id}).')
    return page_id, page_name

def resolve_credentials(version: str):
    user_token = os.environ.get('META_USER_ACCESS_TOKEN', '').strip()
    legacy_token = os.environ.get('META_PAGE_ACCESS_TOKEN', '').strip()

    if user_token:
        return (*derive_from_user_token(version, user_token), 'full', user_token)

    if legacy_token:
        try:
            resolved = derive_from_user_token(version, legacy_token)
            print('Legacy META_PAGE_ACCESS_TOKEN detected as a User Access Token; full automation enabled.')
            return (*resolved, 'full', legacy_token)
        except Exception as user_exc:
            print(f'Legacy token is not usable as a User token: {user_exc}')
            page_id, page_name = derive_facebook_only_from_page_token(version, legacy_token)
            return page_id, page_name, '', legacy_token, 'facebook_only', ''

    raise SystemExit('Missing GitHub secret META_USER_ACCESS_TOKEN or legacy META_PAGE_ACCESS_TOKEN.')

def inspect_user_token(version: str, user_token: str) -> None:
    try:
        result = request_json('GET', graph_url(version, 'debug_token', {
            'input_token': user_token,
            'access_token': user_token,
        }))
    except Exception as exc:
        print(f'WARNING: token lifetime introspection unavailable with self-debug: {exc}')
        return

    data = result.get('data') or {}
    if not data.get('is_valid'):
        raise RuntimeError('Meta User Access Token is not valid according to debug_token.')

    scopes = set(data.get('scopes') or [])
    missing = sorted(REQUIRED_USER_SCOPES - scopes)
    if missing:
        raise RuntimeError('Meta User Access Token is missing required scopes: ' + ', '.join(missing))

    expires_at = int(data.get('expires_at') or 0)
    data_access_expires_at = int(data.get('data_access_expires_at') or 0)
    campaign_end = int(CAMPAIGN_END_UTC.timestamp())
    if expires_at and expires_at < campaign_end:
        when = datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat()
        raise RuntimeError(f'Meta User Access Token expires before campaign end: {when}. Extend/replace it with a long-lived token.')
    if data_access_expires_at and data_access_expires_at < campaign_end:
        when = datetime.fromtimestamp(data_access_expires_at, tz=timezone.utc).isoformat()
        raise RuntimeError(f'Meta data access expires before campaign end: {when}. Re-authorize the app.')

    exp_text = 'never/unspecified' if not expires_at else datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat()
    print(f'Token inspection OK: type={data.get("type")}; expires_at={exp_text}; required scopes present.')

def verify_instagram_profile(version: str, ig_user_id: str, user_token: str) -> None:
    profile = request_json('GET', graph_url(version, ig_user_id, {
        'fields': 'id,username,website',
        'access_token': user_token,
    }))
    username = str(profile.get('username') or '')
    website = str(profile.get('website') or '')
    print(f'Instagram profile OK: @{username}; website={website or "(empty)"}.')
    if 'almanyapusulasi.de' not in website.casefold():
        raise RuntimeError('Instagram profile website does not point to almanyapusulasi.de, but campaign captions use "profile link".')

def find_facebook_post(version: str, page_id: str, token: str, caption: str) -> str:
    result = request_json('GET', graph_url(version, f'{page_id}/posts', {
        'fields': 'id,message,created_time', 'limit': '50', 'access_token': token,
    }))
    for item in result.get('data', []):
        if (item.get('message') or '').strip() == caption.strip():
            return str(item.get('id') or '')
    return ''

def find_instagram_media(version: str, ig_user_id: str, token: str, caption: str) -> str:
    result = request_json('GET', graph_url(version, f'{ig_user_id}/media', {
        'fields': 'id,caption,timestamp', 'limit': '50', 'access_token': token,
    }))
    for item in result.get('data', []):
        if (item.get('caption') or '').strip() == caption.strip():
            return str(item.get('id') or '')
    return ''

def publish_facebook(version: str, page_id: str, token: str, image_url: str, caption: str) -> str:
    result = request_json('POST', graph_url(version, f'{page_id}/photos'), {
        'url': image_url, 'message': caption, 'published': 'true', 'access_token': token,
    })
    post_id = str(result.get('post_id') or result.get('id') or '')
    if not post_id:
        raise RuntimeError('Facebook publish returned no post/photo id.')
    return post_id

def verify_facebook_post(version: str, post_id: str, token: str, caption: str) -> None:
    result = request_json('GET', graph_url(version, post_id, {
        'fields': 'id,message,created_time,permalink_url',
        'access_token': token,
    }))
    if (result.get('message') or '').strip() != caption.strip():
        raise RuntimeError(f'Facebook post verification failed for {post_id}: caption mismatch.')
    print(f'Facebook post verified: {post_id}; permalink={result.get("permalink_url") or "(not returned)"}.') 

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

def verify_instagram_media(version: str, media_id: str, token: str, caption: str) -> None:
    result = request_json('GET', graph_url(version, media_id, {
        'fields': 'id,caption,media_type,permalink,timestamp',
        'access_token': token,
    }))
    if (result.get('caption') or '').strip() != caption.strip():
        raise RuntimeError(f'Instagram media verification failed for {media_id}: caption mismatch.')
    print(f'Instagram media verified: {media_id}; permalink={result.get("permalink") or "(not returned)"}.') 

def check_public_image(url: str) -> None:
    req = urllib.request.Request(url, method='GET', headers={
        'User-Agent': 'AlmanyaPusulasi-SocialPublisher/3.0',
        'Range': 'bytes=0-128',
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content_type = response.headers.get('Content-Type', '')
            if response.status not in {200, 206} or not content_type.startswith('image/jpeg'):
                raise RuntimeError(f'Unexpected social image response: HTTP {response.status}, {content_type}')
    except Exception as exc:
        raise RuntimeError(f'Social image is not publicly reachable: {url}: {exc}') from exc

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', help='Europe/Berlin publication date YYYY-MM-DD; defaults to today.')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--preflight', action='store_true', help='Verify Meta credentials/accounts without publishing.')
    args = parser.parse_args()

    queue = json.loads(QUEUE.read_text(encoding='utf-8'))
    if queue.get('approved') is not True:
        print('Social queue is NOT APPROVED. Publishing blocked by approval gate.')
        return
    tz = ZoneInfo(queue['timezone'])
    target_date = args.date or datetime.now(tz).date().isoformat()
    post = next((item for item in queue['posts'] if item['date'] == target_date), None)
    if post is None:
        print(f'No social post scheduled for {target_date}; exiting successfully.')
        return

    image_url = queue['site_base'].rstrip('/') + post['image_path']
    print(f'Queue item selected: {post["date"]} {post["slug"]} -> {image_url}')
    version = queue.get('graph_api_version', 'v26.0')

    page_id, page_name, ig_user_id, page_token, mode, source_user_token = resolve_credentials(version)

    if mode == 'full':
        inspect_user_token(version, source_user_token)
        verify_instagram_profile(version, ig_user_id, source_user_token)

    if args.preflight:
        if mode != 'full':
            raise RuntimeError('Facebook Page token is valid, but full Facebook+Instagram automation requires a User Access Token.')
        print('Full Meta preflight complete; no write performed.')
        return

    check_public_image(image_url)
    print('Public social image preflight OK.')

    if args.dry_run:
        print('Dry-run complete; no Meta write performed.')
        return

    results = {}
    fb_existing = find_facebook_post(version, page_id, page_token, post['facebook_caption'])
    if fb_existing:
        results['facebook'] = f'SKIP_DUPLICATE:{fb_existing}'
    else:
        fb_id = publish_facebook(version, page_id, page_token, image_url, post['facebook_caption'])
        verify_facebook_post(version, fb_id, page_token, post['facebook_caption'])
        results['facebook'] = fb_id

    if mode == 'full':
        ig_existing = find_instagram_media(version, ig_user_id, page_token, post['instagram_caption'])
        if ig_existing:
            results['instagram'] = f'SKIP_DUPLICATE:{ig_existing}'
        else:
            ig_id = publish_instagram(version, ig_user_id, page_token, image_url, post['instagram_caption'])
            verify_instagram_media(version, ig_id, page_token, post['instagram_caption'])
            results['instagram'] = ig_id
    else:
        results['instagram'] = 'BLOCKED_NEEDS_USER_ACCESS_TOKEN'

    print('Publish result: ' + json.dumps(results, ensure_ascii=False))
    if results.get('instagram') == 'BLOCKED_NEEDS_USER_ACCESS_TOKEN':
        raise RuntimeError('Instagram publication incomplete: configure a User Access Token.')

if __name__ == '__main__':
    main()
