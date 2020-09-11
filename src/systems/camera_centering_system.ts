import { Birch } from '../../../birch/src/index';
import { StatusComponent } from '../components/status_component';
// import { PlayerComponent } from '../components/player_component';

/**
 * This system monitors frame events and moves the camera appropriately.
 * It gets the entity of the frame, and gets the corresponding camera entity's frame.
 * It also gets the player component of the character entity and changes things depending on the mode.
 */
export class CameraCenteringSystem extends Birch.World.System {
	constructor() {
		super();

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

	update(): void {
		const players = window.app.players;
		for (const entry of players) {
			const player = entry.value;
			const characterFrame = player.character.get(Birch.World.FrameComponent, 0) as Birch.World.FrameComponent;
			const characterStatus = player.character.get(StatusComponent, 0) as StatusComponent;
			const cameraFrame = player.camera.get(Birch.World.FrameComponent, 0) as Birch.World.FrameComponent;
			const newPosition = new Birch.Vector3();
			if (characterStatus.stuck) {
				newPosition.copy(cameraFrame.position);
			}
			else {
				newPosition.set(characterFrame.position.x, characterFrame.position.y, cameraFrame.position.z);
			}
			const newOrientation = new Birch.Quaternion();
			if (characterStatus.drunk) {
				const rotation = new Birch.Quaternion();
				characterStatus.drunkRotationSpeed += (Math.random() - 0.5) * 1;
				characterStatus.drunkRotationSpeed = Birch.Num.clamp(characterStatus.drunkRotationSpeed, -1, 1);
				characterStatus.drunkRotation += characterStatus.drunkRotationSpeed;
				newOrientation.setFromAxisAngle(Birch.Vector3.UnitZ, characterStatus.drunkRotation * Math.PI / 180);
				newOrientation.mult(rotation, newOrientation);
			}
			if (characterStatus.tilted) {
				const rotation = new Birch.Quaternion();
				rotation.setFromEulerAngles(45 * Math.PI / 180, 0, 0);
				newOrientation.mult(newOrientation, rotation);
				const offset = new Birch.Vector3();
				offset.quatAxis(newOrientation, 2);
				offset.mult(offset, +8.0 * Math.sqrt(2));
				newPosition.add(newPosition, offset);
				newPosition.z = cameraFrame.position.z;
			}
			cameraFrame.position = newPosition;
			cameraFrame.orientation = newOrientation;
		}
	}

	// /** Process any events. */
	// processEvent(component: Birch.World.Component, event: symbol): void {
	// 	if (event === Birch.World.Entity.ComponentCreated) {
	// 		if (component instanceof Birch.World.FrameComponent) {
	// 			// If the frame is a character.
	// 			const componentName: string | undefined = component.entity.name;
	// 			if (componentName !== undefined && componentName.startsWith('character ')) {
	// 				this.subscribeToComponent(component);
	// 			}
	// 		}
	// 		else if (component instanceof Birch.World.CameraComponent) {
	// 			const frameComponent = component.entity.components.getFirstOfType(Birch.World.FrameComponent);
	// 			if (frameComponent !== undefined) {
	// 				this.subscribeToComponent(frameComponent);
	// 			}
	// 		}
	// 	}
	// 	else if (event === Birch.World.Component.ComponentDestroyed) {
	// 		this.unsubscribeFromComponent(component);
	// 		this._cameras.delete(component as Birch.World.FrameComponent);
	// 	}
	// 	else {
	// 		const characterFrame = component as Birch.World.FrameComponent;
	// 		let cameraFrame = this._cameras.get(characterFrame);
	// 		if (cameraFrame === undefined) {
	// 			const entityName = characterFrame.entity.name as string;
	// 			const playerNumber = entityName.substring('character '.length);
	// 			const cameraEntity = characterFrame.entity.world.entities.get('camera ' + playerNumber);
	// 			if (cameraEntity !== undefined) {
	// 				cameraFrame = cameraEntity.components.getFirstOfType(Birch.World.FrameComponent);
	// 				if (cameraFrame !== undefined) {
	// 					this._cameras.set(characterFrame, cameraFrame);
	// 				}
	// 			}
	// 			if (cameraFrame === undefined) {
	// 				return;
	// 			}
	// 		}
	// 		cameraFrame.position = new Birch.Vector3(characterFrame.position.x, characterFrame.position.y, cameraFrame.position.z);
	// 	}
	// }

	/** A mapping from character frame components to camera frame components. */
	private _cameras: Map<Birch.World.FrameComponent, Birch.World.FrameComponent> = new Map();
}
