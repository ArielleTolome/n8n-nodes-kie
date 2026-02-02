# Speech To Text API Documentation

> Generate content using the Speech To Text model

## Overview

This document describes how to use the Speech To Text model for content generation. The process consists of two steps:
1. Create a generation task
2. Query task status and results

## Authentication

All API requests require a Bearer Token in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

Get API Key:
1. Visit [API Key Management Page](https://kie.ai/api-key) to get your API Key
2. Add to request header: `Authorization: Bearer YOUR_API_KEY`

---

## 1. Create Generation Task

### API Information
- **URL**: `POST https://api.kie.ai/api/v1/jobs/createTask`
- **Content-Type**: `application/json`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Model name, format: `elevenlabs/speech-to-text` |
| input | object | Yes | Input parameters object |
| callBackUrl | string | No | Callback URL for task completion notifications. If provided, the system will send POST requests to this URL when the task completes (success or fail). If not provided, no callback notifications will be sent. Example: `"https://your-domain.com/api/callback"` |

### Model Parameter

The `model` parameter specifies which AI model to use for content generation.

| Property | Value | Description |
|----------|-------|-------------|
| **Format** | `elevenlabs/speech-to-text` | The exact model identifier for this API |
| **Type** | string | Must be passed as a string value |
| **Required** | Yes | This parameter is mandatory for all requests |

> **Note**: The model parameter must match exactly as shown above. Different models have different capabilities and parameter requirements.

### Callback URL Parameter

The `callBackUrl` parameter allows you to receive automatic notifications when your task completes.

| Property | Value | Description |
|----------|-------|-------------|
| **Purpose** | Task completion notification | Receive real-time updates when your task finishes |
| **Method** | POST request | The system sends POST requests to your callback URL |
| **Timing** | When task completes | Notifications sent for both success and failure states |
| **Content** | Query Task API response | Callback content structure is identical to the Query Task API response |
| **Parameters** | Complete request data | The `param` field contains the complete Create Task request parameters, not just the input section |
| **Optional** | Yes | If not provided, no callback notifications will be sent |

**Important Notes:**
- The callback content structure is identical to the Query Task API response
- The `param` field contains the complete Create Task request parameters, not just the input section  
- If `callBackUrl` is not provided, no callback notifications will be sent

### input Object Parameters

#### audio_url
- **Type**: `string`
- **Required**: Yes
- **Description**: Please provide the URL of the uploaded file,URL of the audio file to transcribe
- **Max File Size**: 200MB
- **Accepted File Types**: audio/mpeg, audio/wav, audio/x-wav, audio/aac, audio/mp4, audio/ogg
- **Default Value**: `"https://file.aiquickdraw.com/custom-page/akr/section-images/1757157053357tn37vxc8.mp3"`

#### language_code
- **Type**: `string`
- **Required**: No
- **Description**: Language code of the audio
- **Max Length**: 500 characters
- **Default Value**: `""`

#### tag_audio_events
- **Type**: `boolean`
- **Required**: No
- **Description**: Tag audio events like laughter, applause, etc.
- **Default Value**: `true`

#### diarize
- **Type**: `boolean`
- **Required**: No
- **Description**: Whether to annotate who is speaking
- **Default Value**: `true`

### Request Example

```json
{
  "model": "elevenlabs/speech-to-text",
  "input": {
    "audio_url": "https://file.aiquickdraw.com/custom-page/akr/section-images/1757157053357tn37vxc8.mp3",
    "language_code": "",
    "tag_audio_events": true,
    "diarize": true
  }
}
```
### Response Example

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0*********************f39b9"
  }
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| code | integer | Response status code, 200 indicates success |
| msg | string | Response message |
| data.taskId | string | Task ID for querying task status |

---

## 2. Query Task Status

### API Information
- **URL**: `GET https://api.kie.ai/api/v1/jobs/recordInfo`
- **Parameter**: `taskId` (passed via URL parameter)

### Request Example
```
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=281e5b0*********************f39b9
```

### Response Example

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0*********************f39b9",
    "model": "elevenlabs/speech-to-text",
    "state": "waiting",
    "param": "{\"model\":\"elevenlabs/speech-to-text\",\"input\":{\"audio_url\":\"https://file.aiquickdraw.com/custom-page/akr/section-images/1757157053357tn37vxc8.mp3\",\"language_code\":\"\",\"tag_audio_events\":true,\"diarize\":true}}",
    "resultJson": "{\"resultObject\":{\"language_code\":\"eng\",\"language_probability\":0.9915943741798401,\"words\":[{\"speaker_id\":\"speaker_0\",\"start\":0.14,\"end\":0.339,\"text\":\"Ever\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":0.339,\"end\":0.459,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":0.459,\"end\":0.659,\"text\":\"tried\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":0.659,\"end\":0.74,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":0.74,\"end\":0.879,\"text\":\"Ki\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":0.879,\"end\":0.959,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":0.959,\"end\":2.279,\"text\":\"AI?\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":2.279,\"end\":2.279,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":2.279,\"end\":2.459,\"text\":\"They've\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":2.459,\"end\":2.48,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":2.48,\"end\":2.579,\"text\":\"got\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":2.579,\"end\":2.639,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":2.639,\"end\":2.699,\"text\":\"a\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":2.699,\"end\":2.719,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":2.72,\"end\":2.939,\"text\":\"bunch\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":2.939,\"end\":2.979,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":2.98,\"end\":3.119,\"text\":\"of\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":3.119,\"end\":3.139,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":3.139,\"end\":3.479,\"text\":\"solid\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":3.479,\"end\":3.5,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":3.5,\"end\":3.759,\"text\":\"AI\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":3.759,\"end\":3.839,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":3.839,\"end\":4.78,\"text\":\"APIs,\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":4.78,\"end\":4.779,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":4.779,\"end\":4.899,\"text\":\"and\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":4.899,\"end\":4.92,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":4.92,\"end\":5.019,\"text\":\"the\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":5.019,\"end\":5.039,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":5.039,\"end\":5.48,\"text\":\"prices\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":5.48,\"end\":5.5,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":5.5,\"end\":5.619,\"text\":\"are\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":5.619,\"end\":5.639,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":5.639,\"end\":5.799,\"text\":\"more\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":5.799,\"end\":5.819,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":5.819,\"end\":6.019,\"text\":\"than\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":6.019,\"end\":6.199,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":6.199,\"end\":6.739,\"text\":\"50%\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":6.739,\"end\":6.759,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":6.759,\"end\":7.039,\"text\":\"lower\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":7.039,\"end\":7.059,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":7.059,\"end\":7.179,\"text\":\"than\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":7.179,\"end\":7.199,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":7.199,\"end\":7.299,\"text\":\"the\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":7.299,\"end\":7.339,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":7.339,\"end\":7.679,\"text\":\"usual\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":7.679,\"end\":7.699,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":7.699,\"end\":7.839,\"text\":\"big\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":7.839,\"end\":7.879,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":7.879,\"end\":8.079,\"text\":\"name\",\"type\":\"word\"},{\"speaker_id\":\"speaker_0\",\"start\":8.079,\"end\":8.099,\"text\":\" \",\"type\":\"spacing\"},{\"speaker_id\":\"speaker_0\",\"start\":8.099,\"end\":9.659,\"text\":\"platforms.\",\"type\":\"word\"}],\"text\":\"Ever tried Ki AI? They've got a bunch of solid AI APIs, and the prices are more than 50% lower than the usual big name platforms.\"}}",
    "failCode": null,
    "failMsg": null,
    "costTime": null,
    "completeTime": null,
    "createTime": 1757584164490
  }
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| code | integer | Response status code, 200 indicates success |
| msg | string | Response message |
| data.taskId | string | Task ID |
| data.model | string | Model name used |
| data.state | string | Task status: `waiting`(waiting),  `success`(success), `fail`(fail) |
| data.param | string | Task parameters (JSON string) |
| data.resultJson | string | Task result (JSON string, available when task is success). Structure depends on outputMediaType: `{resultUrls: []}` for image/media/video, `{resultObject: {}}` for text |
| data.failCode | string | Failure code (available when task fails) |
| data.failMsg | string | Failure message (available when task fails) |
| data.costTime | integer | Task duration in milliseconds (available when task is success) |
| data.completeTime | integer | Completion timestamp (available when task is success) |
| data.createTime | integer | Creation timestamp |

---

## Usage Flow

1. **Create Task**: Call `POST https://api.kie.ai/api/v1/jobs/createTask` to create a generation task
2. **Get Task ID**: Extract `taskId` from the response
3. **Wait for Results**: 
   - If you provided a `callBackUrl`, wait for the callback notification
   - If no `callBackUrl`, poll status by calling `GET https://api.kie.ai/api/v1/jobs/recordInfo`
4. **Get Results**: When `state` is `success`, extract generation results from `resultJson`

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Request successful |
| 400 | Invalid request parameters |
| 401 | Authentication failed, please check API Key |
| 402 | Insufficient account balance |
| 404 | Resource not found |
| 422 | Parameter validation failed |
| 429 | Request rate limit exceeded |
| 500 | Internal server error |
