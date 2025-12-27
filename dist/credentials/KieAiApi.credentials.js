"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KieAiApi = void 0;
class KieAiApi {
    constructor() {
        this.name = 'kieAiApi';
        this.displayName = 'AI Hub Kie API';
        this.icon = 'file:kie-bubble.svg';
        // documentationUrl = 'https://kie.ai/api-key';
        this.properties = [
            {
                displayName: '<b>EN:</b> One key for all Kie.ai services. Register via author\'s link: <a href="https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5" target="_blank">kie.ai</a> and get welcome bonuses (exact amount in kie.ai terms). After registration: <b>API keys</b> tab -> <b>Create new key</b> button -> paste below.<br><br><b>RU:</b> Один ключ для всех сервисов Kie.ai. Зарегистрируйтесь по ссылке автора: <a href="https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5" target="_blank">kie.ai</a> и получите приветственные бонусы (точное количество в условиях kie.ai). После регистрации: вкладка <b>API keys</b> -> кнопка <b>Create new key</b> -> вставьте ключ ниже.',
                name: 'notice',
                type: 'notice',
                default: '',
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'All API from Kie',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://api.kie.ai',
                url: '/api/v1/jobs/recordInfo?taskId=test',
            },
        };
    }
}
exports.KieAiApi = KieAiApi;
