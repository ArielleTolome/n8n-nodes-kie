"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedreamApi = void 0;
class SeedreamApi {
    constructor() {
        this.name = 'seedreamApi';
        this.displayName = 'Seedream API';
        this.icon = 'file:seedream-logo4.svg';
        // documentationUrl = 'https://kie.ai/api-key';
        this.properties = [
            {
                displayName: '<b>EN:</b> To get an API Key, register via author\'s link: <a href="https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5" target="_blank">kie.ai</a> and get welcome bonuses (subject to service terms). After registration: <b>API keys</b> tab -> <b>Create new key</b> button -> paste below.<br><br><b>RU:</b> Для получения ключа API зарегистрируйтесь по ссылке автора: <a href="https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5" target="_blank">kie.ai</a> и получите приветственные бонусы (согласно условиям сервиса). После регистрации: вкладка <b>API keys</b> -> кнопка <b>Create new key</b> -> вставьте ключ ниже.',
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
exports.SeedreamApi = SeedreamApi;
