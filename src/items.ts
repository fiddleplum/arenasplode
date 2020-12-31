import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { ChainWand } from 'entities/chain_wand';
import { Nuke } from 'entities/nuke';
import { Gun } from 'entities/gun';
import { Shell } from 'entities/shell';
import { Sword } from 'entities/sword';

const itemWeights = new Map([
	[Sword, 1],
	[Gun, 1],
	[Shell, 1],
	[Nuke, 1],
	[ChainWand, 1]
]);

export class Items {
	static createRandomItem(app: ArenaSplodeApp): void {
		// Get the total weights.
		let totalWeights = 0;
		for (const entry of itemWeights) {
			totalWeights += entry[1];
		}

		// Get a random aggregate weight and decrease until we find our index.
		let randomWeight = Math.floor(Math.random() * totalWeights);
		for (const entry of itemWeights) {
			if (randomWeight < entry[1]) {
				const itemType = entry[0];
				const item = new itemType(app);
				app.addEntity(item);
				item.setPosition(new Birch.Vector2(1 + Math.random() * (app.level.size.x - 2), 1 + Math.random() * (app.level.size.y - 2)));
				break;
			}
			else {
				randomWeight -= entry[1];
			}
		}
	}

}
