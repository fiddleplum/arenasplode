import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { ChainWand } from 'entities/chain_wand';
import { Nuke } from 'entities/nuke';
import { Shell } from 'entities/shell';
import { Sword } from 'entities/sword';
import { BulletGun } from 'entities/bullet_gun';
import { BombGun } from 'entities/bomb_gun';
import { Bomb } from 'entities/bomb';
import { Bullet } from 'entities/bullet';
import { Character } from 'entities/character';
import { Explosion } from 'entities/explosion';
import { Gib } from 'entities/gib';
import { Gun } from 'entities/gun';
import { Projectile } from 'entities/projectile';

export class Entities {
	private static entityTypes = [
		BombGun,
		Bomb,
		BulletGun,
		Bullet,
		ChainWand,
		Character,
		Explosion,
		Gib,
		Gun,
		Nuke,
		Projectile,
		Shell,
		Sword
	];

	private static itemWeights = new Map([
		[Sword, 3],
		[BulletGun, 2],
		[BombGun, 1],
		[Shell, 1],
		[Nuke, 1],
		[ChainWand, 1]
	]);

	static loadEntityResources(engine: Birch.Engine): Promise<void>[] {
		const promises: Promise<void>[] = [];
		for (let i = 0; i < this.entityTypes.length; i++) {
			promises.concat(this.entityTypes[i].loadResources(engine));
		}
		return promises;
	}

	static createRandomItem(app: ArenaSplodeApp): void {
		// Get the total weights.
		let totalWeights = 0;
		for (const entry of this.itemWeights) {
			totalWeights += entry[1];
		}

		// Get a random aggregate weight and decrease until we find our index.
		let randomWeight = Math.floor(Math.random() * totalWeights);
		for (const entry of this.itemWeights) {
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
