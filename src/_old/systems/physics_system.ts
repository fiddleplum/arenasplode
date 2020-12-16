import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { PhysicsComponent } from 'components/physics_component';

/** Updates positions from velocities. */
export class PhysicsSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	update(): void {
		const entities = this.world.entities;
		// Update positions from velocities.
		for (const entry of entities) {
			const entity = entry.key;
			const physics = entity.get(PhysicsComponent);
			const frame = entity.get(Frame2DComponent);
			if (physics !== undefined && frame !== undefined) {
				// Get the current velocity and angular velocity.
				const newVelocity = Birch.Vector2.temp0;
				newVelocity.copy(physics.velocity);
				let newAngularVelocity = physics.angularVelocity;
				// Apply spring physics to bound entities.
				for (const entry of physics.boundEntities) {
					const otherEntity = entry.key;
					const bindParams = entry.value;
					const otherFrame = otherEntity.get(Frame2DComponent)!;
					const diff = Birch.Vector2.temp1;
					diff.rot(bindParams.offset, otherFrame.rotation);
					diff.add(diff, otherFrame.position);
					diff.sub(diff, frame.position);
					newVelocity.addMult(newVelocity, 1.0, diff, bindParams.springCoefficient);
					if (bindParams.usesRotation) {
						const angleDiff = Birch.Num.angleDiff(frame.rotation, otherFrame.rotation);
						newAngularVelocity += bindParams.springCoefficient * angleDiff;
					}
				}

				// Apply friction.
				newVelocity.mult(newVelocity, 0.5);
				newAngularVelocity *= 0.5;

				// Set the new velocity and angular velocity.
				physics.setVelocity(newVelocity);
				physics.setAngularVelocity(newAngularVelocity);

				// Apply the velocity to the position.
				const newPosition = Birch.Vector2.temp1;
				newPosition.add(frame.position, physics.velocity);
				frame.setPosition(newPosition);

				// Apply the angular velocity to the rotation.
				frame.setRotation(frame.rotation + physics.angularVelocity);
			}
		}
	}
}
