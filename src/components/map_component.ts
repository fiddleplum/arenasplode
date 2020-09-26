import { Birch } from 'birch';
import { Tile } from '../tile';

export class MapComponent extends Birch.World.ModelComponent {
	constructor(entity: Birch.World.Entity) {
		super(entity);

		// Create the mesh.
		this._mesh = this.engine.renderer.meshes.create();
		this._mesh.setVertexFormat([[{
			location: 0, // position
			type: 'float',
			dimensions: 2
		}, {
			location: 1, // uv
			type: 'float',
			dimensions: 2
		}]]);

		this._shader = this.engine.renderer.shaders.create();

		// Create the texture.
		this._texture = this.engine.renderer.textures.create();
		this._texture.setSource('assets/sprites/tiles.png');

		// Setup the model.
		this.model.mesh = this._mesh;
		this.model.shader = this._shader;

		// Set the model's uniforms.
		this.model.uniforms.setUniformTypes([{
			name: 'position',
			type: Birch.Render.Uniforms.Type.vec2
		}, {
			name: 'rotation',
			type: Birch.Render.Uniforms.Type.float
		}, {
			name: 'level',
			type: Birch.Render.Uniforms.Type.float
		}, {
			name: 'colorTexture',
			type: Birch.Render.Uniforms.Type.sampler2D
		}]);
		this.model.uniforms.setUniform('position', Birch.Vector2.Zero.array);
		this.model.uniforms.setUniform('rotation', 0);
		this.model.uniforms.setUniform('level', 0);
		this.model.uniforms.setUniform('colorTexture', this._texture);

		// Set the size of the map.
		this._size = new Birch.Vector2(25, 25);
		this._updateMap();

		// Create the shader.
		this.engine.downloader.getJson<Birch.Render.Shader.Options>('assets/shaders/sprite.json').then((json) => {
			this._shader.setFromOptions(json);
		});
	}

	destroy(): void {
		this.entity.world.scene.models.remove(this.model);
		this.engine.renderer.models.destroy(this.model);
		this.engine.renderer.textures.destroy(this._texture);
		this.engine.renderer.shaders.destroy(this._shader);
		this.engine.renderer.meshes.destroy(this._mesh);
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

	private _mesh: Birch.Render.Mesh;
	private _shader: Birch.Render.Shader;
	private _texture: Birch.Render.Texture;
}
