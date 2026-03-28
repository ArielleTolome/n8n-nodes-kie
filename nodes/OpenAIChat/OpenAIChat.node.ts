import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.kie.ai';

interface ChatMessage {
	role: string;
	content: Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

async function openaiChatRequest(
	context: IExecuteFunctions,
	model: string,
	messages: ChatMessage[],
	systemPrompt?: string,
): Promise<IDataObject> {
	const credentials = await context.getCredentials('kieApi');
	const apiKey = credentials.apiKey as string;

	const allMessages: ChatMessage[] = [];
	if (systemPrompt) {
		allMessages.push({ role: 'developer', content: [{ type: 'text', text: systemPrompt }] });
	}
	allMessages.push(...messages);

	const body: IDataObject = {
		messages: allMessages,
		stream: false,
	};

	// Determine endpoint path based on model
	const endpointMap: Record<string, string> = {
		'gpt-5-2': '/chat/gpt-5-2/v1/chat/completions',
		'gpt-codex': '/market/codex/gpt-codex/v1/chat/completions',
	};

	const endpoint = endpointMap[model] || `/chat/gpt-5-2/v1/chat/completions`;

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

export class OpenAIChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenAI Chat (Kie.ai)',
		name: 'openAiChatKie',
		icon: 'file:openai-chat.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Chat with GPT-5 and OpenAI Codex models via Kie.ai API',
		defaults: {
			name: 'OpenAI Chat (Kie.ai)',
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
					{ name: 'GPT-5-2 (Latest)', value: 'gpt-5-2' },
					{ name: 'GPT Codex', value: 'gpt-codex' },
				],
				default: 'gpt-5-2',
				description: 'OpenAI model to use for chat completions',
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
				description: 'The user message to send to the model',
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
				const chatHistoryRaw = this.getNodeParameter('chatHistory', i, '[]') as string | IDataObject[];

				// Parse chat history
				let chatHistory: ChatMessage[] = [];
				if (typeof chatHistoryRaw === 'string') {
					try {
						chatHistory = JSON.parse(chatHistoryRaw) as ChatMessage[];
					} catch (_) {
						chatHistory = [];
					}
				} else if (Array.isArray(chatHistoryRaw)) {
					chatHistory = chatHistoryRaw as unknown as ChatMessage[];
				}

				// Build current user message content
				const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
					{ type: 'text', text: userMessage },
				];
				if (imageUrl) {
					userContent.push({ type: 'image_url', image_url: { url: imageUrl } });
				}

				const messages: ChatMessage[] = [
					...chatHistory,
					{ role: 'user', content: userContent },
				];

				const response = await openaiChatRequest(
					this,
					model,
					messages,
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
