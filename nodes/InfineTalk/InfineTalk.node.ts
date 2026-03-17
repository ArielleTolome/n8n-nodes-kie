import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class InfineTalk implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InfineTalk (Kie.ai)',
		name: 'infineTalk',
		icon: 'file:infinetalk.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Audio dubbing using InfineTalk via Kie.ai API',
		defaults: {
			name: 'InfineTalk (Kie.ai)',
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
					{ name: 'Dub from Audio', value: 'fromAudio', action: 'Dub from audio' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'fromAudio',
				required: true,
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: '',
			},
			{
				displayName: 'Target Language',
				name: 'targetLanguage',
				type: 'string',
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: '',
				description: 'Optional target language code',
			},
			{
				displayName: 'Speed',
				name: 'speed',
				type: 'number',
				typeOptions: { minValue: 0.5, maxValue: 2.0, numberStepSize: 0.1 },
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: 1.0,
				description: 'Speech speed multiplier (0.5-2.0, 1.0 = normal)',
			},
			{
				displayName: 'Pitch',
				name: 'pitch',
				type: 'number',
				typeOptions: { minValue: -12, maxValue: 12, numberStepSize: 1 },
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: 0,
				description: 'Voice pitch adjustment in semitones (-12 to 12)',
			},
			{
				displayName: 'Volume',
				name: 'volume',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 2.0, numberStepSize: 0.1 },
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: 1.0,
				description: 'Output volume multiplier (0-2.0, 1.0 = normal)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['fromAudio'] } },
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['fromAudio'] } },
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
					const input: IDataObject = {
						audioUrl: this.getNodeParameter('audioUrl', i) as string,
					};
					const targetLanguage = this.getNodeParameter('targetLanguage', i, '') as string;
					if (targetLanguage) input.targetLanguage = targetLanguage;
					const speed = this.getNodeParameter('speed', i, 1.0) as number;
					if (speed !== 1.0) input.speed = speed;
					const pitch = this.getNodeParameter('pitch', i, 0) as number;
					if (pitch !== 0) input.pitch = pitch;
					const volume = this.getNodeParameter('volume', i, 1.0) as number;
					if (volume !== 1.0) input.volume = volume;

					const body: IDataObject = { model: 'infinetalk/from-audio', input };

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
