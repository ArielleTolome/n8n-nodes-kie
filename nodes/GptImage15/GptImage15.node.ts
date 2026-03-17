import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class GptImage15 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GPT-image-1.5 (Kie.ai)',
		name: 'gptImage15',
		icon: 'file:gpt-image-1_5-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using GPT-image-1.5 via Kie.ai API',
		defaults: {
			name: 'GPT-image-1.5 (Kie.ai)',
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
					{ name: 'Text-to-Image', value: 'textToImage', action: 'Text to image' },
					{ name: 'Image-to-Image', value: 'imageToImage', action: 'Image to image' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'textToImage',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: '',
			},
			{
				displayName: 'Input Images',
				name: 'inputImages',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['imageToImage'] } },
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
							},
						],
					},
				],
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				options: [
					{ name: '1:1', value: '1:1' },
					{ name: '2:3', value: '2:3' },
					{ name: '3:2', value: '3:2' },
				],
				default: '3:2',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'options',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				options: [
					{ name: 'Auto', value: 'auto' },
					{ name: 'High', value: 'high' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Low', value: 'low' },
				],
				default: 'medium',
			},
			{
				displayName: 'Number of Images',
				name: 'n',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: 1,
				description: 'Number of images to generate (1-10)',
			},
			{
				displayName: 'Background',
				name: 'background',
				type: 'options',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				options: [
					{ name: 'Auto', value: 'auto' },
					{ name: 'Transparent', value: 'transparent' },
					{ name: 'Opaque', value: 'opaque' },
				],
				default: 'auto',
				description: 'Background transparency setting',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				options: [
					{ name: 'PNG', value: 'png' },
					{ name: 'WebP', value: 'webp' },
					{ name: 'JPEG', value: 'jpeg' },
				],
				default: 'png',
				description: 'Output image format',
			},
			{
				displayName: 'Output Compression',
				name: 'outputCompression',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 100 },
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage'],
						outputFormat: ['webp', 'jpeg'],
					},
				},
				default: 80,
				description: 'Compression level (0-100, only for WebP/JPEG)',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: 0,
				description: 'Seed for reproducibility (0 = random)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['textToImage', 'imageToImage'] } },
				default: true,
				description: 'Whether to wait for the task to complete (polls every 3s, 5min timeout)',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['queryTaskStatus'] } },
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
					const model = operation === 'imageToImage'
						? 'gpt-image/1.5-image-to-image'
						: 'gpt-image/1.5-text-to-image';

					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
						aspect_ratio: this.getNodeParameter('aspectRatio', i) as string,
						quality: this.getNodeParameter('quality', i) as string,
					};
					const n = this.getNodeParameter('n', i, 1) as number;
					if (n > 1) input.n = n;
					const background = this.getNodeParameter('background', i, 'auto') as string;
					if (background !== 'auto') input.background = background;
					const outputFormat = this.getNodeParameter('outputFormat', i, 'png') as string;
					if (outputFormat !== 'png') input.output_format = outputFormat;
					if (outputFormat === 'webp' || outputFormat === 'jpeg') {
						const outputCompression = this.getNodeParameter('outputCompression', i, 80) as number;
						input.output_compression = outputCompression;
					}
					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;

					if (operation === 'imageToImage') {
						const inputImages = this.getNodeParameter('inputImages', i) as IDataObject;
						const images = (inputImages?.image as IDataObject[]) || [];
						input.input_urls = images.map((img) => img.url as string).filter((url) => url && url.trim() !== '');
					}

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
