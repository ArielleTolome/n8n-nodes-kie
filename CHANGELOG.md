# Changelog

All notable changes to this project will be documented in this file.

Format: [Semantic Versioning](https://semver.org/)

## [0.10.0] - 2026-03-27
### Fixed
- **GrokImagine**: Fixed critical 422 "aspect_ratio cannot be empty" error in Text-to-Image by adding `required: true` to the `aspectRatio` field and a `|| '1:1'` fallback in execute()
- **GrokImagine**: Confirmed `image_urls` array format for Image-to-Image is correct per Kie.ai API
- **Kling**: Fixed `generationMode` (Standard/Pro) field not being sent to the API — now correctly sent as `input.mode` for both textToVideo and imageToVideo
- **Kling**: Fixed `enableSound` field not being sent to the API — now correctly sent as `input.enable_sound`
- **package.json**: Fixed InfineTalk node not registered in `n8n.nodes` array — node was built but never exposed to n8n

## [0.5.1] - 2026-03-17
### Fixed
- Example workflow type strings corrected: `image-generation-flux.json` → `n8n-nodes-kie.flux`, `image-generation-ideogram.json` → `n8n-nodes-kie.ideogram`, `text-to-speech-elevenlabs.json` → `n8n-nodes-kie.elevenLabs`, `video-to-video-topaz.json` → `n8n-nodes-kie.topaz` (all were using non-existent `n8n-nodes-kie.kie` type)
### Added
- SUMMARY.md — comprehensive package documentation for first-time discovery

## [0.4.9] - 2026-03-17
### Added
- 4 additional importable n8n workflow example templates: Flux image generation, Topaz video upscale, ElevenLabs TTS, Ideogram image generation
- CHANGELOG.md (this file)
- PUBLISH.md with n8n community node submission guidance

## [0.4.8] - 2026-03-17
### Added
- Importable n8n workflow example templates in `examples/`
- Examples section in README

## [0.4.7] - 2026-03-17
### Security
- Added `required: true` to API key credential field
- Documented rate limits and exponential backoff behavior

## [0.4.6] - 2026-03-17
### Documentation
- Full README changelog updated through v0.4.5
- Lint: removed package.json from ESLint glob (0 warnings)

## [0.4.5] - 2026-03-17
### Fixed
- **36 API parameter naming bugs** across 11 nodes — camelCase → snake_case in API request bodies
- Affected nodes: Ideogram (9), Topaz (6), Wan (6+1 UI), Google (3), Qwen (3), InfineTalk (2), Hailuo (2), Seedance (2), Flux (1), GrokImagine (1), Recraft (1)
- Wan: fixed displayOptions typo causing Mask URL field to be invisible

## [0.4.4] - 2026-03-17
### Fixed
- Kling: `tailImageUrl` → `tail_image_url` in I2V requests (silent API failure)
- ElevenLabs: all 5 operations verified correct
- GenericFunctions: retry logic verified (3 retries, 2s/4s/8s backoff)

## [0.4.3] - 2026-03-17
### Changed
- Added JSDoc to all 7 GenericFunctions exports
- TypeScript: fixed Promise<any> types

## [0.4.2] - 2026-03-17
### Added
- GitHub Actions CI workflow (Node 18.x + 20.x)
- GitHub Actions Release workflow (auto-publish on tag)
- CONTRIBUTING.md

## [0.4.1] - 2026-03-17
### Added
- `.npmignore` (dist-only npm package)
- `bugs` field in package.json

## [0.4.0] - 2026-03-17
### Added
- Kling 3.0 support (generationMode, enableSound, 15s duration)
- Complete GitHub release history

## [0.3.9] - 2026-03-17
### Added
- 429 rate limit retry with exponential backoff in GenericFunctions

## [0.3.7] - 2026-03-17
### Fixed
- Critical model ID format fixes: Seedream, Seedance, Hailuo, Wan, Kling

## [0.3.6] - 2026-03-17
### Changed
- UX: placeholder text on 14+ URL fields
- Normalized seed/replyUrl/captchaToken descriptions

## [0.3.5] - 2026-03-17
### Fixed
- Wan: stale model ID removed
- Runway: quality field marked required

## [0.3.4] - 2026-03-17
### Fixed
- Veo: model IDs corrected (veo3/veo3_fast)
- ElevenLabs: TTS model ID format fixed (turbo-2-5 not turbo-2.5)
- Runway: required quality field added (720p/1080p)
### Changed
- Full README rewrite

## [0.3.3] - 2026-03-17
### Fixed
- Confirmed all prior wave fields complete

## [0.3.2] - 2026-03-17
### Added
- Flux: strength field for kontext op
- Ideogram: renderingSpeed dropdown
- GptImage15: background, outputFormat, outputCompression, n, quality
- Topaz: outputFormat, outputQuality, faceRecovery, denoiseStrength
- InfineTalk: speed, pitch, volume

## [0.3.1] - 2026-03-17
### Added
- Advanced parameters: guidance scale, colorPalette, ttsLanguageCode, continueClipId

## [0.3.0] - 2026-03-17
### Added
- replyUrl, replyRef, captchaToken, seed, negativePrompt across all nodes
- Style options, modelVersion dropdowns

## [0.2.9] - 2026-03-17
### Added
- Initial field expansion: startFrame/endFrame, seed across video nodes
