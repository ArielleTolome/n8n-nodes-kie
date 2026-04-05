# Changelog

All notable changes to this project will be documented in this file.

Format: [Semantic Versioning](https://semver.org/)

---

## [0.14.0] - 2026-04-05

### Added
- **Seedance**: Added `bytedance/seedance-2` and `bytedance/seedance-2-fast` for both text-to-video and image-to-video
- **Seedance**: Added Seedance 2.0 fields for multimodal references (`referenceImageUrls`, `referenceVideoUrls`, `referenceAudioUrls`), `lastFrameUrl`, `resolution`, `generateAudio`, `returnLastFrame`, and `webSearch`
- **Veo**: Added `veo3_lite` (Veo 3.1 Lite) model option
- **Veo**: Added explicit `generationType` selection and optional `watermark`
- **Wan**: Added new `Image` operation for `wan/2-7-image` and `wan/2-7-image-pro`
- **Wan**: Added Wan 2.7 image fields for optional editing inputs, `imageCount`, `enableSequential`, `imageResolution`, `thinkingMode`, `imageWatermark`, and `imageSeed`

### Changed
- **GrokImagine**: Video generation now exposes documented `duration` (6–30s), `mode`, `resolution`, and video `aspect_ratio`
- **Seedance**: Expanded duration and aspect ratio options to better match newer Seedance 2.0 docs

## [0.13.0] - 2026-03-28

### Added
- **Suno**: New `V5_5` model — most expressive Suno model yet with enhanced voice personalization
- **Suno**: New `generateSound` operation — create custom sound effects from text prompts with loop/BPM/key control (model: `ai-music-api/sounds`)
- **Suno**: New `musicMashup` operation — blend two audio tracks into a new composition with `styleWeight`, `audioWeight`, and `weirdnessConstraint` parameters (model: `ai-music-api/mashup`)
- **GrokImagine**: Image-to-Image now supports up to 5 reference images via `additionalImageUrls` field
- **GrokImagine**: Image-to-Video now supports up to 7 reference images
- **NEW NODE: Claude (Kie.ai)** — chat completions for Anthropic Claude 4 series via Kie.ai API
  - Models: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `claude-sonnet-4-5`, `claude-opus-4-5`
  - Supports streaming, multimodal inputs, system prompts, multi-turn history
- **NEW NODE: OpenAI Chat (Kie.ai)** — GPT-5 series and Codex models via Kie.ai API
  - Models: GPT-5.2, GPT Codex
  - Supports web search grounding, reasoning effort control
- **NEW NODE: Midjourney (Kie.ai)** — image generation via Kie.ai
  - Models: Midjourney Standard, Niji 7 (anime-optimized)
  - Operations: Text-to-Image, Image-to-Image
- **CI**: GitHub Actions workflow now auto-publishes to npm and deploys to n8n on git tag push
- **Automation**: Weekly Kie.ai audit script (`scripts/kie-audit.mjs`) — tracks announcements API for new models

### Fixed
- **Gemini**: Node was in `package.json` but missing from `index.ts` exports — now properly registered

---

## [0.12.2] - 2026-03-28

### Fixed
- **Kling**: Critical 422 `multi_shots cannot be empty` error on Kling 3.0 textToVideo/imageToVideo
  - Kling 3.0 has a completely different API schema from v2.x — these differences are now handled separately:
    - `aspect_ratio` (not `ratio`)
    - `sound` (not `enable_sound`)
    - `image_urls` array (not `image_url` string) for Image-to-Video
    - `multi_shots: false` is now always sent (required boolean for single-shot mode)
- **Kling**: Added `kling-3.0/image-to-video` to Image-to-Video model dropdown
- **Kling**: Added 15-second duration option (Kling 3.0 supports up to 15s)

---

## [0.12.1] - 2026-03-27

### Fixed
- **Kling**: Critical 500 `This field is required` error on Kling 3.0 textToVideo
  - The `mode` field (Standard/Pro) was conditionally omitted when set to `std` (default), but Kling 3.0 requires it always. Now always sends `mode: 'std'` or `mode: 'pro'`

---

## [0.12.0] - 2026-03-28

### Added
- **NEW NODE: Gemini (Kie.ai)** — chat completions for Google Gemini models via Kie.ai API
  - Models: Gemini 3.1 Pro, Gemini 3 Pro, Gemini 2.5 Pro, Gemini 2.5 Flash
  - Supports multimodal inputs (text + image URL), Google Search grounding, optional reasoning/thoughts, system prompts, multi-turn chat history
  - Returns `reply` + `updatedHistory` for chaining across multiple nodes

---

## [0.11.0] - 2026-03-27

### Added (deep field audit across 9 nodes)
- **GrokImagine**: `negativePrompt`, `seed`, `replyUrl`, `replyRef`
- **Hailuo**: `aspectRatio`, `duration`, `negativePrompt` (all three were missing entirely)
- **Kling**: `negativePrompt` for text-to-video and image-to-video
- **Seedream**: `negativePrompt`, `numOutputs` (1–4) for text-to-image
- **Wan**: `negativePrompt` for all video operations
- **Seedance**: `negativePrompt`, `captchaToken` for textToVideo
- **Google (Imagen)**: `numOutputs` (1–4) for generate; `seed` extended to imageToImage
- **Ideogram**: `numOutputs` (1–8) for generate operation
- **Flux**: `seed` for Kontext operation

---

## [0.10.4] - 2026-03-27

### Fixed
- **Suno**: Corrected `modelVersion` fallback from `'v4.5'` to `'V4_5'`
- **Ideogram**: Renamed renderingSpeed option to satisfy n8n property validation

### Added
- Regression tests for GrokImagine and InfineTalk (120 tests total)

---

## [0.10.1] - 2026-03-27

### Fixed
- **package.json**: InfineTalk node missing from `n8n.nodes` array

## [0.10.0] - 2026-03-27

### Fixed
- **GrokImagine**: 422 `aspect_ratio cannot be empty` — added `required: true` + `|| '1:1'` fallback
- **Kling**: `generationMode` (Standard/Pro) was not being sent to API — fixed
- **Kling**: `enableSound` was not being sent to API — fixed
- **package.json**: InfineTalk not registered in `n8n.nodes` array

---

## [0.5.6] - 2026-03-17

### Fixed
- Model ID audit — fix Flux (`flux-2/` prefix), fix Suno chirp IDs, remove invalid `qwen2/image-to-image`
- Published as `n8n-nodes-kie-pro`

---

## [0.4.5] - 2026-03-17

### Fixed
- 36 API parameter naming bugs across 11 nodes (camelCase → snake_case in request bodies)

---

## [0.4.0] - 2026-03-17

### Added
- Kling 3.0 support (generationMode, enableSound, 15s duration)
- 429 rate limit retry with exponential backoff

---

## [0.2.9] - 2026-03-17

### Added
- Initial field expansion: seed, replyUrl, replyRef, captchaToken, negativePrompt across all nodes

---

## [0.1.0] - 2026-03-17

### Added
- Initial release — Sora 2 Pro, Seedream, GPT-image-1.5, ElevenLabs, 21 nodes total
