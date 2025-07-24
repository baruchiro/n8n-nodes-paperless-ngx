import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PaperlessNgxApi implements ICredentialType {
	name = 'paperlessNgxApi';
	displayName = 'Paperless-Ngx API';
	documentationUrl = 'https://docs.paperless-ngx.com/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8000',
			placeholder: 'http://localhost:8000',
			description: 'The base URL of your Paperless-ngx instance',
			required: true,
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The authentication token for Paperless-ngx API',
			required: true,
		},
	];
}
