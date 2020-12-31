import { Birch } from 'birch';

export class Sprite {
	/** The constructor.
	  * @param level - The map is at 0, items are at 1, held items are at 2, characters are at 3. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene, level: number) {

		// Set the engine and scene.
		this._engine = engine;
		this._scene = scene;

		// Create the mesh.
		if (Sprite._mesh === undefined) {
			Sprite._mesh = this._engine.renderer.meshes.create();
			Sprite._mesh.setVertexFormat([[{
				location: 0, // position
				type: 'float',
				dimensions: 2
			}, {
				location: 1, // uv
				type: 'float',
				dimensions: 2
			}]]);
			const vertices: number[] = [-.5, -.5, 0, 1, .5, -.5, 1, 1, .5, .5, 1, 0, -.5, .5, 0, 0];
			const indices: number[] = [0, 1, 2, 2, 3, 0];
			Sprite._mesh.setVertices(0, vertices, false);
			Sprite._mesh.setIndices(indices, false);
		}

		// Create the shader.
		if (Sprite._shader === undefined) {
			Sprite._shader = this._engine.renderer.shaders.create('sprite');
			this._engine.downloader.getJson<Birch.Render.Shader.Options>('assets/shaders/sprite.json').then((json) => {
				Sprite._shader.setFromOptions(json);
			});
		}

		// Increase the number of sprite entities by 1.
		Sprite._count += 1;

		// Create the texture.
		this._texture = this._engine.renderer.textures.create();

		// Setup the model.
		this._model = this._engine.renderer.models.create();
		this._model.mesh = Sprite._mesh;
		this._model.shader = Sprite._shader;
		this._model.depth = level;

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
		this._model.uniforms.setUniform('position', Birch.Vector2.Zero.array);
		this._model.uniforms.setUniform('rotation', 0);
		this._model.uniforms.setUniform('scale', Birch.Vector2.One.array);
		this._model.uniforms.setUniform('level', level);
		this._model.uniforms.setUniform('colorTexture', this._texture);
		this._scene.models.add(this._model);
	}

	/** The destructor. */
	destroy(): void {
		this._scene.models.remove(this._model);
		this._model.destroy();
		this._engine.renderer.textures.destroy(this._texture);

		Sprite._count -= 1;
		if (Sprite._count === 0) {
			this._engine.renderer.meshes.destroy(Sprite._mesh);
			this._engine.renderer.shaders.destroy(Sprite._shader);
		}
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		this._model.uniforms.setUniform('position', position.array);
	}

	/** Sets the rotation in radians. */
	setRotation(rotation: number): void {
		this._model.uniforms.setUniform('rotation', rotation);
	}

	/** Sets the scale of the sprite, as multiplied by the entity scale. */
	setScale(scale: Birch.Vector2Readonly): void {
		this._model.uniforms.setUniform('scale', scale.array);
	}

	/** Sets the texture name. */
	setTextureName(name: string): void {
		this._texture.setSource(`assets/sprites/${name}.png`);
	}

	private static _mesh: Birch.Render.Mesh;
	private static _shader: Birch.Render.Shader;
	private static _count: number = 0;

	private _engine: Birch.Engine;
	private _scene: Birch.Render.Scene;
	private _model: Birch.Render.Model;
	private _texture: Birch.Render.Texture;
}
