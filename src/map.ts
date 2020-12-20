import { Birch } from 'birch';
import { Character } from 'entities/character';
import { Entity } from 'entity';
import { Tile } from 'tile';

export class Map {
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene) {
		// Set the engine and scene.
		this._engine = engine;
		this._scene = scene;

		// Create the mesh.
		this._mesh = this._engine.renderer.meshes.create();
		this._mesh.setVertexFormat([[{
			location: 0, // position
			type: 'float',
			dimensions: 2
		}, {
			location: 1, // uv
			type: 'float',
			dimensions: 2
		}]]);

		this._shader = this._engine.renderer.shaders.create();

		// Create the texture.
		this._texture = this._engine.renderer.textures.create();
		this._texture.setSource('assets/sprites/tiles.png');

		// Setup the model.
		this._model = this._engine.renderer.models.create();
		this._model.mesh = this._mesh;
		this._model.shader = this._shader;

		// Set the model's uniforms.
		this._model.uniforms.setUniformTypes([{
			name: 'position',
			type: Birch.Render.UniformGroup.Type.vec2
		}, {
			name: 'rotation',
			type: Birch.Render.UniformGroup.Type.float
		}, {
			name: 'scale',
			type: Birch.Render.UniformGroup.Type.vec2
		}, {
			name: 'level',
			type: Birch.Render.UniformGroup.Type.float
		}, {
			name: 'colorTexture',
			type: Birch.Render.UniformGroup.Type.sampler2D
		}]);
		this._model.uniforms.setUniform('position', [0, 0]);
		this._model.uniforms.setUniform('rotation', 0);
		this._model.uniforms.setUniform('scale', [1, 1]);
		this._model.uniforms.setUniform('level', 0);
		this._model.uniforms.setUniform('colorTexture', this._texture);
		this._scene.models.add(this._model);

		// Set the size of the map.
		this._size = new Birch.Vector2(25, 25);
		this._updateMap();

		// Create the shader.
		this._engine.downloader.getJson<Birch.Render.Shader.Options>('assets/shaders/sprite.json').then((json) => {
			this._shader.setFromOptions(json);
		});
	}

	destroy(): void {
		this._scene.models.remove(this._model);
		this._engine.renderer.models.destroy(this._model);
		this._engine.renderer.textures.destroy(this._texture);
		this._engine.renderer.shaders.destroy(this._shader);
		this._engine.renderer.meshes.destroy(this._mesh);
	}

	/** Finds all tiles that overlap the entity and process the overlaps. */
	handleOverlappingTiles(entity: Entity, deltaTime: number): void {
		const direction = Birch.Vector2.pool.get();
		let numOverlappingTiles = 0;
		// Get the integer bounds of the entity.
		const min = Birch.Vector2.pool.get();
		const max = Birch.Vector2.pool.get();
		min.set(Birch.Num.clamp(Math.floor(entity.position.x - entity.radius), 0, this._size.x - 1),
			Birch.Num.clamp(Math.floor(entity.position.y - entity.radius), 0, this._size.y - 1));
		max.set(Birch.Num.clamp(Math.floor(entity.position.x + entity.radius), 0, this._size.x - 1),
			Birch.Num.clamp(Math.floor(entity.position.y + entity.radius), 0, this._size.y - 1));
		// Go through each tile and find the overlap.
		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				const tile = Birch.Vector2.pool.get();
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
				Birch.Vector2.pool.release(tile);
			}
		}
		Birch.Vector2.pool.release(min);
		Birch.Vector2.pool.release(max);
		Birch.Vector2.pool.release(direction);
		// Clear out the remaining items in the list, since it is persistent from the last entity.
		for (let i = numOverlappingTiles; i < this._overlappingTiles.length; i++) {
			this._overlappingTiles[i].distance = 0;
		}
		// Sort the overlapping entities list.
		Birch.Sort.sort(this._overlappingTiles, TileOverlap.isLess);
		// Call the appropriate onOverlap function for the entities.
		for (let i = 0; i < numOverlappingTiles; i++) {
			this._onTileOverlap(entity, this._overlappingTiles[i].tile, deltaTime);
		}
	}

	/** Returns the distance and the direction of overlap between the entity and the tile. */
	private _getTileOverlap(outDirection: Birch.Vector2, entity: Entity, tile: Birch.Vector2): number {
		const diff = Birch.Vector2.pool.get();
		diff.set(tile.x + 0.5, tile.y + 0.5);
		diff.sub(entity.position, diff);
		let distance = 0;
		if (Math.abs(diff.x) > Math.abs(diff.y)) {
			if (diff.x >= 0) {
				outDirection.set(1, 0);
				distance = (tile.x + 1) - (entity.position.x - entity.radius);
			}
			else {
				outDirection.set(-1, 0);
				distance = (entity.position.x + entity.radius) - tile.x;
			}
		}
		else {
			if (diff.y >= 0) {
				outDirection.set(0, 1);
				distance = (tile.y + 1) - (entity.position.y - entity.radius);
			}
			else {
				outDirection.set(0, -1);
				distance = (entity.position.y + entity.radius) - tile.y;
			}
		}
		Birch.Vector2.pool.release(diff);
		return distance;
	}

	get tiles(): Tile[][] {
		return this._tiles;
	}

	get size(): Birch.Vector2 {
		return this._size;
	}

	setSize(size: Birch.Vector2): void {
		this._size.copy(size);
		this._updateMap();
	}

	/** Process the overlap between an entity and tile. */
	private _onTileOverlap(entity: Entity, tile: Birch.Vector2, deltaTime: number): void {
		const direction = Birch.Vector2.pool.get();
		const distance = this._getTileOverlap(direction, entity, tile);
		const tileType = this._tiles[tile.y][tile.x].type;
		// If it's a wall, move it away.
		if (tileType === Tile.Type.Wall) {
			const offset = Birch.Vector2.pool.get();
			offset.addMult(entity.position, 1.0, direction, distance);
			entity.setPosition(offset);
			Birch.Vector2.pool.release(offset);
			const newVelocity = Birch.Vector2.pool.get();
			newVelocity.addMult(entity.velocity, 1, direction, Math.max(0, -entity.velocity.dot(direction)));
			entity.setVelocity(newVelocity);
			Birch.Vector2.pool.release(newVelocity);
		}
		else if (tileType === Tile.Type.Floor) {
			// Apply friction.
			const frictionCoefficient = 10.00;
			const newVelocity = Birch.Vector2.pool.get();
			if (entity instanceof Character) {
				// console.log(Math.pow(friction, deltaTime));
				// console.log(Math.pow(1 - friction, distance * deltaTime));
			}
			const friction = 1 - distance * (Math.pow(1 + frictionCoefficient, deltaTime) - 1);
			newVelocity.mult(entity.velocity, friction);
			entity.setVelocity(newVelocity);
			entity.setAngularVelocity(entity.angularVelocity * friction);
			Birch.Vector2.pool.release(newVelocity);
		}
		Birch.Vector2.pool.release(direction);
	}

	private _updateMap(): void {
		if (this._mesh === undefined) {
			return;
		}
		this._size.copy(this._size);
		this._tiles = [];
		for (let y = 0; y < this._size.y; y++) {
			this._tiles.push([]);
			for (let x = 0; x < this._size.x; x++) {
				const tile = new Tile();
				if (x === 0 || y === 0 || x === this._size.x - 1 || y === this._size.y - 1) {
					tile.type = Tile.Type.Wall;
				}
				else if (Math.random() >= 0.8) {
					tile.type = Tile.Type.Wall;
				}
				else {
					tile.type = Tile.Type.Floor;
				}
				this._tiles[y].push(tile);
			}
		}

		const vertices: number[] = [];
		const indices: number[] = [];
		for (let y = 0; y < this._size.y; y++) {
			for (let x = 0; x < this._size.x; x++) {
				vertices.push(x);
				vertices.push(y);
				vertices.push(this._tiles[y][x].type / 2);
				vertices.push(0);
				vertices.push(x + 1);
				vertices.push(y);
				vertices.push(this._tiles[y][x].type / 2 + 1 / Tile.Type.NumTiles);
				vertices.push(0);
				vertices.push(x + 1);
				vertices.push(y + 1);
				vertices.push(this._tiles[y][x].type / 2 + 1 / Tile.Type.NumTiles);
				vertices.push(1);
				vertices.push(x);
				vertices.push(y + 1);
				vertices.push(this._tiles[y][x].type / 2);
				vertices.push(1);
				indices.push(vertices.length / 4 - 4 + 0);
				indices.push(vertices.length / 4 - 4 + 1);
				indices.push(vertices.length / 4 - 4 + 2);
				indices.push(vertices.length / 4 - 4 + 0);
				indices.push(vertices.length / 4 - 4 + 2);
				indices.push(vertices.length / 4 - 4 + 3);
			}
		}
		this._mesh.setVertices(0, vertices, false);
		this._mesh.setIndices(indices, false);
	}

	private _size: Birch.Vector2 = new Birch.Vector2();
	private _tiles: Tile[][] = [];

	private _engine: Birch.Engine;
	private _scene: Birch.Render.Scene;
	private _model: Birch.Render.Model;
	private _mesh: Birch.Render.Mesh;
	private _shader: Birch.Render.Shader;
	private _texture: Birch.Render.Texture;

	// A persisent array used by the doOverlappingTiles function.
	private _overlappingTiles: TileOverlap[] = [];
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
