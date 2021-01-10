import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Entity } from './entity';

export class Shell extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/shell');
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/shell`),
		];
	}
}
