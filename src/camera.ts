import { Birch } from 'birch';
import { Entity } from 'entity';

export class Camera extends Entity {
	constructor(stage: Birch.Render.Stage) {
		super(Number.NaN);
		this._stage = stage;

		this._stage.uniforms.setUniformTypes([
			{ name: 'viewPosition', type: Birch.Render.UniformGroup.Type.vec2 },
			{ name: 'viewSize', type: Birch.Render.UniformGroup.Type.vec2 }
		]);

		this._stage.uniforms.setUniform('viewPosition', this.position.array);
		this._stage.uniforms.setUniform('viewSize', this._viewSize.array);
	}

	setPosition(position: Birch.Vector2Readonly): void {
		super.setPosition(position);
		this._stage.uniforms.setUniform('viewPosition', this.position.array);
	}

	get viewSize(): Birch.Vector2Readonly {
		return this._viewSize;
	}

	setViewSize(viewSize: Birch.Vector2Readonly): void {
		this._viewSize.copy(viewSize);
		this._stage.uniforms.setUniform('viewSize', this._viewSize.array);
	}

	/** The view size of the camera. How many tiles it can see. */
	private _viewSize: Birch.Vector2 = new Birch.Vector2();

	/** The render stage for applying uniforms. */
	private _stage: Birch.Render.Stage;
}
