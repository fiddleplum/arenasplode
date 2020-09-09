import { Birch } from '../../../birch/src/index';

export class PlayerComponent extends Birch.World.Component {
	constructor(entity: Birch.World.Entity) {
		super(entity);
	}

	private _height: number = 100;
}
