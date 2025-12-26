import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Seedream implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Seedream',
		name: 'seedream',
		icon: 'file:seedream-logo4.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate images using Seedream V4 Text To Image API',
		defaults: {
			name: 'Seedream',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kieAiApi',
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
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a new image generation task',
						action: 'Create a task',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Query the status of a task',
						action: 'Query task status',
					},
				],
				default: 'createTask',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: 'Seedream V4 Text to Image',
						value: 'bytedance/seedream-v4-text-to-image',
					},
					{
						name: 'Seedream V4 Edit',
						value: 'bytedance/seedream-v4-edit',
					},
				],
				default: 'bytedance/seedream-v4-text-to-image',
				description: 'The AI model to use for generation',
				required: true,
			},
			// Create Task parameters
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
				description: 'The text prompt used to generate or edit the image (max 5000 characters)',
				placeholder: 'Draw the following system of binary linear equations...',
			},
			{
				displayName: 'Input Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
						model: ['bytedance/seedream-v4-edit'],
					},
				},
				default: '',
				description: 'URL of the input image to edit. For multiple images, separate by comma.',
				placeholder: 'https://example.com/image.png',
			},
			{
				displayName: 'Image Size',
				name: 'imageSize',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: 'Landscape 16:9',
						value: 'landscape_16_9',
					},
					{
						name: 'Landscape 21:9',
						value: 'landscape_21_9',
					},
					{
						name: 'Landscape 3:2',
						value: 'landscape_3_2',
					},
					{
						name: 'Landscape 4:3',
						value: 'landscape_4_3',
					},
					{
						name: 'Portrait 2:3',
						value: 'portrait_3_2',
					},
					{
						name: 'Portrait 3:4',
						value: 'portrait_4_3',
					},
					{
						name: 'Portrait 9:16',
						value: 'portrait_16_9',
					},
					{
						name: 'Square',
						value: 'square',
					},
					{
						name: 'Square HD',
						value: 'square_hd',
					},
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
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: '1K',
						value: '1K',
					},
					{
						name: '2K',
						value: '2K',
					},
					{
						name: '4K',
						value: '4K',
					},
				],
				default: '1K',
				description: 'Final image resolution (combined with image size determines pixel dimensions)',
			},
			{
				displayName: 'Max Images',
				name: 'maxImages',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 6,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: 1,
				description: 'Maximum number of images to generate (1-6)',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: 0,
				description: 'Random seed to control the stochasticity of image generation (leave 0 for random)',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
				description: 'Optional callback URL for task completion notifications',
				placeholder: 'https://your-domain.com/api/callback',
			},
			{
				displayName: 'Инструкции по настройке и примеры использования в телеграм канале <a href="https://t.me/myspacet_ai" target="_blank">https://t.me/myspacet_ai</a>',
				name: 'telegramNotice',
				type: 'notice',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
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
				placeholder: '281e5b0*********************f39b9',
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
					if (operation === 'createTask') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const imageSize = this.getNodeParameter('imageSize', i) as string;
						const imageResolution = this.getNodeParameter('imageResolution', i) as string;
						const maxImages = this.getNodeParameter('maxImages', i) as number;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						const body: IDataObject = {
							model: 'bytedance/seedream-v4-text-to-image',
							input: {
								prompt,
								image_size: imageSize,
								image_resolution: imageResolution,
								max_images: maxImages,
							},
						};

						if (seed && seed !== 0) {
							(body.input as IDataObject).seed = seed;
						}

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'seedreamApi',
							{
								method: 'POST',
								url: 'https://api.kie.ai/api/v1/jobs/createTask',
								headers: {
									'Content-Type': 'application/json',
								},
								body,
								json: true,
							},
						);

						returnData.push(response);
					} else if (operation === 'queryTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'seedreamApi',
							{
								method: 'GET',
								url: `https://api.kie.ai/api/v1/jobs/recordInfo`,
								qs: {
									taskId,
								},
								json: true,
							},
						);

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

