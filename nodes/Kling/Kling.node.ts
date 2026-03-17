import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

export class Kling implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Kling (Kie.ai)',
		name: 'kling',
		icon: 'file:kling.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate videos using Kling via Kie.ai API',
		defaults: {
			name: 'Kling (Kie.ai)',
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
						name: 'AI Avatar',
						value: 'aiAvatar',
						description: 'Generate AI avatar video',
						action: 'AI avatar',
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
					{ name: 'Kling 3.0', value: 'kling-3.0/text-to-video' },
					{ name: 'Kling 2.6', value: 'kling-2.6/text-to-video' },
					{ name: 'Kling 2.5 Turbo Pro', value: 'kling-2.5/turbo-text-to-video-pro' },
					{ name: 'Kling 2.1 Master', value: 'kling-2.1/master-text-to-video' },
					{ name: 'Kling 2.1 Pro', value: 'kling-2.1/pro' },
					{ name: 'Kling 2.1 Standard', value: 'kling-2.1/standard' },
				],
				default: 'kling-3.0/text-to-video',
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
					{ name: 'Kling 2.6', value: 'kling-2.6/image-to-video' },
					{ name: 'Kling 2.5 Turbo Pro', value: 'kling-2.5/turbo-image-to-video-pro' },
					{ name: 'Kling 2.1 Master', value: 'kling-2.1/master-image-to-video' },
					{ name: 'Kling 2.1 Pro', value: 'kling-2.1/pro' },
					{ name: 'Kling Motion Control', value: 'kling/motion-control' },
				],
				default: 'kling-2.6/image-to-video',
			},
			{
				displayName: 'Model',
				name: 'modelAvatar',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['aiAvatar'],
					},
				},
				options: [
					{ name: 'AI Avatar Pro', value: 'kling/ai-avatar-pro' },
					{ name: 'AI Avatar Standard', value: 'kling/ai-avatar-standard' },
				],
				default: 'kling/ai-avatar-pro',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['textToVideo', 'aiAvatar'],
					},
				},
				default: '',
				description: 'Text prompt for video generation',
			},
			{
				displayName: 'Prompt',
				name: 'promptI2V',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['imageToVideo'],
					},
				},
				default: '',
				description: 'Optional text prompt to guide image-to-video',
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
				description: 'URL of the input image',
			},
			{
				displayName: 'Avatar ID',
				name: 'avatarId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['aiAvatar'],
					},
				},
				default: '',
				description: 'Avatar ID for AI avatar generation',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				options: [
					{ name: '5 Seconds', value: 5 },
					{ name: '10 Seconds', value: 10 },
				],
				default: 5,
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
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
				displayName: 'CFG Scale',
				name: 'cfgScale',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo'],
					},
				},
				default: 0.5,
				description: 'Creativity vs prompt adherence (0-1)',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['textToVideo', 'imageToVideo', 'aiAvatar'],
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
					const input: IDataObject = {};

					if (operation === 'textToVideo') {
						model = this.getNodeParameter('model', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						input.duration = this.getNodeParameter('duration', i) as number;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.cfg_scale = this.getNodeParameter('cfgScale', i) as number;
					} else if (operation === 'imageToVideo') {
						model = this.getNodeParameter('modelI2V', i) as string;
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const prompt = this.getNodeParameter('promptI2V', i, '') as string;
						if (prompt) input.prompt = prompt;
						input.duration = this.getNodeParameter('duration', i) as number;
						input.ratio = this.getNodeParameter('ratio', i) as string;
						input.cfg_scale = this.getNodeParameter('cfgScale', i) as number;
					} else if (operation === 'aiAvatar') {
						model = this.getNodeParameter('modelAvatar', i) as string;
						input.prompt = this.getNodeParameter('prompt', i) as string;
						const avatarId = this.getNodeParameter('avatarId', i, '') as string;
						if (avatarId) input.avatarId = avatarId;
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
