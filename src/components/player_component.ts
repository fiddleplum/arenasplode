import { Birch } from 'birch';
import { WeaponComponent } from './weapon_component';

export class PlayerComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get index(): number {
		return this._index;
	}

	setIndex(index: number): void {
		this._index = index;
	}

	get stuck(): boolean {
		return this._stuck;
	}

	setStuck(stuck: boolean): void {
		this._stuck = stuck;
	}

	get drunk(): boolean {
		return this._drunk;
	}

	setDrunk(drunk: boolean): void {
		this._drunk = drunk;
	}

	get tilted(): boolean {
		return this._tilted;
	}

	setTilted(tilted: boolean): void {
		this._tilted = tilted;
	}

	get weaponHeld(): WeaponComponent | undefined {
		return this._weaponHeld;
	}

	setWeaponHeld(weaponHeld: WeaponComponent | undefined): void {
		this._weaponHeld = weaponHeld;
	}

	drunkRotation = 0;
	drunkRotationSpeed = 0;

	private _index = 0;
	private _stuck = false;
	private _drunk = false;
	private _tilted = false;
	private _weaponHeld: WeaponComponent | undefined = undefined;

	private _hitPoints: number = 100;
}
