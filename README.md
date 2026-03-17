# n8n-nodes-kie

n8n community nodes for [kie.ai](https://kie.ai) - Sora 2 Pro, Seedream, GPT-image-1.5, ElevenLabs TTS/STT/SFX.

All nodes use the unified Kie.ai API with a single API key.

---

## Available Nodes

### Sora 2 Pro (Kie.ai)
- **Text-to-Video**: High-quality video generation (1080p/720p, up to 15s)
- **Models**: sora-2-text-to-video, sora-2-pro-text-to-video, sora-2-image-to-video, sora-2-pro-image-to-video

### Seedream v4 (Kie.ai)
- **Text-to-Image**: Detailed art and photo generation (up to 4K)
- **Image-Edit**: Professional image modification with mask support

### GPT-image-1.5 (Kie.ai)
- **Text-to-Image**: Smart generation from text prompts
- **Image-to-Image**: Deep context editing from existing images

### ElevenLabs (Kie.ai)
- **Text-to-Speech (Turbo 2.5)**: Ultra-fast speech generation with 20+ voices and 70+ languages
- **Speech-to-Text**: Transcription with diarization (speaker identification)
- **Sound Effects**: Generate custom sound effects from text descriptions
- **Audio Isolation**: Isolate voice from background noise
- **Text-to-Dialogue**: Create multi-voice dialogues

---

## Features

- **waitForCompletion** toggle on all create operations (polls every 3s, 5min timeout)
- **Bearer token auth** via single Kie.ai API key
- **Callback URL** support for async task notifications

---

## Installation

1. Go to **Settings > Community Nodes > Install a community node**
2. Enter: `n8n-nodes-kie`
3. Click **Install**

---

## API Key Setup

1. Visit [kie.ai/api-key](https://kie.ai/api-key) to create your API key
2. In n8n, go to **Credentials > New Credential > Kie API**
3. Paste your API key

---

## Usage

1. **Create Task**: Send prompt and settings; if `waitForCompletion` is enabled, the node waits and returns the final result
2. **Query Task Status**: Use `taskId` to manually check status (useful when `waitForCompletion` is disabled)

---

## License

MIT
