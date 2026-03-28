import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.kie.ai';

interface GeminiMessage {
	role: string;
	content: Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

async function geminiChatRequest(
	context: IExecuteFunctions,
	model: string,
	messages: GeminiMessage[],
	stream: boolean,
	includeThoughts: boolean,
	googleSearch: boolean,
	systemPrompt?: string,
): Promise<IDataObject> {
	const credentials = await context.getCredentials('kieApi');
	const apiKey = credentials.apiKey as string;

	const allMessages: GeminiMessage[] = [];
	if (systemPrompt) {
		allMessages.push({ role: 'developer', content: [{ type: 'text', text: systemPrompt }] });
	}
	allMessages.push(...messages);

	const body: IDataObject = {
		messages: allMessages,
		stream: false, // Always non-streaming for n8n
		include_thoughts: includeThoughts,
	};

	if (googleSearch) {
		body.tools = [{ type: 'function', function: { name: 'googleSearch' } }];
	}

	// Determine endpoint path based on model
	const endpointMap: Record<string, string> = {
		'gemini-2.5-flash': '/gemini-2.5-flash/v1/chat/completions',
		'gemini-2.5-pro': '/gemini-2.5-pro/v1/chat/completions',
		'gemini-3-pro': '/gemini-3-pro/v1/chat/completions',
		'gemini-3.1-pro': '/gemini-3.1-pro/v1/chat/completions',
	};

	const endpoint = endpointMap[model] || `/gemini-2.5-flash/v1/chat/completions`;

	const response = await context.helpers.httpRequest({
		method: 'POST',
		url: `${BASE_URL}${endpoint}`,
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
		returnFullResponse: false,
		json: true,
	}) as IDataObject;

	return response;
}

export class Gemini implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Gemini (Kie.ai)',
		name: 'geminiKie',
		icon: 'file:gemini.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Chat with Gemini models (2.5 Flash, 2.5 Pro, 3 Pro, 3.1 Pro) via Kie.ai API',
		defaults: {
			name: 'Gemini (Kie.ai)',
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
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{ name: 'Gemini 3.1 Pro (Latest)', value: 'gemini-3.1-pro' },
					{ name: 'Gemini 3 Pro', value: 'gemini-3-pro' },
					{ name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
					{ name: 'Gemini 2.5 Flash (Fast)', value: 'gemini-2.5-flash' },
				],
				default: 'gemini-2.5-flash',
				description: 'Gemini model to use for chat completions',
				required: true,
			},
			{
				displayName: 'User Message',
				name: 'userMessage',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				description: 'The user message to send to Gemini',
			},
			{
				displayName: 'System Prompt',
				name: 'systemPrompt',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Optional system/developer instructions to guide the model behavior',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				description: 'Optional image URL to include in the user message (multimodal input)',
			},
			{
				displayName: 'Enable Google Search',
				name: 'googleSearch',
				type: 'boolean',
				default: false,
				description: 'Whether to enable Google Search grounding for real-time information (cannot be used with custom tools)',
			},
			{
				displayName: 'Include Thoughts',
				name: 'includeThoughts',
				type: 'boolean',
				default: false,
				description: 'Whether to include the model\'s reasoning/thoughts in the response (Flash/2.5 Pro)',
			},
			{
				displayName: 'Chat History',
				name: 'chatHistory',
				type: 'json',
				default: '[]',
				description: 'Optional array of previous messages to continue a conversation. Format: [{"role":"user","content":[{"type":"text","text":"..."}]},{"role":"assistant","content":[{"type":"text","text":"..."}]}]',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const model = this.getNodeParameter('model', i) as string;
				const userMessage = this.getNodeParameter('userMessage', i) as string;
				const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
				const imageUrl = this.getNodeParameter('imageUrl', i, '') as string;
				const googleSearch = this.getNodeParameter('googleSearch', i, false) as boolean;
				const includeThoughts = this.getNodeParameter('includeThoughts', i, false) as boolean;
				const chatHistoryRaw = this.getNodeParameter('chatHistory', i, '[]') as string | IDataObject[];

				// Parse chat history
				let chatHistory: GeminiMessage[] = [];
				if (typeof chatHistoryRaw === 'string') {
					try {
						chatHistory = JSON.parse(chatHistoryRaw) as GeminiMessage[];
					} catch (_) {
						chatHistory = [];
					}
				} else if (Array.isArray(chatHistoryRaw)) {
					chatHistory = chatHistoryRaw as unknown as GeminiMessage[];
				}

				// Build current user message content
				const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
					{ type: 'text', text: userMessage },
				];
				if (imageUrl) {
					userContent.push({ type: 'image_url', image_url: { url: imageUrl } });
				}

				const messages: GeminiMessage[] = [
					...chatHistory,
					{ role: 'user', content: userContent },
				];

				const response = await geminiChatRequest(
					this,
					model,
					messages,
					false,
					includeThoughts,
					googleSearch,
					systemPrompt || undefined,
				);

				// Extract the reply from the response
				const choices = response.choices as IDataObject[] | undefined;
				const assistantMessage = choices?.[0]?.message as IDataObject | undefined;
				const content = assistantMessage?.content as string | undefined;

				returnData.push({
					...response,
					model,
					reply: content || '',
					// Surface updated chat history for chaining
					updatedHistory: [
						...messages,
						...(content ? [{ role: 'assistant', content: [{ type: 'text', text: content }] }] : []),
					],
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error instanceof Error ? error.message : String(error) });
					continue;
				}
				if (error instanceof NodeApiError) throw error;
				throw new NodeApiError(this.getNode(), {} as import('n8n-workflow').JsonObject, {
					message: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
