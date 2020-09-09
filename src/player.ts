import { Birch } from '../../birch/src/index';
import { App } from './app';
import { SpriteComponent } from './components/sprite_component';

export class Player {
	app: App;

	index: number;

	viewport: Birch.Viewport;

	camera: Birch.World.Entity;

	character: Birch.World.Entity;

	constructor(app: App, index: number) {
		this.app = app;
		this.index = index;

		// Create the viewport.
		this.viewport = this.app.birch.viewports.create('' + index);
		const div = this.viewport.div;
		div.style.left = '0';
		div.style.top = '0';
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.border = '1px solid white';
		this.viewport.clearColor = new Birch.Color(0, 0, 0, 1);
		this.viewport.stage.scene = this.app.world.scene;

		// Create the camera.
		this.camera = this.app.world.entities.create('camera ' + index);
		const cameraCamera = this.camera.components.create(Birch.World.CameraComponent);
		cameraCamera.near = 0.01;
		const cameraFrame = this.camera.components.create(Birch.World.FrameComponent, 'frame');
		cameraFrame.position = new Birch.Vector3(0, 0, 8.00);

		// Attach the camera to the viewport.
		this.viewport.camera = this.camera;

		// Create the character.
		this.character = this.app.world.entities.create('character ' + index);
		const characterSprite = this.character.components.create(SpriteComponent, 'sprite');
		characterSprite.url = 'assets/sprites/characters/bob.png';
		const characterFrame = this.character.components.create(Birch.World.FrameComponent, 'frame');
		characterFrame.position = new Birch.Vector3(0, 0, 0);
	}

	destroy(): void {
		this.app.world.entities.destroy(this.character);
		this.app.world.entities.destroy(this.camera);
		this.app.birch.viewports.destroy(this.viewport);
	}
}
