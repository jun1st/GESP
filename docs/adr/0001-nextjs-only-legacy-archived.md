# Next.js app is the only product; legacy site archived, no redirects

The Next.js app in `web/` is the only product. The old static HTML site and its Express server were moved untouched to `archive/` and are linked from nowhere. We chose this over keeping two front ends in sync (the level JSON had to be hand-duplicated) and over a redirect table for old `.html` URLs.

Consequences:

- Old `.html` URLs and `/levels/N` return 404; no redirects are kept.
- Level Courses live at `/course/N` (1–8). Fundamentals is not a Level and lives at `/fundamentals`.
- Fundamentals progress key changed from `gesp_lv0_prog` to `gesp_fundamentals_prog` with no migration, so existing users' Fundamentals check-ins were reset.
