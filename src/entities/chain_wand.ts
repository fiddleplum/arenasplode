import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Entity } from './entity';

export class ChainWand extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/chain-wand');
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		return [
			engine.renderer.textures.load(`items/chain-wand`),
		];
	}
}
