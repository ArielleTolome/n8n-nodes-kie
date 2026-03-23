# Handoff: T2V / I2V Operation Split

## Summary

Fixed three nodes to cleanly separate Text-to-Video and Image-to-Video as distinct operations, eliminating "image_url is required" errors caused by the old unified `generate` operation where imageUrl was optional but sometimes sent empty to the API.

## Changes

### nodes/Veo/Veo.node.ts

- Replaced single `generate` operation with two operations:
  - `textToVideo` — prompt, model, ratio, duration, enableTranslation, seed, replyUrl, replyRef, waitForCompletion. No imageUrl field.
  - `imageToVideo` — same fields plus imageUrl (required), referenceUrls, endImageUrl.
- All shared fields (model, prompt, ratio, duration, enableTranslation, seed, replyUrl, replyRef, waitForCompletion) show for both `textToVideo` and `imageToVideo`.
- Image-only fields (imageUrl, referenceUrls, endImageUrl) show exclusively for `imageToVideo`.
- Both operations call `POST /api/v1/veo/generate` — no API endpoint changes.
- `extend`, `get1080p`, `get4k`, `queryTaskStatus` operations unchanged.
- Default operation changed from `generate` to `textToVideo`.

### nodes/Runway/Runway.node.ts

- Replaced single `generate` operation with two operations:
  - `textToVideo` — prompt, model, quality, ratio, duration, seed, replyUrl, replyRef, captchaToken, waitForCompletion. No imageUrl/endImageUrl.
  - `imageToVideo` — same fields plus imageUrl (required), endImageUrl (optional).
- Shared fields (model, quality, ratio, duration, seed, replyUrl, replyRef, captchaToken, waitForCompletion) show for both `textToVideo` and `imageToVideo`.
- Image-only fields (imageUrl, endImageUrl) show exclusively for `imageToVideo`.
- Both operations call `POST /api/v1/runway/generate` — no API endpoint changes.
- `extend`, `aleph`, `queryTaskStatus` operations unchanged.
- Default operation changed from `generate` to `textToVideo`.

### nodes/Seedance/Seedance.node.ts

- Added new `imageToVideo` operation (inserted before `queryTaskStatus`).
- `imageToVideo` fields: imageUrl (required), prompt (optional), model (dropdown, default: bytedance/seedance-1.5-pro), duration, ratio, seed, replyUrl, replyRef, captchaToken, waitForCompletion.
- Updated `duration`, `ratio`, `seed`, `replyUrl`, `replyRef`, `waitForCompletion` displayOptions to include `imageToVideo`.
- `imageToVideo` calls `POST /api/v1/jobs/createTask` (same endpoint as textToVideo) with `image_url` set in the `input` object.
- `textToVideo` operation unchanged.

## TypeScript

`./node_modules/.bin/tsc --noEmit` passes with zero errors.
