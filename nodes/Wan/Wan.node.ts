import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Wan implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wan (Kie.ai)',
		name: 'wan',
		icon: 'file:wan.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Wan via Kie.ai API',
		defaults: {
			name: 'Wan (Kie.ai)',
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
						name: 'Video-to-Video',
						value: 'videoToVideo',
						description: 'Transform video with prompt',
						action: 'Video to video',
					},
					{
						name: 'Speech-to-Video',
						value: 'speechToVideo',
						description: 'Generate video from audio',
						action: 'Speech to video',
					},
					{
						name: 'Animate',
						value: 'animate',
						description: 'Animate an image with motion',
						action: 'Animate',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Generate or edit images with Wan 2.7 Image models',
						action: 'Generate image',
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
					{ name: 'Wan 2.6', value: 'wan/2-6-text-to-video' },
					{ name: 'Wan 2.5', value: 'wan/2-5-text-to-video' },
					{ name: 'Wan 2.2 Turbo', value: 'wan/2-2-a14b-text-to-video-turbo' },
				],
				default: 'wan/2-6-text-to-video',
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
					{ name: 'Wan 2.6', value: 'wan/2-6-image-to-video' },
					{ name: 'Wan 2.6 Flash', value: 'wan/2-6-flash-image-to-video' },
					{ name: 'Wan 2.5', value: 'wan/2-5-image-to-video' },
					{ name: 'Wan 2.2 Turbo', value: 'wan/2-2-a14b-image-to-video-turbo' },
				],
				default: 'wan/2-6-image-to-video',
			},
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
					{ name: 'Wan 2.6', value: 'wan/2-6-video-to-video' },
					{ name: 'Wan 2.6 Flash', value: 'wan/2-6-flash-video-to-video' },
				],
				default: 'wan/2-6-video-to-video',
			},
			{
				displayName: 'Animate Type',
				name: 'animateType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['animate'],
					},
				},
				options: [
					{ name: 'Animate Move', value: 'wan/2-2-animate-move' },
					{ name: 'Animate Replace', value: 'wan/2-2-animate-replace' },
				],
				default: 'wan/2-2-animate-move',
			},
			{
				displayName: 'Model',
				name: 'modelImage',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				options: [
					{ name: 'Wan 2.7 Image', value: 'wan/2-7-image' },
					{ name: 'Wan 2.7 Image Pro', value: 'wan/2-7-image-pro' },
				],
				default: 'wan/2-7-image',
			},
			{
				displayName: 'Prompt',
				name: 'imagePrompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: '',
				description: 'Prompt for image generation or editing',
			},
			{
				displayName: 'Input Image URL',
				name: 'inputImageUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'Optional source image URL. When set, Wan 2.7 performs image editing instead of pure generation.',
			},
			{
				displayName: 'Additional Input Image URLs',
				name: 'additionalInputImageUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: {},
				placeholder: 'Add Input Image URL',
				options: [
					{
						displayName: 'Image',
						name: 'image',
						values: [{ displayName: 'URL', name: 'url', type: 'string', default: '' }],
					},
				],
				description: 'Optional extra edit/reference images. Wan 2.7 supports up to 9 input URLs.',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'imageAspectRatio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				options: [
					{ name: '1:1', value: '1:1' },
					{ name: '16:9', value: '16:9' },
					{ name: '4:3', value: '4:3' },
					{ name: '21:9', value: '21:9' },
					{ name: '3:4', value: '3:4' },
					{ name: '9:16', value: '9:16' },
					{ name: '8:1', value: '8:1' },
					{ name: '1:8', value: '1:8' },
				],
				default: '1:1',
				description: 'Used for text-to-image generation. Kie hides this server-side when input images are provided.',
			},
			{
				displayName: 'Number of Images',
				name: 'imageCount',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 12, numberStepSize: 1 },
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: 4,
				description: '1-4 in standard mode, 1-12 when sequential mode is enabled',
			},
			{
				displayName: 'Sequential Mode',
				name: 'enableSequential',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: false,
			},
			{
				displayName: 'Resolution',
				name: 'imageResolution',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				options: [
					{ name: '1K', value: '1K' },
					{ name: '2K', value: '2K' },
					{ name: '4K', value: '4K' },
				],
				default: '2K',
			},
			{
				displayName: 'Thinking Mode',
				name: 'thinkingMode',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: false,
				description: 'Only applies when sequential mode is disabled and no input images are provided',
			},
			{
				displayName: 'Watermark',
				name: 'imageWatermark',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: false,
			},
			{
				displayName: 'Seed',
				name: 'imageSeed',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 2147483647, numberStepSize: 1 },
				displayOptions: {
					show: {
						operation: ['image'],
					},
				},
				default: 0,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo'],
					},
				},
				default: '',
			},
			{
				displayName: 'Prompt',
				name: 'promptOpt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: '',
				description: 'Optional prompt to guide generation (required for Speech-to-Video)',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['imageToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: '',
			},
			{
				displayName: 'End Frame URL',
				name: 'endImageUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				description: 'Optional end frame image URL for image-to-video',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['videoToVideo', 'animate'],
					},
				},
				default: '',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['speechToVideo'],
					},
				},
				default: '',
				description: 'URL of the audio file',
			},
			{
				displayName: 'Mask URL',
				name: 'maskUrl',
				type: 'string',
				displayOptions: {
					show: {
						animateType: ['wan/2-2-animate-replace'],
					},
				},
				default: '',
				description: 'Mask URL for animate-replace',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
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
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
					},
				},
				options: [
					{ name: '5 Seconds', value: 5 },
					{ name: '10 Seconds', value: 10 },
				],
				default: 5,
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
					},
				},
				default: '',
				description: 'Elements to avoid in the generated video',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
					},
				},
				default: 0,
				description: 'Seed for reproducibility (0 = random)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Captcha Token',
				name: 'captchaToken',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: '',
				description: 'reCAPTCHA token if required by the API',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
					},
				},
				default: true,
				description: 'Whether to wait for the task to complete (polls every 3s, 5min timeout)',
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
				} else {
					let model = '';
					const input: IDataObject = {};

					if (operation === 'image') {
						model = this.getNodeParameter('modelImage', i) as string;
						input.prompt = this.getNodeParameter('imagePrompt', i) as string;
						input.aspect_ratio = this.getNodeParameter('imageAspectRatio', i, '1:1') as string;
						input.enable_sequential = this.getNodeParameter('enableSequential', i, false) as boolean;
						input.n = this.getNodeParameter('imageCount', i, 4) as number;
						input.resolution = this.getNodeParameter('imageResolution', i, '2K') as string;
						input.thinking_mode = this.getNodeParameter('thinkingMode', i, false) as boolean;
						input.watermark = this.getNodeParameter('imageWatermark', i, false) as boolean;
						const imageSeed = this.getNodeParameter('imageSeed', i, 0) as number;
						if (imageSeed) input.seed = imageSeed;

						const primaryUrl = this.getNodeParameter('inputImageUrl', i, '') as string;
						const additionalCollection = this.getNodeParameter('additionalInputImageUrls', i, {}) as IDataObject;
						const additionalUrls = ((additionalCollection.image as IDataObject[]) || [])
							.map((img) => img.url as string)
							.filter((url) => url && url.trim() !== '');
						const allInputUrls = primaryUrl ? [primaryUrl, ...additionalUrls] : additionalUrls;
						if (allInputUrls.length) input.input_urls = allInputUrls.slice(0, 9);
					} else if (operation === 'textToVideo') {
						model = this.getNodeParameter('model', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = String(this.getNodeParameter('duration', i));
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						const negPromptT2V = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negPromptT2V) input.negative_prompt = negPromptT2V;
					} else if (operation === 'imageToVideo') {
						model = this.getNodeParameter('modelI2V', i) as string;
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						if (model === 'wan/2-6-image-to-video') {
							input.image_urls = [imageUrl];
						} else {
							input.image_url = imageUrl;
						}
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = String(this.getNodeParameter('duration', i));
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						const endImageUrl = this.getNodeParameter('endImageUrl', i, '') as string;
						if (endImageUrl) input.end_image_url = endImageUrl;
						const negPromptI2V = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negPromptI2V) input.negative_prompt = negPromptI2V;
					} else if (operation === 'videoToVideo') {
						model = this.getNodeParameter('modelV2V', i) as string;
						input.video_urls = [this.getNodeParameter('videoUrl', i) as string];
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = String(this.getNodeParameter('duration', i));
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						const negPromptV2V = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negPromptV2V) input.negative_prompt = negPromptV2V;
					} else if (operation === 'speechToVideo') {
						model = 'wan/2-2-a14b-speech-to-video-turbo';
						input.audio_url = this.getNodeParameter('audioUrl', i) as string;
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
					} else if (operation === 'animate') {
						model = this.getNodeParameter('animateType', i) as string;
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
						input.video_url = this.getNodeParameter('videoUrl', i) as string;
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						if (model === 'wan/2-2-animate-replace') {
							const mask = this.getNodeParameter('maskUrl', i, '') as string;
							if (mask) input.mask_url = mask;
						}
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
