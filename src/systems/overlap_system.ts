import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { MapComponent } from 'components/map_component';
import { Tile } from 'tile';
import { Sort } from '../../../birch/src/internal';

export class OverlapSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	update(): void {
		const entities = this.world.entities;
		const map = this.world.getEntity('map')!.get(MapComponent)!;
		// Go through each entity-entity pair.
		for (const entry of entities) {
			this._doOverlappingEntities(entry.key);
			this._doOverlappingTiles(entry.key, map);
		}
	}

	private _onEntityOverlap(entity1: Birch.World.Entity, entity2: Birch.World.Entity): void {
		const direction = Birch.Vector2.temp0;
		const distance = this._getEntityOverlap(direction, entity1, entity2);
		// console.log(entity1.name, entity2.name, distance);
	}

	private _onTileOverlap(entity: Birch.World.Entity, tile: Birch.Vector2): void {
		const direction = Birch.Vector2.temp0;
		const distance = this._getTileOverlap(direction, entity, tile);
		const map = this.world.getEntity('map')!.get(MapComponent)!;
		// If it's a wall, move it away.
		if (map.tiles[tile.y][tile.x].type === Tile.Type.Wall) {
			const frame = entity.get(Frame2DComponent)!;
			const offset = Birch.Vector2.temp3;
			offset.addMult(frame.position, 1.0, direction, distance);
			frame.setPosition(offset);
		}
	}

	/** Finds all entities that overlap the entity and process the overlaps. */
	private _doOverlappingEntities(entity: Birch.World.Entity): void {
		const entities = this.world.entities;
		const direction = Birch.Vector2.temp0;
		let numOverlappingEntities = 0;
		for (const entry2 of entities) {
			const entity2 = entry2.key;
			if (entity.id == entity2.id) {
				continue;
			}
			// Get the distance and direction overlap of the two entities.
			const distance = this._getEntityOverlap(direction, entity, entity2);
			// If they overlap, add them to the list.
			if (distance > 0) {
				if (numOverlappingEntities === this._overlappingEntities.length) {
					this._overlappingEntities.push(new EntityOverlap(distance, direction, entity2));
				}
				else {
					const entityOverlap = this._overlappingEntities[numOverlappingEntities];
					entityOverlap.distance = distance;
					entityOverlap.direction.copy(direction);
					entityOverlap.entity = entity2;
				}
				numOverlappingEntities += 1;
			}
		}
		// Clear out the remaining items in the list, since it is persistent from the last frame.
		for (let i = numOverlappingEntities; i < this._overlappingEntities.length; i++) {
			this._overlappingEntities[i].distance = 0;
		}
		// Sort the overlapping entities list.
		Sort.sort(this._overlappingEntities, EntityOverlap.isLess);
		// Call the appropriate onOverlap function for the entities.
		for (let i = 0; i < numOverlappingEntities; i++) {
			this._onEntityOverlap(entity, this._overlappingEntities[i].entity);
		}
	}

	/** Returns the distance and the direction of overlap between two entities. */
	private _getEntityOverlap(outDirection: Birch.Vector2, entity1: Birch.World.Entity, entity2: Birch.World.Entity): number {
		const frame1 = entity1.get(Frame2DComponent);
		const frame2 = entity2.get(Frame2DComponent);
		if (frame1 !== undefined && frame2 !== undefined) {
			outDirection.sub(frame1.position, frame2.position);
			const distance = frame1.radius + frame2.radius - outDirection.norm;
			if (distance > 0) {
				outDirection.normalize(outDirection);
				return distance;
			}
		}
		return 0;
	}

	/** Finds all tiles that overlap the entity and process the overlaps. */
	private _doOverlappingTiles(entity: Birch.World.Entity, map: MapComponent): void {
		// Collide entities with the map.
		const direction = Birch.Vector2.temp0;
		let numOverlappingTiles = 0;
		const frame = entity.get(Frame2DComponent);
		if (frame !== undefined) {
			// Get the integer bounds of the entity.
			const min = Birch.Vector2.temp1;
			const max = Birch.Vector2.temp2;
			if (isNaN(frame.position.x) || isNaN(frame.position.y)) {
				return;
			}
			min.set(Birch.Num.clamp(Math.floor(frame.position.x - frame.radius), 0, map.size.x - 1),
				Birch.Num.clamp(Math.floor(frame.position.y - frame.radius), 0, map.size.y - 1));
			max.set(Birch.Num.clamp(Math.floor(frame.position.x + frame.radius), 0, map.size.x - 1),
				Birch.Num.clamp(Math.floor(frame.position.y + frame.radius), 0, map.size.y - 1));
			// Go through each tile and find the overlap.
			for (let x = min.x; x <= max.x; x++) {
				for (let y = min.y; y <= max.y; y++) {
					const tile = Birch.Vector2.temp3;
					tile.set(x, y);
					const distance = this._getTileOverlap(direction, entity, tile);
					// If they overlap, add them to the list.
					if (distance > 0) {
						if (numOverlappingTiles === this._overlappingTiles.length) {
							this._overlappingTiles.push(new TileOverlap(distance, direction, tile));
						}
						else {
							const tileOverlap = this._overlappingTiles[numOverlappingTiles];
							tileOverlap.distance = distance;
							tileOverlap.direction.copy(direction);
							tileOverlap.tile.copy(tile);
						}
						numOverlappingTiles += 1;
					}
				}
			}
			// Clear out the remaining items in the list, since it is persistent from the last frame.
			for (let i = numOverlappingTiles; i < this._overlappingTiles.length; i++) {
				this._overlappingTiles[i].distance = 0;
			}
			// Sort the overlapping entities list.
			Sort.sort(this._overlappingTiles, TileOverlap.isLess);
			// Call the appropriate onOverlap function for the entities.
			for (let i = 0; i < numOverlappingTiles; i++) {
				this._onTileOverlap(entity, this._overlappingTiles[i].tile);
			}
		}
	}

	/** Returns the distance and the direction of overlap between the entity and the tile. */
	private _getTileOverlap(outDirection: Birch.Vector2, entity: Birch.World.Entity, tile: Birch.Vector2): number {
		const frame = entity.get(Frame2DComponent);
		if (frame !== undefined) {
			// const closestPoint = Birch.Vector2.temp4;
			// const bounds = Birch.Rectangle.temp0;
			// bounds.set(tile.x, tile.y, 1, 1);
			const diff = Birch.Vector2.temp4;
			diff.set(tile.x + 0.5, tile.y + 0.5);
			diff.sub(frame.position, diff);
			if (Math.abs(diff.x) > Math.abs(diff.y)) {
				if (diff.x >= 0) {
					outDirection.set(1, 0);
					return (tile.x + 1) - (frame.position.x - frame.radius);
				}
				else {
					outDirection.set(-1, 0);
					return (frame.position.x + frame.radius) - tile.x;
				}
			}
			else {
				if (diff.y >= 0) {
					outDirection.set(0, 1);
					return (tile.y + 1) - (frame.position.y - frame.radius);
				}
				else {
					outDirection.set(0, -1);
					return (frame.position.y + frame.radius) - tile.y;
				}
			}
			// }
			// else {
			// 	bounds.closest(closestPoint, frame.position);
			// 	const diff = Birch.Vector2.temp5;
			// 	diff.sub(frame.position, closestPoint);
			// 	const distanceToTile = diff.norm;
			// 	if (distanceToTile < frame.radius) {
			// 		diff.normalize(diff);
			// 		diff.mult(diff, frame.radius - distanceToTile);
			// 		const newPosition = Birch.Vector2.temp6;
			// 		newPosition.set(frame.position.x + diff.x, frame.position.y + diff.y);
			// 		frame.setPosition(newPosition);
			// 	}
			// }
		}
		return 0;
	}

	private _overlappingEntities: EntityOverlap[] = [];

	private _overlappingTiles: TileOverlap[] = [];
}

class EntityOverlap {
	constructor(distance: number, direction: Birch.Vector2, entity: Birch.World.Entity) {
		this.distance = distance;
		this.direction = new Birch.Vector2(direction.x, direction.y);
		this.entity = entity;
	}

	distance: number;
	direction: Birch.Vector2;
	entity: Birch.World.Entity;

	static isLess(entityOverlap1: EntityOverlap, entityOverlap2: EntityOverlap): boolean {
		if (entityOverlap1.distance === entityOverlap2.distance) {
			return entityOverlap1.entity.id < entityOverlap2.entity.id;
		}
		return entityOverlap1.distance > entityOverlap2.distance;
	}
}

class TileOverlap {
	constructor(distance: number, direction: Birch.Vector2, tile: Birch.Vector2) {
		this.distance = distance;
		this.direction = new Birch.Vector2(direction.x, direction.y);
		this.tile = new Birch.Vector2(tile.x, tile.y);
	}

	distance: number;
	direction: Birch.Vector2;
	tile: Birch.Vector2;

	static isLess(tileOverlap1: TileOverlap, tileOverlap2: TileOverlap): boolean {
		if (tileOverlap1.distance === tileOverlap2.distance) {
			if (tileOverlap1.tile.x === tileOverlap2.tile.x) {
				return tileOverlap1.tile.y < tileOverlap2.tile.y;
			}
			return tileOverlap1.tile.x < tileOverlap2.tile.x;
		}
		return tileOverlap1.distance > tileOverlap2.distance;
	}
}
