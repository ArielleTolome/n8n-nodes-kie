import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Sora2Pro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sora 2 Pro',
		name: 'sora2Pro',
		icon: 'file:sora2-pro-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Sora 2 Pro Text To Video API',
		defaults: {
			name: 'Sora 2 Pro',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kieAiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Job',
						value: 'job',
					},
				],
				default: 'job',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a new video generation task',
						action: 'Create a task',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Query the status of a task',
						action: 'Query task status',
					},
				],
				default: 'createTask',
				required: true,
			},
			// Create Task parameters
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
				description: 'The text prompt describing the desired video motion (max 10000 characters)',
				placeholder: 'a happy dog running in the garden',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'aspectRatio',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: 'Landscape',
						value: 'landscape',
					},
					{
						name: 'Portrait',
						value: 'portrait',
					},
				],
				default: 'landscape',
				description: 'The aspect ratio of the generated video',
			},
			{
				displayName: 'Video Duration',
				name: 'nFrames',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: '10 Seconds',
						value: '10',
					},
					{
						name: '15 Seconds',
						value: '15',
					},
				],
				default: '10',
				description: 'The number of seconds/frames to be generated',
			},
			{
				displayName: 'Quality Size',
				name: 'size',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: 'High (1080p)',
						value: 'high',
					},
					{
						name: 'Standard (720p)',
						value: 'standard',
					},
				],
				default: 'high',
				description: 'The quality or size of the generated video',
			},
			{
				displayName: 'Character IDs',
				name: 'characterIds',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
				description: 'Optional list of character IDs for consistent character generation (comma-separated)',
				placeholder: 'char_12345, char_67890',
			},
			{
				displayName: 'Remove Watermark',
				name: 'removeWatermark',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: true,
				description: 'Whether to remove watermarks from the generated video',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
				description: 'Optional callback URL for task completion notifications',
				placeholder: 'https://your-domain.com/api/callback',
			},
			{
				displayName: 'Инструкции по настройке и примеры использования в телеграм канале <a href="https://t.me/myspacet_ai" target="_blank">https://t.me/myspacet_ai</a>',
				name: 'telegramNotice',
				type: 'notice',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: '',
			},
			// Query Task Status parameters
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['queryTaskStatus'],
					},
				},
				default: '',
				description: 'The task ID to query',
				placeholder: '281e5b0*********************f39b9',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'job') {
					if (operation === 'createTask') {
						const prompt = this.getNodeParameter('prompt', i) as string;
						const aspectRatio = this.getNodeParameter('aspectRatio', i) as string;
						const nFrames = this.getNodeParameter('nFrames', i) as string;
						const size = this.getNodeParameter('size', i) as string;
						const removeWatermark = this.getNodeParameter('removeWatermark', i) as boolean;
						const characterIds = this.getNodeParameter('characterIds', i, '') as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						const body: IDataObject = {
							model: 'sora-2-pro-text-to-video',
							input: {
								prompt,
								aspect_ratio: aspectRatio,
								n_frames: nFrames,
								size: size,
								remove_watermark: removeWatermark,
							},
						};

						if (characterIds && characterIds.trim() !== '') {
							(body.input as IDataObject).character_id_list = characterIds.split(',').map((id) => id.trim());
						}

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'kieAiApi',
							{
								method: 'POST',
								url: 'https://api.kie.ai/api/v1/jobs/createTask',
								headers: {
									'Content-Type': 'application/json',
								},
								body,
								json: true,
							},
						);

						returnData.push(response);
					} else if (operation === 'queryTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'kieAiApi',
							{
								method: 'GET',
								url: `https://api.kie.ai/api/v1/jobs/recordInfo`,
								qs: {
									taskId,
								},
								json: true,
							},
						);

						returnData.push(response);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({ error: errorMessage, json: {} });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}