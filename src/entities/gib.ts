import { ArenaSplodeApp } from 'app';
import { Entity } from './entity';

export class Gib extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp, filename: string) {
		super(app, 1);
		this.sprite.setTextureName(filename);
	}
}
