/**
 * Unit tests for GenericFunctions.ts (pure / non-API functions only)
 *
 * parseKieResponse is a pure data-transformation function — no n8n runtime or
 * API credentials are needed to test it.
 */

import { parseKieResponse } from '../nodes/GenericFunctions';

describe('parseKieResponse', () => {
	it('returns response unchanged when data is missing', () => {
		const response = { code: 200 };
		const result = parseKieResponse(response);
		expect(result).toBe(response);
	});

	it('returns response unchanged when data is undefined', () => {
		const response = { data: undefined };
		const result = parseKieResponse(response);
		expect(result).toBe(response);
	});

	it('parses a valid resultJson string into an object', () => {
		const response = {
			data: {
				resultJson: JSON.stringify({ resultUrls: ['https://example.com/video.mp4'] }),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(typeof data.resultJson).toBe('object');
		expect((data.resultJson as Record<string, unknown>).resultUrls).toEqual([
			'https://example.com/video.mp4',
		]);
	});

	it('surfaces resultUrls to data level', () => {
		const response = {
			data: {
				resultJson: JSON.stringify({ resultUrls: ['https://cdn.kie.ai/output.jpg'] }),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(data.resultUrls).toEqual(['https://cdn.kie.ai/output.jpg']);
	});

	it('surfaces videoUrls to data level', () => {
		const response = {
			data: {
				resultJson: JSON.stringify({ videoUrls: ['https://cdn.kie.ai/out.mp4'] }),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(data.videoUrls).toEqual(['https://cdn.kie.ai/out.mp4']);
	});

	it('surfaces audioUrl to data level', () => {
		const response = {
			data: {
				resultJson: JSON.stringify({ audioUrl: 'https://cdn.kie.ai/audio.mp3' }),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(data.audioUrl).toBe('https://cdn.kie.ai/audio.mp3');
	});

	it('parses a valid param string into an object', () => {
		const param = { prompt: 'a sunset over the ocean', modelName: 'kling-v2' };
		const response = {
			data: {
				param: JSON.stringify(param),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(typeof data.param).toBe('object');
		expect((data.param as Record<string, unknown>).prompt).toBe('a sunset over the ocean');
	});

	it('handles nested param.input JSON string', () => {
		const innerInput = { width: 512, height: 512 };
		const param = { input: JSON.stringify(innerInput) };
		const response = {
			data: {
				param: JSON.stringify(param),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		const parsedParam = data.param as Record<string, unknown>;
		expect(parsedParam.input).toEqual(innerInput);
	});

	it('silently ignores invalid JSON in resultJson', () => {
		const response = {
			data: {
				resultJson: 'NOT_VALID_JSON{{{',
			},
		};
		expect(() => parseKieResponse(response)).not.toThrow();
		const data = response.data as Record<string, unknown>;
		expect(data.resultJson).toBe('NOT_VALID_JSON{{{');
	});

	it('silently ignores invalid JSON in param', () => {
		const response = {
			data: {
				param: 'broken json',
			},
		};
		expect(() => parseKieResponse(response)).not.toThrow();
		const data = response.data as Record<string, unknown>;
		expect(data.param).toBe('broken json');
	});

	it('does not overwrite existing resultUrls if not present in resultJson', () => {
		const response = {
			data: {
				resultJson: JSON.stringify({ somethingElse: true }),
			},
		};
		const result = parseKieResponse(response);
		const data = result.data as Record<string, unknown>;
		expect(data.resultUrls).toBeUndefined();
	});
});
