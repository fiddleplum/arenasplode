import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Sword } from 'entities/sword';

const itemWeights = new Map([
	[Sword, 1]
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
				const item = new itemType(app.engine, app.scene);
				app.addEntity(item);
				item.setPosition(new Birch.Vector2(1 + Math.random() * (app.map.size.x - 2), 1 + Math.random() * (app.map.size.y - 2)));
			}
			else {
				randomWeight -= entry[1];
			}
		}
	}

}
