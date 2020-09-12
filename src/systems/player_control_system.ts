import { Birch } from '../../../birch/src/index';
import { FrameComponent } from '../../../birch/src/world/internal';
import { PhysicsComponent } from '../components/physics_component';

export class PlayerControlSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
		this._axisThreshold = 0.15;
	}

	update(): void {
		for (const entry of window.app.players) {
			const playerIndex = entry.key;
			const player = entry.value;
			const controller = this.world.engine.input.getController(playerIndex);
			let x = controller.axis(0);
			let y = controller.axis(1);
			if (Math.abs(x) < this._axisThreshold) {
				x = 0;
			}
			if (Math.abs(y) < this._axisThreshold) {
				y = 0;
			}
			if (x !== 0 || y !== 0) {
				const physics = player.character.get(PhysicsComponent);
				const frame = player.character.get(FrameComponent);
				if (physics !== undefined && frame !== undefined) {
					const velocity = physics.velocity;
					const newVelocity = Birch.Vector2.temp0;
					newVelocity.set(velocity.x + x * .25, velocity.y - y * .25);
					physics.setVelocity(newVelocity);
					const newAngle = Math.atan(-y / x);
					const newOrientation = Birch.Quaternion.temp0;
					newOrientation.setFromAxisAngle(Birch.Vector3.UnitZ, newAngle);
					frame.setOrientation(newOrientation);
				}
			}
		}
	}

	private _axisThreshold: number;
}
