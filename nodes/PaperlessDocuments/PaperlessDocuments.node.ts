import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { IDataObject, NodeConnectionType } from 'n8n-workflow';
import { createEnhancedError, handlePaperlessError } from '../shared/errorHandler';

export class PaperlessDocuments implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paperless Documents',
		name: 'paperlessDocuments',
		icon: 'file:paperlessDocuments.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Paperless-ngx documents',
		defaults: {
			name: 'Paperless Documents',
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
						name: 'Get Documents by Tags',
						value: 'getDocumentsByTags',
						description: 'Get documents filtered by tags',
						action: 'Get documents filtered by tags',
					},
					{
						name: 'Get All Documents',
						value: 'getAllDocuments',
						action: 'Get all documents',
					},
				],
				default: 'getDocumentsByTags',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['getDocumentsByTags'],
					},
				},
				default: '',
				placeholder: 'tag1,tag2,tag3',
				description: 'Comma-separated list of tag names or IDs',
				required: true,
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				default: 25,
				description: 'Number of items per page',
			},
			{
				displayName: 'Ordering',
				name: 'ordering',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Created Date (Newest First)',
						value: '-created_date',
					},
					{
						name: 'Created Date (Oldest First)',
						value: 'created_date',
					},
					{
						name: 'Modified Date (Newest First)',
						value: '-modified_date',
					},
					{
						name: 'Modified Date (Oldest First)',
						value: 'modified_date',
					},
					{
						name: 'Title (A-Z)',
						value: 'title',
					},
					{
						name: 'Title (Z-A)',
						value: '-title',
					},
				],
				default: '-created_date',
				description: 'Ordering of results',
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
					if (operation === 'getDocumentsByTags') {
						const tags = this.getNodeParameter('tags', i) as string;
						const page = this.getNodeParameter('page', i) as number;
						const pageSize = this.getNodeParameter('pageSize', i) as number;
						const ordering = this.getNodeParameter('ordering', i) as string;

						const qs: IDataObject = {
							page,
							page_size: pageSize,
							ordering,
						};

						if (tags) {
							qs.tags__name__in = tags;
						}

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							{
								method: 'GET',
								url: '/api/documents/',
								qs,
							},
						);
					} else if (operation === 'getAllDocuments') {
						const page = this.getNodeParameter('page', i) as number;
						const pageSize = this.getNodeParameter('pageSize', i) as number;
						const ordering = this.getNodeParameter('ordering', i) as string;

						const qs: IDataObject = {
							page,
							page_size: pageSize,
							ordering,
						};

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'paperlessNgxApi',
							{
								method: 'GET',
								url: '/api/documents/',
								qs,
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
				const detailedError = await handlePaperlessError.call(
					this,
					error,
					operation,
					resource,
					'/api/documents/',
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
