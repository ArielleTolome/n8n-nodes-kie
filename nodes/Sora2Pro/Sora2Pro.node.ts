import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Sora2Pro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sora 2 (Kie.ai)',
		name: 'sora2Pro',
		icon: 'file:sora2-pro-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Sora 2 via Kie.ai API',
		defaults: {
			name: 'Sora 2 (Kie.ai)',
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
						name: 'Characters',
						value: 'characters',
						description: 'Generate video with consistent characters',
						action: 'Characters video',
					},
					{
						name: 'Storyboard',
						value: 'storyboard',
						description: 'Generate storyboard video',
						action: 'Storyboard video',
					},
					{
						name: 'Remove Watermark',
						value: 'removeWatermark',
						description: 'Remove watermark from video',
						action: 'Remove watermark',
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
					{ name: 'Sora 2 Pro', value: 'sora-2-pro-text-to-video' },
					{ name: 'Sora 2', value: 'sora-2-text-to-video' },
				],
				default: 'sora-2-pro-text-to-video',
				description: 'The Sora model variant to use',
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
					{ name: 'Sora 2 Pro', value: 'sora-2-pro-image-to-video' },
					{ name: 'Sora 2', value: 'sora-2-image-to-video' },
				],
				default: 'sora-2-pro-image-to-video',
				description: 'The Sora model variant to use',
			},
			{
				displayName: 'Model',
				name: 'modelChar',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['characters'],
					},
				},
				options: [
					{ name: 'Sora 2 Characters Pro', value: 'sora-2-characters-pro' },
					{ name: 'Sora 2 Characters', value: 'sora-2-characters' },
				],
				default: 'sora-2-characters-pro',
				description: 'The Sora characters model variant',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard'],
					},
				},
				default: '',
				description: 'The text prompt describing the desired video',
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
				description: 'URL of the input image',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['removeWatermark'],
					},
				},
				default: '',
				description: 'URL of the video to remove watermark from',
			},
			{
				displayName: 'Character IDs',
				name: 'characterIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['characters'],
					},
				},
				default: '',
				description: 'Comma-separated character IDs for consistent characters',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard'],
					},
				},
				options: [
					{ name: 'Landscape (16:9)', value: 'landscape' },
					{ name: 'Portrait (9:16)', value: 'portrait' },
				],
				default: 'landscape',
			},
			{
				displayName: 'Duration',
				name: 'nFrames',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard'],
					},
				},
				options: [
					{ name: '10 Seconds', value: '10' },
					{ name: '15 Seconds', value: '15' },
				],
				default: '10',
			},
			{
				displayName: 'Quality',
				name: 'size',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard'],
					},
				},
				options: [
					{ name: 'High (1080p)', value: 'high' },
					{ name: 'Standard (720p)', value: 'standard' },
				],
				default: 'high',
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
				description: 'Optional end/tail frame image URL for image-to-video',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters'],
					},
				},
				default: 0,
				description: 'Seed for reproducibility (0 = random)',
			},
			{
				displayName: 'Shots (JSON)',
				name: 'shotsJson',
				type: 'string',
				typeOptions: { rows: 4 },
				displayOptions: {
					show: {
						operation: ['storyboard'],
					},
				},
				default: '[{"prompt": "Scene one description", "duration": "5"}, {"prompt": "Scene two description", "duration": "5"}]',
				description: 'Array of shot objects. Each shot requires a "prompt" and "duration" (in seconds as a string). Total duration of all shots must equal 10, 15, or 25.',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard', 'removeWatermark'],
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
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard', 'removeWatermark'],
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
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard', 'removeWatermark'],
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
						operation: ['textToVideo', 'imageToVideo', 'characters', 'storyboard', 'removeWatermark'],
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
				description: 'The task ID to query',
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
				} else if (operation === 'removeWatermark') {
					const videoUrl = this.getNodeParameter('videoUrl', i) as string;
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;
					const body: IDataObject = {
						model: 'sora-watermark-remover',
						input: { videoUrl },
					};
					const wmReplyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (wmReplyUrl) body.replyUrl = wmReplyUrl;
					const wmReplyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (wmReplyRef) body.replyRef = wmReplyRef;
					const wmCaptchaToken = this.getNodeParameter('captchaToken', i, '') as string;
					if (wmCaptchaToken) body.captchaToken = wmCaptchaToken;
					const response = await kieRequest(this, 'POST', '/api/v1/jobs/createTask', body);
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
				} else {
					let model = '';
					if (operation === 'textToVideo') {
						model = this.getNodeParameter('model', i) as string;
					} else if (operation === 'imageToVideo') {
						model = this.getNodeParameter('modelI2V', i) as string;
					} else if (operation === 'characters') {
						model = this.getNodeParameter('modelChar', i) as string;
					} else if (operation === 'storyboard') {
						model = 'sora-2-pro-storyboard';
					}

					const nFrames = this.getNodeParameter('nFrames', i) as string;
					const size = this.getNodeParameter('size', i) as string;
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					let input: IDataObject;

					if (operation === 'storyboard') {
						// Storyboard requires shots array; total shot duration must be 10, 15, or 25
						const shotsRaw = this.getNodeParameter('shotsJson', i) as string;
						let shots: IDataObject[];
						try {
							shots = JSON.parse(shotsRaw);
						} catch {
							throw new Error('Shots JSON is not valid JSON. Please provide a valid JSON array.');
						}
						input = { shots, n_frames: nFrames, size };
					} else {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const aspectRatio = this.getNodeParameter('aspectRatio', i) as string;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						input = {
							prompt,
							aspect_ratio: aspectRatio,
							n_frames: nFrames,
							size,
						};
						if (seed) input.seed = seed;
					}

					if (operation === 'imageToVideo') {
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						input.image_urls = [imageUrl];
						const endImageUrl = this.getNodeParameter('endImageUrl', i, '') as string;
						if (endImageUrl) input.tail_image_url = endImageUrl;
					}

					if (operation === 'characters') {
						const charIds = this.getNodeParameter('characterIds', i, '') as string;
						if (charIds.trim()) {
							input.character_id_list = charIds.split(',').map((id) => id.trim());
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
