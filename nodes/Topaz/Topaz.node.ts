import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

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
				displayName: 'Output Quality',
				name: 'outputQuality',
				type: 'options',
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
				options: [
					{ name: 'Low', value: 'Low' },
					{ name: 'Medium', value: 'Medium' },
					{ name: 'High', value: 'High' },
					{ name: 'Very High', value: 'Very High' },
				],
				default: 'High',
				description: 'Output quality level',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				displayOptions: { show: { operation: ['videoUpscale'] } },
				options: [
					{ name: 'MP4', value: 'mp4' },
					{ name: 'MOV', value: 'mov' },
					{ name: 'MKV', value: 'mkv' },
				],
				default: 'mp4',
				description: 'Output video format',
			},
			{
				displayName: 'Face Recovery',
				name: 'faceRecovery',
				type: 'boolean',
				displayOptions: { show: { operation: ['imageUpscale'] } },
				default: false,
				description: 'Whether to enable AI face recovery during upscale',
			},
			{
				displayName: 'Denoise Strength',
				name: 'denoiseStrength',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
				default: 0,
				description: 'Denoising strength (0-1, 0 = disabled)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['imageUpscale', 'videoUpscale'] } },
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
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
					returnData.push(await kieQueryTask(this, taskId));
				} else {
					const model = operation === 'imageUpscale' ? 'topaz/image-upscale' : 'topaz/video-upscale';
					const scaleVal = this.getNodeParameter('scale', i) as number;
					const input: IDataObject = {
						upscale_factor: String(scaleVal),
					};

					if (operation === 'imageUpscale') {
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
						const faceRecovery = this.getNodeParameter('faceRecovery', i, false) as boolean;
						if (faceRecovery) input.face_recovery = true;
					} else {
						input.video_url = this.getNodeParameter('videoUrl', i) as string;
						const outputFormat = this.getNodeParameter('outputFormat', i, 'mp4') as string;
						if (outputFormat !== 'mp4') input.output_format = outputFormat;
					}

					const outputQuality = this.getNodeParameter('outputQuality', i, 'High') as string;
					if (outputQuality !== 'High') input.output_quality = outputQuality;
					const denoiseStrength = this.getNodeParameter('denoiseStrength', i, 0) as number;
					if (denoiseStrength > 0) input.denoise_strength = denoiseStrength;

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
