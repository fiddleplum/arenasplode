import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Character } from 'entities/character';
import { Level } from 'level';
import { Sprite } from 'sprite';
import { Tile } from 'tile';
import { FastOrderedSet } from '../../../birch/src/internal';

export class Entity {
	/** The constructor.
	  * @param level - The map is at 0, items are at 1, held items are at 2, players are at 3. */
	constructor(app: ArenaSplodeApp, level: number) {
		this._app = app;
		this._sprite = new Sprite(app.engine, app.scene, level);
	}

	/** The destructor. */
	destroy(): void {
		this._sprite.destroy();
	}

	/** Gets the position. */
	get position(): Birch.Vector2Readonly {
		return this._position;
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		this._position.copy(position);
		this._sprite.setPosition(position);
	}

	/** Gets the rotation in radians. */
	get rotation(): number {
		return this._rotation;
	}

	/** Sets the rotation in radians. */
	setRotation(rotation: number): void {
		this._rotation = rotation;
		this._sprite.setRotation(rotation);
	}

	/** Gets the scale. */
	get scale(): number {
		return this._scale;
	}

	/** Sets the scale. */
	setScale(scale: number): void {
		this._scale = scale;
		const scaleXY = Birch.Vector2.pool.get();
		scaleXY.set(2 * this._radius * this._scale, 2 * this._radius * this._scale);
		this._sprite.setScale(scaleXY);
		Birch.Vector2.pool.release(scaleXY);
	}

	/** Gets the velocity in units per second. */
	get velocity(): Birch.Vector2Readonly {
		return this._velocity;
	}

	/** Sets the velocity in units per second. */
	setVelocity(velocity: Birch.Vector2Readonly): void {
		this._velocity.copy(velocity);
		if (this._velocity.normSq > 12 * 12) {
			this._velocity.setNorm(12);
		}
	}

	/** Gets the angular velocity in radians per second. */
	get angularVelocity(): number {
		return this._angularVelocity;
	}

	/** Sets the angular velocity in radians per second. */
	setAngularVelocity(angularVelocity: number): void {
		this._angularVelocity = angularVelocity;
	}

	/** Gets the radius. */
	get radius(): number {
		return this._radius;
	}

	/** Sets the radius. */
	setRadius(radius: number): void {
		this._radius = radius;
		const scaleXY = Birch.Vector2.pool.get();
		scaleXY.set(2 * this._radius * this._scale, 2 * this._radius * this._scale);
		this._sprite.setScale(scaleXY);
		Birch.Vector2.pool.release(scaleXY);
	}

	/** Gets the mass. */
	get mass(): number {
		return this._mass;
	}

	/** Sets the mass. */
	setMass(mass: number): void {
		this._mass = mass;
	}

	/** Gets the friction. */
	get friction(): number {
		return this._friction;
	}

	/** Sets the friction. */
	setFriction(friction: number): void {
		this._friction = friction;
	}

	/** Gets the bounciness. */
	get bounciness(): number {
		return this._bounciness;
	}

	/** Sets the bounciness. A negative number means it doesn't bound off of walls. */
	setBounciness(bounciness: number): void {
		this._bounciness = bounciness;
	}

	/** Gets the character holding this, if any. */
	get heldBy(): Character | undefined {
		return this._heldBy;
	}

	/** Sets the character holding this, if any. */
	setHeldBy(character: Character | undefined): void {
		this._heldBy = character;
		if (character !== undefined) {
			this.sprite.setLevel(2);
		}
		else {
			this.sprite.setLevel(1);
		}
	}

	/** Gets whether the entity can be picked up. */
	get canBeHeld(): boolean {
		return this._canBeHeld;
	}

	/** Sets whether the entity can be picked up. */
	protected setCanBeHeld(canBeHeld: boolean): void {
		this._canBeHeld = canBeHeld;
	}

	/** Gets the sprite. */
	protected get sprite(): Sprite {
		return this._sprite;
	}

	/** Gets the app. */
	protected get app(): ArenaSplodeApp {
		return this._app;
	}

	/** The update function. */
	update(_deltaTime: number): void {
	}

	/** The pre-render function. */
	preRender(): void {
		this._sprite.setPosition(this._position);
		this._sprite.setRotation(this._rotation);
	}

	/** Does the iteraction physics. */
	doPhysics(deltaTime: number): void {
		if (this._heldBy !== undefined) {
			return;
		}
		// Max speed.
		if (this._velocity.normSq > 10000000000) {
			this._velocity.setNorm(100000);
		}
		// Friction
		const velocityNorm = this._velocity.norm;
		if (this._friction * deltaTime < velocityNorm) {
			this._velocity.setNorm(velocityNorm - this._friction * deltaTime);
		}
		else {
			this._velocity.set(0, 0);
		}
		if (this._friction * deltaTime < this._angularVelocity) {
			this._angularVelocity -= this._friction * deltaTime;
		}
		else {
			this._angularVelocity = 0;
		}
		// Apply the velocity and angular velocity.
		this._position.addMult(this._position, 1, this._velocity, deltaTime);
		this._rotation += this._angularVelocity * deltaTime;
	}

	onTouch(_entity: Entity): void {
	}

	onOverTile(level: Level, tileCoords: Birch.Vector2): void {
		// If it's a wall, move it away.
		const tile = level.getTile(tileCoords);
		if (tile === undefined) {
			return;
		}
		if (this._bounciness >= 0 && tile.type === Tile.Type.Wall) {
			const offset = Birch.Vector2.pool.get();
			const contains = this.getClosestPoint(offset, tileCoords);
			offset.sub(this._position, offset);
			const offsetNorm = offset.norm;
			if (0 < offsetNorm && offsetNorm < this._radius * this._scale) {
				if (contains) {
					offset.mult(offset, (-this._radius * this._scale - offsetNorm) / offsetNorm);
				}
				else {
					offset.mult(offset, (this._radius * this._scale - offsetNorm) / offsetNorm);
				}
				const newPosition = Birch.Vector2.pool.get();
				newPosition.add(this._position, offset);
				this.setPosition(newPosition);
				Birch.Vector2.pool.release(newPosition);
				const newVelocity = Birch.Vector2.pool.get();
				offset.normalize(offset);
				newVelocity.addMult(this._velocity, 1, offset, Math.max(0, -(1 + this._bounciness) * this._velocity.dot(offset)));
				this.setVelocity(newVelocity);
				Birch.Vector2.pool.release(newVelocity);
			}
			Birch.Vector2.pool.release(offset);
		}
	}

	/** Gets the tile edge closest to the entity. Returns true if the tile contains the entity position. */
	protected getClosestPoint(closestPoint: Birch.Vector2, tileCoords: Birch.Vector2): boolean {
		const tileBounds = Birch.Rectangle.pool.get();
		tileBounds.set(tileCoords.x, tileCoords.y, 1, 1);
		const contains = tileBounds.closest(closestPoint, this._position, false);
		Birch.Rectangle.pool.release(tileBounds);
		return contains;
	}

	/** Push both this and the other entity away from each other by the velocity amount. */
	pushBack(entity: Entity, amount: number): void {
		const push = Birch.Vector2.pool.get();
		push.sub(this._position, entity.position);
		push.setNorm(amount);
		this._velocity.add(this._velocity, push);
		push.addMult(entity.velocity, 1, push, -1);
		entity.setVelocity(push);
		Birch.Vector2.pool.release(push);
	}

	/** Load the resources needed for the entity. */
	static loadResources(_engine: Birch.Engine): Promise<void>[] {
		return [];
	}

	// FRAME AND FRAME DERIVATIVES

	/** The 2D position within the world. */
	private _position: Birch.Vector2 = new Birch.Vector2();

	/** The rotation in radians. */
	private _rotation: number = 0;

	/** The scale of the entity. */
	private _scale: number = 1;

	/** The velocity of the entity. */
	private _velocity = new Birch.Vector2();

	/** The angular velocity of the entity. */
	private _angularVelocity = 0;

	// PHYSICS

	/** The radius of the entity. */
	private _radius: number = 0.5;

	/** The mass of the entity. */
	private _mass = 1;

	/** The friction of the entity with the floor. */
	private _friction = 32;

	/** When doing collision physics, this is the spring coefficient. */
	private _bounciness = 0;

	// INTERACTION

	/** The character holding this, if any. */
	private _heldBy: Character | undefined;

	/** The flag whether the entity can be picked up. */
	private _canBeHeld = false;

	/** The set of entities this is currently intersecting with. */
	intersectingEntities: Birch.FastOrderedSet<Entity> = new FastOrderedSet();

	// SYSTEMS

	private _app: ArenaSplodeApp;

	// SPRITE

	/** The sprite for the entity. */
	private _sprite: Sprite;
}
