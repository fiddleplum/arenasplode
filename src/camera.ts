import { Birch } from 'birch';
import { Entity } from 'entities/entity';

export class Camera {
	constructor(stage: Birch.Render.Stage) {

		this._stage = stage;

		this._stage.uniforms.setUniformTypes([
			{ name: 'viewPosition', type: Birch.Render.UniformGroup.Type.vec2 },
			{ name: 'viewSize', type: Birch.Render.UniformGroup.Type.vec2 }
		]);

		this._stage.uniforms.setUniform('viewPosition', [0, 0]);
		this._stage.uniforms.setUniform('viewSize', [1, 1]);
	}

	get viewSize(): Birch.Vector2Readonly {
		return this._viewSize;
	}

	setViewSize(viewSize: Birch.Vector2Readonly): void {
		this._viewSize.copy(viewSize);
		this._stage.uniforms.setUniform('viewSize', this._viewSize.array);
	}

	setEntityFocus(entity: Entity): void {
		this._entityFocus = entity;
	}

	preRender(): void {
		if (this._entityFocus !== undefined) {
			this._stage.uniforms.setUniform('viewPosition', this._entityFocus.position.array);
		}
	}

	/** The view size of the camera. How many tiles it can see. */
	private _viewSize: Birch.Vector2 = new Birch.Vector2();

	/** The render stage for applying uniforms. */
	private _stage: Birch.Render.Stage;

	/** The entity focus. */
	private _entityFocus: Entity | undefined;
}
