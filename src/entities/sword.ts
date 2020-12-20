import { Birch } from 'birch';
import { SpriteEntity } from 'sprite_entity';

export class Sword extends SpriteEntity {
	/** The constructor. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		super(engine, scene, 1);
		this.setTextureName('items/sword');
	}

	static weight = 1;
}