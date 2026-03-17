import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

export class Sora2Pro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sora 2 Pro (Kie.ai)',
		name: 'sora2Pro',
		icon: 'file:sora2-pro-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Sora 2 Pro via Kie.ai API',
		defaults: {
			name: 'Sora 2 Pro (Kie.ai)',
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
						name: 'Text-to-Video',
						value: 'createTask',
						description: 'Generate video from text prompt',
						action: 'Text-to-Video',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get Task Status',
					},
				],
				default: 'createTask',
				required: true,
			},
			// Create Task parameters
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				options: [
					{
						name: 'Sora 2 Pro (Text-to-Video)',
						value: 'sora-2-pro-text-to-video',
					},
					{
						name: 'Sora 2 (Text-to-Video)',
						value: 'sora-2-text-to-video',
					},
					{
						name: 'Sora 2 Pro (Image-to-Video)',
						value: 'sora-2-pro-image-to-video',
					},
					{
						name: 'Sora 2 (Image-to-Video)',
						value: 'sora-2-image-to-video',
					},
				],
				default: 'sora-2-pro-text-to-video',
				description: 'The Sora model variant to use',
			},
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
				displayName: 'Input Image URL',
				name: 'inputImageUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
						model: ['sora-2-pro-image-to-video', 'sora-2-image-to-video'],
					},
				},
				default: '',
				description: 'URL of the input image for image-to-video generation',
				placeholder: 'https://example.com/image.png',
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
						name: 'Landscape (16:9)',
						value: 'landscape',
					},
					{
						name: 'Portrait (9:16)',
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
				description: 'Duration of the generated video',
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
				description: 'The quality of the generated video',
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
				description: 'Optional character IDs for consistent character generation (comma-separated)',
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
				default: false,
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
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['createTask'],
					},
				},
				default: true,
				description: 'Whether to wait for the task to complete before returning (polls every 3s, 5min timeout)',
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
						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const aspectRatio = this.getNodeParameter('aspectRatio', i) as string;
						const nFrames = this.getNodeParameter('nFrames', i) as string;
						const size = this.getNodeParameter('size', i) as string;
						const removeWatermark = this.getNodeParameter('removeWatermark', i) as boolean;
						const characterIds = this.getNodeParameter('characterIds', i, '') as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

						const input: IDataObject = {
							prompt,
							aspect_ratio: aspectRatio,
							n_frames: nFrames,
							size,
							remove_watermark: removeWatermark,
						};

						if (model.includes('image-to-video')) {
							const inputImageUrl = this.getNodeParameter('inputImageUrl', i, '') as string;
							if (inputImageUrl && inputImageUrl.trim() !== '') {
								input.input_image_url = inputImageUrl;
							}
						}

						if (characterIds && characterIds.trim() !== '') {
							input.character_id_list = characterIds.split(',').map((id) => id.trim());
						}

						const body: IDataObject = { model, input };

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await kieRequest(this, 'POST', '/api/v1/jobs/createTask', body);

						if (waitForCompletionFlag) {
							const data = response.data as IDataObject | undefined;
							const taskId = data?.taskId as string | undefined;
							if (taskId) {
								const result = await waitForTask(this, taskId);
								returnData.push(result);
							} else {
								returnData.push(response);
							}
						} else {
							returnData.push(response);
						}
					} else if (operation === 'queryTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const response = await kieRequest(this, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId });
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
