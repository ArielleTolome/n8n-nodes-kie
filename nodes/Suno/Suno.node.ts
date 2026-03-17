import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForDedicatedTask } from '../GenericFunctions';

export class Suno implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Suno (Kie.ai)',
		name: 'suno',
		icon: 'file:suno.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate music, lyrics, and audio processing using Suno via Kie.ai API',
		defaults: {
			name: 'Suno (Kie.ai)',
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
					{ name: 'Generate Music', value: 'generateMusic', action: 'Generate music' },
					{ name: 'Extend Music', value: 'extendMusic', action: 'Extend music' },
					{ name: 'Generate Lyrics', value: 'generateLyrics', action: 'Generate lyrics' },
					{ name: 'Boost Style', value: 'boostStyle', action: 'Boost style' },
					{ name: 'Convert to WAV', value: 'convertWav', action: 'Convert to WAV' },
					{ name: 'Separate Vocals', value: 'separateVocals', action: 'Separate vocals' },
					{ name: 'Generate MIDI', value: 'generateMidi', action: 'Generate MIDI' },
					{ name: 'Create Music Video', value: 'createMusicVideo', action: 'Create music video' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'generateMusic',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic', 'generateLyrics'] } },
				default: '',
				description: 'Text description of the music or lyrics to generate',
			},
			{
				displayName: 'Lyrics',
				name: 'lyrics',
				type: 'string',
				typeOptions: { rows: 6 },
				displayOptions: { show: { operation: ['generateMusic'] } },
				default: '',
				description: 'Custom lyrics (optional if prompt is provided)',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic', 'boostStyle'] } },
				default: '',
				description: 'Music style description (e.g. "upbeat pop", "jazz ballad")',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic'] } },
				default: '',
			},
			{
				displayName: 'Instrumental',
				name: 'instrumental',
				type: 'boolean',
				displayOptions: { show: { operation: ['generateMusic'] } },
				default: false,
				description: 'Whether to generate instrumental only',
			},
			{
				displayName: 'Task ID',
				name: 'sourceTaskId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['extendMusic', 'boostStyle', 'convertWav', 'generateMidi', 'createMusicVideo'] } },
				default: '',
				description: 'Task ID of the source music',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				displayOptions: { show: { operation: ['separateVocals'] } },
				default: '',
				description: 'Audio URL (alternative to task ID)',
			},
			{
				displayName: 'Source Task ID',
				name: 'vocalTaskId',
				type: 'string',
				displayOptions: { show: { operation: ['separateVocals'] } },
				default: '',
				description: 'Task ID (alternative to audio URL)',
			},
			{
				displayName: 'Continue At (Seconds)',
				name: 'continueAt',
				type: 'number',
				displayOptions: { show: { operation: ['extendMusic'] } },
				default: 0,
				description: 'Timestamp in seconds to continue from',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['generateMusic', 'extendMusic', 'generateLyrics', 'boostStyle', 'convertWav', 'separateVocals', 'generateMidi', 'createMusicVideo'] } },
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/generate/record-info', undefined, { taskId }));
				} else {
					let endpoint = '';
					const body: IDataObject = {};
					let pollEndpoint = '/api/v1/generate/record-info';

					if (operation === 'generateMusic') {
						endpoint = '/api/v1/generate';
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						const lyrics = this.getNodeParameter('lyrics', i, '') as string;
						const style = this.getNodeParameter('style', i, '') as string;
						const title = this.getNodeParameter('title', i, '') as string;
						const instrumental = this.getNodeParameter('instrumental', i) as boolean;
						if (prompt) body.prompt = prompt;
						if (lyrics) body.lyrics = lyrics;
						if (style) body.style = style;
						if (title) body.title = title;
						body.instrumental = instrumental;
					} else if (operation === 'extendMusic') {
						endpoint = '/api/v1/generate/extend';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
						const continueAt = this.getNodeParameter('continueAt', i, 0) as number;
						if (continueAt) body.continueAt = continueAt;
					} else if (operation === 'generateLyrics') {
						endpoint = '/api/v1/lyrics';
						body.prompt = this.getNodeParameter('prompt', i, '') as string;
					} else if (operation === 'boostStyle') {
						endpoint = '/api/v1/style/generate';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
						const style = this.getNodeParameter('style', i, '') as string;
						if (style) body.style = style;
					} else if (operation === 'convertWav') {
						endpoint = '/api/v1/wav/generate';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
					} else if (operation === 'separateVocals') {
						endpoint = '/api/v1/vocal-removal/generate';
						const audioUrl = this.getNodeParameter('audioUrl', i, '') as string;
						const vocalTaskId = this.getNodeParameter('vocalTaskId', i, '') as string;
						if (audioUrl) body.audioUrl = audioUrl;
						if (vocalTaskId) body.taskId = vocalTaskId;
					} else if (operation === 'generateMidi') {
						endpoint = '/api/v1/midi/generate';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
					} else if (operation === 'createMusicVideo') {
						endpoint = '/api/v1/mp4/generate';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
					}

					const response = await kieRequest(this, 'POST', endpoint, body);
					const waitFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

					if (waitFlag) {
						const taskId = (response.data as IDataObject)?.taskId ?? response.taskId;
						if (taskId) {
							returnData.push(await waitForDedicatedTask(this, taskId as string, pollEndpoint));
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
