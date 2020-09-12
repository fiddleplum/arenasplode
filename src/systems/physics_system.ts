import { Birch } from '../../../birch/src/index';
import { PhysicsComponent } from '../components/physics_component';

export class PhysicsSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	update(): void {
		const entities = this.world.entities;
		for (const entry1 of entities) {
			const entity1 = entry1.key;
			for (const entry2 of entities) {
				const entity2 = entry2.key;
				if (entity1.id > entity2.id) {
					continue;
				}
				const physics1 = entity1.get(PhysicsComponent);
				const physics2 = entity2.get(PhysicsComponent);
				const frame1 = entity1.get(Birch.World.FrameComponent);
				const frame2 = entity2.get(Birch.World.FrameComponent);
				if (frame1 !== undefined && frame2 !== undefined && physics1 !== undefined && physics2 !== undefined) {
					const offset = Birch.Vector2.temp0;
					offset.setX(frame1.position.x - frame2.position.x);
					offset.setY(frame1.position.y - frame2.position.y);
					const distance = offset.norm;
					if (distance < physics1.radius + physics2.radius) {
						offset.normalize(offset);
					}
				}
			}
		}
		// Velocities
		for (const entry of entities) {
			const entity = entry.key;
			const physics = entity.get(PhysicsComponent);
			const frame = entity.get(Birch.World.FrameComponent);
			if (physics !== undefined && frame !== undefined) {
				// Apply friction to the velocity.
				const newVelocity = Birch.Vector2.temp0;
				newVelocity.mult(physics.velocity, 0.5);
				physics.setVelocity(newVelocity);
				// Apply the velocity to the position.
				const newPosition = Birch.Vector3.temp0;
				newPosition.copy(frame.position);
				newPosition.setX(frame.position.x + physics.velocity.x);
				newPosition.setY(frame.position.y + physics.velocity.y);
				frame.setPosition(newPosition);
			}
		}
	}
}
