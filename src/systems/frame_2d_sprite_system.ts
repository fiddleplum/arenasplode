import { Birch } from 'birch';
import { Frame2DComponent } from '../components/frame_2d_component';
import { SpriteComponent } from '../components/sprite_component';

export class Frame2DSpriteSystem extends Birch.World.System {
	/** Constructs the frame-model system. */
	constructor(world: Birch.World.World) {
		super(world);

		this.monitorComponentTypes([Frame2DComponent, SpriteComponent]);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		if (event === Birch.World.Entity.ComponentCreated) {
			if (component instanceof Frame2DComponent) {
				this.subscribeToEvents(component);
				this._updateSprites(component);
			}
			else { // It must be a sprite.
				const frame2DComponent = component.entity.get(Frame2DComponent);
				if (frame2DComponent !== undefined) {
					this._updateSprite(frame2DComponent, component as SpriteComponent);
				}
			}
		}
		else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
			if (component instanceof Frame2DComponent) {
				this.unsubscribeFromEvents(component);
			}
		}
		else { // Some event from a frame component.
			this._updateSprites(component as Frame2DComponent);
		}
	}

	/** Updates all of the sprites given a frame2D component. */
	private _updateSprites(frame: Frame2DComponent): void {
		const sprites = frame.entity.getAll(SpriteComponent);
		if (sprites !== undefined) {
			for (const sprite of sprites) {
				this._updateSprite(frame, sprite);
			}
		}
	}

	/** Updates a single sprite with the frame2D info. */
	private _updateSprite(frame2DComponent: Frame2DComponent, spriteComponent: SpriteComponent): void {
		spriteComponent.uniforms.setUniform('position', frame2DComponent.position.array);
		spriteComponent.uniforms.setUniform('rotation', frame2DComponent.rotation);
		spriteComponent.uniforms.setUniform('level', frame2DComponent.level);
	}
}
