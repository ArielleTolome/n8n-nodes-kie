import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class GptImage15 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPT-image-1.5 (Kie.ai)',
		name: 'gptImage15',
		icon: 'file:gpt-image-1_5-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using GPT-image-1.5 Image To Image API',
		defaults: {
			name: 'GPT-image-1.5 (Kie.ai)',
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
						name: 'Text-to-Image',
						value: 'textToImage',
						description: 'Generate image from text prompt',
						action: 'Text-to-Image',
					},
					{
						name: 'Image-to-Image',
						value: 'imageToImage',
						description: 'Generate image from existing image and text prompt',
						action: 'Image-to-Image',
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
			// Common Parameters (Prompt)
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageToImage'],
					},
				},
				default: '',
				description: 'A text description of the image you want to generate (max 1000 characters)',
				placeholder: 'A photorealistic candid photograph of an elderly sailor...',
			},
			// Image-to-Image Parameters
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
						operation: ['imageToImage'],
					},
				},
				default: {},
				required: true,
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
				description: 'URLs of the input images',
			},
			// Common Parameters (Aspect Ratio, Quality)
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageToImage'],
					},
				},
				options: [
					{
						name: '1:1',
						value: '1:1',
					},
					{
						name: '2:3',
						value: '2:3',
					},
					{
						name: '3:2',
						value: '3:2',
					},
				],
				default: '3:2',
				description: 'Width-height ratio of the image',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageToImage'],
					},
				},
				options: [
					{
						name: 'Medium (Balanced)',
						value: 'medium',
					},
					{
						name: 'High (Slow/Detailed)',
						value: 'high',
					},
				],
				default: 'medium',
				description: 'Quality of the generated image',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToImage', 'imageToImage'],
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
						operation: ['textToImage', 'imageToImage'],
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
					if (operation === 'textToImage' || operation === 'imageToImage') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const aspectRatio = this.getNodeParameter('aspectRatio', i) as string;
						const quality = this.getNodeParameter('quality', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						const model = operation === 'imageToImage' 
							? 'gpt-image/1.5-image-to-image' 
							: 'gpt-image/1.5-text-to-image';

						const body: IDataObject = {
							model,
							input: {
								prompt,
								aspect_ratio: aspectRatio,
								quality,
							},
						};

						if (operation === 'imageToImage') {
							// @ts-ignore
							const inputImages = this.getNodeParameter('inputImages', i) as IDataObject;
							const images = (inputImages?.image as IDataObject[]) || [];
							const inputUrls = images.map((img) => img.url as string).filter((url) => url && url.trim() !== '');
							(body.input as IDataObject).input_urls = inputUrls;
						}

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'kieAiApi',
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
							'kieAiApi',
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