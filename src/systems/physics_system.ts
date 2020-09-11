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
				const physics1 = entity1.get(PhysicsComponent, 0);
				const physics2 = entity2.get(PhysicsComponent, 0);
				const frame1 = entity1.get(Birch.World.FrameComponent, 0);
				const frame2 = entity2.get(Birch.World.FrameComponent, 0);
				if (frame1 !== undefined && frame2 !== undefined && physics1 !== undefined && physics2 !== undefined) {
					temp1.sub(frame1.position, frame2.position);
					const distance = temp1.norm;
					if (distance < physics1.radius + physics2.radius) {
						temp1.normalize(temp1);
					}
				}
			}
		}
	}
}

const temp1 = new Birch.Vector3();
const newPosition1 = new Birch.Vector3();
const newPosition2 = new Birch.Vector3();
