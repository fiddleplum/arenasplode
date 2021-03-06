import { Birch } from 'birch';

/** The frame 2D component. */
export class Frame2DComponent extends Birch.World.Component {
	/** Gets the position. */
	get position(): Birch.Vector2Readonly {
		return this._position;
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		if (!this._position.equals(position)) {
			this._position.copy(position);
			this.sendEvent(Frame2DComponent.FrameChanged);
		}
	}

	/** Gets the rotation. */
	get rotation(): number {
		return this._rotation;
	}

	/** Sets the rotation. */
	setRotation(rotation: number): void {
		if (this._rotation !== rotation) {
			this._rotation = Birch.Num.wrap(rotation, -Math.PI, Math.PI);
			this.sendEvent(Frame2DComponent.FrameChanged);
		}
	}

	/** Gets the level. */
	get level(): number {
		return this._level;
	}

	/** Sets the level. */
	setLevel(level: number): void {
		if (this._level !== level) {
			this._level = level;
			this.sendEvent(Frame2DComponent.FrameChanged);
		}
	}

	/** Gets the radius. */
	get radius(): number {
		return this._radius;
	}

	/** Sets the radius. */
	setRadius(radius: number): void {
		if (this._radius !== radius) {
			this._radius = radius;
			this.sendEvent(Frame2DComponent.FrameChanged);
		}
	}

	/** The position. */
	private _position = new Birch.Vector2();

	/** The rotation. */
	private _rotation = 0;

	/** The level. Higher means in front. */
	private _level = 0;

	/** The radius. */
	private _radius = .5;

	/** The event sent when the frame has changed. */
	static FrameChanged = Symbol('FrameChanged');
}
