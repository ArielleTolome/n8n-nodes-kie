# n8n-nodes-kie — Package Summary

## What This Is

`n8n-nodes-kie` is a community n8n node package that provides **21 individual AI generation nodes** powered by the [kie.ai](https://kie.ai) API. Each service gets its own dedicated n8n node with full parameter dropdowns, model selection, async polling, and retry handling baked in.

Install it in your self-hosted n8n instance and start generating images, videos, music, speech, and more — without writing a line of API code.

**npm:** [`n8n-nodes-kie`](https://www.npmjs.com/package/n8n-nodes-kie)  
**GitHub:** [ArielleTolome/n8n-nodes-kie](https://github.com/ArielleTolome/n8n-nodes-kie)  
**Current Version:** 0.5.1  
**Requires:** n8n ≥ 1.0, Node ≥ 18

---

## Nodes Included (21 nodes)

| Node | n8n Type | Operations |
|------|----------|------------|
| **Sora 2 Pro** | `n8n-nodes-kie.sora2Pro` | textToVideo, imageToVideo, queryTaskStatus |
| **Kling** | `n8n-nodes-kie.kling` | textToVideo, imageToVideo, aiAvatar, videoToVideo, queryTaskStatus |
| **Seedream** | `n8n-nodes-kie.seedream` | textToImage, imageToImage, imageEdit, queryTaskStatus |
| **Seedance** | `n8n-nodes-kie.seedance` | textToVideo, imageToVideo, queryTaskStatus |
| **Wan** | `n8n-nodes-kie.wan` | textToVideo, imageToVideo, queryTaskStatus |
| **Hailuo** | `n8n-nodes-kie.hailuo` | textToVideo, imageToVideo, queryTaskStatus |
| **Grok Imagine** | `n8n-nodes-kie.grokImagine` | textToImage, imageToImage, textToVideo, imageToVideo, upscale, queryTaskStatus |
| **Google AI Images** | `n8n-nodes-kie.googleAiImages` | generate, edit, imageToImage, queryTaskStatus |
| **Flux** | `n8n-nodes-kie.flux` | textToImage, imageToImage, kontext (image editing), queryTaskStatus |
| **Ideogram** | `n8n-nodes-kie.ideogram` | generate, queryTaskStatus |
| **Qwen** | `n8n-nodes-kie.qwen` | textToImage, imageToImage, imageEdit, queryTaskStatus |
| **ZImage (Nano Banana)** | `n8n-nodes-kie.zImage` | generate, queryTaskStatus |
| **Topaz** | `n8n-nodes-kie.topaz` | imageUpscale, videoUpscale, queryTaskStatus |
| **Recraft** | `n8n-nodes-kie.recraft` | removeBackground, crispUpscale, queryTaskStatus |
| **GPT Image 1.5** | `n8n-nodes-kie.gptImage15` | textToImage, imageToImage, queryTaskStatus |
| **4o Image** | `n8n-nodes-kie.fourOImage` | generate, queryTaskStatus |
| **Runway** | `n8n-nodes-kie.runway` | generate, extend, queryTaskStatus |
| **Veo** | `n8n-nodes-kie.veo` | generate, extend, queryTaskStatus |
| **Suno** | `n8n-nodes-kie.suno` | generateMusic, extendMusic, generateLyrics, boostStyle, convertWav, separateVocals, generateMidi, createMusicVideo, queryTaskStatus |
| **ElevenLabs** | `n8n-nodes-kie.elevenLabs` | textToSpeech, speechToText, soundEffects, audioIsolation, textToDialogue, queryTaskStatus |
| **InfineTalk** | `n8n-nodes-kie.infineTalk` | fromAudio (lip-sync / talking avatar), queryTaskStatus |

---

## Notable Features

- **Exponential backoff retry** — 3 retries with 2 s / 4 s / 8 s delays on 429 rate-limit responses (GenericFunctions)
- **`waitForCompletion` flag** — all generation operations can poll the kie.ai task endpoint until the job finishes, then return the final result in a single n8n step
- **`replyUrl` / `replyRef` webhook callbacks** — pass a webhook URL so kie.ai pushes the result back for fully async workflows
- **`captchaToken` support** — services like Google AI Images that require CAPTCHA solving accept the token as a parameter
- **Full model dropdowns** — every node ships with curated dropdown options for all current kie.ai models (e.g. Kling 2.6/3.0, Flux Kontext Max/Pro, Suno v4/v4.5, ElevenLabs Turbo 2.5, etc.)
- **`queryTaskStatus` operation** — all nodes expose a status-check operation so you can poll manually or via n8n's Wait node in advanced async flows
- **Single shared credential** — one `KIE API` credential (API key) works across all 21 nodes
- **CI/CD** — GitHub Actions runs `npm run build && npm run lint` on Node 18.x and 20.x; tagged releases auto-publish to npm

---

## Credentials

Create a **KIE API** credential in n8n with your API key from [kie.ai](https://kie.ai). One key unlocks all 21 nodes.

---

## Example Workflows

Five ready-to-import n8n workflow JSON files are included in the `examples/` folder:

| File | Description |
|------|-------------|
| `kling-text-to-video.json` | Generate a video from a text prompt using Kling — demonstrates `waitForCompletion`, model selection, aspect ratio, and duration |
| `image-generation-flux.json` | Text-to-image with Flux 1.1 Ultra — 16:9, seed control, polling until ready |
| `image-generation-ideogram.json` | Logo/design generation with Ideogram — 1:1 aspect ratio, QUALITY rendering speed |
| `text-to-speech-elevenlabs.json` | Convert text to speech via ElevenLabs Turbo 2.5 with voice selection |
| `video-to-video-topaz.json` | Upscale a video 2× with Topaz — demonstrates video enhancement workflow |

To import: **n8n → Workflows → Import from file** → select any `.json` from `examples/`.

---

## Quick Start

1. Install the package in your n8n instance:
   ```
   npm install n8n-nodes-kie
   ```
   Or via n8n Settings → Community Nodes → Install → `n8n-nodes-kie`

2. Add a **KIE API** credential with your [kie.ai](https://kie.ai) API key

3. Drag any of the 21 nodes into a workflow and connect them

4. Enable **Wait For Completion** to get results inline, or use `replyUrl` + Webhook node for async

---

## Architecture

```
GenericFunctions.ts       — shared HTTP client, retry logic, polling helper
credentials/KieApi.ts     — single API key credential

nodes/
  ElevenLabs/             — TTS, STT, sound effects, audio isolation, dialogue
  Flux/                   — text-to-image, image-to-image, Flux Kontext
  FourOImage/             — GPT-4o image generation
  GptImage15/             — GPT Image 1.5 (text-to-image, image-to-image)
  Google/                 — Google AI Images (Imagen 3, Veo)
  GrokImagine/            — Grok image + video generation
  Hailuo/                 — Hailuo video generation
  Ideogram/               — Ideogram image generation
  InfineTalk/             — Lip-sync / talking avatar
  Kling/                  — Kling video (2.6, 3.0), AI Avatar
  Qwen/                   — Qwen image generation and editing
  Recraft/                — Background removal, crisp upscale
  Runway/                 — Runway video generation and extension
  Seedance/               — Seedance video generation
  Seedream/               — Seedream image generation and editing
  Sora2Pro/               — Sora 2 Pro text/image to video
  Suno/                   — Suno music generation, lyrics, MIDI, music video
  Topaz/                  — Topaz image and video upscaling
  Veo/                    — Veo video generation and extension
  Wan/                    — Wan video generation
  ZImage/                 — ZImage (Nano Banana) image generation
```

---

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for the full history.

### Highlights
- **v0.5.1** — Example workflow type-string fixes (4 files corrected to proper node type names); SUMMARY.md added
- **v0.5.0** — 4 additional example workflows; PUBLISH.md; CHANGELOG.md
- **v0.4.9** — Full example workflow templates added; CHANGELOG.md
- **v0.4.5** — 36 API parameter naming bugs fixed (camelCase → snake_case) across 11 nodes
- **v0.4.4** — Kling `tailImageUrl` → `tail_image_url` critical fix; exponential backoff verified
- **v0.4.0** — Kling 3.0 support; full GitHub release history
- **v0.3.9** — 429 rate-limit retry with exponential backoff added
- **v0.3.7** — Critical model ID format fixes (Seedream, Seedance, Hailuo, Wan, Kling)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs welcome — especially new node types as kie.ai adds services.

## License

MIT
