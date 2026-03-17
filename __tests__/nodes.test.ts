/**
 * Smoke tests — verify each node can be instantiated and has the required
 * n8n node description shape. No API calls or n8n runtime required.
 */

import type { INodeProperties } from 'n8n-workflow';
import { Kling } from '../nodes/Kling/Kling.node';
import { Flux } from '../nodes/Flux/Flux.node';
import { Suno } from '../nodes/Suno/Suno.node';
import { ElevenLabs } from '../nodes/ElevenLabs/ElevenLabs.node';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = new () => { description: any };

function assertNodeShape(NodeClass: AnyNode, expectedName: string): void {
	const node = new NodeClass();
	const { description } = node;

	expect(description).toBeDefined();
	expect(typeof description.name).toBe('string');
	expect(description.name).toBe(expectedName);
	expect(typeof description.displayName).toBe('string');
	expect((description.displayName as string).length).toBeGreaterThan(0);
	expect(Array.isArray(description.properties)).toBe(true);
	expect((description.properties as INodeProperties[]).length).toBeGreaterThan(0);
	expect(description.credentials).toBeDefined();
}

describe('Kling node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Kling as unknown as AnyNode, 'kling');
	});

	it('lists at least one operation in properties', () => {
		const node = new Kling();
		const operationProp = node.description.properties.find(
			(p: INodeProperties) => p.name === 'operation',
		);
		expect(operationProp).toBeDefined();
		expect(Array.isArray(operationProp.options)).toBe(true);
		expect((operationProp.options as unknown[]).length).toBeGreaterThan(0);
	});

	it('requires kieApi credential', () => {
		const node = new Kling();
		const creds = node.description.credentials as Array<{ name: string }>;
		expect(creds.some((c) => c.name === 'kieApi')).toBe(true);
	});
});

describe('Flux node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Flux as unknown as AnyNode, 'flux');
	});
});

describe('Suno node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Suno as unknown as AnyNode, 'suno');
	});
});

describe('ElevenLabs node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(ElevenLabs as unknown as AnyNode, 'elevenLabs');
	});
});
