import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Seedance implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seedance (Kie.ai)',
		name: 'seedance',
		icon: 'file:seedance.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Seedance via Kie.ai API',
		defaults: {
			name: 'Seedance (Kie.ai)',
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
						name: 'Image to Video',
						value: 'imageToVideo',
						description: 'Generate video from image',
						action: 'Image to video',
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
				name: 'modelT2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo'],
					},
				},
				options: [
					{ name: 'Seedance 2.0', value: 'bytedance/seedance-2' },
					{ name: 'Seedance 2.0 Fast', value: 'bytedance/seedance-2-fast' },
					{ name: 'Seedance 1.5 Pro', value: 'bytedance/seedance-1.5-pro' },
					{ name: 'Bytedance V1 Pro', value: 'bytedance/v1-pro-text-to-video' },
					{ name: 'Bytedance V1 Lite', value: 'bytedance/v1-lite-text-to-video' },
				],
				default: 'bytedance/seedance-2',
				description: 'Model to use for text-to-video generation',
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
				description: 'Text prompt for video generation',
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
				description: 'Image URL for image-to-video generation',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				description: 'Optional text prompt for image-to-video generation',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				options: [
					{ name: 'Seedance 2.0', value: 'bytedance/seedance-2' },
					{ name: 'Seedance 2.0 Fast', value: 'bytedance/seedance-2-fast' },
					{ name: 'Seedance 1.5 Pro', value: 'bytedance/seedance-1.5-pro' },
					{ name: 'Bytedance V1 Pro', value: 'bytedance/v1-pro-image-to-video' },
					{ name: 'Bytedance V1 Pro Fast', value: 'bytedance/v1-pro-fast-image-to-video' },
					{ name: 'Bytedance V1 Lite', value: 'bytedance/v1-lite-image-to-video' },
				],
				default: 'bytedance/seedance-2',
				description: 'Model to use for image-to-video generation',
			},
			{
				displayName: 'Last Frame URL',
				name: 'lastFrameUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
						model: ['bytedance/seedance-2', 'bytedance/seedance-2-fast'],
					},
				},
				default: '',
				description: 'Optional last frame URL for Seedance 2.0 image-to-video',
			},
			{
				displayName: 'Reference Image URLs',
				name: 'referenceImageUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: {},
				placeholder: 'Add Reference Image URL',
				options: [{ displayName: 'Image', name: 'image', values: [{ displayName: 'URL', name: 'url', type: 'string', default: '' }] }],
				description: 'Optional Seedance 2.0 multimodal reference images (up to 9)',
			},
			{
				displayName: 'Reference Video URLs',
				name: 'referenceVideoUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: {},
				placeholder: 'Add Reference Video URL',
				options: [{ displayName: 'Video', name: 'video', values: [{ displayName: 'URL', name: 'url', type: 'string', default: '' }] }],
				description: 'Optional Seedance 2.0 reference videos (up to 3)',
			},
			{
				displayName: 'Reference Audio URLs',
				name: 'referenceAudioUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: {},
				placeholder: 'Add Reference Audio URL',
				options: [{ displayName: 'Audio', name: 'audio', values: [{ displayName: 'URL', name: 'url', type: 'string', default: '' }] }],
				description: 'Optional Seedance 2.0 reference audio clips (up to 3)',
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
					{ name: '4 Seconds', value: '4' },
					{ name: '8 Seconds', value: '8' },
					{ name: '12 Seconds', value: '12' },
					{ name: '15 Seconds', value: '15' },
				],
				default: '8',
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
					{ name: '4:3', value: '4:3' },
					{ name: '3:4', value: '3:4' },
					{ name: '21:9', value: '21:9' },
					{ name: 'Adaptive', value: 'adaptive' },
				],
				default: '16:9',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: '480p', value: '480p' },
					{ name: '720p', value: '720p' },
				],
				default: '720p',
			},
			{
				displayName: 'Generate Audio',
				name: 'generateAudio',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: true,
			},
			{
				displayName: 'Return Last Frame',
				name: 'returnLastFrame',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: false,
			},
			{
				displayName: 'Web Search',
				name: 'webSearch',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: false,
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
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
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
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: '',
				description: 'Custom reference passed in webhook callback',
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
				displayName: 'Captcha Token',
				name: 'captchaToken',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
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
						operation: ['textToVideo', 'imageToVideo'],
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
				} else if (operation === 'textToVideo') {
					const model = this.getNodeParameter('modelT2V', i, 'bytedance/seedance-2') as string;
					const isSeedance2 = ['bytedance/seedance-2', 'bytedance/seedance-2-fast'].includes(model);

					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
						duration: this.getNodeParameter('duration', i) as string,
						aspect_ratio: this.getNodeParameter('ratio', i) as string,
					};
					if (isSeedance2) {
						input.resolution = this.getNodeParameter('resolution', i, '720p') as string;
						input.generate_audio = this.getNodeParameter('generateAudio', i, true) as boolean;
						input.return_last_frame = this.getNodeParameter('returnLastFrame', i, false) as boolean;
						input.web_search = this.getNodeParameter('webSearch', i, false) as boolean;
					}

					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;
					const t2vNegPrompt = this.getNodeParameter('negativePrompt', i, '') as string;
					if (t2vNegPrompt) input.negative_prompt = t2vNegPrompt;
					if (isSeedance2) {
						const referenceImages = (this.getNodeParameter('referenceImageUrls', i, {}) as IDataObject).image as IDataObject[] | undefined;
						const referenceVideos = (this.getNodeParameter('referenceVideoUrls', i, {}) as IDataObject).video as IDataObject[] | undefined;
						const referenceAudios = (this.getNodeParameter('referenceAudioUrls', i, {}) as IDataObject).audio as IDataObject[] | undefined;
						const imageUrls = (referenceImages || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 9);
						const videoUrls = (referenceVideos || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 3);
						const audioUrls = (referenceAudios || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 3);
						if (imageUrls.length) input.reference_image_urls = imageUrls;
						if (videoUrls.length) input.reference_video_urls = videoUrls;
						if (audioUrls.length) input.reference_audio_urls = audioUrls;
					}

					const body: IDataObject = { model, input };
					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;
					const t2vCaptchaToken = this.getNodeParameter('captchaToken', i, '') as string;
					if (t2vCaptchaToken) body.captchaToken = t2vCaptchaToken;
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
				} else if (operation === 'imageToVideo') {
					const model = this.getNodeParameter('model', i) as string;
					const isSeedance2 = ['bytedance/seedance-2', 'bytedance/seedance-2-fast'].includes(model);

					const input: IDataObject = {
						duration: this.getNodeParameter('duration', i) as string,
						aspect_ratio: this.getNodeParameter('ratio', i) as string,
					};
					const imageUrl = this.getNodeParameter('imageUrl', i) as string;
					if (isSeedance2) {
						input.first_frame_url = imageUrl;
						input.resolution = this.getNodeParameter('resolution', i, '720p') as string;
						input.generate_audio = this.getNodeParameter('generateAudio', i, true) as boolean;
						input.return_last_frame = this.getNodeParameter('returnLastFrame', i, false) as boolean;
						input.web_search = this.getNodeParameter('webSearch', i, false) as boolean;
						const lastFrameUrl = this.getNodeParameter('lastFrameUrl', i, '') as string;
						if (lastFrameUrl) input.last_frame_url = lastFrameUrl;
						const referenceImages = (this.getNodeParameter('referenceImageUrls', i, {}) as IDataObject).image as IDataObject[] | undefined;
						const referenceVideos = (this.getNodeParameter('referenceVideoUrls', i, {}) as IDataObject).video as IDataObject[] | undefined;
						const referenceAudios = (this.getNodeParameter('referenceAudioUrls', i, {}) as IDataObject).audio as IDataObject[] | undefined;
						const imageUrls = (referenceImages || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 9);
						const videoUrls = (referenceVideos || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 3);
						const audioUrls = (referenceAudios || []).map((entry) => entry.url as string).filter(Boolean).slice(0, 3);
						if (imageUrls.length) input.reference_image_urls = imageUrls;
						if (videoUrls.length) input.reference_video_urls = videoUrls;
						if (audioUrls.length) input.reference_audio_urls = audioUrls;
					} else {
						input.image_url = imageUrl;
					}

					const prompt = this.getNodeParameter('prompt', i, '') as string;
					if (prompt) input.prompt = prompt;

					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;
					const i2vNegPrompt = this.getNodeParameter('negativePrompt', i, '') as string;
					if (i2vNegPrompt) input.negative_prompt = i2vNegPrompt;

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
