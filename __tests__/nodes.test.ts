/**
 * Smoke tests — verify each node can be instantiated and has the required
 * n8n node description shape. No API calls or n8n runtime required.
 */

import type { INodeProperties } from 'n8n-workflow';
import { ElevenLabs } from '../nodes/ElevenLabs/ElevenLabs.node';
import { Flux } from '../nodes/Flux/Flux.node';
import { FourOImage } from '../nodes/FourOImage/FourOImage.node';
import { Google } from '../nodes/Google/Google.node';
import { GptImage15 } from '../nodes/GptImage15/GptImage15.node';
import { GrokImagine } from '../nodes/GrokImagine/GrokImagine.node';
import { Hailuo } from '../nodes/Hailuo/Hailuo.node';
import { Ideogram } from '../nodes/Ideogram/Ideogram.node';
import { InfineTalk } from '../nodes/InfineTalk/InfineTalk.node';
import { Kling } from '../nodes/Kling/Kling.node';
import { Qwen } from '../nodes/Qwen/Qwen.node';
import { Recraft } from '../nodes/Recraft/Recraft.node';
import { Runway } from '../nodes/Runway/Runway.node';
import { Seedance } from '../nodes/Seedance/Seedance.node';
import { Seedream } from '../nodes/Seedream/Seedream.node';
import { Sora2Pro } from '../nodes/Sora2Pro/Sora2Pro.node';
import { Suno } from '../nodes/Suno/Suno.node';
import { Topaz } from '../nodes/Topaz/Topaz.node';
import { Veo } from '../nodes/Veo/Veo.node';
import { Wan } from '../nodes/Wan/Wan.node';
import { ZImage } from '../nodes/ZImage/ZImage.node';

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

function assertHasOperationWithOptions(NodeClass: AnyNode): void {
	const node = new NodeClass();
	const operationProp = (node.description.properties as INodeProperties[]).find(
		(p) => p.name === 'operation',
	);
	expect(operationProp).toBeDefined();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(Array.isArray((operationProp as any)?.options)).toBe(true);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(((operationProp as any)?.options as unknown[]).length).toBeGreaterThan(0);
}

// ─── ElevenLabs ───────────────────────────────────────────────────────────────

describe('ElevenLabs node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(ElevenLabs as unknown as AnyNode, 'elevenLabs');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(ElevenLabs as unknown as AnyNode);
	});
	it('requires kieApi credential', () => {
		const node = new ElevenLabs();
		const creds = node.description.credentials as Array<{ name: string }>;
		expect(creds.some((c) => c.name === 'kieApi')).toBe(true);
	});
});

// ─── Flux ─────────────────────────────────────────────────────────────────────

describe('Flux node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Flux as unknown as AnyNode, 'flux');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Flux as unknown as AnyNode);
	});
});

// ─── FourOImage ───────────────────────────────────────────────────────────────

describe('FourOImage node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(FourOImage as unknown as AnyNode, 'fourOImage');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(FourOImage as unknown as AnyNode);
	});
});

// ─── Google ───────────────────────────────────────────────────────────────────

describe('Google node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Google as unknown as AnyNode, 'googleAiImages');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Google as unknown as AnyNode);
	});
});

// ─── GptImage15 ───────────────────────────────────────────────────────────────

describe('GptImage15 node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(GptImage15 as unknown as AnyNode, 'gptImage15');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(GptImage15 as unknown as AnyNode);
	});
});

// ─── GrokImagine ──────────────────────────────────────────────────────────────

describe('GrokImagine node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(GrokImagine as unknown as AnyNode, 'grokImagine');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(GrokImagine as unknown as AnyNode);
	});
});

// ─── Hailuo ───────────────────────────────────────────────────────────────────

describe('Hailuo node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Hailuo as unknown as AnyNode, 'hailuo');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Hailuo as unknown as AnyNode);
	});
});

// ─── Ideogram ─────────────────────────────────────────────────────────────────

describe('Ideogram node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Ideogram as unknown as AnyNode, 'ideogram');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Ideogram as unknown as AnyNode);
	});
});

// ─── InfineTalk ───────────────────────────────────────────────────────────────

describe('InfineTalk node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(InfineTalk as unknown as AnyNode, 'infineTalk');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(InfineTalk as unknown as AnyNode);
	});
});

// ─── Kling ────────────────────────────────────────────────────────────────────

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

// ─── Qwen ─────────────────────────────────────────────────────────────────────

describe('Qwen node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Qwen as unknown as AnyNode, 'qwen');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Qwen as unknown as AnyNode);
	});
});

// ─── Recraft ──────────────────────────────────────────────────────────────────

describe('Recraft node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Recraft as unknown as AnyNode, 'recraft');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Recraft as unknown as AnyNode);
	});
});

// ─── Runway ───────────────────────────────────────────────────────────────────

describe('Runway node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Runway as unknown as AnyNode, 'runway');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Runway as unknown as AnyNode);
	});
});

// ─── Seedance ─────────────────────────────────────────────────────────────────

describe('Seedance node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Seedance as unknown as AnyNode, 'seedance');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Seedance as unknown as AnyNode);
	});
});

// ─── Seedream ─────────────────────────────────────────────────────────────────

describe('Seedream node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Seedream as unknown as AnyNode, 'seedream');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Seedream as unknown as AnyNode);
	});
});

// ─── Sora2Pro ─────────────────────────────────────────────────────────────────

describe('Sora2Pro node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Sora2Pro as unknown as AnyNode, 'sora2Pro');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Sora2Pro as unknown as AnyNode);
	});
});

// ─── Suno ─────────────────────────────────────────────────────────────────────

describe('Suno node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Suno as unknown as AnyNode, 'suno');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Suno as unknown as AnyNode);
	});
});

// ─── Topaz ────────────────────────────────────────────────────────────────────

describe('Topaz node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Topaz as unknown as AnyNode, 'topaz');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Topaz as unknown as AnyNode);
	});
});

// ─── Veo ──────────────────────────────────────────────────────────────────────

describe('Veo node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Veo as unknown as AnyNode, 'veo');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Veo as unknown as AnyNode);
	});
});

// ─── Wan ──────────────────────────────────────────────────────────────────────

describe('Wan node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(Wan as unknown as AnyNode, 'wan');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(Wan as unknown as AnyNode);
	});
});

// ─── ZImage ───────────────────────────────────────────────────────────────────

describe('ZImage node', () => {
	it('has required n8n description shape', () => {
		assertNodeShape(ZImage as unknown as AnyNode, 'zImage');
	});
	it('has operation property with options', () => {
		assertHasOperationWithOptions(ZImage as unknown as AnyNode);
	});
});
