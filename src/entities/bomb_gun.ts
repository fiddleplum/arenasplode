import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Bomb } from './bomb';
import { Gun } from './gun';

export class BombGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bomb', Bomb);
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/bomb-gun`),
			engine.sounds.load(`bomb-gun`)
		];
	}
}
