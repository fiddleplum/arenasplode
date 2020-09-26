import { Birch } from 'birch';

export class WeaponComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get heldByEntity(): Birch.World.Entity | undefined {
		return this._heldByEntity;
	}

	setHeldByEntity(entity: Birch.World.Entity | undefined): void {
		this._heldByEntity = entity;
	}

	private _heldByEntity: Birch.World.Entity | undefined = undefined;
}
