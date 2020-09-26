import { Birch } from 'birch';
import { Frame2DComponent } from '../components/frame_2d_component';
import { PlayerComponent } from '../components/player_component';

/** This system keeps the camera centered on the character and handles camera statuses. */
export class CameraCenteringSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		this.monitorComponentTypes([Frame2DComponent, PlayerComponent]);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		const entity = component.entity;
		if (event === Birch.World.Entity.ComponentCreated) {
			if (entity.has(Frame2DComponent) && entity.has(PlayerComponent)) {
				this._characters.add(entity);
			}
		}
		else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
			if (!entity.has(Frame2DComponent) || !entity.has(PlayerComponent)) {
				this._characters.remove(entity);
			}
		}
	}

	update(): void {
		for (const character of this._characters) {
			if (character.name === undefined) {
				return;
			}
			// Get the corresponding camera.
			const camera = character.world.entities.get('camera ' + character.name.substring('character '.length));
			if (camera === undefined) {
				return;
			}
			const characterFrame = character.get(Frame2DComponent)!;
			const characterStatus = character.get(PlayerComponent)!;
			const cameraFrame = camera.get(Birch.World.FrameComponent)!;
			const newPosition = Birch.Vector3.temp0;
			if (characterStatus.stuck) {
				newPosition.copy(cameraFrame.position);
			}
			else {
				newPosition.set(characterFrame.position.x, characterFrame.position.y, cameraFrame.position.z);
			}
			const newOrientation = Birch.Quaternion.temp0;
			newOrientation.copy(cameraFrame.orientation);
			if (characterStatus.drunk) {
				const rotation = Birch.Quaternion.temp1;
				characterStatus.drunkRotationSpeed += (Math.random() - 0.5) * 1;
				characterStatus.drunkRotationSpeed = Birch.Num.clamp(characterStatus.drunkRotationSpeed, -1, 1);
				characterStatus.drunkRotation += characterStatus.drunkRotationSpeed;
				newOrientation.setFromAxisAngle(Birch.Vector3.UnitZ, characterStatus.drunkRotation * Math.PI / 180);
				newOrientation.mult(rotation, newOrientation);
			}
			if (characterStatus.tilted) {
				const rotation = Birch.Quaternion.temp1;
				rotation.setFromEulerAngles(45 * Math.PI / 180, 0, 0);
				newOrientation.mult(newOrientation, rotation);
				const offset = Birch.Vector3.temp1;
				offset.quatAxis(newOrientation, 2);
				offset.mult(offset, 8.0 * Math.sqrt(2));
				newPosition.add(newPosition, offset);
				newPosition.setZ(cameraFrame.position.z);
			}
			cameraFrame.setPosition(newPosition);
			cameraFrame.setOrientation(newOrientation);
		}
	}

	private _characters: Birch.FastOrderedSet<Birch.World.Entity> = new Birch.FastOrderedSet();
}
