import { Birch } from 'birch';
import { Entity } from 'entity';

export class SpriteEntity extends Entity {
	/** The constructor.
	  * @param level - The map is at 0, items are at 1, held items are at 2, players are at 3. */
	constructor(engine: Birch.Engine, scene: Birch.Render.Scene, level: number) {
		super();

		// Set the engine and scene.
		this._engine = engine;
		this._scene = scene;

		// Create the mesh.
		if (SpriteEntity._mesh === undefined) {
			SpriteEntity._mesh = this._engine.renderer.meshes.create();
			SpriteEntity._mesh.setVertexFormat([[{
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
			SpriteEntity._mesh.setVertices(0, vertices, false);
			SpriteEntity._mesh.setIndices(indices, false);
		}

		// Create the shader.
		if (SpriteEntity._shader === undefined) {
			SpriteEntity._shader = this._engine.renderer.shaders.create('sprite');
			this._engine.downloader.getJson<Birch.Render.Shader.Options>('assets/shaders/sprite.json').then((json) => {
				SpriteEntity._shader.setFromOptions(json);
			});
		}

		// Increase the number of sprite entities by 1.
		SpriteEntity._count += 1;

		// Create the texture.
		this._texture = this._engine.renderer.textures.create();

		// Setup the model.
		this._model = this._engine.renderer.models.create();
		this._model.mesh = SpriteEntity._mesh;
		this._model.shader = SpriteEntity._shader;

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

		SpriteEntity._count -= 1;
		if (SpriteEntity._count === 0) {
			this._engine.renderer.meshes.destroy(SpriteEntity._mesh);
			this._engine.renderer.shaders.destroy(SpriteEntity._shader);
		}
	}

	/** Sets the position. */
	setPosition(position: Birch.Vector2Readonly): void {
		super.setPosition(position);
		this._model.uniforms.setUniform('position', position.array);
	}

	/** Sets the rotation in radians. */
	setRotation(rotation: number): void {
		super.setRotation(rotation);
		this._model.uniforms.setUniform('rotation', rotation);
	}

	/** Sets the radius. */
	setRadius(radius: number): void {
		super.setRadius(radius);
		const newScale = Birch.Vector2.pool.get();
		newScale.mult(this._scaleXY, radius);
		this._model.uniforms.setUniform('scale', newScale.array);
		Birch.Vector2.pool.release(newScale);
	}

	/** Sets the scale of the sprite, as multiplied by the entity scale. */
	protected setScaleXY(scaleXY: Birch.Vector2Readonly): void {
		this._scaleXY.copy(scaleXY);
		const newScale = Birch.Vector2.pool.get();
		newScale.mult(this._scaleXY, this.radius);
		this._model.uniforms.setUniform('scale', newScale.array);
		Birch.Vector2.pool.release(newScale);
	}

	/** Sets the texture name. */
	protected setTextureName(name: string): void {
		this._texture.setSource(`assets/sprites/${name}.png`);
	}

	private static _mesh: Birch.Render.Mesh;
	private static _shader: Birch.Render.Shader;
	private static _count: number = 0;

	private _engine: Birch.Engine;
	private _scene: Birch.Render.Scene;
	private _model: Birch.Render.Model;
	private _texture: Birch.Render.Texture;

	private _scaleXY: Birch.Vector2 = new Birch.Vector2(1, 1);
}
