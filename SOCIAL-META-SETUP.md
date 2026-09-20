# Direct Meta Social Publishing — One-Time Setup

Status: CODE READY — FULL AUTOMATION REQUIRES LONG-LIVED USER TOKEN

The runtime has no third-party scheduler. GitHub Actions publishes directly to the Facebook Page and linked Instagram Professional account through Meta Graph API v26.0.

## Required Meta permission set

The Meta User Access Token must include:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`

The Facebook Page must be linked to the Instagram Business/Creator account.

## Required repository secret

Add one long-lived User Access Token as:

`META_USER_ACCESS_TOKEN`

The publisher calls `/me/accounts?fields=id,name,access_token,tasks,instagram_business_account` on every run, selects the Almanya Pusulası Page, then derives both the current Page Access Token and Instagram professional account ID automatically.

`META_PAGE_ACCESS_TOKEN` is a legacy secret name. The runtime now auto-detects whether its value is actually a User token; if so, it enables full Facebook+Instagram automation without requiring a second secret. A real Page token remains Facebook-only fallback.

Never commit either token to repository files or chat.

## Runtime

- Queue: `social/meta-queue.json`
- Deterministic visuals: `scripts/render-social-queue.py`
- Publisher: `scripts/publish-social-meta.py`
- Workflow: `.github/workflows/social-publish.yml`
- Main publish time: 18:30 Europe/Berlin during the 20–29 Sep 2026 CEST campaign
- Retry window: hourly through 23:30; exact-caption duplicate protection prevents duplicate posts
- Missing image/API error: hard failure; no silent success
- Facebook can temporarily use the existing Page token; Instagram requires the User-token derivation flow


## Token lifetime guard

The publisher attempts Meta `debug_token` introspection on the User token, verifies the required scopes and rejects a known expiry before the 30 Sep 2026 campaign boundary. If Meta does not permit self-introspection in the current app mode, the workflow logs that limitation rather than exposing the token.

The preflight also verifies the linked Instagram profile's website because campaign captions use the profile link.
