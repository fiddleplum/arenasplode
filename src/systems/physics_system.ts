import { Birch } from 'birch';
import { Frame2DComponent } from '../components/frame_2d_component';
import { MapComponent } from '../components/map_component';
import { PhysicsComponent } from '../components/physics_component';
import { Tile } from '../tile';

export class PhysicsSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	get collidingEntities(): Map<Birch.World.Entity, Set<Birch.World.Entity>> {
		return this._collidingEntities;
	}

	update(): void {
		const entities = this.world.entities;
		// Update positions from velocities.
		for (const entry of entities) {
			const entity = entry.key;
			const physics = entity.get(PhysicsComponent);
			const frame = entity.get(Frame2DComponent);
			if (physics !== undefined && frame !== undefined) {
				// Apply friction to the velocity.
				const newVelocity = Birch.Vector2.temp0;
				newVelocity.mult(physics.velocity, 0.5);
				physics.setVelocity(newVelocity);
				// Apply the velocity to the position.
				const newPosition = Birch.Vector2.temp1;
				newPosition.copy(frame.position);
				newPosition.setX(frame.position.x + physics.velocity.x);
				newPosition.setY(frame.position.y + physics.velocity.y);
				frame.setPosition(newPosition);
			}
		}
		// Collide entities with other entities.
		for (const entry1 of entities) {
			const entity1 = entry1.key;
			for (const entry2 of entities) {
				let colliding: boolean = false;
				const entity2 = entry2.key;
				if (entity1.id < entity2.id) {
					const physics1 = entity1.get(PhysicsComponent);
					const physics2 = entity2.get(PhysicsComponent);
					const frame1 = entity1.get(Frame2DComponent);
					const frame2 = entity2.get(Frame2DComponent);
					if (frame1 !== undefined && frame2 !== undefined && physics1 !== undefined && physics2 !== undefined) {
						const offset = Birch.Vector2.temp0;
						offset.sub(frame1.position, frame2.position);
						const distance = offset.norm;
						if (distance < physics1.radius + physics2.radius) {
							offset.normalize(offset);
							colliding = true;
						}
					}
				}
				// Add it to or remove it from the colliding entities list.
				if (colliding) {
					let set1 = this._collidingEntities.get(entity1);
					if (set1 === undefined) {
						set1 = new Set();
						this._collidingEntities.set(entity1, set1);
					}
					set1.add(entity2);
					let set2 = this._collidingEntities.get(entity2);
					if (set2 === undefined) {
						set2 = new Set();
						this._collidingEntities.set(entity2, set2);
					}
					set2.add(entity1);
				}
				else {
					const set1 = this._collidingEntities.get(entity1);
					const set2 = this._collidingEntities.get(entity2);
					if (set1 !== undefined) {
						set1.delete(entity2);
						if (set1.size === 0) {
							this._collidingEntities.delete(entity1);
						}
					}
					if (set2 !== undefined) {
						set2.delete(entity1);
						if (set2.size === 0) {
							this._collidingEntities.delete(entity2);
						}
					}
				}
			}
		}
		// Collide entities with the map.
		const map = entities.get('map')!.get(MapComponent)!;
		for (const entry of entities) {
			const entity = entry.key;
			const physics = entity.get(PhysicsComponent);
			const frame = entity.get(Frame2DComponent);
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
							if (bounds.contains(position)) {
								const diff = Birch.Vector2.temp4;
								const newPosition = Birch.Vector2.temp5;
								diff.set(x + 0.5, y + 0.5);
								diff.sub(position, diff);
								if (Math.abs(diff.x) > Math.abs(diff.y)) {
									if (diff.x >= 0) {
										newPosition.set(x + 1 + physics.radius, position.y);
									}
									else {
										newPosition.set(x - physics.radius, position.y);
									}
								}
								else {
									if (diff.y >= 0) {
										newPosition.set(position.x, y + 1 + physics.radius);
									}
									else {
										newPosition.set(position.x, y - physics.radius);
									}
								}
								frame.setPosition(newPosition);
							}
							else {
								bounds.closest(closestPoint, position);
								const diff = Birch.Vector2.temp4;
								diff.sub(position, closestPoint);
								const distanceToTile = diff.norm;
								if (distanceToTile < physics.radius) {
									diff.normalize(diff);
									diff.mult(diff, physics.radius - distanceToTile);
									const newPosition = Birch.Vector2.temp5;
									newPosition.set(frame.position.x + diff.x, frame.position.y + diff.y);
									frame.setPosition(newPosition);
								}
							}
						}
					}
				}
			}
		}
	}

	private _collidingEntities: Map<Birch.World.Entity, Set<Birch.World.Entity>> = new Map();
}
