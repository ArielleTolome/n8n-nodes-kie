/**
 * Property validation tests — verify all node properties have required fields
 * and option values are not empty strings.
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

const allNodes = [
	new ElevenLabs(),
	new Flux(),
	new FourOImage(),
	new Google(),
	new GptImage15(),
	new GrokImagine(),
	new Hailuo(),
	new Ideogram(),
	new InfineTalk(),
	new Kling(),
	new Qwen(),
	new Recraft(),
	new Runway(),
	new Seedance(),
	new Seedream(),
	new Sora2Pro(),
	new Suno(),
	new Topaz(),
	new Veo(),
	new Wan(),
	new ZImage(),
];

describe('All node properties are valid', () => {
	for (const node of allNodes) {
		const displayName = node.description.displayName as string;
		const properties = node.description.properties as INodeProperties[];

		describe(displayName, () => {
			it('has no properties missing displayName', () => {
				for (const prop of properties) {
					expect(prop.displayName).toBeTruthy();
				}
			});

			it('has no properties missing type', () => {
				for (const prop of properties) {
					expect(prop.type).toBeTruthy();
				}
			});

			it('has no option values that are empty strings (except intentional Auto/Default placeholders)', () => {
				// Some nodes legitimately use '' as the value for "Auto" / "Default" / "None" options
				// which the API interprets as "use server default". We allow that pattern but flag
				// any other empty-string option value as a bug.
				const allowedEmptyNames = new Set(['auto', 'default', 'none', 'any']);
				for (const prop of properties) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					if (prop.type === 'options' && (prop as any).options) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						for (const opt of (prop as any).options as Array<{ name: string; value: unknown }>) {
							if (opt.value === '') {
								// Only allowed if the display name clearly marks it as a placeholder
								expect(allowedEmptyNames.has(opt.name.toLowerCase())).toBe(true);
							}
						}
					}
				}
			});
		});
	}
});
