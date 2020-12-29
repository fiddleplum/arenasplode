import { Birch } from 'birch';
import { Entity } from './entity';

export class Shell extends Entity {
	/** The constructor. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		super(engine, scene, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/shell');
	}
}
