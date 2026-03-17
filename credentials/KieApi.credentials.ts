import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class KieApi implements ICredentialType {
	name = 'kieApi';

	displayName = 'Kie API';

	icon: Icon = 'file:kie-bubble.svg';

	documentationUrl = 'https://kie.ai/api-key';

	properties: INodeProperties[] = [
		{
			displayName:
				'Get your API key from <a href="https://kie.ai/api-key" target="_blank">kie.ai</a>. Go to the <b>API keys</b> tab and click <b>Create new key</b>.',
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
			required: true,
			description: 'Your Kie.ai API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.kie.ai',
			url: '/api/v1/jobs/recordInfo?taskId=test',
		},
	};
}
