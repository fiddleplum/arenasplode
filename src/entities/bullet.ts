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

	update(_deltaTime: number): void {
		if (this.velocity.normSq < 0.1) {
			this.app.removeAndDestroyEntity(this);
		}
	}
}
