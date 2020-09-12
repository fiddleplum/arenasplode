import { Birch } from '../../../birch/src/index';

export class PhysicsComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get radius(): number {
		return this._radius;
	}

	setRadius(radius: number): void {
		this._radius = radius;
	}

	get mass(): number {
		return this._mass;
	}

	setMass(mass: number): void {
		this._mass = mass;
	}

	get velocity(): Birch.Vector2Readonly {
		return this._velocity;
	}

	setVelocity(velocity: Birch.Vector2Readonly): void {
		this._velocity.copy(velocity);
	}

	get angularVelocity(): number {
		return this._angularVelocity;
	}

	setAngularVelocity(angularVelocity: number): void {
		this._angularVelocity = angularVelocity;
	}

	private _radius = .5;
	private _mass = 1;
	private _velocity = new Birch.Vector2();
	private _angularVelocity = 0;
}
