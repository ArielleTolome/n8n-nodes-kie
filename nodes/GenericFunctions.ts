import type { IExecuteFunctions, IDataObject, IHttpRequestOptions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.kie.ai';

declare function setTimeout(callback: () => void, ms: number): unknown;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes an authenticated HTTP request to the Kie.ai API.
 *
 * Automatically retries up to 3 times with exponential backoff on HTTP 429 (rate limit).
 * Enhances error messages with the API response body when available.
 *
 * @param context - The n8n execute-functions context (provides credentials and HTTP helpers)
 * @param method - HTTP method: 'GET' or 'POST'
 * @param endpoint - API path, e.g. '/api/v1/jobs/createTask'
 * @param body - Optional JSON request body (POST requests)
 * @param qs - Optional query string parameters
 * @param _retryCount - Internal retry counter (do not pass manually)
 * @returns The parsed JSON response as an IDataObject
 */
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
		const response = await context.helpers.httpRequestWithAuthentication.call(
			context,
			'kieApi',
			options,
		) as IDataObject;

		// Kie.ai returns HTTP 200 even for errors — check the JSON code field
		const responseCode = response.code as number | undefined;
		if (responseCode !== undefined && responseCode !== 200) {
			const msg = (response.msg as string) || 'Unknown API error';
			throw new NodeApiError(context.getNode(), response as unknown as import('n8n-workflow').JsonObject, {
				message: `Kie.ai API error (${responseCode}): ${msg}`,
			});
		}

		return response;
	} catch (error: unknown) {
		// Re-throw NodeApiError from the response check above
		if (error instanceof NodeApiError) throw error;
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

/**
 * Parses double-encoded JSON strings in Kie.ai responses and promotes result URLs to top level.
 *
 * Kie.ai wraps result data inside `response.data.resultJson` (a JSON string). This function
 * parses `resultJson` and `param` strings in-place and surfaces `resultUrls`, `videoUrls`, and
 * `audioUrl` at `response.data` for easy downstream access in n8n expressions.
 *
 * @param response - The raw API response from kieRequest
 * @returns The same response object with nested JSON strings parsed
 */
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

/**
 * Queries a Kie.ai task by ID and returns the parsed response.
 *
 * Calls GET /api/v1/jobs/recordInfo with the given taskId, then runs the response
 * through parseKieResponse to decode nested JSON fields.
 *
 * @param context - The n8n execute-functions context
 * @param taskId - The task ID returned when the job was created
 * @returns The parsed task detail response
 */
export async function kieQueryTask(
	context: IExecuteFunctions,
	taskId: string,
): Promise<IDataObject> {
	const response = await kieRequest(context, 'GET', '/api/v1/jobs/recordInfo', undefined, { taskId });
	return parseKieResponse(response);
}

/**
 * Polls a Kie.ai task until it reaches a terminal state ('success' or 'fail').
 *
 * Polls GET /api/v1/jobs/recordInfo every `intervalMs` milliseconds (default 3s).
 * Throws a NodeApiError if the task does not complete within `timeoutMs` (default 5 minutes).
 *
 * @param context - The n8n execute-functions context
 * @param taskId - The task ID to poll
 * @param intervalMs - Polling interval in milliseconds (default: 3000)
 * @param timeoutMs - Maximum time to wait before throwing a timeout error (default: 300000)
 * @returns The final parsed response when state is 'success' or 'fail'
 * @throws NodeApiError if the task times out
 */
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

/**
 * Polls a dedicated Kie.ai poll endpoint until the task reaches a terminal state.
 *
 * Used for nodes that have their own status endpoint (e.g. Topaz, Sora2Pro) rather than the
 * generic /api/v1/jobs/recordInfo endpoint. Polls every `intervalMs` milliseconds (default 3s)
 * and throws if the task does not complete within `timeoutMs` (default 5 minutes).
 *
 * Terminal states checked: 'success', 'fail', 'failed'.
 *
 * @param context - The n8n execute-functions context
 * @param taskId - The task ID to poll
 * @param pollEndpoint - The endpoint path to GET for status updates
 * @param intervalMs - Polling interval in milliseconds (default: 3000)
 * @param timeoutMs - Maximum time to wait before throwing a timeout error (default: 300000)
 * @returns The final parsed response when a terminal state is reached
 * @throws NodeApiError if the task times out
 */
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

/**
 * Conditionally waits for a Kie.ai task to complete after creation.
 *
 * If `waitForCompletionFlag` is true and a `taskId` is present in `response.data`,
 * delegates to `waitForTask`. Otherwise resolves immediately with the creation response.
 *
 * @param context - The n8n execute-functions context
 * @param response - The response from the createTask API call
 * @param waitForCompletionFlag - Whether to poll until completion
 * @returns The creation response (immediate) or final task response (after polling)
 */
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

/**
 * Conditionally waits for a dedicated-endpoint Kie.ai task to complete after creation.
 *
 * Like `createTaskAndMaybeWait` but uses `waitForDedicatedTask` with a node-specific
 * `pollEndpoint` rather than the generic recordInfo endpoint. If `waitForCompletionFlag`
 * is false or no taskId is found, resolves immediately with the creation response.
 *
 * @param context - The n8n execute-functions context
 * @param response - The response from the createTask API call
 * @param waitForCompletionFlag - Whether to poll until completion
 * @param pollEndpoint - The dedicated status endpoint path to poll
 * @returns The creation response (immediate) or final task response (after polling)
 */
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
