import { ArenaSplodeApp } from 'app';
import { Bomb } from './bomb';
import { Gun } from './gun';

export class BombGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bomb', Bomb);
	}
}
