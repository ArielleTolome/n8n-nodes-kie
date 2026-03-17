/**
 * Integration tests — require a real kie.ai API key.
 * Run with: KIE_API_KEY=your_key npm test -- --testPathPattern=integration
 *
 * These tests are SKIPPED by default (no API key in CI).
 *
 * When you have a test account, replace the empty test bodies below with
 * real HTTP calls to the kie.ai API and assert on the response shape.
 */

const apiKey = process.env.KIE_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const runIntegration = !!apiKey;

describe.skip('Kling API Integration', () => {
	// These would make real API calls — skip in CI

	it('should create a text-to-video task', async () => {
		// Example of what a real integration test would look like:
		//
		// const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
		//   method: 'POST',
		//   headers: {
		//     'Authorization': `Bearer ${apiKey}`,
		//     'Content-Type': 'application/json',
		//   },
		//   body: JSON.stringify({
		//     model: 'kling-v1.6',
		//     prompt: 'A cat walking on a beach',
		//   }),
		// });
		// const data = await response.json();
		// expect(data.taskId).toBeDefined();
	});

	it('should retrieve a task status', async () => {
		// Example:
		//
		// const taskId = 'some-task-id-from-previous-test';
		// const response = await fetch(
		//   `https://api.kie.ai/api/v1/jobs/getTaskDetail?taskId=${taskId}`,
		//   { headers: { 'Authorization': `Bearer ${apiKey}` } }
		// );
		// const data = await response.json();
		// expect(['pending', 'processing', 'completed', 'failed']).toContain(data.status);
	});

	it('should create an image-to-video task', async () => {
		// Not implemented — add when you have a test account and a public image URL
	});
});
