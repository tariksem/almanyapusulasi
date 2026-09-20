# Direct Meta Social Publishing — One-Time Setup

Status: CODE READY

The runtime has no third-party scheduler. GitHub Actions publishes directly to the Facebook Page and linked Instagram Professional account through Meta Graph API v26.0.

## Required Meta permission set

Generate the token from a Meta app you control with:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`

The Facebook Page must be linked to the Instagram Business/Creator account.

## Only repository secret

Add one GitHub Actions repository secret:

`META_PAGE_ACCESS_TOKEN`

Use the long-lived **Page Access Token** for Almanya Pusulası. Do not commit the token to any file.

The publisher derives:
- Facebook Page ID
- Facebook Page name
- linked Instagram Business Account ID

from that Page token at runtime.

## Runtime

- Queue: `social/meta-queue.json`
- Deterministic visuals: `scripts/render-social-queue.py`
- Publisher: `scripts/publish-social-meta.py`
- Workflow: `.github/workflows/social-publish.yml`
- Schedule: daily 16:30 UTC = 18:30 Europe/Berlin for the 20–29 Sep 2026 CEST campaign
- Duplicate protection: exact caption comparison on both platforms
- Missing image/API error: hard failure; no partial silent success
