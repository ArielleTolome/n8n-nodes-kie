import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Seedream implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seedream (Kie.ai)',
		name: 'seedream',
		icon: 'file:seedream-v4-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Seedream via Kie.ai API',
		defaults: {
			name: 'Seedream (Kie.ai)',
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
						description: 'Generate image from text prompt',
						action: 'Text to image',
					},
					{
						name: 'Image Edit',
						value: 'imageEdit',
						description: 'Edit existing image with prompt',
						action: 'Image edit',
					},
					{
						name: 'Image-to-Image',
						value: 'imageToImage',
						description: 'Transform image with prompt',
						action: 'Image to image',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get task status',
					},
				],
				default: 'textToImage',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToImage'],
					},
				},
				options: [
					{ name: 'Seedream 5 Lite', value: 'seedream-5-lite/text-to-image' },
					{ name: 'Seedream 4.5', value: 'seedream-4.5/text-to-image' },
					{ name: 'Seedream v4', value: 'seedream-v4/text-to-image' },
				],
				default: 'seedream-5-lite/text-to-image',
			},
			{
				displayName: 'Model',
				name: 'modelEdit',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageEdit'],
					},
				},
				options: [
					{ name: 'Seedream 4.5 Edit', value: 'seedream-4.5/edit' },
					{ name: 'Seedream v4 Edit', value: 'seedream-v4/edit' },
				],
				default: 'seedream-4.5/edit',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
					},
				},
				default: '',
				description: 'The text prompt for generation',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['imageEdit', 'imageToImage'],
					},
				},
				default: '',
				description: 'URL of the input image',
			},
			{
				displayName: 'Mask URL',
				name: 'maskUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageEdit'],
					},
				},
				default: '',
				description: 'Optional mask URL for targeted editing',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'imageSize',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
					},
				},
				options: [
					{ name: 'Square', value: 'square' },
					{ name: 'Square HD', value: 'square_hd' },
					{ name: 'Landscape 16:9', value: 'landscape_16_9' },
					{ name: 'Landscape 4:3', value: 'landscape_4_3' },
					{ name: 'Landscape 3:2', value: 'landscape_3_2' },
					{ name: 'Portrait 9:16', value: 'portrait_16_9' },
					{ name: 'Portrait 3:4', value: 'portrait_4_3' },
					{ name: 'Portrait 2:3', value: 'portrait_3_2' },
				],
				default: 'square_hd',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
					},
				},
				default: 0,
				description: 'Random seed (0 for random)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
					},
				},
				default: '',
				description: 'Webhook URL to call when task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
					},
				},
				default: '',
				description: 'Custom reference passed in webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageEdit', 'imageToImage'],
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

					if (operation === 'textToImage') {
						model = this.getNodeParameter('model', i) as string;
					} else if (operation === 'imageEdit') {
						model = this.getNodeParameter('modelEdit', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const maskUrl = this.getNodeParameter('maskUrl', i, '') as string;
						if (maskUrl) input.maskUrl = maskUrl;
					} else if (operation === 'imageToImage') {
						model = 'seedream-5-lite/image-to-image';
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
					}

					input.prompt = this.getNodeParameter('prompt', i) as string;
					input.image_size = this.getNodeParameter('imageSize', i) as string;
					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;

					const body: IDataObject = { model, input };
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
