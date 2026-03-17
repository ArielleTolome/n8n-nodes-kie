import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForDedicatedTask } from '../GenericFunctions';

export class FourOImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: '4o Image (Kie.ai)',
		name: 'fourOImage',
		icon: 'file:4o-image.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using GPT-4o Image via Kie.ai API',
		defaults: {
			name: '4o Image (Kie.ai)',
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
					{ name: 'Generate', value: 'generate', action: 'Generate image' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'generate',
				required: true,
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
				description: 'Optional input image URL for image editing',
			},
			{
				displayName: 'Number of Images',
				name: 'n',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: '1', value: 1 },
					{ name: '2', value: 2 },
					{ name: '3', value: 3 },
					{ name: '4', value: 4 },
				],
				default: 1,
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: '1024x1024', value: '1024x1024' },
					{ name: '1792x1024', value: '1792x1024' },
					{ name: '1024x1792', value: '1024x1792' },
				],
				default: '1024x1024',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: 'Standard', value: 'standard' },
					{ name: 'HD', value: 'hd' },
				],
				default: 'standard',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'options',
				displayOptions: { show: { operation: ['generate'] } },
				options: [
					{ name: 'Vivid', value: 'vivid' },
					{ name: 'Natural', value: 'natural' },
				],
				default: 'vivid',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['generate'] } },
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/gpt4o-image/record-info', undefined, { taskId }));
				} else {
					const body: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
						n: this.getNodeParameter('n', i) as number,
						size: this.getNodeParameter('size', i) as string,
						quality: this.getNodeParameter('quality', i) as string,
						style: this.getNodeParameter('style', i) as string,
					};
					const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
					if (imageUrl) body.imageUrl = imageUrl;

					const response = await kieRequest(this, 'POST', '/api/v1/gpt4o-image/generate', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/gpt4o-image/record-info'));
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
