import { ArenaSplodeApp } from 'app';
import { Bullet } from './bullet';
import { Gun } from './gun';

export class BulletGun extends Gun {
	/** The constructor. */
	constructor(app: ArenaSplodeApp) {
		super(app, 'bullet', Bullet);
	}
}
