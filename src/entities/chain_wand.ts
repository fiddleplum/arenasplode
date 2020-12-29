import { ArenaSplodeApp } from 'app';
import { Entity } from './entity';

export class ChainWand extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/chain-wand');
	}
}
