import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { kieRequest, kieQueryTask, waitForTask } from '../GenericFunctions';

export class Ideogram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ideogram (Kie.ai)',
		name: 'ideogram',
		icon: 'file:ideogram.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Ideogram via Kie.ai API',
		defaults: {
			name: 'Ideogram (Kie.ai)',
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
					{ name: 'Generate', value: 'generate', action: 'Generate image' },
					{ name: 'Reframe', value: 'reframe', action: 'Reframe image' },
					{ name: 'Character', value: 'character', action: 'Character generation' },
					{ name: 'Character Edit', value: 'characterEdit', action: 'Character edit' },
					{ name: 'Character Remix', value: 'characterRemix', action: 'Character remix' },
					{ name: 'Query Task Status', value: 'queryTaskStatus', action: 'Get task status' },
				],
				default: 'generate',
				required: true,
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['generate', 'reframe', 'character', 'characterEdit', 'characterRemix'],
					},
				},
				default: '',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['reframe', 'characterEdit', 'characterRemix'],
					},
				},
				default: '',
			},
			{
				displayName: 'Reference Images',
				name: 'referenceImageUrls',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: {
					show: {
						operation: ['character', 'characterEdit', 'characterRemix'],
					},
				},
				default: {},
				placeholder: 'Add Reference Image',
				description: 'Reference images for character consistency. Required for Character and Character Edit operations (up to 5, currently only 1 is used by the API).',
				options: [
					{
						displayName: 'Image',
						name: 'image',
						values: [
							{
								displayName: 'Image URL',
								name: 'url',
								type: 'string',
								default: '',
								description: 'URL of the reference image',
							},
						],
					},
				],
			},
			{
				displayName: 'Mask URL',
				name: 'maskUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['characterEdit'],
					},
				},
				default: '',
				description: 'URL of the mask image for inpainting. Must match the dimensions of the Image URL.',
			},
			{
				displayName: 'Rendering Speed',
				name: 'renderingSpeed',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['character', 'characterEdit', 'characterRemix', 'generate'],
					},
				},
				options: [
					{ name: 'Turbo', value: 'TURBO' },
					{ name: 'Default', value: 'DEFAULT' },
					{ name: 'Balanced', value: 'BALANCED' },
					{ name: 'Quality', value: 'QUALITY' },
				],
				default: 'DEFAULT',
				description: 'Rendering speed vs quality trade-off',
			},
			{
				displayName: 'Character ID',
				name: 'characterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['character', 'characterEdit', 'characterRemix'],
					},
				},
				default: '',
			},
			{
				displayName: 'Aspect Ratio',
				name: 'ratio',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generate', 'reframe'],
					},
				},
				options: [
					{ name: '1:1', value: '1:1' },
					{ name: '16:9', value: '16:9' },
					{ name: '9:16', value: '9:16' },
					{ name: '4:3', value: '4:3' },
					{ name: '3:4', value: '3:4' },
				],
				default: '1:1',
			},
			{
				displayName: 'Style',
				name: 'style',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				default: '',
				description: 'Optional style hint',
			},
			{
				displayName: 'Negative Prompt',
				name: 'negativePrompt',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				default: '',
				description: 'Elements to avoid in the generated image',
			},
			{
				displayName: 'Style Type',
				name: 'styleType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				options: [
					{ name: 'Auto', value: '' },
					{ name: 'General', value: 'GENERAL' },
					{ name: 'Realistic', value: 'REALISTIC' },
					{ name: 'Design', value: 'DESIGN' },
					{ name: 'Render 3D', value: 'RENDER_3D' },
					{ name: 'Anime', value: 'ANIME' },
				],
				default: '',
				description: 'Ideogram style type preset',
			},
			{
				displayName: 'Magic Prompt Option',
				name: 'magicPromptOption',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				options: [
					{ name: 'Auto', value: '' },
					{ name: 'On', value: 'ON' },
					{ name: 'Off', value: 'OFF' },
				],
				default: '',
				description: 'Whether to use Ideogram Magic Prompt enhancement',
			},
			{
				displayName: 'Color Palette',
				name: 'colorPalette',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				default: '',
				description: 'Optional color palette preset name or hex colors (e.g. "pastel", "#FF5733,#00FF00")',
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['generate'],
					},
				},
				default: 0,
				description: 'Random seed (0 for random)',
			},
			{
				displayName: 'Reply URL',
				name: 'replyUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate', 'reframe', 'character', 'characterEdit', 'characterRemix'],
					},
				},
				default: '',
				description: 'Webhook URL to call when the task completes',
			},
			{
				displayName: 'Reply Ref',
				name: 'replyRef',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generate', 'reframe', 'character', 'characterEdit', 'characterRemix'],
					},
				},
				default: '',
				description: 'Custom reference string passed back in the webhook callback',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['generate', 'reframe', 'character', 'characterEdit', 'characterRemix'],
					},
				},
				default: true,
				description: 'Whether to wait for the task to complete (polls every 3s, 5min timeout)',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['queryTaskStatus'],
					},
				},
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
					const modelMap: Record<string, string> = {
						generate: 'ideogram/v3',
						reframe: 'ideogram/v3-reframe',
						character: 'ideogram/character',
						characterEdit: 'ideogram/character-edit',
						characterRemix: 'ideogram/character-remix',
					};

					const input: IDataObject = {
						prompt: this.getNodeParameter('prompt', i) as string,
					};

					if (['reframe', 'characterEdit', 'characterRemix'].includes(operation)) {
						input.image_url = this.getNodeParameter('imageUrl', i) as string;
					}

					if (['character', 'characterEdit', 'characterRemix'].includes(operation)) {
						const charId = this.getNodeParameter('characterId', i, '') as string;
						if (charId) input.character_id = charId;
					}

					// Reference images (required for character/characterEdit, optional for remix)
					if (['character', 'characterEdit', 'characterRemix'].includes(operation)) {
						const refCollection = this.getNodeParameter('referenceImageUrls', i, {}) as IDataObject;
						const refUrls = ((refCollection.image as IDataObject[]) || [])
							.map((img) => img.url as string)
							.filter((url) => url && url.trim() !== '');
						if (refUrls.length > 0) {
							input.reference_image_urls = refUrls;
						}
					}

					// Mask URL (required for characterEdit)
					if (operation === 'characterEdit') {
						const maskUrl = this.getNodeParameter('maskUrl', i, '') as string;
						if (maskUrl) input.mask_url = maskUrl;
					}

					// Rendering speed for character ops and generate
					if (['character', 'characterEdit', 'characterRemix', 'generate'].includes(operation)) {
						input.rendering_speed = this.getNodeParameter('renderingSpeed', i, 'DEFAULT') as string;
					}

					if (operation === 'generate' || operation === 'reframe') {
						input.ratio = this.getNodeParameter('ratio', i) as string;
					}

					if (operation === 'generate') {
						const style = this.getNodeParameter('style', i, '') as string;
						if (style) input.style = style;
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						if (negativePrompt) input.negative_prompt = negativePrompt;
						const styleType = this.getNodeParameter('styleType', i, '') as string;
						if (styleType) input.style_type = styleType;
						const magicPromptOption = this.getNodeParameter('magicPromptOption', i, '') as string;
						if (magicPromptOption) input.magic_prompt_option = magicPromptOption;
						const colorPalette = this.getNodeParameter('colorPalette', i, '') as string;
						if (colorPalette) input.color_palette = colorPalette;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
					}

					const body: IDataObject = { model: modelMap[operation], input };

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
