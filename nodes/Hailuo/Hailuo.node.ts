import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Hailuo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hailuo (Kie.ai)',
		name: 'hailuo',
		icon: 'file:hailuo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Hailuo via Kie.ai API',
		defaults: {
			name: 'Hailuo (Kie.ai)',
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
						name: 'Image-to-Video',
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
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo'],
					},
				},
				options: [
					{ name: 'Hailuo 02 Pro', value: 'hailuo-02/text-to-video-pro' },
					{ name: 'Hailuo 02 Standard', value: 'hailuo-02/text-to-video-standard' },
				],
				default: 'hailuo-02/text-to-video-pro',
			},
			{
				displayName: 'Model',
				name: 'modelI2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				options: [
					{ name: 'Hailuo 2.3 Pro', value: 'hailuo-2.3/image-to-video-pro' },
					{ name: 'Hailuo 2.3 Standard', value: 'hailuo-2.3/image-to-video-standard' },
					{ name: 'Hailuo 02 Pro', value: 'hailuo-02/image-to-video-pro' },
					{ name: 'Hailuo 02 Standard', value: 'hailuo-02/image-to-video-standard' },
				],
				default: 'hailuo-2.3/image-to-video-pro',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
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
						operation: ['imageToVideo'],
					},
				},
				default: '',
			},
			{
				displayName: 'End Frame URL',
				name: 'endImageUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				description: 'Optional end/last frame image URL for image-to-video',
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
				description: 'Seed for reproducibility (0 = random)',
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
				description: 'Webhook URL to call when the task completes',
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
				description: 'Custom reference string passed back in the webhook callback',
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
				} else {
					const model = operation === 'textToVideo'
						? this.getNodeParameter('model', i) as string
						: this.getNodeParameter('modelI2V', i) as string;

					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
					};

					if (operation === 'imageToVideo') {
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const endImageUrl = this.getNodeParameter('endImageUrl', i, '') as string;
						if (endImageUrl) input.endImageUrl = endImageUrl;
					}
					const seed = this.getNodeParameter('seed', i, 0) as number;
					if (seed) input.seed = seed;

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
