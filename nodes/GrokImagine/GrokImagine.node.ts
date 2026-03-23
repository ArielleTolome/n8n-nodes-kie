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
				required: true,
				displayOptions: {
					show: {
						operation: ['imageToImage', 'imageToVideo'],
					},
				},
				default: '',
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
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'textToVideo', 'imageToVideo', 'upscale'],
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
						input.aspect_ratio = this.getNodeParameter('aspectRatio', i) as string;
					}
					if (operation === 'imageToImage') {
						input.image_urls = [this.getNodeParameter('imageUrl', i) as string];
					} else if (operation === 'imageToVideo') {
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
					} else if (operation === 'upscale') {
						input.task_id = this.getNodeParameter('upscaleTaskId', i) as string;
					} else if (operation === 'extend') {
						input.task_id = this.getNodeParameter('extendTaskId', i) as string;
					}

					const body: IDataObject = { model: modelMap[operation], input };
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
