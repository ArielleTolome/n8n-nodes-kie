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

## Available Nodes

### 🎬 Video Generation

| Node | Models / Operations |
|------|-------------------|
| **Sora 2 Pro** | Text-to-Video, Image-to-Video, Characters, Storyboard, Remove Watermark, Query Status |
| **Kling** | Text-to-Video (3.0/2.6/2.5/2.1), Image-to-Video, AI Avatar, Query Status |
| **Seedance** | Text-to-Video, Image-to-Video (Seedance 1.5 Pro, v1 Pro/Lite), Query Status |
| **Veo** | Generate (Veo 3/3 Fast/3.1/3.1 Fast), Extend, Get 1080p, Query Status |
| **Wan** | Text-to-Video, Image-to-Video, Video-to-Video, Speech-to-Video, Animate (Wan 2.2/2.6 variants), Query Status |
| **Hailuo** | Text-to-Video, Image-to-Video (Hailuo 02 Pro/Standard, 2.3 Pro), Query Status |
| **Runway** | Generate (Gen4/Gen4 Turbo), Extend, Aleph Generate, Query Status |
| **GrokImagine** | Text-to-Image, Image-to-Image, Text-to-Video, Image-to-Video, Upscale, Query Status |

### 🖼️ Image Generation

| Node | Models / Operations |
|------|-------------------|
| **Flux** | Text-to-Image, Image-to-Image, Kontext (Flux 2 Pro/Flex, Kontext Pro/Max/Dev), Query Status |
| **Seedream** | Text-to-Image, Image Edit, Image-to-Image (Seedream 5 Lite/4.5/v4), Query Status |
| **Google** | Generate, Edit, Image-to-Image (Imagen 4 Ultra/Fast, Nano Banana/Pro/2), Query Status |
| **Ideogram** | Generate, Reframe, Character, Character Edit, Character Remix (V3/V3 Turbo), Query Status |
| **Qwen** | Text-to-Image, Image-to-Image, Image Edit (Qwen/Qwen2), Query Status |
| **GptImage15** | Text-to-Image, Image-to-Image, Query Status |
| **FourOImage** | Generate (GPT-4o image, Standard/HD), Query Status |
| **ZImage** | Generate, Query Status |
| **Recraft** | Remove Background, Crisp Upscale, Query Status |
| **Topaz** | Image Upscale, Video Upscale, Query Status |

### 🎵 Audio & Music

| Node | Models / Operations |
|------|-------------------|
| **ElevenLabs** | Text-to-Speech (Turbo 2.5), Speech-to-Text, Sound Effects, Audio Isolation, Text-to-Dialogue, Query Status |
| **Suno** | Generate Music, Extend Music, Generate Lyrics, Boost Style, Convert to WAV, Separate Vocals, Add Vocals, MIDI to Music, Music Video, Query Status |
| **InfineTalk** | Dub from Audio, Query Status |

---

## Features

- **`waitForCompletion`** toggle on all create operations (on by default) — polls every 3s up to 5 min
- **`resultUrls`** surfaced at top level in every response — direct access to output file URLs
- **Callback URL** support for async task notifications
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
| v0.2.1 | Fix resultJson parsing — `resultUrls` now surfaced at top level |
| v0.2.0 | Full model coverage — 21 nodes: Sora2Pro, Kling, Seedance, Veo, Wan, Hailuo, Runway, GrokImagine, Flux, Seedream, Google, Ideogram, Qwen, GptImage15, FourOImage, ZImage, Recraft, Topaz, ElevenLabs, Suno, InfineTalk |
| v0.1.0 | Initial release — Sora 2 Pro, Seedream, GPT-image-1.5, ElevenLabs |

---

## License

MIT
