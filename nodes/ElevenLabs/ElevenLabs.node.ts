import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class ElevenLabs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs (Kie.ai)',
		name: 'elevenLabs',
		icon: 'file:elevenlabs-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate speech, sound effects, and dialogue using ElevenLabs via Kie.ai API',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Text-to-Speech', value: 'textToSpeech', action: 'Text to speech' },
					{ name: 'Speech-to-Text', value: 'speechToText', action: 'Speech to text' },
					{ name: 'Sound Effects', value: 'soundEffects', action: 'Sound effects' },
					{ name: 'Audio Isolation', value: 'audioIsolation', action: 'Audio isolation' },
					{ name: 'Text-to-Dialogue', value: 'textToDialogue', action: 'Text to dialogue' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'textToSpeech',
				required: true,
			},
			{
				displayName: 'Model',
				name: 'ttsModel',
				type: 'options',
				displayOptions: { show: { operation: ['textToSpeech'] } },
				options: [
					{ name: 'Turbo 2.5', value: 'elevenlabs/text-to-speech-turbo-2-5' },
					{ name: 'Multilingual v2', value: 'elevenlabs/text-to-speech-multilingual-v2' },
				],
				default: 'elevenlabs/text-to-speech-turbo-2-5',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['textToSpeech'] } },
				default: '',
			},
			{
				displayName: 'Voice',
				name: 'voice',
				type: 'options',
				displayOptions: { show: { operation: ['textToSpeech'] } },
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
			},
			{
				displayName: 'Stability',
				name: 'stability',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['textToSpeech', 'textToDialogue'] } },
				default: 0.5,
			},
			{
				displayName: 'Similarity Boost',
				name: 'similarityBoost',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['textToSpeech'] } },
				default: 0.75,
			},
			{
				displayName: 'Style Exaggeration',
				name: 'styleExaggeration',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.01 },
				displayOptions: { show: { operation: ['textToSpeech'] } },
				default: 0,
				description: 'Style exaggeration level (0-1). Higher values may increase latency.',
			},
			{
				displayName: 'Speaker Boost',
				name: 'speakerBoost',
				type: 'boolean',
				displayOptions: { show: { operation: ['textToSpeech'] } },
				default: false,
				description: 'Whether to boost clarity and target speaker similarity',
			},
			{
				displayName: 'Language Code',
				name: 'ttsLanguageCode',
				type: 'options',
				displayOptions: { show: { operation: ['textToSpeech'] } },
				options: [
					{ name: 'Auto', value: '' },
					{ name: 'English', value: 'en' },
					{ name: 'Spanish', value: 'es' },
					{ name: 'French', value: 'fr' },
					{ name: 'German', value: 'de' },
					{ name: 'Italian', value: 'it' },
					{ name: 'Portuguese', value: 'pt' },
					{ name: 'Polish', value: 'pl' },
					{ name: 'Hindi', value: 'hi' },
					{ name: 'Japanese', value: 'ja' },
					{ name: 'Korean', value: 'ko' },
					{ name: 'Chinese (Mandarin)', value: 'zh' },
					{ name: 'Arabic', value: 'ar' },
					{ name: 'Russian', value: 'ru' },
					{ name: 'Dutch', value: 'nl' },
					{ name: 'Swedish', value: 'sv' },
					{ name: 'Turkish', value: 'tr' },
				],
				default: '',
				description: 'Language for TTS. Leave blank for auto-detection.',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['speechToText', 'audioIsolation'] } },
				default: '',
			},
			{
				displayName: 'Description',
				name: 'sfxText',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['soundEffects'] } },
				default: '',
				description: 'Text describing the sound effect',
			},
			{
				displayName: 'Duration (Seconds)',
				name: 'durationSeconds',
				type: 'number',
				typeOptions: { minValue: 0.5, maxValue: 22, numberStepSize: 0.1 },
				displayOptions: { show: { operation: ['soundEffects'] } },
				default: 10,
			},
			{
				displayName: 'Model',
				name: 'modelDialogue',
				type: 'options',
				displayOptions: { show: { operation: ['textToDialogue'] } },
				options: [
					{ name: 'ElevenLabs V3', value: 'elevenlabs/text-to-dialogue-v3' },
				],
				default: 'elevenlabs/text-to-dialogue-v3',
				description: 'The ElevenLabs dialogue model to use',
			},
			{
				displayName: 'Language',
				name: 'languageCode',
				type: 'options',
				displayOptions: { show: { operation: ['textToDialogue'] } },
				options: [
					{ name: 'Auto', value: 'auto' },
					{ name: 'Afrikaans', value: 'af' },
					{ name: 'Arabic', value: 'ar' },
					{ name: 'Armenian', value: 'hy' },
					{ name: 'Bengali', value: 'bn' },
					{ name: 'Bulgarian', value: 'bg' },
					{ name: 'Catalan', value: 'ca' },
					{ name: 'Croatian', value: 'hr' },
					{ name: 'Czech', value: 'cs' },
					{ name: 'Danish', value: 'da' },
					{ name: 'Dutch', value: 'nl' },
					{ name: 'English', value: 'en' },
					{ name: 'Finnish', value: 'fi' },
					{ name: 'French', value: 'fr' },
					{ name: 'German', value: 'de' },
					{ name: 'Greek', value: 'el' },
					{ name: 'Hebrew', value: 'he' },
					{ name: 'Hindi', value: 'hi' },
					{ name: 'Hungarian', value: 'hu' },
					{ name: 'Indonesian', value: 'id' },
					{ name: 'Italian', value: 'it' },
					{ name: 'Japanese', value: 'ja' },
					{ name: 'Korean', value: 'ko' },
					{ name: 'Malay', value: 'ms' },
					{ name: 'Mandarin Chinese', value: 'zh' },
					{ name: 'Norwegian', value: 'no' },
					{ name: 'Persian', value: 'fa' },
					{ name: 'Polish', value: 'pl' },
					{ name: 'Portuguese', value: 'pt' },
					{ name: 'Romanian', value: 'ro' },
					{ name: 'Russian', value: 'ru' },
					{ name: 'Serbian', value: 'sr' },
					{ name: 'Slovak', value: 'sk' },
					{ name: 'Spanish', value: 'es' },
					{ name: 'Swedish', value: 'sv' },
					{ name: 'Tamil', value: 'ta' },
					{ name: 'Thai', value: 'th' },
					{ name: 'Turkish', value: 'tr' },
					{ name: 'Ukrainian', value: 'uk' },
					{ name: 'Urdu', value: 'ur' },
					{ name: 'Vietnamese', value: 'vi' },
				],
				default: 'auto',
				description: 'Language for dialogue generation. Auto-detects if not specified.',
			},
			{
				displayName: 'Dialogue',
				name: 'dialogue',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['textToDialogue'] } },
				default: {},
				placeholder: 'Add Dialogue Line',
				options: [
					{
						name: 'dialogueItems',
						displayName: 'Dialogue Item',
						values: [
							{
								displayName: 'Voice',
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
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								typeOptions: { rows: 4 },
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: { show: { operation: ['textToSpeech', 'speechToText', 'soundEffects', 'audioIsolation', 'textToDialogue'] } },
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: { show: { operation: ['textToSpeech', 'speechToText', 'soundEffects', 'audioIsolation', 'textToDialogue'] } },
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: { show: { operation: ['textToSpeech', 'speechToText', 'soundEffects', 'audioIsolation', 'textToDialogue'] } },
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
					let model = '';
					const input: IDataObject = {};

					if (operation === 'textToSpeech') {
						model = this.getNodeParameter('ttsModel', i) as string;
						input.text = this.getNodeParameter('text', i) as string;
						input.voice = this.getNodeParameter('voice', i) as string;
						input.stability = this.getNodeParameter('stability', i) as number;
						input.similarity_boost = this.getNodeParameter('similarityBoost', i) as number;
						const styleExaggeration = this.getNodeParameter('styleExaggeration', i, 0) as number;
						if (styleExaggeration) input.style = styleExaggeration;
						const speakerBoost = this.getNodeParameter('speakerBoost', i, false) as boolean;
						if (speakerBoost) input.use_speaker_boost = true;
						const ttsLanguageCode = this.getNodeParameter('ttsLanguageCode', i, '') as string;
						if (ttsLanguageCode) input.language_code = ttsLanguageCode;
					} else if (operation === 'speechToText') {
						model = 'elevenlabs/speech-to-text';
						input.audio_url = this.getNodeParameter('audioUrl', i) as string;
					} else if (operation === 'soundEffects') {
						model = 'elevenlabs/sound-effect-v2';
						input.text = this.getNodeParameter('sfxText', i) as string;
						input.duration_seconds = this.getNodeParameter('durationSeconds', i) as number;
					} else if (operation === 'audioIsolation') {
						model = 'elevenlabs/audio-isolation';
						input.audio_url = this.getNodeParameter('audioUrl', i) as string;
					} else if (operation === 'textToDialogue') {
						model = this.getNodeParameter('modelDialogue', i) as string;
						const languageCode = this.getNodeParameter('languageCode', i, 'auto') as string;
						input.stability = this.getNodeParameter('stability', i) as number;
						input.language_code = languageCode;
						const dialogueItems = this.getNodeParameter('dialogue', i, {}) as IDataObject;
						const dialogue: IDataObject[] = [];
						if (dialogueItems.dialogueItems) {
							dialogue.push(...(dialogueItems.dialogueItems as IDataObject[]));
						}
						input.dialogue = dialogue;
					}

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
