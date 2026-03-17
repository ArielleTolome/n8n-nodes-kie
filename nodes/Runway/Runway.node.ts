import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForDedicatedTask } from '../GenericFunctions';

export class Runway implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Runway Gen4 (Kie.ai)',
		name: 'runway',
		icon: 'file:runway.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate and extend videos using Runway Gen4 via Kie.ai API',
		defaults: {
			name: 'Runway Gen4 (Kie.ai)',
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
					{ name: 'Aleph Generate', value: 'aleph', action: 'Aleph generate' },
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
					{ name: 'Gen4 Turbo', value: 'gen4_turbo' },
					{ name: 'Gen4', value: 'gen4' },
				],
				default: 'gen4_turbo',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['generate', 'aleph'] } },
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
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['aleph'] } },
				default: '',
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
					{ name: '10', value: 10 },
				],
				default: 5,
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
				displayName: 'Extend Seconds',
				name: 'seconds',
				type: 'number',
				displayOptions: { show: { operation: ['extend'] } },
				default: 5,
				description: 'Number of seconds to extend',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['generate', 'extend', 'aleph'] } },
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/runway/record-detail', undefined, { taskId }));
				} else if (operation === 'generate') {
					const body: IDataObject = {
						model: this.getNodeParameter('model', i) as string,
						prompt: this.getNodeParameter('prompt', i) as string,
						ratio: this.getNodeParameter('ratio', i) as string,
						duration: this.getNodeParameter('duration', i) as number,
					};
					const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
					if (imageUrl) body.imageUrl = imageUrl;

					const response = await kieRequest(this, 'POST', '/api/v1/runway/generate', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/runway/record-detail'));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				} else if (operation === 'extend') {
					const body: IDataObject = {
						taskId: this.getNodeParameter('extendTaskId', i) as string,
						seconds: this.getNodeParameter('seconds', i) as number,
					};

					const response = await kieRequest(this, 'POST', '/api/v1/runway/extend', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/runway/record-detail'));
						} else {
							returnData.push(response);
						}
					} else {
						returnData.push(response);
					}
				} else if (operation === 'aleph') {
					const body: IDataObject = {
						model: 'aleph',
						videoUrl: this.getNodeParameter('videoUrl', i) as string,
						prompt: this.getNodeParameter('prompt', i) as string,
					};

					const response = await kieRequest(this, 'POST', '/api/v1/aleph/generate', body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, '/api/v1/aleph/record-info'));
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
