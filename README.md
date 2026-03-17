# n8n-nodes-kie

n8n community nodes for [kie.ai](https://kie.ai) — comprehensive coverage of all kie.ai models across video, image, audio, and music generation.

All nodes use a single Kie.ai API key. Every create operation supports `waitForCompletion` (polls every 3s, 5-min timeout).

> **Note:** The npm package name `n8n-nodes-kie` may not be available. Install from GitHub (see below).

---

## Installation

### GitHub Install (Recommended)

For self-hosted n8n running in Docker:

```bash
docker exec -u node n8n sh -c "
  mkdir -p /home/node/.n8n/nodes &&
  cd /home/node/.n8n/nodes &&
  npm install github:ArielleTolome/n8n-nodes-kie
"
docker restart n8n
```

For self-hosted n8n (bare metal):

```bash
cd ~/.n8n/nodes
npm install github:ArielleTolome/n8n-nodes-kie
```

After restarting n8n, search for node names in the node picker (e.g. "Kling", "Suno", "Veo").

---

## API Key Setup

1. Visit [kie.ai/api-key](https://kie.ai/api-key) to generate your API key
2. In n8n, go to **Credentials > New Credential > Kie API**
3. Paste your API key and save

---

## Available Nodes (21 Total)

### 🎬 Video Generation

#### Sora 2 Pro
Operations: Text-to-Video, Image-to-Video, Characters, Storyboard, Remove Watermark, Query Task Status

Models: `sora-2-pro`, `sora-2`

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

Models (T2V): `kling-3.0/video` *(new — up to 15s, native audio)*, `kling-2.6/text-to-video`, `kling/v2-5-turbo-text-to-video-pro`, `kling/v2-1-master-text-to-video`, `kling/v2-1-pro`, `kling/v2-1-standard`

Models (I2V): `kling-3.0/video` *(new)*, `kling-2.6/image-to-video`, `kling/v2-5-turbo-image-to-video-pro`, `kling/v2-1-master-image-to-video`, `kling/v2-1-pro`

Key parameters:
- `prompt`, `imageUrl`
- `model` / `modelI2V` — model variant
- `ratio` — aspect ratio (16:9, 9:16, 1:1)
- `duration` — 5 or 10 seconds (Kling 3.0 supports 3–15s via duration field)
- `generationMode` — `std` or `pro` (Kling 3.0 only)
- `enableSound` — boolean, enables native audio (Kling 3.0 only)
- `cfgScale` / `seed` — for older models
- `replyUrl` / `replyRef` — webhook
- `captchaToken` — reCAPTCHA token if required
- `waitForCompletion`

---

#### Seedance
Operations: Text-to-Video, Image-to-Video, Query Task Status

Models: `seedance-2.0/text-to-video`, `seedance-1.5-pro/text-to-video`, `seedance-v1-pro/text-to-video`, `seedance-v1-lite/text-to-video` (and I2V equivalents)

Key parameters:
- `prompt`, `imageUrl`
- `model`, `ratio`, `duration` (5 or 10s)
- `seed`, `endImageUrl`, `replyUrl`, `replyRef`, `captchaToken`
- `waitForCompletion`

---

#### Veo
Operations: Generate, Extend, Get 1080p Video, Get 4K Video, Query Task Status

Models: `veo3` (Veo 3.1 Standard), `veo3_fast` (Veo 3.1 Fast)

Key parameters:
- `prompt` — generation prompt
- `model` — `veo3` or `veo3_fast`
- `imageUrl` — single image for I2V
- `referenceUrls` — multiple reference images (Reference-to-Video mode)
- `endImageUrl` — end frame image URL
- `ratio` — aspect ratio (16:9, 9:16, 1:1)
- `duration` — 5 or 8 seconds
- `enableTranslation` — auto-translate non-English prompts
- `seed` — reproducibility seed
- `replyUrl` / `replyRef` — webhook
- `waitForCompletion`

---

#### Wan
Operations: Text-to-Video, Image-to-Video, Video-to-Video, Speech-to-Video, Animate, Query Task Status

Models (T2V): `wan2.5-t2v-preview/text-to-video`, `wan-2.6/text-to-video`, `wan-2.5/text-to-video`, `wan-2.2-turbo/text-to-video`

Models (I2V): `wan-2.6/image-to-video`, `wan-2.6-flash/image-to-video`, `wan-2.5/image-to-video`, `wan-2.2-turbo/image-to-video`

Key parameters:
- `prompt`, `imageUrl`, `videoUrl`
- `model`, `ratio`, `duration`
- `seed`, `endImageUrl`, `replyUrl`, `replyRef`, `captchaToken`
- `waitForCompletion`

---

#### Hailuo
Operations: Text-to-Video, Image-to-Video, Query Task Status

Models (T2V): `hailuo-02-pro/text-to-video`, `hailuo-02-standard/text-to-video`

Models (I2V): `hailuo-2.3-pro/image-to-video`, `hailuo-2.3-standard/image-to-video`, `hailuo-02-pro/image-to-video`, `hailuo-02-standard/image-to-video`

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
- `quality` — `720p` or `1080p` (**required** by Runway API)
- `ratio` — aspect ratio (16:9, 9:16, 1:1)
- `duration` — 5 or 10 seconds
- `seed` — reproducibility seed
- `replyUrl` / `replyRef` — webhook
- `captchaToken`
- `waitForCompletion`

---

#### GrokImagine
Operations: Text-to-Image, Image-to-Image, Text-to-Video, Image-to-Video, Upscale, Query Task Status

Key parameters:
- `prompt`, `imageUrl`
- `aspectRatio`, `model`, `seed`
- `outputFormat` — JPEG or PNG
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

### 🖼️ Image Generation

#### Flux
Operations: Text-to-Image, Image-to-Image, Kontext Generate/Edit, Query Task Status

Models (T2I/I2I): `flux2/pro`, `flux2/flex`

Models (Kontext): `flux-kontext-pro`, `flux-kontext-max`, `flux-kontext-dev`

Key parameters:
- `prompt`, `inputImage`
- `model`, `aspectRatio`
- `steps` — inference steps (Kontext)
- `strength` — image strength for I2I (0–1)
- `seed`, `outputFormat` (JPEG/PNG/WebP)
- `quality` — output quality
- `background` — background color
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Seedream
Operations: Text-to-Image, Image Edit, Image-to-Image, Query Task Status

Models: `seedream-5-lite`, `seedream-4.5`, `seedream-v4` (T2I/I2I/Edit)

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Google (Imagen)
Operations: Generate, Edit, Image-to-Image, Query Task Status

Models: `imagen4-ultra`, `imagen4`, `imagen4-fast`, `nano-banana-pro`, `nano-banana-2`, `nano-banana`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `quality`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Ideogram
Operations: Generate, Reframe, Character, Character Edit, Character Remix, Query Task Status

Models: `ideogram-v3`, `ideogram-v3-turbo`

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `renderingSpeed` — quality vs speed (TURBO/DEFAULT/QUALITY)
- `seed`, `outputFormat`
- `referenceUrls` — style reference images
- `maskUrl` — inpainting mask
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Qwen
Operations: Text-to-Image, Image-to-Image, Image Edit, Query Task Status

Models: `qwen2` (Qwen 2), `qwen` (Qwen)

Key parameters:
- `prompt`, `imageUrl`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### GptImage15
Operations: Text-to-Image, Image-to-Image, Query Task Status

Key parameters:
- `prompt`, `imageUrl`
- `aspectRatio`, `quality` (standard/hd)
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### FourOImage
Operations: Generate, Query Task Status

Models: `gpt-4o-image`, `gpt-4o-image-standard`, `gpt-4o-image-hd`

Key parameters:
- `prompt`
- `model`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### ZImage
Operations: Generate, Query Task Status

Key parameters:
- `prompt`, `aspectRatio`
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Recraft
Operations: Remove Background, Crisp Upscale, Query Task Status

Key parameters:
- `imageUrl`
- `seed`, `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

#### Topaz
Operations: Image Upscale, Video Upscale, Query Task Status

Key parameters:
- `imageUrl` / `videoUrl`
- `scale` — upscale factor
- `outputFormat`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

### 🎵 Audio & Music

#### ElevenLabs
Operations: Text-to-Speech, Speech-to-Text, Sound Effects, Audio Isolation, Text-to-Dialogue, Query Task Status

TTS Models: `elevenlabs/text-to-speech-turbo-2-5`, `elevenlabs/text-to-speech-multilingual-v2`

Key parameters (Text-to-Speech):
- `text` — text to speak
- `ttsModel` — model selection
- `voice` — speaker voice (Rachel, Aria, Roger, Sarah, Laura, etc.)
- `stability` — voice stability (0–1)
- `similarityBoost` — clarity/similarity boost (0–1)

Key parameters (Text-to-Dialogue):
- `dialogue` — array of `{ voiceId, text }` turns
- `model` — `elevenlabs/text-to-dialogue-v3` or `elevenlabs/text-to-dialogue`
- `stability`, `language_code`

---

#### Suno
Operations: Generate Music, Extend Music, Generate Lyrics, Boost Style, Convert to WAV, Separate Vocals, Add Vocals, MIDI to Music, Music Video, Query Task Status

Key parameters (Generate Music):
- `prompt` — style/lyric prompt
- `model` — `v4.5_plus`, `v4.5`, `v4`, `v3.5`
- `tags` — style tags (e.g. "pop, female vocals")
- `title`, `lyric`
- `seed`, `replyUrl`, `replyRef`
- `waitForCompletion`

---

#### InfineTalk
Operations: Dub from Audio, Query Task Status

Key parameters:
- `audioUrl` — source audio file
- `targetLanguage`
- `replyUrl` / `replyRef`
- `waitForCompletion`

---

## Features

- **`waitForCompletion`** toggle on all create operations (on by default) — polls every 3s up to 5 min
- **`resultUrls`** surfaced at top level in every response — direct access to output file URLs
- **Callback / Webhook URL** support via `replyUrl` + `replyRef`
- **`seed`** parameter on all generation operations for reproducible outputs
- **Bearer token auth** via single Kie.ai API key
- **`continueOnFail`** support — workflow continues even if one task fails

---

## Usage Pattern

1. Drop a node into your workflow (e.g. **Kling**)
2. Select the operation (e.g. **Text-to-Video**)
3. Choose a model variant and fill in the prompt
4. Execute — the node waits for completion and returns `resultUrls` with the output file URLs

To run fire-and-forget: disable **Wait for Completion** and use **Query Task Status** later with the returned `taskId`.

---

## Links

- [kie.ai](https://kie.ai)
- [kie.ai API Docs](https://docs.kie.ai)
- [GitHub Repository](https://github.com/ArielleTolome/n8n-nodes-kie)

---

## Changelog

| Version | Changes |
|---------|---------|
| v0.3.9 | Error handling improvements — 429 rate limit retry (exponential backoff 2/4/8s) in GenericFunctions; enriched error messages include API response body; Kling node adds Kling 3.0 T2V/I2V model + `mode` (std/pro) + `sound` fields |
| v0.3.8 | Model ID verification pass — corrected Sora2Pro, Google, ZImage, Seedream, Seedance, Hailuo, Wan, Kling model IDs; added placeholder text and improved field descriptions |
| v0.3.4 | Fix Veo model names (`veo3`, `veo3_fast`); fix ElevenLabs TTS model ID (dot→hyphen); add `quality` field to Runway generate (now required by API); update README |
| v0.3.3 | Final targeted gap-fill — seed for Flux/Ideogram/Recraft, steps for Flux; verify execute logic across all nodes |
| v0.3.2 | Model-specific optional params — steps, strength, quality, background, outputFormat, seed gaps filled |
| v0.3.1 | Deep-pass — seed, model params, and execute logic gaps filled across all nodes |
| v0.3.0 | Added missing optional fields to Flux, Ideogram, Recraft, Topaz, Qwen, Suno, ElevenLabs, InfineTalk, Google |
| v0.2.9 | Added missing optional fields to all nodes: seed, endImageUrl, replyUrl, replyRef, captchaToken |
| v0.2.8 | Kling 3.0 Motion Control V2V + Kling 2.5 Turbo standard model |
| v0.2.7 | ElevenLabs V3 model selector + language_code for Text-to-Dialogue |
| v0.2.6 | Qwen Image 2.0 model selectors for T2I and I2I operations |
| v0.2.5 | Replace comma-separated reference URL fields with fixedCollection pickers (Veo, Ideogram) |
| v0.2.4 | Flux Kontext inputImage bug fix; Ideogram reference images, mask URL, rendering speed |
| v0.2.3 | Complete model coverage audit — Veo 3.1, Seedance 2.0, Wan 2.5, Suno versions, Kling 3.0 |
| v0.2.2 | Add Veo 3.1 (Fast/Quality/Reference/4K), Wan 2.5 models |
| v0.2.1 | Fix resultJson parsing — `resultUrls` now surfaced at top level |
| v0.2.0 | Full model coverage — 21 nodes: Sora2Pro, Kling, Seedance, Veo, Wan, Hailuo, Runway, GrokImagine, Flux, Seedream, Google, Ideogram, Qwen, GptImage15, FourOImage, ZImage, Recraft, Topaz, ElevenLabs, Suno, InfineTalk |
| v0.1.0 | Initial release — Sora 2 Pro, Seedream, GPT-image-1.5, ElevenLabs |

---

## License

MIT
