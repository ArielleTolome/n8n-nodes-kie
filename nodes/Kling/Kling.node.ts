import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Kling implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kling (Kie.ai)',
		name: 'kling',
		icon: 'file:kling.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Kling via Kie.ai API',
		defaults: {
			name: 'Kling (Kie.ai)',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kieApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Text-to-Video',
						value: 'textToVideo',
						description: 'Generate video from text prompt',
						action: 'Text to video',
					},
					{
						name: 'Image-to-Video',
						value: 'imageToVideo',
						description: 'Generate video from image',
						action: 'Image to video',
					},
					{
						name: 'Video to Video (Motion Control)',
						value: 'videoToVideo',
						description: 'Generate video using character image and reference video motion',
						action: 'Video to video',
					},
					{
						name: 'AI Avatar',
						value: 'aiAvatar',
						description: 'Generate AI avatar video',
						action: 'AI avatar',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get task status',
					},
				],
				default: 'textToVideo',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo'],
					},
				},
				options: [
					{ name: 'Kling 3.0 (Recommended)', value: 'kling-3.0/video' },
					{ name: 'Kling 2.6', value: 'kling-2.6/text-to-video' },
					{ name: 'Kling 2.5 Turbo Pro', value: 'kling/v2-5-turbo-text-to-video-pro' },
					{ name: 'Kling 2.1 Master', value: 'kling/v2-1-master-text-to-video' },
				],
				default: 'kling-3.0/video',
			},
			{
				displayName: 'Model',
				name: 'modelI2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				options: [
					{ name: 'Kling 2.6 (Recommended)', value: 'kling-2.6/image-to-video' },
					{ name: 'Kling 2.5 Turbo Pro', value: 'kling/v2-5-turbo-image-to-video-pro' },
					{ name: 'Kling 2.1 Master', value: 'kling/v2-1-master-image-to-video' },
					{ name: 'Kling 2.1 Pro', value: 'kling/v2-1-pro' },
					{ name: 'Kling 2.1 Standard', value: 'kling/v2-1-standard' },
				],
				default: 'kling-2.6/image-to-video',
			},
			{
				displayName: 'Model',
				name: 'modelAvatar',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['aiAvatar'],
					},
				},
				options: [
					{ name: 'AI Avatar Pro', value: 'kling/ai-avatar-pro' },
					{ name: 'AI Avatar Standard', value: 'kling/ai-avatar-standard' },
				],
				default: 'kling/ai-avatar-pro',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo', 'aiAvatar'],
					},
				},
				default: '',
				description: 'Text prompt for video generation',
			},
			{
				displayName: 'Prompt',
				name: 'promptI2V',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				description: 'Optional text prompt to guide image-to-video',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'URL of the input image',
			},
			{
				displayName: 'Avatar Image URL',
				name: 'avatarImageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['aiAvatar'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'URL of the portrait/avatar image (jpg/jpeg/png, face clearly visible)',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['aiAvatar'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'URL of the audio file to drive the avatar lip-sync',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: '5 Seconds', value: 5 },
					{ name: '10 Seconds', value: 10 },
				],
				default: 5,
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
					{ name: '1:1', value: '1:1' },
				],
				default: '16:9',
			},
			{
				displayName: 'Generation Mode',
				name: 'generationMode',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: 'Standard (std)', value: 'std' },
					{ name: 'Pro (higher resolution)', value: 'pro' },
				],
				default: 'std',
				description: 'Generation mode for Kling 3.0 — Standard or Pro (higher resolution). Ignored for older Kling models.',
			},
			{
				displayName: 'Enable Sound Effects',
				name: 'enableSound',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: false,
				description: 'Whether to enable native audio/sound effects (Kling 3.0 only). Adds cost but produces richer output.',
			},
			{
				displayName: 'CFG Scale',
				name: 'cfgScale',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: 0.5,
				description: 'Creativity vs prompt adherence (0-1)',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: 0,
				description: 'Set to 0 for random seed',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: '',
				description: 'Elements to avoid in the generated video',
			},
			{
				displayName: 'Tail Frame URL',
				name: 'tailImageUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'Optional end/tail frame image URL for image-to-video',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'aiAvatar'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'Webhook URL called when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'aiAvatar'],
					},
				},
				default: '',
				description: 'Custom reference passed in webhook callback',
			},
			{
				displayName: 'Captcha Token',
				name: 'captchaToken',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'aiAvatar'],
					},
				},
				default: '',
				description: 'Your reCAPTCHA v3 Enterprise token (leave empty to let kie.ai handle it)',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'aiAvatar'],
					},
				},
				default: true,
				description: 'Whether to wait for the task to complete (polls every 3s, 5min timeout)',
			},
			// videoToVideo (Motion Control) fields
			{
				displayName: 'Model',
				name: 'modelV2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				options: [
					{ name: 'Kling 3.0 Motion Control', value: 'kling-3.0/motion-control' },
					{ name: 'Kling 2.6 Motion Control', value: 'kling-2.6/motion-control' },
				],
				default: 'kling-3.0/motion-control',
				description: 'Model to use for motion control video generation',
			},
			{
				displayName: 'Character Image URL',
				name: 'characterImageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				default: '',
				description: 'Reference character image URL. The characters in the generated video are based on this image. Supports jpg/jpeg/png, max 10MB, min 300px, aspect ratio 2:5 to 5:2.',
			},
			{
				displayName: 'Reference Video URL',
				name: 'referenceVideoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				default: '',
				description: 'Reference video URL. Character actions in the generated video will match this video. Supports mp4/mov, max 100MB, 3–30 seconds.',
			},
			{
				displayName: 'Prompt',
				name: 'promptV2V',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				default: '',
				description: 'Optional text prompt to guide the generation. Max 2500 characters.',
			},
			{
				displayName: 'Character Orientation',
				name: 'characterOrientation',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				options: [
					{ name: 'Match Video Orientation', value: 'video' },
					{ name: 'Match Image Orientation', value: 'image' },
				],
				default: 'video',
				description: 'Whether to use the character orientation from the reference video or image. "image" limits output to max 10s.',
			},
			{
				displayName: 'Resolution',
				name: 'resolutionV2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				options: [
					{ name: '720p', value: '720p' },
					{ name: '1080p', value: '1080p' },
				],
				default: '720p',
				description: 'Output resolution.',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletionV2V',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				default: true,
				description: 'Whether to wait for the video generation to complete before returning.',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['queryTaskStatus'],
					},
				},
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'queryTaskStatus') {
					const taskId = this.getNodeParameter('taskId', i) as string;
					returnData.push(await kieQueryTask(this, taskId));
				} else if (operation === 'videoToVideo') {
					const characterImageUrl = this.getNodeParameter('characterImageUrl', i) as string;
					const referenceVideoUrl = this.getNodeParameter('referenceVideoUrl', i) as string;
					const promptV2V = this.getNodeParameter('promptV2V', i, '') as string;
					const characterOrientation = this.getNodeParameter('characterOrientation', i, '') as string;
					const resolutionV2V = this.getNodeParameter('resolutionV2V', i, '') as string;
					const waitForCompletionV2V = this.getNodeParameter('waitForCompletionV2V', i) as boolean;

					const input: IDataObject = {
						input_urls: [characterImageUrl],
						video_urls: [referenceVideoUrl],
					};
					if (promptV2V) input.prompt = promptV2V;
					if (characterOrientation) input.character_orientation = characterOrientation;
					if (resolutionV2V) input.resolution = resolutionV2V;

					const motionModel = this.getNodeParameter('modelV2V', i, 'kling-3.0/motion-control') as string;
					const body: IDataObject = { model: motionModel, input };
					const v2vReplyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (v2vReplyUrl) body.replyUrl = v2vReplyUrl;
					const v2vReplyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (v2vReplyRef) body.replyRef = v2vReplyRef;
					const v2vCaptchaToken = this.getNodeParameter('captchaToken', i, '') as string;
					if (v2vCaptchaToken) body.captchaToken = v2vCaptchaToken;
					const response = await kieRequest(this, 'POST', '/api/v1/jobs/createTask', body);

					if (waitForCompletionV2V) {
						const taskId = (response.data as IDataObject)?.taskId as string;
						if (taskId) {
							returnData.push(await waitForTask(this, taskId));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				} else {
					let model = '';
					const input: IDataObject = {};

					if (operation === 'textToVideo') {
						model = this.getNodeParameter('model', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.duration = String(this.getNodeParameter('duration', i) as number);
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.cfg_scale = this.getNodeParameter('cfgScale', i) as number;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						const genMode = this.getNodeParameter('generationMode', i, 'std') as string;
						if (genMode && genMode !== 'std') input.mode = genMode;
						const enableSound = this.getNodeParameter('enableSound', i, false) as boolean;
						if (enableSound) input.enable_sound = true;
						const negPrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negPrompt) input.negative_prompt = negPrompt;
					} else if (operation === 'imageToVideo') {
						model = this.getNodeParameter('modelI2V', i) as string;
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
						const prompt = this.getNodeParameter('promptI2V', i, '') as string;
						if (prompt) input.prompt = prompt;
						input.duration = String(this.getNodeParameter('duration', i) as number);
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.cfg_scale = this.getNodeParameter('cfgScale', i) as number;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						const tailImageUrl = this.getNodeParameter('tailImageUrl', i, '') as string;
						if (tailImageUrl) input.tail_image_url = tailImageUrl;
						const i2vGenMode = this.getNodeParameter('generationMode', i, 'std') as string;
						if (i2vGenMode && i2vGenMode !== 'std') input.mode = i2vGenMode;
						const i2vEnableSound = this.getNodeParameter('enableSound', i, false) as boolean;
						if (i2vEnableSound) input.enable_sound = true;
						const i2vNegPrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						if (i2vNegPrompt) input.negative_prompt = i2vNegPrompt;
					} else if (operation === 'aiAvatar') {
						model = this.getNodeParameter('modelAvatar', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.image_url = this.getNodeParameter('avatarImageUrl', i) as string;
						input.audio_url = this.getNodeParameter('audioUrl', i) as string;
					}

					const body: IDataObject = { model, input };
					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;
					const captchaToken = this.getNodeParameter('captchaToken', i, '') as string;
					if (captchaToken) body.captchaToken = captchaToken;
					const response = await kieRequest(this, 'POST', '/api/v1/jobs/createTask', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId as string;
						if (taskId) {
							returnData.push(await waitForTask(this, taskId));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error instanceof Error ? error.message : String(error) });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
