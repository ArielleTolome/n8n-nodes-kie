import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

export class Seedream implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seedream v4 (Kie.ai)',
		name: 'seedream',
		icon: 'file:seedream-v4-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Seedream V4 via Kie.ai API',
		defaults: {
			name: 'Seedream v4 (Kie.ai)',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Job',
						value: 'job',
					},
				],
				default: 'job',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Text-to-Image',
						value: 'textToImage',
						description: 'Generate image from text prompt',
						action: 'Text-to-Image',
					},
					{
						name: 'Image-Edit',
						value: 'imageEdit',
						description: 'Edit existing image using text prompt',
						action: 'Image-Edit',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get Task Status',
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
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				default: '',
				description: 'The text prompt used to generate or edit the image (max 5000 characters)',
				placeholder: 'A serene mountain landscape at sunset',
			},
			{
				displayName: 'Input Images',
				name: 'inputImages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['imageEdit'],
					},
				},
				default: {},
				placeholder: 'Add Image',
				options: [
					{
						displayName: 'Image',
						name: 'image',
						values: [
							{
								displayName: 'Image URL',
								name: 'url',
								type: 'string',
								default: '',
								placeholder: 'https://example.com/image.png',
							},
						],
					},
				],
				description: 'URLs of the input images to edit',
			},
			{
				displayName: 'Image Size',
				name: 'imageSize',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				options: [
					{ name: 'Landscape 16:9', value: 'landscape_16_9' },
					{ name: 'Landscape 21:9', value: 'landscape_21_9' },
					{ name: 'Landscape 3:2', value: 'landscape_3_2' },
					{ name: 'Landscape 4:3', value: 'landscape_4_3' },
					{ name: 'Portrait 2:3', value: 'portrait_3_2' },
					{ name: 'Portrait 3:4', value: 'portrait_4_3' },
					{ name: 'Portrait 9:16', value: 'portrait_16_9' },
					{ name: 'Square', value: 'square' },
					{ name: 'Square HD', value: 'square_hd' },
				],
				default: 'square_hd',
				description: 'The size/aspect ratio of the generated image',
			},
			{
				displayName: 'Image Resolution',
				name: 'imageResolution',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				options: [
					{ name: '1K', value: '1K' },
					{ name: '2K', value: '2K' },
					{ name: '4K', value: '4K' },
				],
				default: '1K',
				description: 'Final image resolution',
			},
			{
				displayName: 'Max Images',
				name: 'maxImages',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				options: [
					{ name: '1', value: 1 },
					{ name: '2', value: 2 },
					{ name: '3', value: 3 },
					{ name: '4', value: 4 },
					{ name: '5', value: 5 },
					{ name: '6', value: 6 },
				],
				default: 1,
				description: 'Maximum number of images to generate (1-6)',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				typeOptions: {
					numberStepSize: 1,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				default: 0,
				description: 'Random seed to control generation (leave 0 for random)',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				default: '',
				description: 'Optional callback URL for task completion notifications',
				placeholder: 'https://your-domain.com/api/callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageEdit'],
					},
				},
				default: true,
				description: 'Whether to wait for the task to complete before returning (polls every 3s, 5min timeout)',
			},
			// Query Task Status parameters
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
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
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'job') {
					if (operation === 'textToImage' || operation === 'imageEdit') {
						const model = operation === 'imageEdit'
							? 'bytedance/seedream-v4-edit'
							: 'bytedance/seedream-v4-text-to-image';

						const prompt = this.getNodeParameter('prompt', i) as string;
						const imageSize = this.getNodeParameter('imageSize', i) as string;
						const imageResolution = this.getNodeParameter('imageResolution', i) as string;
						const maxImages = this.getNodeParameter('maxImages', i) as number;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

						const input: IDataObject = {
							prompt,
							image_size: imageSize,
							image_resolution: imageResolution,
							max_images: maxImages,
						};

						if (operation === 'imageEdit') {
							const inputImages = this.getNodeParameter('inputImages', i) as IDataObject;
							const images = (inputImages?.image as IDataObject[]) || [];
							const imageUrls = images.map((img) => img.url as string).filter((url) => url && url.trim() !== '');
							if (imageUrls.length > 0) {
								input.image_urls = imageUrls;
							}
						}

						if (seed && seed !== 0) {
							input.seed = seed;
						}

						const body: IDataObject = { model, input };

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await kieRequest(this, 'POST', '/api/v1/jobs/createTask', body);

						if (waitForCompletionFlag) {
							const data = response.data as IDataObject | undefined;
							const taskId = data?.taskId as string | undefined;
							if (taskId) {
								const result = await waitForTask(this, taskId);
								returnData.push(result);
							} else {
								returnData.push(response);
							}
						} else {
							returnData.push(response);
						}
					} else if (operation === 'queryTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const response = await kieRequest(this, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId });
						returnData.push(response);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({ error: errorMessage, json: {} });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
