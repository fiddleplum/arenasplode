import { Birch } from '../../../birch/src/index';

// Now I have a frame component sending events to a frame-model system,
// and the frame-model system updating the model modelMatrix uniform.

// How does the sprite fit into this? The character entity now will have
// frame and model components. If the model needs to be setup like a Sprite,
// should the sprite be a component?

// Or should the sprite component be a
// subclass of the model component? Then there could be a SpriteModelComponent
// and a MapModelComponent and a GLTFModelComponent, and all could work properly
// with the frame-model system.

// ----

// I'm having trouble with the above, because the Entity.getByType doesn't take into account subclasses,
//   so that Entity.getByType(ModelComponent) wouldn't also pick up the SpriteComponent.
// I see a few options.
//   * I could make the getByType handle the whole hierarchy up to Component.
//   * Perhaps the frame-model system needs to check for components that have a .model getter instead of
//     being a model component. I can't use an interface, since that can't be checked at run time.
// I like the idea of checking for the .model getter, since that will allow more flexibility in components.
// If I had a hierarchy and any component using a model had to extend ModelComponent, then they couldn't
//   extend other things.

// ----

// Are there other options beside subclassing model component
//   or having frame-model system look for .model getters?

// Could sprite be a component that just has a url, and then there is a sprite system that sets
//   the model component based on the sprite?
// This feels like a lot of overhead.

// ----

// Going back to hierarchies of component classes, right now frame-model system checks for
//   a model component by type every single time there is an event.
// Perhaps it could go through each component and check if it an instanceof ModelComponent.

// I'm going to keep looking into making the CollectionTyped get the whole hierarchy and then having
//   frame-model system look for ModelComponent base classes.

// ----

// I'm liking the idea of having the sprite component just be a url, and a sprite-model system setting
//   up the model component.
// It feels clean and doesn't require any hierarchies.
// The thing that feels odd is having a system just for sprites, but maybe
//   I need to get used to having tons of systems.

// ----

// Right now every system processes its events every frame. But perhaps instead, I should move that
//   to the event queue. So the event queue tells the system to process a specific event, instead
//   of the system polling for any new events in its queue. Seems more efficient.
// The only problem with this is that the systems wouldn't have any order (they don't have any order now).
// I'll have to think carefully if there is a way to still enforce order, and if I should be having every
//   system run every frame anyway (physics system maybe?).

// ----

// I would also like to move the event queue to the app level. Then viewport could subscribe to it and get
//   its camera frame changed events. Then it would only have to update the stage uniforms when it needs.
// This would also allow components in one world to connect with systems or components in another world.

export class SpriteComponent extends Birch.World.ModelComponent {
	constructor(entity: Birch.World.Entity) {
		super(entity);

		// If this is the first sprite,
		if (SpriteComponent._numSprites === 0) {
			// Create the mesh.
			SpriteComponent._mesh = this.engine.renderer.meshes.create();
			SpriteComponent._mesh.setVertexFormat([[{
				location: 0, // position
				type: 'float',
				dimensions: 2
			}, {
				location: 1, // uv
				type: 'float',
				dimensions: 2
			}]]);
			const vertices: number[] = [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0];
			const indices: number[] = [0, 1, 2, 2, 3, 0];
			SpriteComponent._mesh.setVertices(0, vertices, false);
			SpriteComponent._mesh.setIndices(indices, false);

			// Create the shader.
			SpriteComponent._shader = this.engine.renderer.shaders.create();
			SpriteComponent._shaderLoadedPromise = this.engine.downloader.getJson<Birch.Render.Shader.Options>('assets/shaders/sprite.json').then((json) => {
				SpriteComponent._shader.setFromOptions(json);
			});
		}
		SpriteComponent._numSprites += 1;
		// Create the texture.
		this._texture = this.engine.renderer.textures.create();
		// Create the model.
		this.model.mesh = SpriteComponent._mesh;
		this.model.shader = SpriteComponent._shader;
		// Set the model's uniforms.
		this.model.uniforms.setUniformTypes([{
			name: 'modelMatrix',
			type: Birch.Render.Uniforms.Type.mat4x4
		}, {
			name: 'colorTexture',
			type: Birch.Render.Uniforms.Type.sampler2D
		}]);
		this.model.uniforms.setUniform('colorTexture', this._texture);
	}

	destroy(): void {
		this.engine.renderer.textures.destroy(this._texture);
		SpriteComponent._numSprites -= 1;
		if (SpriteComponent._numSprites === 0) {
			this.engine.renderer.shaders.destroy(SpriteComponent._shader);
			this.engine.renderer.meshes.destroy(SpriteComponent._mesh);
		}
		super.destroy();
	}

	get url(): string {
		return this._url;
	}

	set url(url: string) {
		if (this._url !== url) {
			this._url = url;
			this._texture.setSource(url);
			this._textureLoadedPromise = this._texture.getLoadedPromise();
		}
	}

	getLoadedPromise(): Promise<[void, void]> {
		return Promise.all([this._textureLoadedPromise, SpriteComponent._shaderLoadedPromise]);
	}

	private _textureLoadedPromise: Promise<void> = Promise.resolve();
	private _texture: Birch.Render.Texture;
	private _url: string = '';

	private static _mesh: Birch.Render.Mesh;
	private static _shader: Birch.Render.Shader;
	private static _shaderLoadedPromise: Promise<void>;
	private static _numSprites: number = 0;
}
