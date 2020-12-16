import { Birch } from 'birch';

export class Entity {
	/** The destructor. */
	destroy(): void {
	}

	/** Gets the position. */
	get position(): Birch.Vector2Readonly {
		return this._position;
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		this._position.copy(position);
	}

	/** Gets the rotation in radians. */
	get rotation(): number {
		return this._rotation;
	}

	/** Sets the rotation in radians. */
	setRotation(rotation: number): void {
		this._rotation = rotation;
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

	/** Gets the velocity in units per second. */
	get velocity(): Birch.Vector2Readonly {
		return this._velocity;
	}

	/** Sets the velocity in units per second. */
	setVelocity(velocity: Birch.Vector2Readonly): void {
		this._velocity.copy(velocity);
	}

	/** Gets the angular velocity in radians per second. */
	get angularVelocity(): number {
		return this._angularVelocity;
	}

	/** Sets the angular velocity in radians per second. */
	setAngularVelocity(angularVelocity: number): void {
		this._angularVelocity = angularVelocity;
	}

	/** Gets the spring factor. When doing collision physics, this is the spring coefficient. */
	get springFactor(): number {
		return this._springFactor;
	}

	/** Sets the spring factor. When doing collision physics, this is the spring coefficient. */
	setSpringFactor(springFactor: number): void {
		this._springFactor = springFactor;
	}

	/** The update function. */
	update(_deltaTime: number): void {
	}

	/** The pre-render function. */
	preRender(): void {
	}

	/** The 2D position within the world. */
	private _position: Birch.Vector2 = new Birch.Vector2();

	/** The rotation in radians. */
	private _rotation: number = 0;

	/** The radius of the entity. */
	private _radius: number = 0.5;

	/** The mass of the entity. */
	private _mass = 1;

	/** The velocity of the entity. */
	private _velocity = new Birch.Vector2();

	/** The angular velocity of the entity. */
	private _angularVelocity = 0;

	/** When doing collision physics, this is the spring coefficient. */
	private _springFactor = 0;
}
