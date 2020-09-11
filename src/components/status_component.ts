import { Birch } from '../../../birch/src/index';

export class StatusComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	get stuck(): boolean {
		return this._stuck;
	}

	set stuck(stuck) {
		this._stuck = stuck;
	}

	get drunk(): boolean {
		return this._drunk;
	}

	set drunk(drunk) {
		this._drunk = drunk;
	}

	get tilted(): boolean {
		return this._tilted;
	}

	set tilted(tilted) {
		this._tilted = tilted;
	}

	drunkRotation = 0;
	drunkRotationSpeed = 0;

	private _stuck = false;
	private _drunk = false;
	private _tilted = false;

	private _hitPoints: number = 100;
}
