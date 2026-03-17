import type { IExecuteFunctions, IDataObject, IHttpRequestOptions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.kie.ai';

declare function setTimeout(callback: () => void, ms: number): unknown;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function kieRequest(
	context: IExecuteFunctions,
	method: 'GET' | 'POST',
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		json: true,
	};

	if (body) {
		options.body = body;
		options.headers = { 'Content-Type': 'application/json' };
	}

	if (qs) {
		options.qs = qs as Record<string, string>;
	}

	return context.helpers.httpRequestWithAuthentication.call(
		context,
		'kieApi',
		options,
	) as Promise<IDataObject>;
}

export async function waitForTask(
	context: IExecuteFunctions,
	taskId: string,
	intervalMs = 3000,
	timeoutMs = 300000,
): Promise<IDataObject> {
	const startTime = Date.now();

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (Date.now() - startTime >= timeoutMs) {
			throw new NodeApiError(context.getNode(), {}, {
				message: `Task ${taskId} timed out after ${timeoutMs / 1000} seconds`,
			});
		}

		const response = await kieRequest(context, 'GET', '/api/v1/jobs/recordInfo', undefined, {
			taskId,
		});

		const data = response.data as IDataObject | undefined;
		const state = data?.state as string | undefined;

		if (state === 'success' || state === 'fail') {
			return response;
		}

		await delay(intervalMs);
	}
}
