import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Entity } from './entity';

export class Explosion extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 4);
		this.setRadius(0);
		this.setBounciness(-1);
		this.sprite.setTextureName('items/explosion');

		const sound = this.app.engine.sounds.get(`explosion`);
		sound.play();
		this.app.engine.sounds.release(sound);

		// Set the spawn time for timing the explosion.
		this._spawnTime = Date.now() / 1000;
	}

	get playerIndex(): number | undefined {
		return this._playerIndex;
	}

	setPlayerIndex(playerIndex: number | undefined): void {
		this._playerIndex = playerIndex;
	}

	update(_deltaTime: number): void {
		const now = Date.now() / 1000;
		if (now - this._spawnTime < 0.5) {
			this.setRadius((now - this._spawnTime) / 0.5 * 1.5);
		}
		else {
			this.app.removeAndDestroyEntity(this);
		}
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/explosion`),
			engine.sounds.load(`explosion`)
		];
	}

	/** The time when the explosion was created. */
	private _spawnTime: number;

	/** The index of the player who created this. */
	private _playerIndex: number | undefined;
}
