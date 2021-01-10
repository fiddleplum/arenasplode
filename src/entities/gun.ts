import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Entity } from './entity';
import { Projectile } from './projectile';

export class Gun extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp, sprite: string, projectileType: { new (app: ArenaSplodeApp): Projectile }) {
		super(app, 1);
		this._projectileType = projectileType;
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/' + sprite + '-gun');
	}

	// get type(): 'normal' | 'bomb' | 'cake' | 'drunk' {
	// 	return this._type;
	// }

	// setType(type: 'normal' | 'bomb' | 'cake' | 'drunk'): void {
	// 	this._type = type;
	// 	if (this._type === 'normal') {
	// 		this.sprite.setTextureName('items/gun');
	// 	}
	// 	else if (this._type === 'bomb') {
	// 		this.sprite.setTextureName('items/bomb-gun');
	// 	}
	// 	else if (this._type === 'cake') {
	// 		this.sprite.setTextureName('items/cake-gun');
	// 	}
	// 	else if (this._type === 'drunk') {
	// 		this.sprite.setTextureName('items/drunk-gun');
	// 	}
	// }

	fire(): void {
		if (this.heldBy === undefined) {
			return;
		}
		this._playFireSound();
		const projectile = new this._projectileType(this.app);
		projectile.setPlayerIndex(this.heldBy.playerIndex);
		projectile.setScale(this.scale);
		const projectilePosition = Birch.Vector2.pool.get();
		projectilePosition.rot(Birch.Vector2.UnitX, this.heldBy.rotation);
		projectilePosition.addMult(this.heldBy.position, 1, projectilePosition, this.heldBy.radius * this.heldBy.scale + projectile.radius * projectile.scale * 1.2);
		projectile.setPosition(projectilePosition);
		Birch.Vector2.pool.release(projectilePosition);
		const projectileVelocity = Birch.Vector2.pool.get();
		projectileVelocity.rot(Birch.Vector2.UnitX, this.heldBy.rotation);
		projectileVelocity.mult(projectileVelocity, this._projectileSpeed);
		projectile.setVelocity(projectileVelocity);
		Birch.Vector2.pool.release(projectileVelocity);
		this.app.addEntity(projectile);
	}

	protected _playFireSound(): void {
	}

	protected _projectileSpeed: number = 15;

	private _projectileType: { new (app: ArenaSplodeApp): Projectile };
}
