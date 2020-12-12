import { Birch } from 'birch';

export class PhysicsComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
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

	get solid(): boolean {
		return this._solid;
	}

	setSolid(solid: boolean): void {
		this._solid = solid;
	}

	get boundEntities(): Birch.FastMap<Birch.World.Entity, BindParams> {
		return this._boundEntities;
	}

	private _mass = 1;
	private _velocity = new Birch.Vector2();
	private _angularVelocity = 0;
	private _solid = false;
	private _boundEntities: Birch.FastMap<Birch.World.Entity, BindParams> = new Birch.FastMap();
}

export interface BindParams {
	springCoefficient: number,
	offset: Birch.Vector2,
	usesRotation: boolean
}
