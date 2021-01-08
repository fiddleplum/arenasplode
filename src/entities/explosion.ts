import { ArenaSplodeApp } from 'app';
import { Entity } from './entity';

export class Explosion extends Entity {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 4);
		this.setRadius(4);
		this.sprite.setTextureName('items/explosion');
	}

	get playerIndex(): number | undefined {
		return this._playerIndex;
	}

	setPlayerIndex(playerIndex: number | undefined): void {
		this._playerIndex = playerIndex;
	}

	update(_deltaTime: number): void {
	}

	private _playerIndex: number | undefined;
}
