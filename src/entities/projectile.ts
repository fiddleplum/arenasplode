import { ArenaSplodeApp } from 'app';
import { Entity } from './entity';

export class Projectile extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 2);
		this.setFriction(1);
		this.setCanBeHeld(false);
	}

	get playerIndex(): number | undefined {
		return this._playerIndex;
	}

	setPlayerIndex(playerIndex: number | undefined): void {
		this._playerIndex = playerIndex;
	}

	private _playerIndex: number | undefined;
}
