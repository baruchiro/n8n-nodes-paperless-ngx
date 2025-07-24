import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, IDataObject } from 'n8n-workflow';

export class PaperlessTags implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paperless Tags',
		name: 'paperlessTags',
		icon: 'file:paperlessTags.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Paperless-ngx tags',
		defaults: {
			name: 'Paperless Tags',
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
						name: 'Tag',
						value: 'tag',
					},
				],
				default: 'tag',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'tag',
						],
					},
				},
				options: [
					{
						name: 'Get All Tags',
						value: 'getAllTags',
						action: 'Get all tags',
					},
					{
						name: 'Get Tag by ID',
						value: 'getTagById',
						description: 'Get a specific tag by ID',
						action: 'Get a specific tag by ID',
					},
				],
				default: 'getAllTags',
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'tag',
						],
						operation: [
							'getTagById',
						],
					},
				},
				default: '',
				description: 'The ID of the tag to retrieve',
				required: true,
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'tag',
						],
						operation: [
							'getAllTags',
						],
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
						resource: [
							'tag',
						],
						operation: [
							'getAllTags',
						],
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
						resource: [
							'tag',
						],
						operation: [
							'getAllTags',
						],
					},
				},
				options: [
					{
						name: 'Name (A-Z)',
						value: 'name',
					},
					{
						name: 'Name (Z-A)',
						value: '-name',
					},
					{
						name: 'Created Date (Newest First)',
						value: '-created_date',
					},
					{
						name: 'Created Date (Oldest First)',
						value: 'created_date',
					},
				],
				default: 'name',
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
				if (resource === 'tag') {
					if (operation === 'getAllTags') {
						const page = this.getNodeParameter('page', i) as number;
						const pageSize = this.getNodeParameter('pageSize', i) as number;
						const ordering = this.getNodeParameter('ordering', i) as string;

						const qs: IDataObject = {
							page,
							page_size: pageSize,
							ordering,
						};

						responseData = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', {
							method: 'GET',
							url: '/api/tags/',
							qs,
						});
					} else if (operation === 'getTagById') {
						const tagId = this.getNodeParameter('tagId', i) as number;

						responseData = await this.helpers.requestWithAuthentication.call(this, 'paperlessNgxApi', {
							method: 'GET',
							url: `/api/tags/${tagId}/`,
						});
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData),
						{ itemData: { item: i } },
					));
				} else if (responseData !== undefined) {
					returnData.push(
						{
							json: responseData,
						},
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
