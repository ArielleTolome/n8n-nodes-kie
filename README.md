# n8n-nodes-seedream

n8n community node for Seedream V4 Text To Image API

## Description

This node allows you to generate images using the Seedream V4 Text To Image API. It supports:

- **Create Task**: Create a new image generation task with customizable parameters
- **Query Task Status**: Check the status of a task and retrieve results

## Features

- Generate images from text prompts
- Support for multiple image sizes and resolutions
- Configurable number of images (1-6)
- Optional seed for reproducible results
- Optional callback URL for task completion notifications

## Installation

To install this node, go to **Settings > Community Nodes > Install a node** in your n8n instance and enter:

```bash
@myspacet_ai/n8n-nodes-seedream
```

## Credentials

To use this node, you need an API Key from **kie.ai**. 

1. **Register here**: [https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5](https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5) (Using this link supports future updates for this node).
2. Go to the **API keys** tab and click **Create new key**.
3. Create a new **Seedream API** credential in n8n and paste your key.

## Usage

### Create Task
1. Add the Seedream node to your workflow.
2. Select "Create Task" operation.
3. Enter your prompt and configure parameters.
4. Execute to get a `taskId`.

### Query Task Status
1. Select "Query Task Status" operation.
2. Enter the `taskId` from the previous step.
3. Execute to get the generated image URLs.

## License

MIT