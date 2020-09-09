import { Birch } from '../../../birch/src/index';
import { PlayerComponent } from '../components/player_component';

export class CameraCenteringSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super();
		this._world = world;

		this.monitorComponentTypes([Birch.World.FrameComponent, Birch.World.CameraComponent]);

		// // Looking for a simpler way of doing events other than a big process event function.
		// this.onComponentEvent(FrameComponent, Birch.World.Entity.ComponentCreated, (component) => {
		// 	if (component.entity.name.startsWith('player ')) {
		// 		this.subscribeToComponent(component);
		// 	}
		// });
	}

	// I'm working on getting the system to just monitor the frame components that also
	//   have a player component. Right now the only way is to monitor frame components
	//   and subscribe to them only if there is a player component, but this won't work,
	//   because the frame component might be added before the player component.
	// I could check for a player, frame, and camera component, since it needs all three.
	// Then the component-created event for player and frame components would check if
	//   the other exists, so it would catch all orderings.
	// It would also subscribe the the frame component events.

	// I would like a away to see a component or entity's name.

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		if (event === Birch.World.Entity.ComponentCreated) {
			if (component instanceof FrameComponent) {
				if (component.entity.n
			}
			else if (component instanceof CameraComponent) {
				const frameComponent = component.entity.components.getFirstOfType(FrameComponent);
				if (frameComponent !== undefined) {
					this.subscribeToComponent(frameComponent);
				}
			}
		}
		else if (event === Birch.World.Component.ComponentDestroyed) {
			if (component instanceof CameraComponent || component instanceof FrameComponent) {
				this.unsubscribeFromComponent(component);
			}
		}
		else {
			const frameComponent = component as Birch.World.FrameComponent;
			const modelComponents = component.entity.components.getAllOfType(ModelComponent);
			if (modelComponents !== undefined) {
				for (const modelComponent of modelComponents) {
					modelComponent.model.uniforms.setUniform('modelMatrix', frameComponent.localToWorld.array);
				}
			}
		}
	}

	private _world: Birch.World.World;

	private _players: Map<number, {
		cameraComponent: Birch.World.CameraComponent;
		characterFrameComponent: FrameComponent;
	}> = new Map();
}
