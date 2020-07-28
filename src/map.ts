import { Birch } from '../../birch/src/index';
import { Tile } from './tile';

export class MapComponent extends Birch.Component {
	constructor(entity: Birch.Entity) {
		super(entity);

		this._mesh = this.engine.renderer.createMesh();
		this._mesh.setVertexFormat([[
			new Birch.Render.Mesh.Component(0, 'float', 2, false), // position
			new Birch.Render.Mesh.Component(1, 'float', 2, false)]]); // uv
		this._shader = this.engine.renderer.createShader();
		const vertexCode = `#version 300 es
		in vec2 a_position;
		in vec2 a_uv;
		out vec2 v_uv;
		void main() {
			gl_Position = vec4(a_position / 25.0, 0.0, 1.0);
			v_uv = a_uv;
		}`;
		const fragmentCode = `#version 300 es
		precision highp float;
		uniform sampler2D colorTexture;
		in vec2 v_uv;
		out vec4 o_color;
		void main() {
			vec3 color = texture(colorTexture, v_uv).rgb;
			o_color = vec4(color, 1);
		}`;
		this._shader.setCodeAndAttributes(vertexCode, fragmentCode, new Map<string, number>([['a_position', 0], ['a_uv', 1]]));
		this._texture = this.engine.renderer.createTexture();
		this._texture.setSource('assets/tiles.png');
		this._shader.setTexture(this._shader.getUniformLocation('colorTexture'), 0);
		this._model = this.engine.renderer.createModel();
		this._model.mesh = this._mesh;
		this._model.shader = this._shader;
		this._model.textures.push(this._texture);
		this.entity.world.scene.models.add(this._model);
		this._mesh.setVertices(0, [
			0, 0, 0, 0,
			1, 0, 1, 0,
			0, 0.5, 0, 1
		], false);
		this._mesh.setIndices([0, 1, 2], false);

		this.size = new Birch.Vector2(25, 25);
	}

	destroy(): void {
		this.engine.renderer.destroyModel(this._model);
	}

	set size(size: Birch.Vector2) {
		this._size.copy(size);
		this._tiles = [];
		for (let y = 0; y < this._size.y; y++) {
			this._tiles.push([]);
			for (let x = 0; x < this._size.x; x++) {
				const tile = new Tile();
				if (Math.random() >= 0.9) {
					tile.type = Tile.Type.Wall;
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
	private _model: Birch.Render.Model;
}
