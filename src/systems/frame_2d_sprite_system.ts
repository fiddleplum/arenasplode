import { Birch } from 'birch';
import { Frame2DComponent } from '../components/frame_2d_component';
import { SpriteComponent } from '../components/sprite_component';

export class Frame2DSpriteSystem extends Birch.World.System {
	/** Constructs the frame-model system. */
	constructor(world: Birch.World.World) {
		super(world);

		this.monitorComponentTypes([Frame2DComponent]);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		if (event === Birch.World.Entity.ComponentCreated) {
			this.subscribeToEvents(component);
			this._updateModels(component as Frame2DComponent);
		}
		else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
			this.unsubscribeFromEvents(component);
		}
		else { // Some event from a frame component.
			this._updateModels(component as Frame2DComponent);
		}
	}

	/** Updates all of the sprites given a frame2D component. */
	private _updateModels(frame: Frame2DComponent): void {
		const sprites = frame.entity.getAll(SpriteComponent);
		if (sprites !== undefined) {
			for (const sprite of sprites) {
				sprite.uniforms.setUniform('position', frame.position.array);
				sprite.uniforms.setUniform('rotation', frame.rotation);
				sprite.uniforms.setUniform('level', frame.level);
			}
		}
	}
}
