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
					{ name: 'Seedance 1.5 Pro', value: 'bytedance/seedance-1.5-pro' },
					{ name: 'Bytedance V1 Pro', value: 'bytedance/v1-pro-text-to-video' },
					{ name: 'Bytedance V1 Lite', value: 'bytedance/v1-lite-text-to-video' },
				],
				default: 'bytedance/seedance-1.5-pro',
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
					{ name: 'Seedance 1.5 Pro', value: 'bytedance/seedance-1.5-pro' },
					{ name: 'Bytedance V1 Pro', value: 'bytedance/v1-pro-image-to-video' },
					{ name: 'Bytedance V1 Pro Fast', value: 'bytedance/v1-pro-fast-image-to-video' },
					{ name: 'Bytedance V1 Lite', value: 'bytedance/v1-lite-image-to-video' },
				],
				default: 'bytedance/seedance-1.5-pro',
				description: 'Model to use for image-to-video generation',
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
				],
				default: '16:9',
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
					// Seedance 2.0 model ID: 'bytedance/seedance-2.0-pro' (Coming Soon — activate when live)
					const model = this.getNodeParameter('modelT2V', i, 'bytedance/seedance-1.5-pro') as string;

					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
						duration: this.getNodeParameter('duration', i) as string,
						aspect_ratio: this.getNodeParameter('ratio', i) as string,
					};

					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;
					const t2vNegPrompt = this.getNodeParameter('negativePrompt', i, '') as string;
					if (t2vNegPrompt) input.negative_prompt = t2vNegPrompt;

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

					const input: IDataObject = {
						image_url: this.getNodeParameter('imageUrl', i) as string,
						duration: this.getNodeParameter('duration', i) as string,
						aspect_ratio: this.getNodeParameter('ratio', i) as string,
					};

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
