import { Birch } from 'birch';
import { Level } from 'level';
import { Tile } from 'tile';
import { Entity } from './entity';

export class Sword extends Entity {
	/** The constructor. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		super(engine, scene, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/sword');

		// Load the sword sounds.
		for (let i = 0; i < 3; i++) {
			this.engine.soundSystem.load(`assets/sounds/sword${i}.ogg`);
		}
	}

	destroy(): void {
		for (let i = 0; i < 3; i++) {
			this.engine.soundSystem.unload(`assets/sounds/sword${i}.ogg`);
		}
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		const tile = level.getTile(tileCoords);
		if (this.heldBy !== undefined && this.heldBy.swinging) {
			if (tile !== undefined && tile.type === Tile.Type.Wall) {
				if (Date.now() / 1000 - this._lastPlayedSwordSound > .25) {
					const variant = Math.floor(3 * Math.random());
					this.engine.soundSystem.play(`assets/sounds/sword${variant}.ogg`);
					this._lastPlayedSwordSound = Date.now();
				}
			}
		}
	}

	private _lastPlayedSwordSound: number = 0;
}
