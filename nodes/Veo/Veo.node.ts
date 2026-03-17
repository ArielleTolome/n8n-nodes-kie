import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForDedicatedTask } from '../GenericFunctions';

export class Veo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Veo 3.1 (Kie.ai)',
		name: 'veo',
		icon: 'file:veo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate and extend videos using Veo 3.1 via Kie.ai API',
		defaults: {
			name: 'Veo 3.1 (Kie.ai)',
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
					{ name: 'Generate', value: 'generate', action: 'Generate video' },
					{ name: 'Extend', value: 'extend', action: 'Extend video' },
					{ name: 'Get 1080p Video', value: 'get1080p', action: 'Get 1080p video' },
					{ name: 'Get 4K Video', value: 'get4k', action: 'Get 4K video' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'generate',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: 'Veo 3.1 (Standard)', value: 'veo3' },
					{ name: 'Veo 3.1 Fast', value: 'veo3_fast' },
				],
				default: 'veo3',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['generate'] } },
				default: '',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				displayOptions: { show: { operation: ['generate'] } },
				default: '',
				description: 'Optional image URL for image-to-video',
			},
			{
				displayName: 'Reference Images',
				name: 'referenceUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['generate'] } },
				default: {},
				placeholder: 'Add Reference Image',
				description: 'Reference images for Veo 3.1 Reference-to-Video. When set, overrides the Image URL field.',
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
								description: 'URL of the reference image',
							},
						],
					},
				],
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
					{ name: '1:1', value: '1:1' },
				],
				default: '16:9',
			},
			{
				displayName: 'Duration (Seconds)',
				name: 'duration',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: '5', value: 5 },
					{ name: '8', value: 8 },
				],
				default: 8,
			},
			{
				displayName: 'Enable Translation',
				name: 'enableTranslation',
				type: 'boolean',
				displayOptions: { show: { operation: ['generate'] } },
				default: false,
			},
			{
				displayName: 'End Frame URL',
				name: 'endImageUrl',
				type: 'string',
				displayOptions: { show: { operation: ['generate'] } },
				default: '',
				description: 'Optional end frame image URL for image-to-video',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: { show: { operation: ['generate'] } },
				default: 0,
				description: 'Seed for reproducibility (0 = random)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['generate', 'extend'] } },
				default: '',
				description: 'Webhook URL to call when task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['generate', 'extend'] } },
				default: '',
				description: 'Custom reference passed in webhook callback',
			},
			{
				displayName: 'Task ID',
				name: 'extendTaskId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['extend'] } },
				default: '',
				description: 'Task ID of the video to extend',
			},
			{
				displayName: 'Extend Prompt',
				name: 'extendPrompt',
				type: 'string',
				displayOptions: { show: { operation: ['extend'] } },
				default: '',
				description: 'Optional prompt for extension',
			},
			{
				displayName: 'Task ID',
				name: 'hdTaskId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get1080p'] } },
				default: '',
			},
			{
				displayName: 'Task ID',
				name: 'fourKTaskId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get4k'] } },
				default: '',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['generate', 'extend'] } },
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/veo/record-info', undefined, { taskId }));
				} else if (operation === 'get1080p') {
					const taskId = this.getNodeParameter('hdTaskId', i) as string;
					returnData.push(await kieRequest(this, 'GET', '/api/v1/veo/get-1080p-video', undefined, { taskId }));
				} else if (operation === 'get4k') {
					const taskId = this.getNodeParameter('fourKTaskId', i) as string;
					returnData.push(await kieRequest(this, 'GET', '/api/v1/veo/get-4k-video', undefined, { taskId }));
				} else if (operation === 'generate') {
					const body: IDataObject = {
						model: this.getNodeParameter('model', i) as string,
						prompt: this.getNodeParameter('prompt', i) as string,
						ratio: this.getNodeParameter('ratio', i) as string,
						duration: this.getNodeParameter('duration', i) as number,
						enableTranslation: this.getNodeParameter('enableTranslation', i) as boolean,
					};
					const referenceCollection = this.getNodeParameter('referenceUrls', i, {}) as IDataObject;
					const referenceUrls = ((referenceCollection.image as IDataObject[]) || [])
						.map((img) => img.url as string)
						.filter((url) => url && url.trim() !== '');
					if (referenceUrls.length > 0) {
						body.referenceUrls = referenceUrls;
					} else {
						const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
						if (imageUrl) body.imageUrl = imageUrl;
					}
					const endImageUrl = this.getNodeParameter('endImageUrl', i, '') as string;
					if (endImageUrl) body.endImageUrl = endImageUrl;
					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) body.seed = seed;
					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;

					const response = await kieRequest(this, 'POST', '/api/v1/veo/generate', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/veo/record-info'));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				} else if (operation === 'extend') {
					const body: IDataObject = {
						taskId: this.getNodeParameter('extendTaskId', i) as string,
					};
					const prompt = this.getNodeParameter('extendPrompt', i, '') as string;
					if (prompt) body.prompt = prompt;
					const extReplyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (extReplyUrl) body.replyUrl = extReplyUrl;
					const extReplyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (extReplyRef) body.replyRef = extReplyRef;

					const response = await kieRequest(this, 'POST', '/api/v1/veo/extend', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/veo/record-info'));
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
