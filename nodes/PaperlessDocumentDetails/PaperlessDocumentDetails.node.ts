import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { createEnhancedError, handlePaperlessError } from '../shared/errorHandler';

export class PaperlessDocumentDetails implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paperless Document Details',
		name: 'paperlessDocumentDetails',
		icon: 'file:paperlessDocumentDetails.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get detailed information about Paperless-ngx documents',
		defaults: {
			name: 'Paperless Document Details',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'paperlessNgxApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'document',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Get Document by ID',
						value: 'getDocumentById',
						description: 'Get a specific document by ID',
						action: 'Get a specific document by ID',
					},
					{
						name: 'Get Document Metadata',
						value: 'getDocumentMetadata',
						description: 'Get metadata for a specific document',
						action: 'Get metadata for a specific document',
					},
					{
						name: 'Get Document History',
						value: 'getDocumentHistory',
						description: 'Get history for a specific document',
						action: 'Get history for a specific document',
					},
				],
				default: 'getDocumentById',
			},
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				default: '',
				description: 'The ID of the document to retrieve',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'document') {
					const documentId = this.getNodeParameter('documentId', i) as number;

					if (operation === 'getDocumentById') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							{
								method: 'GET',
								url: `/api/documents/${documentId}/`,
							},
						);
					} else if (operation === 'getDocumentMetadata') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							{
								method: 'GET',
								url: `/api/documents/${documentId}/metadata/`,
							},
						);
					} else if (operation === 'getDocumentHistory') {
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							{
								method: 'GET',
								url: `/api/documents/${documentId}/history/`,
							},
						);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(
						...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), {
							itemData: { item: i },
						}),
					);
				} else if (responseData !== undefined) {
					returnData.push({
						json: responseData,
					});
				}
			} catch (error) {
				const documentId = this.getNodeParameter('documentId', i) as number;
				let url = `/api/documents/${documentId}/`;
				if (operation === 'getDocumentMetadata') {
					url = `/api/documents/${documentId}/metadata/`;
				} else if (operation === 'getDocumentHistory') {
					url = `/api/documents/${documentId}/history/`;
				}

				const detailedError = await handlePaperlessError.call(
					this,
					error,
					operation,
					resource,
					url,
					i,
				);

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: detailedError,
						},
					});
					continue;
				}

				throw createEnhancedError(detailedError);
			}
		}

		return [returnData];
	}
}
