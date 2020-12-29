import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Bullet } from './bullet';
import { Entity } from './entity';
import { Projectile } from './projectile';

export class Gun extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/gun');
	}

	get type(): 'normal' | 'bomb' | 'cake' | 'drunk' {
		return this._type;
	}

	setType(type: 'normal' | 'bomb' | 'cake' | 'drunk'): void {
		this._type = type;
		if (this._type === 'normal') {
			this.sprite.setTextureName('items/gun');
		}
		else if (this._type === 'bomb') {
			this.sprite.setTextureName('items/bomb-gun');
		}
		else if (this._type === 'cake') {
			this.sprite.setTextureName('items/cake-gun');
		}
		else if (this._type === 'drunk') {
			this.sprite.setTextureName('items/drunk-gun');
		}
	}

	fire(): void {
		if (this.heldBy === undefined) {
			return;
		}
		let projectile: Projectile;
		if (this._type === 'normal') {
			projectile = new Bullet(this.app);
		}
		else if (this._type === 'bomb') {
			projectile = new Bullet(this.app);
		}
		else if (this._type === 'cake') {
			projectile = new Bullet(this.app);
		}
		else { // drunk
			projectile = new Bullet(this.app);
		}
		projectile.setPlayerIndex(this.heldBy.playerIndex);
		projectile.setScale(this.scale);
		const projectilePosition = Birch.Vector2.pool.get();
		projectilePosition.rot(Birch.Vector2.UnitX, this.heldBy.rotation);
		projectilePosition.addMult(this.heldBy.position, 1, projectilePosition, this.heldBy.radius * this.heldBy.scale + projectile.radius * projectile.scale * 1.2);
		projectile.setPosition(projectilePosition);
		Birch.Vector2.pool.release(projectilePosition);
		const projectileVelocity = Birch.Vector2.pool.get();
		projectileVelocity.rot(Birch.Vector2.UnitX, this.heldBy.rotation);
		let speed = 1000 / 64;
		if (this._type === 'cake') {
			speed *= .6;
		}
		projectileVelocity.mult(projectileVelocity, speed);
		projectile.setVelocity(projectileVelocity);
		Birch.Vector2.pool.release(projectileVelocity);
		this.app.addEntity(projectile);
	}

	private _type: 'normal' | 'bomb' | 'cake' | 'drunk' = 'normal';
}
