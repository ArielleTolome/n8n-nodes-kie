import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Wan implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wan (Kie.ai)',
		name: 'wan',
		icon: 'file:wan.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Wan via Kie.ai API',
		defaults: {
			name: 'Wan (Kie.ai)',
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
						name: 'Video-to-Video',
						value: 'videoToVideo',
						description: 'Transform video with prompt',
						action: 'Video to video',
					},
					{
						name: 'Speech-to-Video',
						value: 'speechToVideo',
						description: 'Generate video from audio',
						action: 'Speech to video',
					},
					{
						name: 'Animate',
						value: 'animate',
						description: 'Animate an image with motion',
						action: 'Animate',
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
					{ name: 'Wan 2.6', value: 'wan-2.6/text-to-video' },
					{ name: 'Wan 2.2 Turbo', value: 'wan-2.2/text-to-video-turbo' },
				],
				default: 'wan-2.6/text-to-video',
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
					{ name: 'Wan 2.6', value: 'wan-2.6/image-to-video' },
					{ name: 'Wan 2.6 Flash', value: 'wan-2.6/flash-image-to-video' },
					{ name: 'Wan 2.2 Turbo', value: 'wan-2.2/image-to-video-turbo' },
				],
				default: 'wan-2.6/image-to-video',
			},
			{
				displayName: 'Model',
				name: 'modelV2V',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				options: [
					{ name: 'Wan 2.6', value: 'wan-2.6/video-to-video' },
					{ name: 'Wan 2.6 Flash', value: 'wan-2.6/flash-video-to-video' },
				],
				default: 'wan-2.6/video-to-video',
			},
			{
				displayName: 'Animate Type',
				name: 'animateType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['animate'],
					},
				},
				options: [
					{ name: 'Animate Move', value: 'wan-2.2/animate-move' },
					{ name: 'Animate Replace', value: 'wan-2.2/animate-replace' },
				],
				default: 'wan-2.2/animate-move',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo'],
					},
				},
				default: '',
			},
			{
				displayName: 'Prompt',
				name: 'promptOpt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo', 'videoToVideo', 'animate'],
					},
				},
				default: '',
				description: 'Optional prompt to guide generation',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['imageToVideo', 'animate'],
					},
				},
				default: '',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['videoToVideo'],
					},
				},
				default: '',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['speechToVideo'],
					},
				},
				default: '',
				description: 'URL of the audio file',
			},
			{
				displayName: 'Mask URL',
				name: 'maskUrl',
				type: 'string',
				displayOptions: {
					show: {
						animateType: ['wan-2.2/animate-replace'],
					},
				},
				default: '',
				description: 'Mask URL for animate-replace',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
					},
				},
				options: [
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
					{ name: '1:1', value: '1:1' },
				],
				default: '16:9',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo'],
					},
				},
				options: [
					{ name: '5 Seconds', value: 5 },
					{ name: '10 Seconds', value: 10 },
				],
				default: 5,
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'videoToVideo', 'speechToVideo', 'animate'],
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
					let model = '';
					const input: IDataObject = {};

					if (operation === 'textToVideo') {
						model = this.getNodeParameter('model', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = this.getNodeParameter('duration', i) as number;
					} else if (operation === 'imageToVideo') {
						model = this.getNodeParameter('modelI2V', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = this.getNodeParameter('duration', i) as number;
					} else if (operation === 'videoToVideo') {
						model = this.getNodeParameter('modelV2V', i) as string;
						input.videoUrl = this.getNodeParameter('videoUrl', i) as string;
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.duration = this.getNodeParameter('duration', i) as number;
					} else if (operation === 'speechToVideo') {
						model = 'wan-2.2/speech-to-video-turbo';
						input.audioUrl = this.getNodeParameter('audioUrl', i) as string;
					} else if (operation === 'animate') {
						model = this.getNodeParameter('animateType', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const p = this.getNodeParameter('promptOpt', i, '') as string;
						if (p) input.prompt = p;
						if (model === 'wan-2.2/animate-replace') {
							const mask = this.getNodeParameter('maskUrl', i, '') as string;
							if (mask) input.maskUrl = mask;
						}
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
