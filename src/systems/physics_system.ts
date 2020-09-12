import { Birch } from '../../../birch/src/index';
import { MapComponent } from '../components/map_component';
import { PhysicsComponent } from '../components/physics_component';
import { Tile } from '../tile';

export class PhysicsSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	update(): void {
		const entities = this.world.entities;
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
		// Collide with the map.
		const map = (entities.get('map') as Birch.World.Entity).get(MapComponent) as MapComponent;
		for (const entry of entities) {
			const entity = entry.key;
			const physics = entity.get(PhysicsComponent);
			const frame = entity.get(Birch.World.FrameComponent);
			if (physics !== undefined && frame !== undefined) {
				// Get the integer bounds of the entity.
				const min = Birch.Vector2.temp0;
				const max = Birch.Vector2.temp1;
				min.set(Math.floor(frame.position.x - physics.radius), Math.floor(frame.position.y - physics.radius));
				max.set(Math.floor(frame.position.x + physics.radius), Math.floor(frame.position.y + physics.radius));
				for (let x = min.x; x <= max.x; x++) {
					for (let y = min.y; y <= max.y; y++) {
						if (x < 0 || y < 0 || y >= map.tiles.length || x >= map.tiles[0].length) {
							continue;
						}
						if (map.tiles[y][x].type === Tile.Type.Wall) {
							const bounds = Birch.Rectangle.temp0;
							const position = Birch.Vector2.temp2;
							const closestPoint = Birch.Vector2.temp3;
							position.set(frame.position.x, frame.position.y);
							bounds.set(x, y, 1, 1);
							bounds.closest(closestPoint, position);
							const diff = Birch.Vector2.temp4;
							diff.sub(position, closestPoint);
							const distanceToTile = diff.norm;
							if (distanceToTile < physics.radius) {
								diff.normalize(diff);
								diff.mult(diff, physics.radius - distanceToTile);
								const newPosition = Birch.Vector3.temp0;
								newPosition.set(frame.position.x + diff.x, frame.position.y + diff.y, frame.position.z);
								frame.setPosition(newPosition);
							}
						}
					}
				}
			}
		}
	}
}
