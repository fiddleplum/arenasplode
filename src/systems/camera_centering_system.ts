import { Birch } from '../../../birch/src/index';
import { StatusComponent } from '../components/status_component';

/** This system keeps the camera centered on the character and handles camera statuses. */
export class CameraCenteringSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		this.monitorComponentTypes([Birch.World.FrameComponent, Birch.World.CameraComponent]);
	}

	update(): void {
		const players = window.app.players;
		for (const entry of players) {
			const player = entry.value;
			const characterFrame = player.character.get(Birch.World.FrameComponent, 0) as Birch.World.FrameComponent;
			const characterStatus = player.character.get(StatusComponent, 0) as StatusComponent;
			const cameraFrame = player.camera.get(Birch.World.FrameComponent, 0) as Birch.World.FrameComponent;
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
}
