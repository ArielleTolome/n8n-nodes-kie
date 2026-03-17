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
	_retryCount = 0,
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

	try {
		return await context.helpers.httpRequestWithAuthentication.call(
			context,
			'kieApi',
			options,
		) as Promise<IDataObject>;
	} catch (error: unknown) {
		// Extract HTTP status code from n8n error object
		const nodeErr = error as {
			httpCode?: string;
			cause?: { response?: { status?: number; data?: unknown } };
			response?: { status?: number; data?: unknown };
		};
		const statusCode =
			(nodeErr.httpCode ? parseInt(nodeErr.httpCode, 10) : undefined) ??
			nodeErr.cause?.response?.status ??
			nodeErr.response?.status;

		// Retry on 429 (rate limit) with exponential backoff — max 3 retries (2s, 4s, 8s)
		if (statusCode === 429 && _retryCount < 3) {
			const backoffMs = Math.pow(2, _retryCount + 1) * 1000;
			await delay(backoffMs);
			return kieRequest(context, method, endpoint, body, qs, _retryCount + 1);
		}

		// Enhance error message: include API response body when available
		const responseData = nodeErr.cause?.response?.data ?? nodeErr.response?.data;
		if (responseData) {
			const dataStr =
				typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
			const msg = `Kie.ai API error (${statusCode ?? 'unknown'}): ${dataStr}`;
			if (error instanceof NodeApiError) {
				(error as NodeApiError).message = msg;
				throw error;
			}
			throw new NodeApiError(context.getNode(), { message: msg } as unknown as import('n8n-workflow').JsonObject, {
				message: msg,
			});
		}

		throw error;
	}
}

/** Parse double-encoded JSON strings in Kie.ai responses and surface resultUrls at top level */
export function parseKieResponse(response: IDataObject): IDataObject {
	const data = response.data as IDataObject | undefined;
	if (!data) return response;

	// Parse resultJson string → object
	if (typeof data.resultJson === 'string') {
		try {
			data.resultJson = JSON.parse(data.resultJson);
		} catch (_) { /* ignore */ }
	}

	// Parse param string → object
	if (typeof data.param === 'string') {
		try {
			const parsed = JSON.parse(data.param) as IDataObject;
			// param.input is often also a nested JSON string
			if (typeof parsed.input === 'string') {
				try { parsed.input = JSON.parse(parsed.input); } catch (_) { /* ignore */ }
			}
			data.param = parsed;
		} catch (_) { /* ignore */ }
	}

	// Surface resultUrls at top level for easy access
	const resultJson = data.resultJson as IDataObject | undefined;
	if (resultJson?.resultUrls) {
		data.resultUrls = resultJson.resultUrls;
	}
	// Also handle videoUrls (video models)
	if (resultJson?.videoUrls) {
		data.videoUrls = resultJson.videoUrls;
	}
	// Cover audioUrl pattern used by music models
	if (resultJson?.audioUrl) {
		data.audioUrl = resultJson.audioUrl;
	}

	return response;
}

/** Query a task by ID and return parsed response */
export async function kieQueryTask(
	context: IExecuteFunctions,
	taskId: string,
): Promise<IDataObject> {
	const response = await kieRequest(context, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId });
	return parseKieResponse(response);
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
				message: `Task ${taskId} timed out after ${timeoutMs / 1000} seconds. Use Query Task Status to check later.`,
			});
		}

		const response = await kieRequest(context, 'GET', '/api/v1/jobs/recordInfo', undefined, {
			taskId,
		});

		const data = response.data as IDataObject | undefined;
		const state = data?.state as string | undefined;

		if (state === 'success' || state === 'fail') {
			return parseKieResponse(response);
		}

		await delay(intervalMs);
	}
}

export async function waitForDedicatedTask(
	context: IExecuteFunctions,
	taskId: string,
	pollEndpoint: string,
	intervalMs = 3000,
	timeoutMs = 300000,
): Promise<IDataObject> {
	const startTime = Date.now();

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (Date.now() - startTime >= timeoutMs) {
			throw new NodeApiError(context.getNode(), {}, {
				message: `Task ${taskId} timed out after ${timeoutMs / 1000} seconds. Use Query Task Status to check later.`,
			});
		}

		const response = await kieRequest(context, 'GET', pollEndpoint, undefined, {
			taskId,
		});

		const data = response.data as IDataObject | undefined;
		const status = (data?.status ?? data?.state ?? response.status ?? response.state) as string | undefined;

		if (status === 'success' || status === 'fail' || status === 'failed') {
			return parseKieResponse(response);
		}

		await delay(intervalMs);
	}
}

export function createTaskAndMaybeWait(
	context: IExecuteFunctions,
	response: IDataObject,
	waitForCompletionFlag: boolean,
): Promise<IDataObject> {
	if (waitForCompletionFlag) {
		const data = response.data as IDataObject | undefined;
		const taskId = data?.taskId as string | undefined;
		if (taskId) {
			return waitForTask(context, taskId);
		}
		// No taskId in response — return as-is rather than crashing
	}
	return Promise.resolve(response);
}

export function dedicatedTaskAndMaybeWait(
	context: IExecuteFunctions,
	response: IDataObject,
	waitForCompletionFlag: boolean,
	pollEndpoint: string,
): Promise<IDataObject> {
	if (waitForCompletionFlag) {
		const data = response.data as IDataObject | undefined;
		const taskId = (data?.taskId ?? response.taskId) as string | undefined;
		if (taskId) {
			return waitForDedicatedTask(context, taskId, pollEndpoint);
		}
		// No taskId in response — return as-is rather than crashing
	}
	return Promise.resolve(response);
}
