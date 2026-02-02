import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

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
				default: 'Unlock powerful API with Kie.ai! Affordable, scalable APl integration, free trial playground, and secure, reliable performance.',
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
					{ name: 'Ellen (Serious, Direct and Confident)', value: 'BIvP0GN1cAtSRTxNHnWS' },
					{ name: 'Juniper (Grounded and Professional)', value: 'aMSt68OGf4xUZAnLpTU8' },
					{ name: 'Jane (Professional Audiobook Reader)', value: 'RILOU7YmBhvwJGDGjNmP' },
					{ name: 'James (Husky, Engaging and Bold)', value: 'EkK5I93UQWFDigLMpZcX' },
					{ name: 'Arabella (Mysterious and Emotive)', value: 'Z3R5wn05IrDiVCyEkUrK' },
					{ name: 'Hope (Upbeat and Clear)', value: 'tnSpp4vdxKPjI9w0GnoV' },
					{ name: 'Bradford (Expressive and Articulate)', value: 'NNl6r8mD7vthiJatiJt1' },
					{ name: 'Xavier (Dominating, Metalic Announcer)', value: 'YOq2y2Up4RgXP2HyXjE5' },
					{ name: 'Austin (Deep, Raspy and Authentic)', value: 'Bj9UqZbhQsanLzgalpEG' },
					{ name: 'Jarnathan (Confident and Versatile)', value: 'c6SfcYrb2t09NHXiT80T' },
					{ name: 'Kuon (Cheerful, Clear and Steady)', value: 'B8gJV1IhpuegLxdpXFOE' },
					{ name: 'Blondie (Conversational)', value: 'exsUS4vynmxd379XN4yO' },
					{ name: 'Priyanka (Calm, Neutral and Relaxed)', value: 'BpjGufoPiobT79j2vtj4' },
					{ name: 'Monika Sogam (Deep and Natural)', value: '2zRM7PkgwBPiau2jvVXc' },
					{ name: 'Mark (Casual, Relaxed and Light)', value: '1SM7GgM6IMuvQlz2BwM3' },
					{ name: 'Grimblewood Thornwhisker (Snarky Gnome & Magical Maintainer)', value: 'ouL9IsyrSnUkCmfnD02u' },
					{ name: 'Adeline (Feminine and Conversational)', value: '5l5f8iK3YPeGga21rQIX' },
					{ name: 'Sam (Support Agent)', value: 'scOwDtmlUjD3prqpp97I' },
					{ name: 'Spuds Oxley (Wise and Approachable)', value: 'NOpBlnGInO9m6vDvFkFC' },
					{ name: 'Eve (Authentic, Energetic and Happy)', value: 'BZgkqPqms7Kj9ulSkVzn' },
					{ name: 'Northern Terry', value: 'wo6udizrrtpIxWGp2qJk' },
					{ name: 'Dr. Von (Quirky, Mad Scientist)', value: 'yjJ45q8TVCrtMhEKurxY' },
					{ name: 'British Football Announcer', value: 'gU0LNdkMOQCOrPrwtbee' },
					{ name: 'Brock (Commanding and Loud Sergeant)', value: 'DGzg6RaUqxGRTHSBjfgF' },
					{ name: 'Célian (Documentary Narrator)', value: 'DGTOOUoGpoP6UZ9uSWfA' },
					{ name: 'Nathan (Virtual Radio Host)', value: 'x70vRnQBMBu4FAYhjJbO' },
					{ name: 'Viraj (Rich and Soft)', value: 'P1bg08DkjqiVEzOn76yG' },
					{ name: 'Taksh (Calm, Serious and Smooth)', value: 'qDuRKMlYmrm8trt5QyBn' },
					{ name: 'Guadeloupe Merryweather (Emotional)', value: 'kUUTqKQ05NMGulF08DDf' },
					{ name: 'Horatius (Energetic Character Voice)', value: 'qXpMhyvQqiRxWQs4qSSB' },
					{ name: 'Liam (Energetic, Social Media Creator)', value: 'TX3LPaxmHKxFdv7VOQHJ' },
					{ name: 'Chris (Charming, Down-to-Earth)', value: 'iP95p4xoKVk53GoZ742B' },
					{ name: 'Harry (Fierce Warrior)', value: 'SOYHLrjzK2X1ezoPC6cr' },
					{ name: 'Callum (Husky Trickster)', value: 'N2lVS1w4EtoT3dr4eOWO' },
					{ name: 'Laura (Enthusiast, Quirky Attitude)', value: 'FGY2WhTYpPnrIDTdsKH5' },
					{ name: 'Charlotte', value: 'XB0fDUnXU5powFXDhCwa' },
					{ name: 'Jessica (Playful, Bright, Warm)', value: 'cgSgspJ2msm6clMCkdW9' },
					{ name: 'Heather Rey (Rushed and Friendly)', value: 'MnUw1cSnpiLoLhpd3Hqp' },
					{ name: 'Brittney (Social Media Voice - Fun, Youthful & Informative)', value: 'kPzsL2i3teMYv0FxEYQ6' },
					{ name: 'Mark (Natural Conversations)', value: 'UgBBYS2sOqTuMpoF3BR0' },
					{ name: 'Matthew (Casual, Friendly and Smooth)', value: 'IjnA9kwZJHJ20Fp7Vmy6' },
					{ name: 'Pro Narrator (Convincing story teller)', value: 'KoQQbl9zjAdLgKZjm8Ol' },
					{ name: 'Bella (Professional, Bright, Warm)', value: 'hpp4J3VqNfWAUOO0d1Us' },
					{ name: 'Adam (Dominant, Firm)', value: 'pNInz6obpgDQGcFmaJgB' },
					{ name: 'Brian (Deep, Resonant and Comforting)', value: 'nPczCjzI2devNBz1zQrb' },
					{ name: 'Archer', value: 'L0Dsvb3SLTyegXwtm47J' },
					{ name: 'Hope (Bubbly, Gossipy and Girly)', value: 'uYXf8XasLslADfZ2MB4u' },
					{ name: 'Jeff (Classy, Resonating and Strong)', value: 'gs0tAILXbY5DNrJrsM6F' },
					{ name: 'Jamahal (Young, Vibrant, and Natural)', value: 'DTKMou8ccj1ZaWGBiotd' },
					{ name: 'Finn (Youthful, Eager and Energetic)', value: 'vBKc2FfBKJfcZNyEt1n6' },
					{ name: 'Smith (Mellow, Spontaneous, and Bassy)', value: 'TmNe0cCqkZBMwPWOd3RD' },
					{ name: 'Tom (Conversations & Books)', value: 'DYkrAHD8iwork3YSUBbs' },
					{ name: 'Cassidy (Crisp, Direct and Clear)', value: '56AoDkrOh6qfVPDXZ7Pt' },
					{ name: 'Addison 2.0 (Australian Audiobook & Podcast)', value: 'eR40ATw9ArzDf9h3v7t7' },
					{ name: 'Jessica Anne Bogart (Chatty and Friendly)', value: 'g6xIsTj2HwM6VR4iXFCw' },
					{ name: 'Lucy (Fresh & Casual)', value: 'lcMyyd2HUfFzxdCaC4Ta' },
					{ name: 'Tiffany (Natural and Welcoming)', value: '6aDn1KB0hjpdcocrUkmq' },
					{ name: 'Felix (Warm, positive & contemporary RP)', value: 'Sq93GQT4X1lKDXsQcixO' },
					{ name: 'Malyx (Echoey, Menacing and Deep Demon)', value: 'piI8Kku0DcvcL6TTSeQt' },
					{ name: 'Flicker (Cheerful Fairy & Sparkly Sweetness)', value: 'KTPVrSVAEUSJRClDzBw7' },
					{ name: 'Bob (Rugged and Warm Cowboy)', value: 'flHkNRp1BlvT73UL6gyz' },
					{ name: 'Jessica Anne Bogart (Eloquent Villain)', value: '9yzdeviXkFddZ4Oz8Mok' },
					{ name: 'Lutz (Chuckling, Giggly and Cheerful)', value: 'pPdl9cQBQq4p6mRkZy2Z' },
					{ name: 'Emma (Adorable and Upbeat)', value: '0SpgpJ4D3MpHCiWdyTg3' },
					{ name: 'Matthew Schmitz (Elitist, Arrogant, Conniving Tyrant)', value: 'UFO0Yv86wqRxAt1DmXUu' },
					{ name: 'Sarcastic and Sultry Villain', value: 'oR4uRy4fHDUGGISL0Rev' },
					{ name: 'Myrrdin (Wise and Magical Narrator)', value: 'zYcjlYFOd3taleS0gkk3' },
					{ name: 'Edward (Loud, Confident and Cocky)', value: 'nzeAacJi50IvxcyDnMXa' },
					{ name: 'Marshal (Friendly, Funny Professor)', value: 'ruirxsoakN0GWmGNIo04' },
					{ name: 'John Morgan (Gritty, Rugged Cowboy)', value: '1KFdM0QCwQn4rmn5nn9C' },
					{ name: 'Parasyte (Whispers from the Deep Dark)', value: 'TC0Zp7WVFzhA8zpTlRqV' },
					{ name: 'Aria (Sultry Villain)', value: 'ljo9gAlSqKOvF6D8sOsX' },
					{ name: 'Viking Bjorn (Epic Medieval Raider)', value: 'PPzYpIqttlTYA83688JI' },
					{ name: 'Pirate Marshal', value: 'ZF6FPAbjXT4488VcRRnw' },
					{ name: 'Amelia (Enthusiastic and Expressive)', value: '8JVbfL6oEdmuxKn5DK2C' },
					{ name: 'Johnny Kid (Serious and Calm Narrator)', value: 'iCrDUkL56s3C8sCRl7wb' },
					{ name: 'Hope (Poetic, Romantic and Captivating)', value: '1hlpeD1ydbI2ow0Tt3EW' },
					{ name: 'Olivia (Smooth, Warm and Engaging)', value: 'wJqPPQ618aTW29mptyoc' },
					{ name: 'Ana Rita (Smooth, Expressive and Bright)', value: 'EiNlNiXeDU1pqqOPrYMO' },
					{ name: 'John Doe (Deep)', value: 'FUfBrNit0NNZAwb58KWH' },
					{ name: 'Angela (Conversational and Friendly)', value: '4YYIPFl9wE5c4L2eu2Gb' },
					{ name: 'Burt Reynolds™ (Deep, Smooth and clear)', value: 'OYWwCdDHouzDwiZJWOOu' },
					{ name: 'David (Gruff Cowboy)', value: '6F5Zhi321D3Oq7v1oNT4' },
					{ name: 'Hank (Deep and Engaging Narrator)', value: 'qNkzaJoHLLdpvgh5tISm' },
					{ name: 'Carter (Rich, Smooth and Rugged)', value: 'YXpFCvM1S3JbWEJhoskW' },
					{ name: 'Wyatt (Wise Rustic Cowboy)', value: '9PVP7ENhDskL0KYHAKtD' },
					{ name: 'Jerry B. (Southern/Cowboy)', value: 'LG95yZDEHg6fCZdQjLqj' },
					{ name: 'Phil (Passionate Announcer)', value: 'CeNX9CMwmxDxUF5Q2Inm' },
					{ name: 'Johnny Dynamite (Vintage Radio DJ)', value: 'st7NwhTPEzqo2riw7qWC' },
					{ name: 'Blondie (Radio Host)', value: 'aD6riP1btT197c6dACmy' },
					{ name: 'Rachel M (Pro British Radio Presenter)', value: 'FF7KdobWPaiR0vkcALHF' },
					{ name: 'David (Movie Trailer Narrator)', value: 'mtrellq69YZsNwzUSyXh' },
					{ name: 'Rex Thunder (Deep N Tough)', value: 'dHd5gvgSOzSfduK4CvEg' },
					{ name: 'Ed (Late Night Announcer)', value: 'cTNP6ZM2mLTKj2BFhxEh' },
					{ name: 'Paul French (Podcaster)', value: 'eVItLK1UvXctxuaRV2Oq' },
					{ name: 'Jean (Femme Fatale)', value: 'U1Vk2oyatMdYs096Ety7' },
					{ name: 'Michael (Deep, Dark and Urban)', value: 'esy0r39YPLQjOczyOib8' },
					{ name: 'Britney (Calm and Calculative Villain)', value: 'bwCXcoVxWNYMlC6Esa8u' },
					{ name: 'Matthew Schmitz (Gravel, Deep Anti-Hero)', value: 'D2jw4N9m4xePLTQ3IHjU' },
					{ name: 'Ian (Strange and Distorted Alien)', value: 'Tsns2HvNFKfGiNjllgqo' },
					{ name: 'Sven (Emotional and Nice)', value: 'Atp5cNFg1Wj5gyKD7HWV' },
					{ name: 'Natasha (Gentle Meditation)', value: '1cxc5c3E9K6F1wlqOJGV' },
					{ name: 'Emily (Gentle, Soft and Meditative)', value: '1U02n4nD6AdIZ9CjF053' },
					{ name: 'Viraj (Smooth and Gentle)', value: 'HgyIHe81F3nXywNwkraY' },
					{ name: 'Nate (Sultry, Whispery and Seductive)', value: 'AeRdCCKzvd23BpJoofzx' },
					{ name: 'Nathaniel (Engaging, British and Calm)', value: 'LruHrtVF6PSyGItzMNHS' },
					{ name: 'Benjamin (Deep, Warm, Calming)', value: 'Qggl4b0xRMiqOwhPtVWT' },
					{ name: 'Clara (Relaxing, Calm and Soothing)', value: 'zA6D7RyKdc2EClouEMkP' },
					{ name: 'AImee (Tranquil ASMR and Meditation)', value: '1wGbFxmAM3Fgw63G1zZJ' },
					{ name: 'Allison (Calm, Soothing and Meditative)', value: 'hqfrgApggtO1785R4Fsn' },
					{ name: 'Theodore HQ (Serene and Grounded)', value: 'sH0WdfE5fsKuM2otdQZr' },
					{ name: 'Koraly (Soft-spoken and Gentle)', value: 'MJ0RnG71ty4LH3dvNfSd' },
					{ name: 'Leon (Soothing and Grounded)', value: 'pNInz6obpgDQGcFmaJgB' },
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
				description: 'Voice stability (0-1). Default: 0.5.',
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
				description: 'Similarity boost (0-1). Default: 0.75.',
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
				description: 'Style exaggeration (0-1). Default: 0.',
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
				description: 'Speech speed (0.7-1.2). Default: 1.',
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
				description: 'Language code (ISO 639-1) to enforce a language',
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
						typeOptions: {
							rows: 2,
						},
						default: '',
						description: 'The text that came before the text of the current request',
					},
					{
						displayName: 'Next Text',
						name: 'nextText',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						default: '',
						description: 'The text that comes after the text of the current request',
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
				description: 'The ID of the model to use for transcription',
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
				description: 'Detect and tag non-speech audio events like laughter, applause, music, or silence in the transcription',
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
				description: 'Duration in seconds (0.5-22). If not set, optimal duration will be determined from prompt.',
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
				description: 'How closely to follow the prompt (0-1). Higher values mean less variation.',
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
								typeOptions: {
									rows: 4,
								},
								default: '',
								description: 'Text to speak. Can include emotions like [excitedly] or pauses [two second pause].',
							},
						],
					},
				],
			},
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
				displayName: 'Инструкции по настройке и примеры использования в телеграм канале <a href="https://t.me/myspacet_ai" target="_blank">https://t.me/myspacet_ai</a>',
				name: 'telegramNotice',
				type: 'notice',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['textToSpeech', 'speechToText', 'textToDialogue', 'soundEffects', 'audioIsolation'],
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
					if (operation === 'textToSpeech') {
						const text = this.getNodeParameter('text', i) as string;
						const voice = this.getNodeParameter('voice', i) as string;
						const stability = this.getNodeParameter('stabilityTTS', i) as number;
						const similarity_boost = this.getNodeParameter('similarityBoost', i) as number;
						const style = this.getNodeParameter('style', i) as number;
						const speed = this.getNodeParameter('speed', i) as number;
						const language_code = this.getNodeParameter('languageCodeTTS', i, '') as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
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
					} else if (operation === 'speechToText') {
						const audioUrl = this.getNodeParameter('audioUrl', i) as string;
						const model_id = this.getNodeParameter('modelIdSTT', i) as string;
						const language_code = this.getNodeParameter('languageCodeSTT', i, '') as string;
						const tag_audio_events = this.getNodeParameter('tagAudioEvents', i) as boolean;
						const diarize = this.getNodeParameter('diarize', i) as boolean;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

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
							model: 'elevenlabs/speech-to-text-v1',
							input,
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
					} else if (operation === 'soundEffects') {
						const text = this.getNodeParameter('text', i) as string;
						const loop = this.getNodeParameter('loop', i) as boolean;
						const duration_seconds = this.getNodeParameter('durationSeconds', i) as number;
						const prompt_influence = this.getNodeParameter('promptInfluence', i) as number;
						const output_format = this.getNodeParameter('outputFormat', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

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
					} else if (operation === 'audioIsolation') {
						const audio_url = this.getNodeParameter('audioUrl', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;

						const body: IDataObject = {
							model: 'elevenlabs/audio-isolation',
							input: {
								audio_url,
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
					} else if (operation === 'textToDialogue') {
						const stability = this.getNodeParameter('stability', i) as number;
						const languageCode = this.getNodeParameter('languageCode', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const dialogueItems = this.getNodeParameter('dialogue', i, {}) as IDataObject;

						const dialogue = [];
						if (dialogueItems.dialogueItems) {
							// @ts-ignore
							dialogue.push(...dialogueItems.dialogueItems);
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