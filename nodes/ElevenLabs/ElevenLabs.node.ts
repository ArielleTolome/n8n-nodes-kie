import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

const languageOptions = [
	{ name: 'Auto', value: 'auto' },
	{ name: 'Afrikaans', value: 'af' },
	{ name: 'Arabic', value: 'ar' },
	{ name: 'Armenian', value: 'hy' },
	{ name: 'Assamese', value: 'as' },
	{ name: 'Azerbaijani', value: 'az' },
	{ name: 'Belarusian', value: 'be' },
	{ name: 'Bengali', value: 'bn' },
	{ name: 'Bosnian', value: 'bs' },
	{ name: 'Bulgarian', value: 'bg' },
	{ name: 'Catalan', value: 'ca' },
	{ name: 'Cebuano', value: 'ceb' },
	{ name: 'Chichewa', value: 'ny' },
	{ name: 'Croatian', value: 'hr' },
	{ name: 'Czech', value: 'cs' },
	{ name: 'Danish', value: 'da' },
	{ name: 'Dutch', value: 'nl' },
	{ name: 'English', value: 'en' },
	{ name: 'Estonian', value: 'et' },
	{ name: 'Filipino', value: 'fil' },
	{ name: 'Finnish', value: 'fi' },
	{ name: 'French', value: 'fr' },
	{ name: 'Galician', value: 'gl' },
	{ name: 'Georgian', value: 'ka' },
	{ name: 'German', value: 'de' },
	{ name: 'Greek', value: 'el' },
	{ name: 'Gujarati', value: 'gu' },
	{ name: 'Hausa', value: 'ha' },
	{ name: 'Hebrew', value: 'he' },
	{ name: 'Hindi', value: 'hi' },
	{ name: 'Hungarian', value: 'hu' },
	{ name: 'Icelandic', value: 'is' },
	{ name: 'Indonesian', value: 'id' },
	{ name: 'Irish', value: 'ga' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Japanese', value: 'ja' },
	{ name: 'Javanese', value: 'jv' },
	{ name: 'Kannada', value: 'kn' },
	{ name: 'Kazakh', value: 'kk' },
	{ name: 'Kirghiz', value: 'ky' },
	{ name: 'Korean', value: 'ko' },
	{ name: 'Latvian', value: 'lv' },
	{ name: 'Lingala', value: 'ln' },
	{ name: 'Lithuanian', value: 'lt' },
	{ name: 'Luxembourgish', value: 'lb' },
	{ name: 'Macedonian', value: 'mk' },
	{ name: 'Malay', value: 'ms' },
	{ name: 'Malayalam', value: 'ml' },
	{ name: 'Mandarin Chinese', value: 'zh' },
	{ name: 'Marathi', value: 'mr' },
	{ name: 'Nepali', value: 'ne' },
	{ name: 'Norwegian', value: 'no' },
	{ name: 'Pashto', value: 'ps' },
	{ name: 'Persian', value: 'fa' },
	{ name: 'Polish', value: 'pl' },
	{ name: 'Portuguese', value: 'pt' },
	{ name: 'Punjabi', value: 'pa' },
	{ name: 'Romanian', value: 'ro' },
	{ name: 'Russian', value: 'ru' },
	{ name: 'Serbian', value: 'sr' },
	{ name: 'Sindhi', value: 'sd' },
	{ name: 'Slovak', value: 'sk' },
	{ name: 'Slovenian', value: 'sl' },
	{ name: 'Somali', value: 'so' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'Swahili', value: 'sw' },
	{ name: 'Swedish', value: 'sv' },
	{ name: 'Tamil', value: 'ta' },
	{ name: 'Telugu', value: 'te' },
	{ name: 'Thai', value: 'th' },
	{ name: 'Turkish', value: 'tr' },
	{ name: 'Ukrainian', value: 'uk' },
	{ name: 'Urdu', value: 'ur' },
	{ name: 'Vietnamese', value: 'vi' },
	{ name: 'Welsh', value: 'cy' },
];

export class ElevenLabs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs (Kie.ai)',
		name: 'elevenLabs',
		icon: 'file:elevenlabs-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate speech, sound effects, and dialogue using ElevenLabs API via Kie.ai',
		defaults: {
			name: 'ElevenLabs (Kie.ai)',
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
						name: 'Text-to-Speech',
						value: 'textToSpeech',
						description: 'Generate speech from text',
						action: 'Text to speech',
					},
					{
						name: 'Speech-to-Text',
						value: 'speechToText',
						description: 'Transcribe audio to text',
						action: 'Speech to text',
					},
					{
						name: 'Sound Effects',
						value: 'soundEffects',
						description: 'Generate sound effects from text',
						action: 'Sound effects',
					},
					{
						name: 'Audio Isolation',
						value: 'audioIsolation',
						description: 'Isolate voice from audio',
						action: 'Audio isolation',
					},
					{
						name: 'Text-to-Dialogue',
						value: 'textToDialogue',
						description: 'Generate dialogue from text',
						action: 'Text to dialogue',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get task status',
					},
				],
				default: 'textToSpeech',
				required: true,
			},
			// Text-to-Speech Parameters
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				default: '',
				description: 'The text to convert to speech',
			},
			{
				displayName: 'Voice Name or ID',
				name: 'voice',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				options: [
					{ name: 'Rachel', value: 'Rachel' },
					{ name: 'Aria', value: 'Aria' },
					{ name: 'Roger', value: 'Roger' },
					{ name: 'Sarah', value: 'Sarah' },
					{ name: 'Laura', value: 'Laura' },
					{ name: 'Charlie', value: 'Charlie' },
					{ name: 'George', value: 'George' },
					{ name: 'Callum', value: 'Callum' },
					{ name: 'River', value: 'River' },
					{ name: 'Liam', value: 'Liam' },
					{ name: 'Charlotte', value: 'Charlotte' },
					{ name: 'Alice', value: 'Alice' },
					{ name: 'Matilda', value: 'Matilda' },
					{ name: 'Will', value: 'Will' },
					{ name: 'Jessica', value: 'Jessica' },
					{ name: 'Eric', value: 'Eric' },
					{ name: 'Chris', value: 'Chris' },
					{ name: 'Brian', value: 'Brian' },
					{ name: 'Daniel', value: 'Daniel' },
					{ name: 'Lily', value: 'Lily' },
					{ name: 'Bill', value: 'Bill' },
				],
				default: 'Rachel',
				description: 'The voice to use for speech generation',
			},
			{
				displayName: 'Stability',
				name: 'stabilityTTS',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				default: 0.5,
				description: 'Voice stability (0-1)',
			},
			{
				displayName: 'Similarity Boost',
				name: 'similarityBoost',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				default: 0.75,
				description: 'Similarity boost (0-1)',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				default: 0,
				description: 'Style exaggeration (0-1)',
			},
			{
				displayName: 'Speed',
				name: 'speed',
				type: 'number',
				typeOptions: {
					minValue: 0.7,
					maxValue: 1.2,
					numberStepSize: 0.01,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				default: 1,
				description: 'Speech speed (0.7-1.2)',
			},
			{
				displayName: 'Language Code',
				name: 'languageCodeTTS',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				options: languageOptions,
				default: 'auto',
				description: 'Language code (ISO 639-1)',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				type: 'collection',
				placeholder: 'Add Parameter',
				default: {},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech'],
					},
				},
				options: [
					{
						displayName: 'Timestamps',
						name: 'timestamps',
						type: 'boolean',
						default: false,
						description: 'Whether to return timestamps for each word',
					},
					{
						displayName: 'Previous Text',
						name: 'previousText',
						type: 'string',
						typeOptions: { rows: 2 },
						default: '',
						description: 'The text that came before the current request',
					},
					{
						displayName: 'Next Text',
						name: 'nextText',
						type: 'string',
						typeOptions: { rows: 2 },
						default: '',
						description: 'The text that comes after the current request',
					},
				],
			},
			// Speech-to-Text Parameters
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['speechToText', 'audioIsolation'],
					},
				},
				default: '',
				description: 'The URL of the audio file',
				placeholder: 'https://example.com/audio.mp3',
			},
			{
				displayName: 'Model ID',
				name: 'modelIdSTT',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['speechToText'],
					},
				},
				options: [
					{ name: 'Scribble V1', value: 'scribble-v1' },
				],
				default: 'scribble-v1',
				description: 'The model to use for transcription',
			},
			{
				displayName: 'Language Code',
				name: 'languageCodeSTT',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['speechToText'],
					},
				},
				options: languageOptions,
				default: 'auto',
				description: 'Language code (ISO 639-1) of the audio',
			},
			{
				displayName: 'Tag Audio Events',
				name: 'tagAudioEvents',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['speechToText'],
					},
				},
				default: false,
				description: 'Detect and tag non-speech audio events in the transcription',
			},
			{
				displayName: 'Diarize',
				name: 'diarize',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['speechToText'],
					},
				},
				default: false,
				description: 'Whether to annotate who is speaking',
			},
			// Sound Effects Parameters
			{
				displayName: 'Description',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['soundEffects'],
					},
				},
				default: '',
				description: 'The text describing the sound effect to generate',
				placeholder: 'A dog barking in the distance',
			},
			{
				displayName: 'Duration (Seconds)',
				name: 'durationSeconds',
				type: 'number',
				typeOptions: {
					minValue: 0.5,
					maxValue: 22,
					numberStepSize: 0.1,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['soundEffects'],
					},
				},
				default: 10,
				description: 'Duration in seconds (0.5-22)',
			},
			{
				displayName: 'Prompt Influence',
				name: 'promptInfluence',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.01,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['soundEffects'],
					},
				},
				default: 0.3,
				description: 'How closely to follow the prompt (0-1)',
			},
			{
				displayName: 'Loop',
				name: 'loop',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['soundEffects'],
					},
				},
				default: false,
				description: 'Whether to create a sound effect that loops smoothly',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['soundEffects'],
					},
				},
				options: [
					{ name: 'MP3 44100Hz 128kbps', value: 'mp3_44100_128' },
					{ name: 'MP3 44100Hz 192kbps', value: 'mp3_44100_192' },
					{ name: 'PCM 44100Hz', value: 'pcm_44100' },
					{ name: 'PCM 24000Hz', value: 'pcm_24000' },
				],
				default: 'mp3_44100_128',
				description: 'Output format of the generated audio',
			},
			// Text-to-Dialogue Parameters
			{
				displayName: 'Stability',
				name: 'stability',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberStepSize: 0.1,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToDialogue'],
					},
				},
				default: 0.5,
				description: 'Voice stability and randomness (0-1)',
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToDialogue'],
					},
				},
				options: languageOptions,
				default: 'auto',
				description: 'Select the language code',
			},
			{
				displayName: 'Dialogue',
				name: 'dialogue',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToDialogue'],
					},
				},
				default: {},
				placeholder: 'Add Dialogue Line',
				options: [
					{
						name: 'dialogueItems',
						displayName: 'Dialogue Item',
						values: [
							{
								displayName: 'Voice Name',
								name: 'voice',
								type: 'options',
								options: [
									{ name: 'Adam', value: 'Adam' },
									{ name: 'Alice', value: 'Alice' },
									{ name: 'Bill', value: 'Bill' },
									{ name: 'Brian', value: 'Brian' },
									{ name: 'Callum', value: 'Callum' },
									{ name: 'Charlie', value: 'Charlie' },
									{ name: 'Chris', value: 'Chris' },
									{ name: 'Daniel', value: 'Daniel' },
									{ name: 'Eric', value: 'Eric' },
									{ name: 'George', value: 'George' },
									{ name: 'Harry', value: 'Harry' },
									{ name: 'Jessica', value: 'Jessica' },
									{ name: 'Laura', value: 'Laura' },
									{ name: 'Liam', value: 'Liam' },
									{ name: 'Lily', value: 'Lily' },
									{ name: 'Matilda', value: 'Matilda' },
									{ name: 'River', value: 'River' },
									{ name: 'Roger', value: 'Roger' },
									{ name: 'Sarah', value: 'Sarah' },
									{ name: 'Will', value: 'Will' },
								],
								default: 'Liam',
								description: 'Select the voice for this dialogue line',
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								typeOptions: { rows: 4 },
								default: '',
								description: 'Text to speak. Can include emotions like [excitedly] or pauses [two second pause].',
							},
						],
					},
				],
			},
			// Common: Callback URL for create operations
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech', 'speechToText', 'textToDialogue', 'soundEffects', 'audioIsolation'],
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
						operation: ['textToSpeech', 'speechToText', 'textToDialogue', 'soundEffects', 'audioIsolation'],
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
					if (operation === 'textToSpeech') {
						const text = this.getNodeParameter('text', i) as string;
						const voice = this.getNodeParameter('voice', i) as string;
						const stability = this.getNodeParameter('stabilityTTS', i) as number;
						const similarity_boost = this.getNodeParameter('similarityBoost', i) as number;
						const style = this.getNodeParameter('style', i) as number;
						const speed = this.getNodeParameter('speed', i) as number;
						const language_code = this.getNodeParameter('languageCodeTTS', i, '') as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;
						const additionalParameters = this.getNodeParameter('additionalParameters', i, {}) as IDataObject;

						const input: IDataObject = {
							text,
							voice,
							stability,
							similarity_boost,
							style,
							speed,
						};

						if (language_code && language_code !== 'auto') {
							input.language_code = language_code;
						}

						Object.assign(input, additionalParameters);

						const body: IDataObject = {
							model: 'elevenlabs/text-to-speech-turbo-2-5',
							input,
						};

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
					} else if (operation === 'speechToText') {
						const audioUrl = this.getNodeParameter('audioUrl', i) as string;
						const model_id = this.getNodeParameter('modelIdSTT', i) as string;
						const language_code = this.getNodeParameter('languageCodeSTT', i, '') as string;
						const tag_audio_events = this.getNodeParameter('tagAudioEvents', i) as boolean;
						const diarize = this.getNodeParameter('diarize', i) as boolean;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

						const input: IDataObject = {
							audio_url: audioUrl,
							model_id,
							tag_audio_events,
							diarize,
						};

						if (language_code && language_code !== 'auto') {
							input.language_code = language_code;
						}

						const body: IDataObject = {
							model: 'elevenlabs/speech-to-text',
							input,
						};

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
					} else if (operation === 'soundEffects') {
						const text = this.getNodeParameter('text', i) as string;
						const loop = this.getNodeParameter('loop', i) as boolean;
						const duration_seconds = this.getNodeParameter('durationSeconds', i) as number;
						const prompt_influence = this.getNodeParameter('promptInfluence', i) as number;
						const output_format = this.getNodeParameter('outputFormat', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

						const input: IDataObject = {
							text,
							loop,
							prompt_influence,
							output_format,
						};

						if (duration_seconds) {
							input.duration_seconds = duration_seconds;
						}

						const body: IDataObject = {
							model: 'elevenlabs/sound-effect-v2',
							input,
						};

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
					} else if (operation === 'audioIsolation') {
						const audio_url = this.getNodeParameter('audioUrl', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;

						const body: IDataObject = {
							model: 'elevenlabs/audio-isolation',
							input: { audio_url },
						};

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
					} else if (operation === 'textToDialogue') {
						const stability = this.getNodeParameter('stability', i) as number;
						const languageCode = this.getNodeParameter('languageCode', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const waitForCompletionFlag = this.getNodeParameter('waitForCompletion', i) as boolean;
						const dialogueItems = this.getNodeParameter('dialogue', i, {}) as IDataObject;

						const dialogue: IDataObject[] = [];
						if (dialogueItems.dialogueItems) {
							dialogue.push(...(dialogueItems.dialogueItems as IDataObject[]));
						}

						const body: IDataObject = {
							model: 'elevenlabs/text-to-dialogue-v3',
							input: {
								stability,
								language_code: languageCode,
								dialogue,
							},
						};

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
