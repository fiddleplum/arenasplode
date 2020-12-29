import { ArenaSplodeApp } from 'app';
import { Projectile } from './projectile';

export class Bullet extends Projectile {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app);
		this.setRadius(0.125);
		this.setBounciness(0.75);
		this.sprite.setTextureName('items/bullet');
	}
}
