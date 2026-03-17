import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Google implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google AI Images (Kie.ai)',
		name: 'googleAiImages',
		icon: 'file:google-ai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Nano Banana and Imagen 4 via Kie.ai API',
		defaults: {
			name: 'Google AI Images (Kie.ai)',
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
						name: 'Generate',
						value: 'generate',
						description: 'Generate image from text prompt',
						action: 'Generate image',
					},
					{
						name: 'Edit',
						value: 'edit',
						description: 'Edit existing image with prompt',
						action: 'Edit image',
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
						action: 'Get task status',
					},
				],
				default: 'generate',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				options: [
					{ name: 'Imagen 4 Ultra', value: 'imagen4-ultra/generate' },
					{ name: 'Imagen 4', value: 'imagen4/generate' },
					{ name: 'Imagen 4 Fast', value: 'imagen4-fast/generate' },
					{ name: 'Nano Banana Pro', value: 'nano-banana-pro/generate' },
					{ name: 'Nano Banana 2', value: 'nano-banana-2/generate' },
					{ name: 'Nano Banana', value: 'nano-banana/generate' },
				],
				default: 'imagen4/generate',
			},
			{
				displayName: 'Model',
				name: 'modelEdit',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['edit'],
					},
				},
				options: [
					{ name: 'Nano Banana Edit', value: 'nano-banana/edit' },
				],
				default: 'nano-banana/edit',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['generate', 'edit', 'imageToImage'],
					},
				},
				default: '',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['edit', 'imageToImage'],
					},
				},
				default: '',
			},
			{
				displayName: 'Mask URL',
				name: 'maskUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['edit'],
					},
				},
				default: '',
				description: 'Optional mask URL for targeted editing',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generate', 'edit', 'imageToImage'],
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
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate', 'edit'],
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
						operation: ['generate', 'edit'],
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
						operation: ['generate', 'edit', 'imageToImage'],
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
						operation: ['generate', 'edit', 'imageToImage'],
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
						operation: ['generate', 'edit', 'imageToImage'],
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
						operation: ['generate', 'edit', 'imageToImage'],
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

					if (operation === 'generate') {
						model = this.getNodeParameter('model', i) as string;
					} else if (operation === 'edit') {
						model = this.getNodeParameter('modelEdit', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const maskUrl = this.getNodeParameter('maskUrl', i, '') as string;
						if (maskUrl) input.maskUrl = maskUrl;
					} else if (operation === 'imageToImage') {
						model = 'google/pro-image-to-image';
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
					}

					input.prompt = this.getNodeParameter('prompt', i) as string;
					input.ratio = this.getNodeParameter('ratio', i) as string;
					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;
					if (operation === 'generate' || operation === 'edit') {
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negativePrompt) input.negativePrompt = negativePrompt;
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
