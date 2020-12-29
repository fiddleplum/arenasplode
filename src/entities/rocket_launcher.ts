import { Birch } from 'birch';
import { Entity } from './entity';

export class RocketLauncher extends Entity {
	/** The constructor. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		super(engine, scene, 1);
		this.setCanBeHeld(true);
		this.sprite.setTextureName('items/rocket-launcher-normal');
	}

	get type(): 'normal' | 'cake' | 'drunk' {
		return this._type;
	}

	setType(type: 'normal' | 'cake' | 'drunk'): void {
		this._type = type;
		if (this._type === 'normal') {
			this.sprite.setTextureName('items/rocket-launcher-normal');
		}
		else if (this._type === 'cake') {
			this.sprite.setTextureName('items/rocket-launcher-cake');
		}
		else if (this._type === 'drunk') {
			this.sprite.setTextureName('items/rocket-launcher-normal-drunk');
		}
	}

	private _type: 'normal' | 'cake' | 'drunk' = 'normal';
}
