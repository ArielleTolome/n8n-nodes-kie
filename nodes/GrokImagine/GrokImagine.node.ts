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
						operation: ['imageToImage', 'imageToVideo', 'upscale'],
					},
				},
				default: '',
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
					};

					const input: IDataObject = {};
					if (operation !== 'upscale') {
						input.prompt = this.getNodeParameter('prompt', i) as string;
					}
					if (['imageToImage', 'imageToVideo', 'upscale'].includes(operation)) {
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
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
