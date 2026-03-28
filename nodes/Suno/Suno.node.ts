import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForDedicatedTask } from '../GenericFunctions';

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
					{ name: 'Upload & Cover Audio', value: 'uploadCover', action: 'Upload and cover audio' },
					{ name: 'Upload & Extend Audio', value: 'uploadExtend', action: 'Upload and extend audio' },
					{ name: 'Add Instrumental', value: 'addInstrumental', action: 'Add instrumental' },
					{ name: 'Add Vocals', value: 'addVocals', action: 'Add vocals' },
					{ name: 'Replace Music Section', value: 'replaceSection', action: 'Replace music section' },
					{ name: 'Generate Lyrics', value: 'generateLyrics', action: 'Generate lyrics' },
					{ name: 'Boost Style', value: 'boostStyle', action: 'Boost style' },
					{ name: 'Convert to WAV', value: 'convertWav', action: 'Convert to WAV' },
					{ name: 'Separate Vocals', value: 'separateVocals', action: 'Separate vocals' },
					{ name: 'Generate MIDI', value: 'generateMidi', action: 'Generate MIDI' },
					{ name: 'Create Music Video', value: 'createMusicVideo', action: 'Create music video' },
					{ name: 'Generate Sound Effect', value: 'generateSound', action: 'Generate sound effect' },
					{ name: 'Music Mashup', value: 'musicMashup', action: 'Mashup two audio tracks' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'generateMusic',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic', 'generateLyrics', 'uploadCover', 'uploadExtend', 'replaceSection'] } },
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
				displayOptions: { show: { operation: ['generateMusic', 'boostStyle', 'uploadCover'] } },
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
				displayName: 'Model Version',
				name: 'modelVersion',
				type: 'options',
				displayOptions: { show: { operation: ['generateMusic'] } },
				options: [
					{ name: 'V5.5 (Latest)', value: 'V5_5' },
					{ name: 'V5', value: 'V5' },
					{ name: 'V4.5 Plus', value: 'V4_5PLUS' },
					{ name: 'V4.5 All', value: 'V4_5ALL' },
					{ name: 'V4.5', value: 'V4_5' },
					{ name: 'V4', value: 'V4' },
					{ name: 'V3.5', value: 'V3_5' },
				],
				default: 'V5_5',
				description: 'Suno model version to use',
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
				displayOptions: { show: { operation: ['extendMusic', 'boostStyle', 'convertWav', 'generateMidi', 'createMusicVideo', 'addInstrumental', 'addVocals', 'replaceSection'] } },
				default: '',
				description: 'Task ID of the source music',
			},
			{
				displayName: 'Upload URL',
				name: 'uploadUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['uploadCover', 'uploadExtend'] } },
				default: '',
				description: 'URL of the audio file to upload (must be publicly accessible)',
			},
			{
				displayName: 'Tags',
				name: 'uploadTags',
				type: 'string',
				displayOptions: { show: { operation: ['addInstrumental'] } },
				default: '',
				description: 'Music style tags for instrumental (e.g. "jazz, piano, upbeat")',
			},
			{
				displayName: 'Negative Tags',
				name: 'negativeTags',
				type: 'string',
				displayOptions: { show: { operation: ['addInstrumental', 'replaceSection'] } },
				default: '',
				description: 'Music styles to exclude (e.g. "drums, electric guitar")',
			},
			{
				displayName: 'Section Start (Seconds)',
				name: 'sectionStart',
				type: 'number',
				displayOptions: { show: { operation: ['replaceSection'] } },
				default: 0,
				description: 'Start time in seconds of the section to replace',
			},
			{
				displayName: 'Section End (Seconds)',
				name: 'sectionEnd',
				type: 'number',
				displayOptions: { show: { operation: ['replaceSection'] } },
				default: 10,
				description: 'End time in seconds of the section to replace',
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
				displayName: 'Continue Clip ID',
				name: 'continueClipId',
				type: 'string',
				displayOptions: { show: { operation: ['extendMusic'] } },
				default: '',
				description: 'Specific clip ID to continue from (alternative to task ID)',
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
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic'] } },
				default: '',
				description: 'Musical style tags (e.g. "rock, guitar, upbeat"). Alternative to style for model v4+.',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic', 'extendMusic', 'uploadCover', 'uploadExtend', 'addInstrumental', 'addVocals', 'replaceSection', 'generateLyrics', 'boostStyle', 'convertWav', 'separateVocals', 'generateMidi', 'createMusicVideo', 'generateSound', 'musicMashup'] } },
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['generateMusic', 'extendMusic', 'uploadCover', 'uploadExtend', 'addInstrumental', 'addVocals', 'replaceSection', 'generateLyrics', 'boostStyle', 'convertWav', 'separateVocals', 'generateMidi', 'createMusicVideo', 'generateSound', 'musicMashup'] } },
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['generateMusic', 'extendMusic', 'uploadCover', 'uploadExtend', 'addInstrumental', 'addVocals', 'replaceSection', 'generateLyrics', 'boostStyle', 'convertWav', 'separateVocals', 'generateMidi', 'createMusicVideo', 'generateSound', 'musicMashup'] } },
				default: true,
				description: 'Whether to wait for the task to complete (polls every 3s, 5min timeout)',
			},
			// Sound Effect fields
			{
				displayName: 'Sound Prompt',
				name: 'soundPrompt',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['generateSound'] } },
				default: '',
				description: 'Text description of the sound effect to generate',
			},
			{
				displayName: 'Loop',
				name: 'soundLoop',
				type: 'boolean',
				displayOptions: { show: { operation: ['generateSound'] } },
				default: false,
				description: 'Whether to generate a loopable sound effect',
			},
			{
				displayName: 'BPM',
				name: 'soundBpm',
				type: 'number',
				displayOptions: { show: { operation: ['generateSound'] } },
				default: 0,
				description: 'Beats per minute (optional, 0 for auto)',
			},
			{
				displayName: 'Key',
				name: 'soundKey',
				type: 'string',
				displayOptions: { show: { operation: ['generateSound'] } },
				default: '',
				description: 'Musical key (e.g. "C major", "A minor") — optional',
			},
			// Mashup fields
			{
				displayName: 'Audio URL 1',
				name: 'mashupUrl1',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: '',
				description: 'URL of the first audio track',
			},
			{
				displayName: 'Audio URL 2',
				name: 'mashupUrl2',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: '',
				description: 'URL of the second audio track',
			},
			{
				displayName: 'Mashup Lyrics',
				name: 'mashupLyrics',
				type: 'string',
				typeOptions: { rows: 4 },
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: '',
				description: 'Optional custom lyrics for the mashup',
			},
			{
				displayName: 'Mashup Style',
				name: 'mashupStyle',
				type: 'string',
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: '',
				description: 'Music style description for the mashup',
			},
			{
				displayName: 'Mashup Title',
				name: 'mashupTitle',
				type: 'string',
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: '',
			},
			{
				displayName: 'Style Weight',
				name: 'styleWeight',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: 0.5,
				description: 'Weight given to style influence (0-1)',
			},
			{
				displayName: 'Audio Weight',
				name: 'audioWeight',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: 0.5,
				description: 'Weight given to audio influence (0-1)',
			},
			{
				displayName: 'Weirdness Constraint',
				name: 'weirdnessConstraint',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['musicMashup'] } },
				default: 0,
				description: 'Controls how unusual/experimental the mashup can be (0 = normal, 1 = weird)',
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
					const pollEndpoint = '/api/v1/generate/record-info';

					if (operation === 'generateMusic') {
						endpoint = '/api/v1/generate';
						const prompt = this.getNodeParameter('prompt', i, '') as string;
						const lyrics = this.getNodeParameter('lyrics', i, '') as string;
						const style = this.getNodeParameter('style', i, '') as string;
						const title = this.getNodeParameter('title', i, '') as string;
						const tags = this.getNodeParameter('tags', i, '') as string;
						const instrumental = this.getNodeParameter('instrumental', i) as boolean;
						const modelVersion = this.getNodeParameter('modelVersion', i, 'V4_5') as string;
						if (prompt) body.prompt = prompt;
						if (lyrics) body.lyrics = lyrics;
						if (style) body.style = style;
						if (title) body.title = title;
						if (tags) body.tags = tags;
						body.instrumental = instrumental;
						body.customMode = !!(lyrics || style || tags);
						body.model = modelVersion;
					} else if (operation === 'extendMusic') {
						endpoint = '/api/v1/generate/extend';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
						const continueAt = this.getNodeParameter('continueAt', i, 0) as number;
						if (continueAt) body.continueAt = continueAt;
						const continueClipId = this.getNodeParameter('continueClipId', i, '') as string;
						if (continueClipId) body.continueClipId = continueClipId;
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
					} else if (operation === 'uploadCover') {
						endpoint = '/api/v1/generate/upload-cover';
						body.uploadUrl = this.getNodeParameter('uploadUrl', i) as string;
						body.prompt = this.getNodeParameter('prompt', i, '') as string;
						const coverStyle = this.getNodeParameter('style', i, '') as string;
						if (coverStyle) body.style = coverStyle;
					} else if (operation === 'uploadExtend') {
						endpoint = '/api/v1/generate/upload-extend';
						body.uploadUrl = this.getNodeParameter('uploadUrl', i) as string;
						body.prompt = this.getNodeParameter('prompt', i, '') as string;
					} else if (operation === 'addInstrumental') {
						endpoint = '/api/v1/generate/add-instrumental';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
						const instTags = this.getNodeParameter('uploadTags', i, '') as string;
						if (instTags) body.tags = instTags;
						const negTags = this.getNodeParameter('negativeTags', i, '') as string;
						if (negTags) body.negativeTags = negTags;
					} else if (operation === 'addVocals') {
						endpoint = '/api/v1/generate/add-vocals';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
					} else if (operation === 'replaceSection') {
						endpoint = '/api/v1/generate/replace-section';
						body.taskId = this.getNodeParameter('sourceTaskId', i) as string;
						body.prompt = this.getNodeParameter('prompt', i, '') as string;
						body.startTime = this.getNodeParameter('sectionStart', i, 0) as number;
						body.endTime = this.getNodeParameter('sectionEnd', i, 10) as number;
						const negReplTags = this.getNodeParameter('negativeTags', i, '') as string;
						if (negReplTags) body.negativeTags = negReplTags;
					} else if (operation === 'generateSound') {
						endpoint = '/api/v1/sounds/generate';
						body.model = 'ai-music-api/sounds';
						body.prompt = this.getNodeParameter('soundPrompt', i) as string;
						const soundLoop = this.getNodeParameter('soundLoop', i, false) as boolean;
						if (soundLoop) body.loop = true;
						const soundBpm = this.getNodeParameter('soundBpm', i, 0) as number;
						if (soundBpm) body.bpm = soundBpm;
						const soundKey = this.getNodeParameter('soundKey', i, '') as string;
						if (soundKey) body.key = soundKey;
					} else if (operation === 'musicMashup') {
						endpoint = '/api/v1/mashup/generate';
						body.model = 'ai-music-api/mashup';
						const url1 = this.getNodeParameter('mashupUrl1', i) as string;
						const url2 = this.getNodeParameter('mashupUrl2', i) as string;
						body.uploadUrlList = [url1, url2];
						const mashupLyrics = this.getNodeParameter('mashupLyrics', i, '') as string;
						if (mashupLyrics) body.lyrics = mashupLyrics;
						const mashupStyle = this.getNodeParameter('mashupStyle', i, '') as string;
						if (mashupStyle) body.style = mashupStyle;
						const mashupTitle = this.getNodeParameter('mashupTitle', i, '') as string;
						if (mashupTitle) body.title = mashupTitle;
						body.styleWeight = this.getNodeParameter('styleWeight', i, 0.5) as number;
						body.audioWeight = this.getNodeParameter('audioWeight', i, 0.5) as number;
						const weirdnessConstraint = this.getNodeParameter('weirdnessConstraint', i, 0) as number;
						if (weirdnessConstraint) body.weirdnessConstraint = weirdnessConstraint;
					}

					const replyUrl = this.getNodeParameter('replyUrl', i, '') as string;
					if (replyUrl) body.replyUrl = replyUrl;
					const replyRef = this.getNodeParameter('replyRef', i, '') as string;
					if (replyRef) body.replyRef = replyRef;

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
