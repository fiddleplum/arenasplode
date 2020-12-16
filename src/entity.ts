import { Birch } from 'birch';

export class Entity {
	/** The constructor.
	 *  @param level - The level of the entity. The map is at 0, items are at 1, players are at 2.
	*/
	constructor(level: number) {
		this._level = level;
	}

	/** Gets the position. */
	get position(): Birch.Vector2Readonly {
		return this._position;
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		this._position.copy(position);
	}

	/** Gets the rotation in radians. */
	get rotation(): number {
		return this._rotation;
	}

	/** Sets the rotation in radians. */
	setRotation(rotation: number): void {
		this._rotation = rotation;
	}

	/** Gets the scale as the diameter of the entity. */
	get scale(): number {
		return this._scale;
	}

	/** Sets the scale as the diameter of the entity. */
	setScale(scale: number): void {
		this._scale = scale;
	}

	/** Gets the level. The map is at 0, items are at 1, players are at 2. */
	get level(): number {
		return this._level;
	}

	/** The 2D position within the world. */
	private _position: Birch.Vector2 = new Birch.Vector2();

	/** The rotation in radians. */
	private _rotation: number = 0;

	/** The scale of the entity. 1 means it has a diameter of length 1. */
	private _scale: number = 1;

	/** The level of the entity. The map is at 0, items are at 1, players are at 2. */
	private _level: number = 0;
}
