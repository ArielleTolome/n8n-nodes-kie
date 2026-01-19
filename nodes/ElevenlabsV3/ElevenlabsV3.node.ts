import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class ElevenlabsV3 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs Text-to-Dialogue V3 (Kie.ai)',
		name: 'elevenlabsV3',
		icon: 'file:elevenlabs-bubble.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate dialogue using ElevenLabs Text-to-Dialogue V3 API',
		defaults: {
			name: 'ElevenLabs Text-to-Dialogue V3 (Kie.ai)',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'kieAiApi',
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
						name: 'Text-to-Dialogue',
						value: 'textToDialogue',
						description: 'Generate dialogue from text',
						action: 'Text-to-Dialogue',
					},
					{
						name: 'Query Task Status',
						value: 'queryTaskStatus',
						description: 'Check the status of a generation task',
						action: 'Get Task Status',
					},
				],
				default: 'textToDialogue',
				required: true,
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
				description: 'Determines how stable the voice is and the randomness between each generation. Range: 0 - 1.',
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
				options: [
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
				],
				default: 'auto',
				description: 'Select the language code',
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToDialogue'],
					},
				},
				default: '',
				description: 'Optional callback URL for task completion notifications',
				placeholder: 'https://your-domain.com/api/callback',
			},
			{
				displayName: 'Инструкции по настройке и примеры использования в телеграм канале <a href="https://t.me/myspacet_ai" target="_blank">https://t.me/myspacet_ai</a>',
				name: 'telegramNotice',
				type: 'notice',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToDialogue'],
					},
				},
				default: '',
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
				placeholder: '281e5b0*********************f39b9',
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
					if (operation === 'textToDialogue') {
						const stability = this.getNodeParameter('stability', i) as number;
						const languageCode = this.getNodeParameter('languageCode', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						const body: IDataObject = {
							model: 'elevenlabs/text-to-dialogue-v3',
							input: {
								stability,
								language_code: languageCode,
							},
						};

						if (callbackUrl && callbackUrl.trim() !== '') {
							body.callBackUrl = callbackUrl;
						}

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'kieAiApi',
							{
								method: 'POST',
								url: 'https://api.kie.ai/api/v1/jobs/createTask',
								headers: {
									'Content-Type': 'application/json',
								},
								body,
								json: true,
							},
						);

						returnData.push(response);
					} else if (operation === 'queryTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;

						const response = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'kieAiApi',
							{
								method: 'GET',
								url: `https://api.kie.ai/api/v1/jobs/recordInfo`,
								qs: {
									taskId,
								},
								json: true,
							},
						);

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
