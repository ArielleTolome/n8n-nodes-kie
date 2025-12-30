"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seedream = void 0;
class Seedream {
    constructor() {
        this.description = {
            displayName: 'Seedream v4',
            name: 'seedream',
            icon: 'file:seedream-v4-bubble.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Generate images using Seedream V4 Text To Image API',
            defaults: {
                name: 'Seedream V4',
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
                            name: 'Create Task',
                            value: 'createTask',
                            description: 'Create a new image generation task',
                            action: 'Create a task',
                        },
                        {
                            name: 'Query Task Status',
                            value: 'queryTaskStatus',
                            description: 'Query the status of a task',
                            action: 'Query task status',
                        },
                    ],
                    default: 'createTask',
                    required: true,
                },
                {
                    displayName: 'Model',
                    name: 'model',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    options: [
                        {
                            name: 'Seedream V4 Text to Image',
                            value: 'bytedance/seedream-v4-text-to-image',
                        },
                        {
                            name: 'Seedream V4 Edit',
                            value: 'bytedance/seedream-v4-edit',
                        },
                    ],
                    default: 'bytedance/seedream-v4-text-to-image',
                    description: 'The AI model to use for generation',
                    required: true,
                },
                // Create Task parameters
                {
                    displayName: 'Prompt',
                    name: 'prompt',
                    type: 'string',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    default: '',
                    description: 'The text prompt used to generate or edit the image (max 5000 characters)',
                    placeholder: 'Draw the following system of binary linear equations...',
                },
                {
                    displayName: 'Input Images',
                    name: 'inputImages',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                            model: ['bytedance/seedream-v4-edit'],
                        },
                    },
                    default: {},
                    placeholder: 'Add Image',
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
                                    placeholder: 'https://example.com/image.png',
                                },
                            ],
                        },
                    ],
                    description: 'URLs of the input images to edit',
                },
                {
                    displayName: 'Image Size',
                    name: 'imageSize',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    options: [
                        {
                            name: 'Landscape 16:9',
                            value: 'landscape_16_9',
                        },
                        {
                            name: 'Landscape 21:9',
                            value: 'landscape_21_9',
                        },
                        {
                            name: 'Landscape 3:2',
                            value: 'landscape_3_2',
                        },
                        {
                            name: 'Landscape 4:3',
                            value: 'landscape_4_3',
                        },
                        {
                            name: 'Portrait 2:3',
                            value: 'portrait_3_2',
                        },
                        {
                            name: 'Portrait 3:4',
                            value: 'portrait_4_3',
                        },
                        {
                            name: 'Portrait 9:16',
                            value: 'portrait_16_9',
                        },
                        {
                            name: 'Square',
                            value: 'square',
                        },
                        {
                            name: 'Square HD',
                            value: 'square_hd',
                        },
                    ],
                    default: 'square_hd',
                    description: 'The size/aspect ratio of the generated image',
                },
                {
                    displayName: 'Image Resolution',
                    name: 'imageResolution',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    options: [
                        {
                            name: '1K',
                            value: '1K',
                        },
                        {
                            name: '2K',
                            value: '2K',
                        },
                        {
                            name: '4K',
                            value: '4K',
                        },
                    ],
                    default: '1K',
                    description: 'Final image resolution (combined with image size determines pixel dimensions)',
                },
                {
                    displayName: 'Max Images',
                    name: 'maxImages',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    options: [
                        { name: '1', value: 1 },
                        { name: '2', value: 2 },
                        { name: '3', value: 3 },
                        { name: '4', value: 4 },
                        { name: '5', value: 5 },
                        { name: '6', value: 6 },
                    ],
                    default: 1,
                    description: 'Maximum number of images to generate (1-6)',
                },
                {
                    displayName: 'Seed',
                    name: 'seed',
                    type: 'number',
                    typeOptions: {
                        numberStepSize: 1,
                    },
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
                        },
                    },
                    default: 0,
                    description: 'Random seed to control the stochasticity of image generation (leave 0 for random)',
                },
                {
                    displayName: 'Callback URL',
                    name: 'callbackUrl',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['job'],
                            operation: ['createTask'],
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
                            operation: ['createTask'],
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'job') {
                    if (operation === 'createTask') {
                        const model = this.getNodeParameter('model', i);
                        const prompt = this.getNodeParameter('prompt', i);
                        const imageSize = this.getNodeParameter('imageSize', i);
                        const imageResolution = this.getNodeParameter('imageResolution', i);
                        const maxImages = this.getNodeParameter('maxImages', i);
                        const seed = this.getNodeParameter('seed', i, 0);
                        const callbackUrl = this.getNodeParameter('callbackUrl', i, '');
                        const body = {
                            model,
                            input: {
                                prompt,
                                image_size: imageSize,
                                image_resolution: imageResolution,
                                max_images: maxImages,
                            },
                        };
                        if (model === 'bytedance/seedream-v4-edit') {
                            // @ts-ignore
                            const inputImages = this.getNodeParameter('inputImages', i);
                            const images = (inputImages === null || inputImages === void 0 ? void 0 : inputImages.image) || [];
                            const imageUrls = images.map((img) => img.url).filter((url) => url && url.trim() !== '');
                            if (imageUrls.length > 0) {
                                body.input.image_urls = imageUrls;
                            }
                        }
                        if (seed && seed !== 0) {
                            body.input.seed = seed;
                        }
                        if (callbackUrl && callbackUrl.trim() !== '') {
                            body.callBackUrl = callbackUrl;
                        }
                        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'kieAiApi', {
                            method: 'POST',
                            url: 'https://api.kie.ai/api/v1/jobs/createTask',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body,
                            json: true,
                        });
                        returnData.push(response);
                    }
                    else if (operation === 'queryTaskStatus') {
                        const taskId = this.getNodeParameter('taskId', i);
                        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'kieAiApi', {
                            method: 'GET',
                            url: `https://api.kie.ai/api/v1/jobs/recordInfo`,
                            qs: {
                                taskId,
                            },
                            json: true,
                        });
                        returnData.push(response);
                    }
                }
            }
            catch (error) {
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
exports.Seedream = Seedream;
