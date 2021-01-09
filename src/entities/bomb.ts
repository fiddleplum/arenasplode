import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Tile } from 'tile';
import { Character } from './character';
import { Entity } from './entity';
import { Explosion } from './explosion';
import { Projectile } from './projectile';

export class Bomb extends Projectile {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app);
		this.setBounciness(0.25);
		this.sprite.setTextureName('items/bomb');
	}

	onTouch(entity: Entity): void {
		if (entity instanceof Character) {
			this._explode();
		}
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		// If it's a wall, explode.
		const tile = level.getTile(tileCoords);
		if (tile === undefined) {
			return;
		}
		if (tile.type === Tile.Type.Wall) {
			this._explode();
		}
	}

	private _explode(): void {
		const explosion = new Explosion(this.app);
		explosion.setPosition(this.position);
		explosion.setScale(this.scale);
		explosion.setPlayerIndex(this.playerIndex);
		this.app.addEntity(explosion);
		this.app.removeAndDestroyEntity(this);
	}
}
