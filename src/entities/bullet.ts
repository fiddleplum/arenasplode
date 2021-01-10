import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Tile } from 'tile';
import { Projectile } from './projectile';

export class Bullet extends Projectile {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app);
		this.setRadius(0.125);
		this.setBounciness(0.75);
		this.sprite.setTextureName('items/bullet');
	}

	update(_deltaTime: number): void {
		if (this.velocity.normSq < 0.1) {
			this.app.removeAndDestroyEntity(this);
		}
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		// If it's a wall, play a sound.
		const tile = level.getTile(tileCoords);
		if (tile === undefined) {
			return;
		}
		if (tile.type === Tile.Type.Wall) {
			const bulletSound = this.app.engine.sounds.get(`bullet`);
			bulletSound.play();
			this.app.engine.sounds.release(bulletSound);
		}
		super.onOverTile(level, tileCoords);
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/bullet`),
			engine.sounds.load(`bullet`)
		];
	}
}
