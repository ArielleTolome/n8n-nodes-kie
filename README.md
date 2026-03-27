# n8n-nodes-kie-pro

[![npm version](https://img.shields.io/npm/v/n8n-nodes-kie-pro?color=blue)](https://www.npmjs.com/package/n8n-nodes-kie-pro)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-kie-pro)](https://www.npmjs.com/package/n8n-nodes-kie-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**22 n8n community nodes for [Kie.ai](https://kie.ai)** — the unified AI API covering image generation, video generation, audio, music, and upscaling. One API key. All models.

> Includes Flux-2 Pro, Flux Kontext, Sora 2, Kling 3.0, Veo3, Wan 2.6, Hailuo 2.3, Runway Gen4, Google Imagen4, Nano Banana, Seedream 5.0, Seedance/Bytedance, Qwen Image 2.0, GPT-Image-1.5, Grok Imagine, Ideogram v3, Recraft, Topaz, ElevenLabs, Suno V5, ZImage, InfineTalk.

---

## Installation

### Via n8n GUI (Recommended)

1. Open your n8n instance → **Settings → Community Nodes**
2. Click **Install**
3. Enter: `n8n-nodes-kie-pro`
4. Click **Install** and restart n8n

### Docker (CLI)

```bash
docker exec -u node n8n sh -c "
  mkdir -p /home/node/.n8n/nodes &&
  cd /home/node/.n8n/nodes &&
  npm install n8n-nodes-kie-pro
"
docker restart n8n
```

### Bare Metal

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-kie-pro
```

After restarting n8n, search for node names in the node picker (e.g. "Kling", "Suno", "Veo", "Flux").

---

## API Key Setup

1. Visit [kie.ai/api-key](https://kie.ai/api-key) to generate your API key
2. In n8n → **Credentials → New Credential → Kie API**
3. Paste your API key and save

---

## Available Nodes (22 Total)

### 🎬 Video Generation

#### Sora 2 Pro
Operations: Text-to-Video, Image-to-Video, Characters, Storyboard, Remove Watermark, Query Task Status

Models: `sora-2-pro-text-to-video`, `sora-2-text-to-video`, `sora-2-characters-pro`, `sora-2-characters`

Key parameters:
- `prompt` — text description of the video
- `imageUrl` — source image for I2V
- `model` — model variant
- `seed` — reproducibility seed (0 = random)
- `replyUrl` / `replyRef` — webhook callback URL and custom reference
- `waitForCompletion` — poll until done (default: true)

---

#### Kling
Operations: Text-to-Video, Image-to-Video, Video-to-Video (Motion Control), AI Avatar, Query Task Status

Models (T2V): `kling-3.0/video` ✨, `kling-2.6/text-to-video`, `kling/v2-5-turbo-text-to-video-pro`, `kling/v2-1-master-text-to-video`

Models (I2V): `kling-2.6/image-to-video` ✨, `kling/v2-5-turbo-image-to-video-pro`, `kling/v2-1-master-image-to-video`, `kling/v2-1-pro`, `kling/v2-1-standard`

Models (V2V): `kling-3.0/motion-control`, `kling-2.6/motion-control`

Key parameters:
- `prompt`, `imageUrl`
- `model` / `modelI2V` — model variant
- `ratio` — aspect ratio (16:9, 9:16, 1:1)
- `duration` — 5 or 10 seconds (Kling 3.0 supports 3–15s)
- `generationMode` — `std` or `pro` (Kling 3.0 only)
- `enableSound` — boolean, enables native audio (Kling 3.0 only)
- `replyUrl` / `replyRef` — webhook
- `waitForCompletion`

---

#### Seedance
Operations: Text-to-Video, Image-to-Video, Query Task Status

Models: `bytedance/seedance-1.5-pro`, `bytedance/v1-pro-text-to-video`, `bytedance/v1-lite-text-to-video`, `bytedance/v1-pro-image-to-video`, `bytedance/v1-lite-image-to-video`, `bytedance/v1-pro-fast-image-to-video`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `ratio`, `duration` (5 or 10s)
- `seed`, `endImageUrl`, `replyUrl`, `replyRef`, `captchaToken`
- `waitForCompletion`

---

#### Veo
Operations: Generate, Extend, Get 1080p Video, Get 4K Video, Query Task Status

Models: `veo3` (Veo 3 Standard), `veo3_fast` (Veo 3 Fast)

Key parameters:
- `prompt`, `model` — `veo3` or `veo3_fast`
- `imageUrl` — source image for I2V
- `referenceUrls` — multiple reference images
- `endImageUrl` — end frame
- `ratio` — aspect ratio
- `duration` — 5 or 8 seconds
- `seed`, `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Wan
Operations: Text-to-Video, Image-to-Video, Video-to-Video, Speech-to-Video, Animate, Query Task Status

Models (T2V): `wan/2-6-text-to-video`, `wan/2-5-text-to-video`, `wan/2-2-a14b-text-to-video-turbo`

Models (I2V): `wan/2-6-image-to-video`, `wan/2-6-flash-image-to-video` ✨, `wan/2-5-image-to-video`, `wan/2-2-a14b-image-to-video-turbo`

Models (V2V): `wan/2-6-video-to-video`, `wan/2-6-flash-video-to-video` ✨, `wan/2-2-animate-move`, `wan/2-2-animate-replace`

Key parameters:
- `prompt`, `imageUrl`, `videoUrl`
- `model`, `ratio`, `duration`
- `seed`, `endImageUrl`, `replyUrl`, `replyRef`, `captchaToken`
- `waitForCompletion`

---

#### Hailuo
Operations: Text-to-Video, Image-to-Video, Query Task Status

Models (T2V): `hailuo/02-text-to-video-pro`, `hailuo/02-text-to-video-standard`

Models (I2V): `hailuo/2-3-image-to-video-pro` ✨, `hailuo/2-3-image-to-video-standard` ✨, `hailuo/02-image-to-video-pro`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `ratio`, `duration`
- `seed`, `endImageUrl`, `replyUrl`, `replyRef`, `captchaToken`
- `waitForCompletion`

---

#### Runway
Operations: Generate, Extend, Aleph Generate, Query Task Status

Models: `gen4_turbo` (Gen4 Turbo), `gen4` (Gen4)

Key parameters:
- `prompt`, `imageUrl`, `endImageUrl`
- `model` — `gen4_turbo` or `gen4`
- `quality` — `720p` or `1080p` (required by Runway API)
- `ratio` — aspect ratio
- `duration` — 5 or 10 seconds
- `seed`, `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### GrokImagine
Operations: Text-to-Image, Image-to-Image, Text-to-Video, Image-to-Video, Upscale, Extend Video ✨, Query Task Status

Models: `grok-imagine/text-to-image`, `grok-imagine/image-to-image`, `grok-imagine/text-to-video`, `grok-imagine/image-to-video`, `grok-imagine/upscale`, `grok-imagine/extend`

Key parameters:
- `prompt`, `imageUrl`
- `aspectRatio`, `model`, `seed`
- `outputFormat` — JPEG or PNG
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

### 🖼️ Image Generation

#### Flux
Operations: Text-to-Image, Image-to-Image, Kontext Generate/Edit, Query Task Status

Models (T2I): `flux-2/pro-text-to-image`, `flux-2/flex-text-to-image`

Models (I2I): `flux-2/pro-image-to-image`, `flux-2/flex-image-to-image`

Models (Kontext): `flux-kontext-pro`, `flux-kontext-max`

Key parameters:
- `prompt`, `inputImage`
- `model`, `aspectRatio`, `resolution` — 1K or 2K (T2I/I2I)
- `steps` — inference steps (Kontext)
- `strength` — image strength for I2I (0–1)
- `seed`, `outputFormat` (JPEG/PNG/WebP)
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Seedream
Operations: Text-to-Image, Image Edit, Image-to-Image, Query Task Status

Models: `seedream/5-lite-text-to-image`, `seedream/4.5-text-to-image`, `bytedance/seedream-v4-text-to-image`, `seedream/4.5-edit`, `bytedance/seedream-v4-edit`, `seedream/5-lite-image-to-image`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Google (Imagen4 + Nano Banana)
Operations: Generate, Edit, Image-to-Image, Query Task Status

Models: `google/imagen4-ultra`, `google/imagen4`, `google/imagen4-fast`, `nano-banana-pro`, `nano-banana-2`, `google/nano-banana`, `google/nano-banana-edit`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`, `quality`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Ideogram
Operations: Generate (V3), Edit (V3) ✨, Remix (V3) ✨, Reframe (V3) ✨, Character, Character Edit, Character Remix, Query Task Status

Models: `ideogram/v3-text-to-image`, `ideogram/v3-edit`, `ideogram/v3-remix`, `ideogram/v3-reframe`, `ideogram/character`, `ideogram/character-edit`, `ideogram/character-remix`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `renderingSpeed` — TURBO/DEFAULT/QUALITY
- `seed`, `outputFormat`
- `referenceUrls`, `maskUrl`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Qwen
Operations: Text-to-Image, Image-to-Image, Image Edit, Query Task Status

Models: `qwen2/text-to-image`, `qwen/text-to-image`, `qwen2/image-to-image` ✨, `qwen/image-to-image`, `qwen/image-edit`, `qwen2/image-edit`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### GptImage15
Operations: Text-to-Image, Image-to-Image, Query Task Status

Models: `gpt-image/1.5-text-to-image`, `gpt-image/1.5-image-to-image`

Key parameters:
- `prompt`, `imageUrl`
- `aspectRatio`, `quality` (standard/hd)
- `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### FourOImage
Operations: Generate, Query Task Status

Models: `gpt-4o-image`, `gpt-4o-image-standard`, `gpt-4o-image-hd`

Key parameters:
- `prompt`, `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### ZImage
Operations: Generate, Query Task Status

Model: `z-image`

Key parameters:
- `prompt`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Recraft
Operations: Remove Background, Crisp Upscale, Query Task Status

Models: `recraft/remove-background`, `recraft/crisp-upscale`

Key parameters:
- `imageUrl`, `seed`, `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### Topaz
Operations: Image Upscale, Video Upscale, Query Task Status

Models: `topaz/image-upscale`, `topaz/video-upscale`

Key parameters:
- `imageUrl` / `videoUrl`, `scale`
- `outputFormat`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

### 🎵 Audio & Music

#### ElevenLabs
Operations: Text-to-Speech, Text-to-Dialogue V3 ✨, Speech-to-Text, Sound Effects, Audio Isolation, Query Task Status

Models: `elevenlabs/text-to-speech-turbo-2-5`, `elevenlabs/text-to-speech-multilingual-v2`, `elevenlabs/text-to-dialogue-v3`

Key parameters:
- `text` — text to speak
- `ttsModel`, `voice` (Rachel, Aria, Roger, Sarah, Laura, etc.)
- `stability`, `similarityBoost`
- `dialogue` — array of `{ voiceId, text }` turns (Text-to-Dialogue)
- `waitForCompletion`

---

#### Suno
Operations: Generate Music, Extend Music, Upload & Cover Audio ✨, Upload & Extend Audio ✨, Add Instrumental ✨, Add Vocals ✨, Replace Music Section ✨, Generate Lyrics, Boost Style, Convert to WAV, Separate Vocals, Generate MIDI, Create Music Video, Query Task Status

Models: `V5`, `V4_5PLUS`, `V4_5ALL`, `V4_5`, `V4`, `V3_5`

Key parameters:
- `prompt` — style/lyric prompt
- `modelVersion` — `V5`, `V4_5PLUS`, `V4_5ALL`, `V4_5`, `V4`, or `V3_5`
- `tags` — style tags (e.g. "pop, female vocals")
- `title`, `lyrics`, `style`, `instrumental`
- `sourceTaskId` — for extend/boost/midi/video operations
- `uploadUrl` — audio URL for upload operations
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### InfineTalk
Operations: Dub from Audio, Query Task Status

Model: `infinetalk/from-audio`

Key parameters:
- `audioUrl` — source audio file
- `targetLanguage`
- `replyUrl`, `replyRef`
- `waitForCompletion`

---

## Features

- **`waitForCompletion`** on all create operations (on by default) — polls every 3s up to 5 min
- **`resultUrls`** surfaced at top level in every response for direct file access
- **Webhook support** via `replyUrl` + `replyRef` on all nodes
- **`seed`** parameter on all generation nodes for reproducible outputs
- **Bearer token auth** — single Kie.ai API key for all 22 nodes
- **Exponential backoff** on 429 rate limit errors (2s / 4s / 8s retries)
- **`continueOnFail`** support on all nodes

---

## Usage Pattern

1. Drop a node into your workflow (e.g. **Kling**)
2. Select the operation (e.g. **Text-to-Video**)
3. Choose a model variant and fill in the prompt
4. Execute — the node waits for completion and returns `resultUrls`

**Fire-and-forget:** Disable **Wait for Completion** and use **Query Task Status** later with the returned `taskId`.

---

## Rate Limits

Kie.ai enforces 20 requests per 10 seconds. When throttled, the API returns HTTP 429.

Automatic retry with exponential backoff:

| Retry | Delay |
|-------|-------|
| 1st   | 2 s   |
| 2nd   | 4 s   |
| 3rd   | 8 s   |

After 3 retries the error is propagated. For high-volume workflows, use `waitForCompletion: false` and manage concurrency at the n8n level.

---

## Links

- [Kie.ai](https://kie.ai)
- [Kie.ai API Docs](https://docs.kie.ai)
- [npm package](https://www.npmjs.com/package/n8n-nodes-kie-pro)
- [GitHub Repository](https://github.com/ArielleTolome/n8n-nodes-kie)

---

## Changelog

| Version | Changes |
|---------|---------|
| v0.5.6 | Model ID audit — fix Flux (`flux-2/` prefix), fix Suno chirp IDs (`chirp-v4-5-plus`, `chirp-v4-5`, `chirp-v4`, `chirp-v3-5`), remove invalid `qwen2/image-to-image`; publish as `n8n-nodes-kie-pro` |
| v0.5.5 | Internal build; npm name fix attempt |
| v0.4.7 | Security audit — add `required: true` to API key credential field |
| v0.4.6 | README changelog update; lint warning cleanup |
| v0.4.5 | Snake_case audit — 36 API parameter naming bugs fixed across 11 nodes |
| v0.4.4 | Kling `tailImageUrl` snake_case bug fix; ElevenLabs fields verified |
| v0.4.3 | n8n best practices compliance — JSDoc comments, TypeScript type improvements |
| v0.4.2 | GitHub Actions CI/CD pipeline; CONTRIBUTING.md added |
| v0.4.1 | Package metadata improvements; .npmignore added |
| v0.4.0 | Documentation update — complete changelog backfill |
| v0.3.9 | 429 rate limit retry (exponential backoff); Kling 3.0 model + sound fields |
| v0.3.8 | Model ID fix — Sora2Pro, Google, ZImage |
| v0.3.7 | Model ID fix — Seedream, Seedance, Hailuo, Wan, Kling |
| v0.3.6 | UX polish — placeholder text and field descriptions across all nodes |
| v0.3.5 | Bug fix — Wan, Runway model IDs corrected |
| v0.3.4 | Fix Veo model names; fix ElevenLabs TTS model ID; add `quality` to Runway |
| v0.3.3 | Seed for Flux/Ideogram/Recraft; steps for Flux |
| v0.3.0–v0.3.2 | Model-specific optional params gaps filled across all nodes |
| v0.2.9 | Added seed, endImageUrl, replyUrl, replyRef, captchaToken to all nodes |
| v0.2.0–v0.2.8 | Full 21-node release + Kling 3.0, ElevenLabs V3, Qwen 2.0, Veo 3.1 |
| v0.1.0 | Initial release — Sora 2 Pro, Seedream, GPT-image-1.5, ElevenLabs |

---

## License

MIT
