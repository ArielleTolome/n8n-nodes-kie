import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class GrokImagine implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Grok Imagine (Kie.ai)',
		name: 'grokImagine',
		icon: 'file:grok-imagine.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images and videos using Grok Imagine via Kie.ai API',
		defaults: {
			name: 'Grok Imagine (Kie.ai)',
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
						name: 'Text-to-Image',
						value: 'textToImage',
						action: 'Text to image',
					},
					{
						name: 'Image-to-Image',
						value: 'imageToImage',
						action: 'Image to image',
					},
					{
						name: 'Text-to-Video',
						value: 'textToVideo',
						action: 'Text to video',
					},
					{
						name: 'Image-to-Video',
						value: 'imageToVideo',
						action: 'Image to video',
					},
					{
						name: 'Upscale',
						value: 'upscale',
						action: 'Upscale image',
					},
					{
						name: 'Extend Video',
						value: 'extend',
						action: 'Extend video',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						action: 'Get task status',
					},
				],
				default: 'textToImage',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo'],
					},
				},
				default: '',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToImage', 'imageToVideo'],
					},
				},
				default: '',
				description: 'Primary image URL. Use "Additional Image URLs" below for multi-image input.',
			},
			{
				displayName: 'Additional Image URLs',
				name: 'additionalImageUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['imageToImage', 'imageToVideo'],
					},
				},
				default: {},
				placeholder: 'Add Image URL',
				description: 'Additional reference images. Image-to-Image supports up to 5; Image-to-Video supports up to 7.',
				options: [
					{
						displayName: 'Image',
						name: 'image',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Task ID (to upscale)',
				name: 'upscaleTaskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['upscale'],
					},
				},
				default: '',
				description: 'Task ID of a previous Grok Imagine generation to upscale',
			},
			{
				displayName: 'Task ID (to extend)',
				name: 'extendTaskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['extend'],
					},
				},
				default: '',
				description: 'Task ID of a previous Grok Imagine video generation to extend',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage'],
					},
				},
				options: [
					{ name: '1:1', value: '1:1' },
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
					{ name: '4:3', value: '4:3' },
					{ name: '3:4', value: '3:4' },
				],
				default: '1:1',
				description: 'Aspect ratio for the generated image (required by Grok Imagine API)',
			},
			{
				displayName: 'Video Aspect Ratio',
				name: 'videoAspectRatio',
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
					{ name: '3:2', value: '3:2' },
					{ name: '2:3', value: '2:3' },
				],
				default: '16:9',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: 'Normal', value: 'normal' },
					{ name: 'Fun', value: 'fun' },
					{ name: 'Spicy', value: 'spicy' },
				],
				default: 'normal',
			},
			{
				displayName: 'Duration (Seconds)',
				name: 'duration',
				type: 'number',
				typeOptions: { minValue: 6, maxValue: 30, numberStepSize: 1 },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: 6,
				description: 'Video duration from 6 to 30 seconds',
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
				default: '480p',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage'],
					},
				},
				default: '',
				description: 'Elements to avoid in the generated image',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo'],
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
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo', 'upscale', 'extend'],
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
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo', 'upscale', 'extend'],
					},
				},
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo', 'upscale', 'extend'],
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
					const modelMap: Record<string, string> = {
						textToImage: 'grok-imagine/text-to-image',
						imageToImage: 'grok-imagine/image-to-image',
						textToVideo: 'grok-imagine/text-to-video',
						imageToVideo: 'grok-imagine/image-to-video',
						upscale: 'grok-imagine/upscale',
						extend: 'grok-imagine/extend',
					};

					const input: IDataObject = {};
					if (!['upscale', 'extend'].includes(operation)) {
						input.prompt = this.getNodeParameter('prompt', i) as string;
					}
					if (['textToImage', 'imageToImage'].includes(operation)) {
						input.aspect_ratio = (this.getNodeParameter('aspectRatio', i) as string) || '1:1';
					}
					if (['textToVideo', 'imageToVideo'].includes(operation)) {
						input.aspect_ratio = this.getNodeParameter('videoAspectRatio', i, '16:9') as string;
						input.mode = this.getNodeParameter('mode', i, 'normal') as string;
						input.duration = String(this.getNodeParameter('duration', i, 6) as number);
						input.resolution = this.getNodeParameter('resolution', i, '480p') as string;
					}
					if (operation === 'imageToImage') {
						const primaryUrl = this.getNodeParameter('imageUrl', i, '') as string;
						const additionalCollection = this.getNodeParameter('additionalImageUrls', i, {}) as IDataObject;
						const additionalUrls = ((additionalCollection.image as IDataObject[]) || [])
							.map((img) => img.url as string)
							.filter((url) => url && url.trim() !== '');
						const allImageUrls = primaryUrl ? [primaryUrl, ...additionalUrls] : additionalUrls;
						input.image_urls = allImageUrls.slice(0, 5);
					} else if (operation === 'imageToVideo') {
						const primaryUrl = this.getNodeParameter('imageUrl', i, '') as string;
						const additionalCollection = this.getNodeParameter('additionalImageUrls', i, {}) as IDataObject;
						const additionalUrls = ((additionalCollection.image as IDataObject[]) || [])
							.map((img) => img.url as string)
							.filter((url) => url && url.trim() !== '');
						const allVideoUrls = primaryUrl ? [primaryUrl, ...additionalUrls] : additionalUrls;
						if (allVideoUrls.length > 1) {
							input.image_urls = allVideoUrls.slice(0, 7);
						} else if (allVideoUrls.length === 1) {
							input.image_url = allVideoUrls[0];
						}
					} else if (operation === 'upscale') {
						input.task_id = this.getNodeParameter('upscaleTaskId', i) as string;
					} else if (operation === 'extend') {
						input.task_id = this.getNodeParameter('extendTaskId', i) as string;
					}

					if (['textToImage', 'imageToImage'].includes(operation)) {
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negativePrompt) input.negative_prompt = negativePrompt;
					}
					if (!['upscale', 'extend'].includes(operation)) {
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
					}

					const body: IDataObject = { model: modelMap[operation], input };
					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;
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
