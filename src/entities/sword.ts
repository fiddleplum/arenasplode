import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Tile } from 'tile';
import { Entity } from './entity';

export class Sword extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/sword');

		// Load the sword sounds.
		for (let i = 0; i < 3; i++) {
			this.app.engine.soundSystem.load(`assets/sounds/sword${i}.ogg`);
		}
	}

	destroy(): void {
		for (let i = 0; i < 3; i++) {
			this.app.engine.soundSystem.unload(`assets/sounds/sword${i}.ogg`);
		}
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		super.onOverTile(level, tileCoords);
		const tile = level.getTile(tileCoords);
		if (tile !== undefined && tile.type === Tile.Type.Wall) {
			if ((this.heldBy !== undefined && this.heldBy.swinging) || this.velocity.norm > 1) {
				if (Date.now() / 1000 - this._lastPlayedSwordSound > .125) {
					const variant = Math.floor(3 * Math.random());
					this.app.engine.soundSystem.play(`assets/sounds/sword${variant}.ogg`);
					this._lastPlayedSwordSound = Date.now() / 1000;
				}
			}
		}
	}

	private _lastPlayedSwordSound: number = 0;
}
