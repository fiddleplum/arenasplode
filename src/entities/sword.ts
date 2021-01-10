import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Tile } from 'tile';
import { Character } from './character';
import { Entity } from './entity';
import { Nuke } from './nuke';

export class Sword extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/sword');
	}

	destroy(): void {
		super.destroy();
	}

	onTouch(entity: Entity): void {
		if (entity instanceof Nuke && this.heldBy !== undefined && this.heldBy.swinging) {
			// Push both entities back.
			this.pushBack(this.heldBy, 1);
		}
		if (entity instanceof Character && this.heldBy !== undefined && this.heldBy !== entity && this.heldBy.swinging) {
			// Push both entities back.
			this.pushBack(this.heldBy, 1);
			// Hurt the entity.
			entity.harm(this.heldBy.playerIndex, 0.03);
		}
		else if (entity instanceof Sword && this.heldBy !== undefined && entity.heldBy !== undefined && this.heldBy !== entity.heldBy) {
			this._playSwordSound();
			let pushAmount = 1;
			if (this.heldBy.swinging) {
				pushAmount += 1;
			}
			if (entity.heldBy.swinging) {
				pushAmount += 1;
			}
			this.pushBack(this.heldBy, pushAmount);
		}
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		const tile = level.getTile(tileCoords);
		if (tile !== undefined && tile.type === Tile.Type.Wall) {
			if ((this.heldBy !== undefined && this.heldBy.swinging) || this.velocity.norm > .5) {
				this._playSwordSound();
			}
		}
		super.onOverTile(level, tileCoords);
	}

	private _playSwordSound(): void {
		if (Date.now() / 1000 - this._swordSoundTime > .125) {
			const variant = Math.floor(3 * Math.random());
			const sound = this.app.engine.sounds.get(`sword${variant}`);
			sound.play();
			this.app.engine.sounds.release(sound);
			this._swordSoundTime = Date.now() / 1000;
		}
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		const promises: Promise<void>[] = [];
		promises.push(engine.renderer.textures.load(`items/sword`));
		for (let i = 0; i < 3; i++) {
			promises.push(engine.sounds.load(`sword${i}`));
		}
		return promises;
	}

	private _swordSoundTime: number = 0;
}
