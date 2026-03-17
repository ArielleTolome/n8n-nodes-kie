import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

export class Topaz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Topaz (Kie.ai)',
		name: 'topaz',
		icon: 'file:topaz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Upscale images and videos using Topaz via Kie.ai API',
		defaults: {
			name: 'Topaz (Kie.ai)',
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
					{ name: 'Image Upscale', value: 'imageUpscale', action: 'Upscale image' },
					{ name: 'Video Upscale', value: 'videoUpscale', action: 'Upscale video' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'imageUpscale',
				required: true,
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['imageUpscale'] } },
				default: '',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['videoUpscale'] } },
				default: '',
			},
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'options',
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
				options: [
					{ name: '2x', value: 2 },
					{ name: '4x', value: 4 },
				],
				default: 2,
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId }));
				} else {
					const model = operation === 'imageUpscale' ? 'topaz/image-upscale' : 'topaz/video-upscale';
					const input: IDataObject = {
						scale: this.getNodeParameter('scale', i) as number,
					};

					if (operation === 'imageUpscale') {
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
					} else {
						input.videoUrl = this.getNodeParameter('videoUrl', i) as string;
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
