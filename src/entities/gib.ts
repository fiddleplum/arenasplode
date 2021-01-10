import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Character } from './character';
import { Entity } from './entity';

export class Gib extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp, filename: string) {
		super(app, 1);
		this.setRadius(0.2);
		this.sprite.setTextureName(filename);
		this.sprite.setTint(new Birch.Color(0.25, 0.25, 0.25, 1.0));
	}

	onTouch(entity: Entity): void {
		if (entity instanceof Character) {
			const push = Birch.Vector2.pool.get();
			push.sub(this.position, entity.position);
			push.setNorm(1);
			push.add(this.velocity, push);
			this.setVelocity(push);
			Birch.Vector2.pool.release(push);
		}
	}
}
