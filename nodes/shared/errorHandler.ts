import type { IExecuteFunctions } from 'n8n-workflow';

export interface DetailedError {
	message: string;
	operation: string;
	resource: string;
	baseUrl: string;
	fullUrl: string;
	credentials: {
		hasBaseUrl: boolean;
		hasToken: boolean;
		tokenLength: number;
	};
	originalError: any;
}

export async function handlePaperlessError(
	this: IExecuteFunctions,
	error: any,
	operation: string,
	resource: string,
	url: string,
	itemIndex: number,
): Promise<DetailedError> {
	// Get credentials for debugging
	const credentials = await this.getCredentials('paperlessNgxApi');
	const baseUrl =
		(typeof credentials?.baseUrl === 'string' ? credentials.baseUrl : 'Not set') || 'Not set';

	// Build the full URL for debugging
	let fullUrl = 'Unknown';
	try {
		fullUrl = `${baseUrl}${url}`;
	} catch (urlError) {
		fullUrl = 'Could not construct URL';
	}

	// Create detailed error message
	const detailedError: DetailedError = {
		message: error.message,
		operation,
		resource,
		baseUrl,
		fullUrl,
		credentials: {
			hasBaseUrl: !!credentials?.baseUrl,
			hasToken: !!credentials?.token,
			tokenLength: typeof credentials?.token === 'string' ? credentials.token.length : 0,
		},
		originalError: error,
	};

	return detailedError;
}

export function createEnhancedError(detailedError: DetailedError): Error {
	const enhancedError = new Error(
		`Paperless-ngx API Error: ${detailedError.message}\n` +
			`Operation: ${detailedError.operation}\n` +
			`Resource: ${detailedError.resource}\n` +
			`Base URL: ${detailedError.baseUrl}\n` +
			`Full URL: ${detailedError.fullUrl}\n` +
			`Credentials: Base URL ${detailedError.credentials.hasBaseUrl ? 'set' : 'not set'}, Token ${detailedError.credentials.hasToken ? 'set' : 'not set'}`,
	);
	enhancedError.stack = detailedError.originalError.stack;
	return enhancedError;
}
