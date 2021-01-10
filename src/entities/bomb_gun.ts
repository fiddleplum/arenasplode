import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Bomb } from './bomb';
import { Gun } from './gun';

export class BombGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bomb', Bomb);
		this._projectileSpeed = 5;
	}

	protected _playFireSound(): void {
		const sound = this.app.engine.sounds.get(`bomb-gun`);
		sound.play();
		this.app.engine.sounds.release(sound);
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/bomb-gun`),
			engine.sounds.load(`bomb-gun`)
		];
	}
}
