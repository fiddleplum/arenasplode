import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Bullet } from './bullet';
import { Gun } from './gun';

export class BulletGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bullet', Bullet);
	}

	protected _playFireSound(): void {
		const sound = this.app.engine.sounds.get(`bullet-gun`);
		sound.play();
		this.app.engine.sounds.release(sound);
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/bullet-gun`),
			engine.sounds.load(`bullet-gun`)
		];
	}
}
