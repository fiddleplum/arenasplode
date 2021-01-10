import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Bullet } from './bullet';
import { Gun } from './gun';

export class BulletGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bullet', Bullet);
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/bullet-gun`),
			engine.sounds.load(`bullet-gun`)
		];
	}
}
