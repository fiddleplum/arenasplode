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
		scaleXY.set(2 * this._radius * scale, 2 * this._radius * scale);
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

	/** Sets the bounciness. */
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
			const frictionForce = Birch.Vector2.pool.get();
			frictionForce.mult(this._velocity, -this._friction * deltaTime / velocityNorm);
			this._velocity.addMult(this._velocity, 1, frictionForce, 1);
			Birch.Vector2.pool.release(frictionForce);
		}
		else {
			this._velocity.set(0, 0);
		}
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
		if (tile.type === Tile.Type.Wall) {
			const offset = Birch.Vector2.pool.get();
			this.getClosestPoint(offset, tileCoords);
			offset.sub(this.position, offset);
			const offsetNorm = offset.norm;
			if (offsetNorm > 0 && this.radius > offsetNorm) {
				offset.mult(offset, (this.radius - offsetNorm) / offsetNorm);
				const newPosition = Birch.Vector2.pool.get();
				newPosition.addMult(this.position, 1, offset, 1);
				this.setPosition(newPosition);
				Birch.Vector2.pool.release(newPosition);
				const newVelocity = Birch.Vector2.pool.get();
				offset.normalize(offset);
				newVelocity.addMult(this.velocity, 1, offset, Math.max(0, -(1 + this._bounciness) * this.velocity.dot(offset)));
				this.setVelocity(newVelocity);
				Birch.Vector2.pool.release(newVelocity);
			}
			Birch.Vector2.pool.release(offset);
		}
	}

	protected getClosestPoint(closestPoint: Birch.Vector2, tileCoords: Birch.Vector2): void {
		const tileBounds = Birch.Rectangle.pool.get();
		tileBounds.set(tileCoords.x, tileCoords.y, 1, 1);
		tileBounds.closest(closestPoint, this.position, false);
		Birch.Rectangle.pool.release(tileBounds);
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

	/** The friction of the entity. */
	private _friction = 16;

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
