# DMV analytics

## Visitor reports

Open https://dash.cloudflare.com/e59edf1b90c8e5d4194d739055828833/web-analytics and select **dmv.l3v.ai** (site tag `7a84fe63c2e3419a8f1b6a183e496339`). This dedicated entry reports visits, page views, referrers, countries, device/browser breakdowns and performance using Cloudflare Web Analytics.

## App usage

Status: **Prepared, not collecting yet.** Cloudflare rejected deployment because Analytics Engine is not enabled on this account (error 10089). Enable it at https://dash.cloudflare.com/e59edf1b90c8e5d4194d739055828833/workers/analytics-engine . Then add `"analytics_engine_datasets": [{"binding":"USAGE","dataset":"dmv_usage"}]` to wrangler.jsonc, set `USAGE_ENABLED=true` in dist/analytics.js, bump the service worker version, test, and deploy. Until then only visitor analytics run.

Dataset once enabled: **dmv_usage**, in Cloudflare Workers Analytics Engine. Only authenticated Cloudflare account analytics readers can query it; the site exposes no public reporting endpoint. The connected MCP credential returned 403 for SQL reads during setup, so use a credential with Account Analytics Read to query it.

Columns: blob1 event, blob2 state (`nj`/`ny`), blob3 language (`en`/`ka`), blob4 mode, blob5 topic, blob6 link target, blob7 country, blob8 broad device category. double1 is 1. index1 is the constant `dmv`, not a visitor identifier.

Events: `app_open`, `test_start`, `test_complete`, `state_change`, `language_change`, `link_click`. Opening the app is a page-load count, not a unique-person count. Completed tests are not linked to starts by any persistent user identifier. Do not interpret period completion/start ratios as exact cohort conversion.

Example SQL for last seven days:

```sql
SELECT blob1 AS event, blob2 AS state, blob3 AS language,
       SUM(_sample_interval) AS events
FROM dmv_usage
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY event, state, language
ORDER BY events DESC
```

Popular topics: filter `blob1 = 'test_start' AND blob4 = 'topic'`, group by blob5. Link clicks: filter `blob1 = 'link_click'`, group by blob6 (coffee, l3v, tools, echora).

## Privacy and limitations

- No names, emails, individual answers, scores, session identifiers, saved progress, or raw user-agent strings are stored in the custom dataset.
- IP addresses are used transiently by Cloudflare's rate limiter, not written to the custom analytics dataset. Normal hosting/provider processing still applies.
- Browser DNT / Global Privacy Control and the footer opt-out disable analytics loading and custom events. The opt-out preference itself stays on the device.
- Analytics failures do not interrupt quizzes; offline or blocked events are dropped, not queued. Counts are approximate and may include bots. Events are rate limited, origin checked, size limited and allowlisted.
- Tracking begins with this release; previous app actions cannot be reconstructed. Cloudflare controls data retention and sampling. Use weighted SUM(_sample_interval), not COUNT(), for reported totals.
- No synthetic usage events have been submitted to production.

No additional subscription was purchased. Existing Workers plan limits and Cloudflare analytics pricing apply.
