import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Flux implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Flux (Kie.ai)',
		name: 'flux',
		icon: 'file:flux.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Flux and Flux Kontext via Kie.ai API',
		defaults: {
			name: 'Flux (Kie.ai)',
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
						name: 'Kontext',
						value: 'kontext',
						description: 'Use Flux Kontext for advanced image generation',
						action: 'Kontext generate',
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
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToImage'],
					},
				},
				options: [
					{ name: 'Flux 2 Pro', value: 'flux-2/pro-text-to-image' },
					{ name: 'Flux 2 Flex', value: 'flux-2/flex-text-to-image' },
				],
				default: 'flux-2/pro-text-to-image',
			},
			{
				displayName: 'Model',
				name: 'modelI2I',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageToImage'],
					},
				},
				options: [
					{ name: 'Flux 2 Pro', value: 'flux-2/pro-image-to-image' },
					{ name: 'Flux 2 Flex', value: 'flux-2/flex-image-to-image' },
				],
				default: 'flux-2/pro-image-to-image',
			},
			{
				displayName: 'Model',
				name: 'modelKontext',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['kontext'],
					},
				},
				options: [
					{ name: 'Flux Kontext Max', value: 'flux-kontext-max' },
					{ name: 'Flux Kontext Pro', value: 'flux-kontext-pro' },
				],
				default: 'flux-kontext-pro',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'kontext'],
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
						operation: ['imageToImage'],
					},
				},
				default: '',
				placeholder: 'https://...',
			},
			{
				displayName: 'Input Image URL',
				name: 'imageUrlKontext',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['kontext'],
					},
				},
				default: '',
				placeholder: 'https://...',
				description: 'URL of an input image to edit. If provided, the model edits this image based on the prompt. If omitted, generates a new image from text.',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['kontext'],
					},
				},
				options: [
					{ name: 'JPEG', value: 'jpeg' },
					{ name: 'PNG', value: 'png' },
				],
				default: 'jpeg',
			},
			{
				displayName: 'Prompt Upsampling',
				name: 'promptUpsampling',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['kontext'],
					},
				},
				default: false,
				description: 'If enabled, upsamples the prompt for richer detail (may increase processing time)',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'kontext'],
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
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage'],
					},
				},
				default: 0,
				description: 'Set to 0 for random seed',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage'],
					},
				},
				options: [
					{ name: '1K', value: '1K' },
					{ name: '2K', value: '2K' },
				],
				default: '1K',
				description: 'Output resolution (1K or 2K)',
			},
			{
				displayName: 'Steps',
				name: 'steps',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				displayOptions: {
					show: {
						operation: ['textToImage'],
					},
				},
				default: 25,
				description: 'Number of generation steps',
			},
			{
				displayName: 'Guidance Scale',
				name: 'guidance',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 20, numberStepSize: 0.1 },
				displayOptions: {
					show: {
						operation: ['textToImage'],
					},
				},
				default: 3.5,
				description: 'Guidance scale for prompt adherence (1-20)',
			},
			{
				displayName: 'Strength',
				name: 'strength',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: {
					show: {
						operation: ['imageToImage', 'kontext'],
					},
				},
				default: 0.75,
				description: 'How much to transform the input image (0-1)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'kontext'],
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
						operation: ['textToImage', 'imageToImage', 'kontext'],
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
						operation: ['textToImage', 'imageToImage', 'kontext'],
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
				} else if (operation === 'kontext') {
					const model = this.getNodeParameter('modelKontext', i) as string;
					const prompt = this.getNodeParameter('prompt', i) as string;
					const ratio = this.getNodeParameter('ratio', i) as string;
					const imageUrl = this.getNodeParameter('imageUrlKontext', i, '') as string;

					const body: IDataObject = { model, prompt, ratio };
					if (imageUrl) body.inputImage = imageUrl;

					const outputFormat = this.getNodeParameter('outputFormat', i, 'jpeg') as string;
					if (outputFormat !== 'jpeg') body.outputFormat = outputFormat;
					const promptUpsampling = this.getNodeParameter('promptUpsampling', i, false) as boolean;
					if (promptUpsampling) body.promptUpsampling = true;
					const kontextStrength = this.getNodeParameter('strength', i, 0) as number;
					if (kontextStrength > 0) body.strength = kontextStrength;

					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;

					const response = await kieRequest(this, 'POST', '/api/v1/flux/kontext/generate', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForTask(this, taskId as string));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				} else {
					let model = '';
					const input: IDataObject = {};

					if (operation === 'textToImage') {
						model = this.getNodeParameter('model', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.aspect_ratio = this.getNodeParameter('ratio', i) as string;
						input.resolution = this.getNodeParameter('resolution', i) as string;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
						input.steps = this.getNodeParameter('steps', i) as number;
						const guidance = this.getNodeParameter('guidance', i, 3.5) as number;
						if (guidance !== 3.5) input.guidance = guidance;
					} else if (operation === 'imageToImage') {
						model = this.getNodeParameter('modelI2I', i) as string;
						input.input_urls = [this.getNodeParameter('imageUrl', i) as string];
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.strength = this.getNodeParameter('strength', i) as number;
						input.aspect_ratio = this.getNodeParameter('ratio', i) as string;
						input.resolution = this.getNodeParameter('resolution', i) as string;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
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
