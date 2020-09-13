import { Birch } from '../../../birch/src/index';

export class WeaponComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get held(): boolean {
		return this._held;
	}

	setHeld(held: boolean): void {
		this._held = held;
	}

	private _held: boolean = false;
}
