import { Birch } from '../../../birch/src/index';

export class PhysicsComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get mass(): number {
		return this._mass;
	}

	set mass(mass) {
		this._mass = mass;
	}

	get velocity(): Vector2Readonly {
		return this._velocity;
	}

	set velocity(velocity) {
		this._velocity.copy(velocity);
	}

	get angularVelocity(): number {
		return this._angularVelocity;
	}

	set angularVelocity(angularVelocity) {
		this._angularVelocity = angularVelocity;
	}

	private _mass = 1;
	private _velocity = new Birch.Vector2();
	private _angularVelocity = 0;
}
