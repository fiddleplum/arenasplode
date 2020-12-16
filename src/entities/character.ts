import { Birch } from 'birch';
import { SpriteEntity } from 'sprite_entity';

export class Character extends SpriteEntity {
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		super(engine, scene, 2);
		this.setTextureName('characters/bob');
	}
}
