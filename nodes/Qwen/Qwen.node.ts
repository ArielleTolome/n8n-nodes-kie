import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

export class Qwen implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Qwen (Kie.ai)',
		name: 'qwen',
		icon: 'file:qwen.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Qwen via Kie.ai API',
		defaults: {
			name: 'Qwen (Kie.ai)',
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
					{ name: 'Image Edit', value: 'imageEdit', action: 'Image edit' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'textToImage',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'modelEdit',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageEdit'],
					},
				},
				options: [
					{ name: 'Qwen Image Edit', value: 'qwen/image-edit' },
					{ name: 'Qwen 2 Image Edit', value: 'qwen2/image-edit' },
				],
				default: 'qwen/image-edit',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'imageEdit'],
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
						operation: ['imageToImage', 'imageEdit'],
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
						operation: ['imageEdit'],
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
						operation: ['textToImage', 'imageToImage'],
					},
				},
				options: [
					{ name: '1:1', value: '1:1' },
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
				],
				default: '1:1',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['textToImage'],
					},
				},
				default: 0,
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToImage', 'imageToImage', 'imageEdit'],
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId }));
				} else {
					let model = '';
					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
					};

					if (operation === 'textToImage') {
						model = 'qwen/text-to-image';
						input.ratio = this.getNodeParameter('ratio', i) as string;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
					} else if (operation === 'imageToImage') {
						model = 'qwen/image-to-image';
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						input.ratio = this.getNodeParameter('ratio', i) as string;
					} else if (operation === 'imageEdit') {
						model = this.getNodeParameter('modelEdit', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const maskUrl = this.getNodeParameter('maskUrl', i, '') as string;
						if (maskUrl) input.maskUrl = maskUrl;
					}

					const body: IDataObject = { model, input };
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
