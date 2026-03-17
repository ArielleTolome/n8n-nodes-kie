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
						input.imageUrl = this.getNodeParameter('imageUrl', i) as string;
					}

					if (['character', 'characterEdit', 'characterRemix'].includes(operation)) {
						const charId = this.getNodeParameter('characterId', i, '') as string;
						if (charId) input.characterId = charId;
					}

					if (operation === 'generate' || operation === 'reframe') {
						input.ratio = this.getNodeParameter('ratio', i) as string;
					}

					if (operation === 'generate') {
						const style = this.getNodeParameter('style', i, '') as string;
						if (style) input.style = style;
						const seed = this.getNodeParameter('seed', i, 0) as number;
						if (seed) input.seed = seed;
					}

					const body: IDataObject = { model: modelMap[operation], input };
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
