import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, waitForTask } from '../GenericFunctions';

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
					{ name: 'Turbo 2.5', value: 'elevenlabs/text-to-speech-turbo-2.5' },
					{ name: 'Multilingual v2', value: 'elevenlabs/text-to-speech-multilingual-v2' },
				],
				default: 'elevenlabs/text-to-speech-turbo-2.5',
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
					returnData.push(await kieRequest(this, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId }));
				} else {
					let model = '';
					const input: IDataObject = {};

					if (operation === 'textToSpeech') {
						model = this.getNodeParameter('ttsModel', i) as string;
						input.text = this.getNodeParameter('text', i) as string;
						input.voice = this.getNodeParameter('voice', i) as string;
						input.stability = this.getNodeParameter('stability', i) as number;
						input.similarity_boost = this.getNodeParameter('similarityBoost', i) as number;
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
						model = 'elevenlabs/text-to-dialogue-v3';
						input.stability = this.getNodeParameter('stability', i) as number;
						const dialogueItems = this.getNodeParameter('dialogue', i, {}) as IDataObject;
						const dialogue: IDataObject[] = [];
						if (dialogueItems.dialogueItems) {
							dialogue.push(...(dialogueItems.dialogueItems as IDataObject[]));
						}
						input.dialogue = dialogue;
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
