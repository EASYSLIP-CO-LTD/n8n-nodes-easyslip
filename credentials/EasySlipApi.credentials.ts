import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class EasySlipApi implements ICredentialType {
	name = 'easySlipApi';
	displayName = 'EasySlip API';
	documentationUrl = 'https://document.easyslip.com/documents/start';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The Bearer token for EasySlip API authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};
}
