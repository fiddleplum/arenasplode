import { Birch } from 'birch';
import { Entity } from './entity';
import { ChainWand } from './chain_wand';
import { Nuke } from './nuke';
import { Gun } from './gun';
import { Shell } from './shell';
import { Sword } from './sword';
import { ArenaSplodeApp } from 'app';
import { Gib } from './gib';

export class Character extends Entity {
	constructor(app: ArenaSplodeApp, playerIndex: number, name: string) {
		super(app, 3);
		// Set the player index.
		this._playerIndex = playerIndex;

		// Set the sprite texture.
		this.sprite.setTextureName('characters/' + name);

		// Set up physical properties.
		this.setBounciness(0.2);

		// Set the file name for the gib pieces.
		this._gibName = `characters/${name}`;
	}

	get playerIndex(): number {
		return this._playerIndex;
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

	get health(): number {
		return this._health;
	}

	protected setMaxSpeed(maxSpeed: number): void {
		this._maxSpeed = maxSpeed;
	}

	incNumKills(): void {
		this._numKills += 1;
		if (this._numKills % 3 == 0) {
			const multikillSound = this.app.engine.sounds.get(`multikill`);
			multikillSound.play();
			this.app.engine.sounds.release(multikillSound);
		}
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

	harm(playerIndex: number | undefined, amount: number): void {
		if (this._health === 0) {
			return;
		}
		if (amount > this._health) {
			amount = this._health;
		}
		this._health -= amount;
		this.app.getPlayer(this._playerIndex)!.updateHealthBar();
		if (Date.now() / 1000 - this._harmSoundTime > .125) {
			const variant = Math.floor(3 * Math.random());
			if (this._health > 0) {
				const hurtSound = this.app.engine.sounds.get(`hurt${variant}`);
				hurtSound.play();
				this.app.engine.sounds.release(hurtSound);
			}
			this._harmSoundTime = Date.now() / 1000;
		}
		if (playerIndex !== undefined && playerIndex !== this._playerIndex) {
			const otherPlayer = this.app.getPlayer(playerIndex)!;
			otherPlayer.addScore(amount);
			if (this._health <= 0) {
				otherPlayer.addScore(10);
				otherPlayer.character?.incNumKills();
			}
		}
		if (this._health <= 0) {
			// Play the death sound.
			const variant = Math.floor(3 * Math.random());
			const deathSound = this.app.engine.sounds.get(`death${variant}`);
			deathSound.play();
			this.app.engine.sounds.release(deathSound);
			// Drop any item held.
			this.dropHeldItem();
			// Add some gibs.
			for (let i = 0; i < 4; i++) {
				const gib = new Gib(this.app, this._gibName);
				gib.setScale(this.scale);
				gib.setPosition(this.position);
				const gibVelocity = Birch.Vector2.pool.get();
				gibVelocity.setX(15 * (Math.random() * 2 - 1));
				gibVelocity.setY(15 * (Math.random() * 2 - 1));
				gib.setVelocity(gibVelocity);
				Birch.Vector2.pool.release(gibVelocity);
				gib.setAngularVelocity(15 * (Math.random() * 2 - 1));
				this.app.addEntity(gib);
			}
			// Notify the player that the character died.
			this.app.getPlayer(this._playerIndex)!.die();
		}
	}

	/** Drop a held item. */
	dropHeldItem(): void {
		if (this._holdingEntity !== undefined) {
			const heldItem = this._holdingEntity;
			// Set the item as not held.
			this._holdingEntity = undefined;
			heldItem.setHeldBy(undefined);
			// Do the toss physics.
			const newVelocity = Birch.Vector2.pool.get();
			newVelocity.rot(Birch.Vector2.UnitX, this.rotation);
			newVelocity.addMult(newVelocity, 5.0, this.velocity, 1);
			heldItem.setVelocity(newVelocity);
			Birch.Vector2.pool.release(newVelocity);
		}
	}

	/** Pick up and item or drop the equipped one. */
	pickUpOrDrop(): void {
		// Dropping.
		if (this.holdingEntity !== undefined) {
			this.dropHeldItem();
		}
		// Picking up.
		else {
			// Get the nearest entity intersecting with the character that can be picked up.
			let nearestIntersectingEntity: Entity | undefined = undefined;
			let nearestIntersectingDistance = Number.POSITIVE_INFINITY;
			for (const intersectingEntity of this.intersectingEntities) {
				// If it can be held and isn't currently held.
				if (intersectingEntity.canBeHeld && intersectingEntity.heldBy === undefined) {
					const distance = this.position.distance(intersectingEntity.position);
					if (distance < nearestIntersectingDistance) {
						nearestIntersectingDistance = distance;
						nearestIntersectingEntity = intersectingEntity;
					}
				}
			}
			// If there was an valid holdable entity, do it.
			if (nearestIntersectingEntity !== undefined) {
				this.setHoldingEntity(nearestIntersectingEntity);
				nearestIntersectingEntity.setHeldBy(this);
			}
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

	static async getCharacterSpriteList(): Promise<void> {
		const text = await fetch('assets/sprites/characters/list.txt').then(response => response.text());
		const sprites = text.split('\n');
		for (const sprite of sprites) {
			if (sprite !== '') {
				this.characterSpriteList.push(sprite);
			}
		}
	}

	/** Load the resources needed for the entity. */
	static loadResources(engine: Birch.Engine): Promise<void>[] {
		const promises: Promise<void>[] = [];
		promises.push(this.getCharacterSpriteList().then(() => {
			const p: Promise<void>[] = [];
			for (let i = 0; i < this.characterSpriteList.length; i++) {
				p.push(engine.renderer.textures.load(`characters/${this.characterSpriteList[i]}`));
			}
			return Promise.all(p) as unknown as Promise<void>;
		}));
		for (let i = 0; i < 3; i++) {
			promises.push(engine.sounds.load(`hurt${i}`));
			promises.push(engine.sounds.load(`death${i}`));
		}
		promises.push(engine.sounds.load(`multikill`));
		return promises;
	}

	static characterSpriteList: string[] = [];

	private _playerIndex: number;

	private _holdingEntity: Entity | undefined;
	private _heldOrientationOffset: number = 0;
	private _heldRadiusOffset: number = 0;
	private _swinging: boolean = false;

	private _maxSpeed = 20;

	private _health: number = 1;
	private _harmSoundTime: number = 0;
	private _numKills: number = 0;
	private _gibName: string = '';
}
