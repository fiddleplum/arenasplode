import { Birch } from 'birch';
import { Entity } from './entity';
import { ChainWand } from './chain_wand';
import { Nuke } from './nuke';
import { Gun } from './gun';
import { Shell } from './shell';
import { Sword } from './sword';
import { ArenaSplodeApp } from 'app';

export class Character extends Entity {
	constructor(app: ArenaSplodeApp) {
		super(app, 3);
		this.sprite.setTextureName('characters/bob');
		this.setBounciness(0.2);
	}

	get playerIndex(): number | undefined {
		return this._playerIndex;
	}

	setPlayerIndex(playerIndex: number): void {
		this._playerIndex = playerIndex;
	}

	get holdingEntity(): Entity | undefined {
		return this._holdingEntity;
	}

	setHoldingEntity(holdingEntity: Entity | undefined): void {
		this._holdingEntity = holdingEntity;
	}

	get swinging(): boolean {
		return this._swinging;
	}

	protected setMaxSpeed(maxSpeed: number): void {
		this._maxSpeed = maxSpeed;
	}

	useHeld(): void {
		if (this._holdingEntity instanceof Sword || this._holdingEntity instanceof ChainWand) {
			this._swinging = true;
			this._heldOrientationOffset = Math.PI / 4;
			this._heldRadiusOffset = this.radius * .5;
		}
		else if (this._holdingEntity instanceof Gun) {
			this._holdingEntity.fire();
		}
		else if (this._holdingEntity instanceof Shell) {
			// Ptr<Object> o = objectHeld;
			// Vector2f d = Vector2f(std::cos(getOrientation()), std::sin(getOrientation()));
			// setObjectHeld(Ptr<Object>());
			// o->setHeld(Ptr<Character>());
			// o->setPosition(getPosition() + 32.f * d);
			// o->setVelocity(400.f * d);
			// o.as<Shell>()->setOwned(getPlayer()->getNumber());
		}
		else if (this._holdingEntity instanceof Nuke) {
			// objectHeld.as<Nuke>()->explode(getPlayer()->getNumber());
		}
	}

	update(deltaTime: number): void {
		super.update(deltaTime);
		if(this.velocity.norm > this._maxSpeed) {
			const newVelocity = Birch.Vector2.pool.get();
			newVelocity.copy(this.velocity);
			newVelocity.setNorm(this._maxSpeed);
			this.setVelocity(newVelocity);
			Birch.Vector2.pool.release(newVelocity);
		}
		if(this._swinging) {
			this._heldOrientationOffset -= 2 * Math.PI * deltaTime;
			if(this._heldOrientationOffset < -Math.PI / 4) {
				this._swinging = false;
				this._heldOrientationOffset = 0;
				this._heldRadiusOffset = 0;
			}
		}
	}

	preRender(): void {
		super.preRender();
		if (this._holdingEntity !== undefined) {
			this._holdingEntity.setScale(this.scale);
			const heldPosition = Birch.Vector2.pool.get();
			heldPosition.rot(Birch.Vector2.UnitX, this.rotation + this._heldOrientationOffset);
			heldPosition.mult(heldPosition, this.radius * this.scale + this._heldRadiusOffset);
			heldPosition.add(this.position, heldPosition);
			this._holdingEntity.setPosition(heldPosition);
			Birch.Vector2.pool.release(heldPosition);
			this._holdingEntity.setRotation(this.rotation + this._heldOrientationOffset);
		}
	}

	private _playerIndex: number | undefined;

	private _holdingEntity: Entity | undefined;
	private _heldOrientationOffset: number = 0;
	private _heldRadiusOffset: number = 0;
	private _swinging: boolean = false;

	private _maxSpeed = 20;
}
