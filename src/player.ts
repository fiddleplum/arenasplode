import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Camera } from 'camera';
import { Character } from 'entities/character';

const axisThreshold: number = 0.15;

export class Player {
	// Constructs this.
	constructor(index: number, app: ArenaSplodeApp) {
		this._index = index;
		this._app = app;

		// Create and setup the viewport.
		this._viewport = this._app.engine.viewports.create();
		this._viewport.setClearColor(new Birch.Color(0, 0, 0, 1));
		this._viewport.stage.scene = this._app.scene;
		const div = this._viewport.div;
		div.style.left = '0';
		div.style.top = '0';
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.border = '1px solid white';

		// Create the character.
		this._character = new Character(app.engine, app.scene);
		app.addEntity(this._character);
		this._character.setPosition(new Birch.Vector2(1 + Math.random() * (app.map.size.x - 2), 1 + Math.random() * (app.map.size.y - 2)));

		// Create the camera.
		this._camera = new Camera(this._viewport.stage);
		this._camera.setEntityFocus(this._character);
		app.addEntity(this._camera);
	}

	updateControls(): void {
		const controller = this._app.engine.input.getController(this._index);
		// If for some reason the controller isn't there, do nothing.
		if (controller === undefined) {
			return;
		}
		// Handle moving.
		let x = controller.axis(0);
		let y = controller.axis(1);
		if (Math.abs(x) < axisThreshold) {
			x = 0;
		}
		if (Math.abs(y) < axisThreshold) {
			y = 0;
		}
		if (x !== 0 || y !== 0) {
			// Update the velocity.
			const velocity = this._character.velocity;
			const newVelocity = Birch.Vector2.pool.get();
			newVelocity.set(velocity.x + x * .25, velocity.y - y * .25);
			this._character.setVelocity(newVelocity);
			Birch.Vector2.pool.release(newVelocity);

			// Point the character in the right direction.
			const newAngle = Math.atan2(-y, x);
			this._character.setRotation(newAngle);
		}
	}

	// Destroys this.
	destroy(): void {
		this._app.removeEntity(this._character);
		this._app.removeEntity(this._camera);
		this._app.engine.viewports.destroy(this._viewport);
	}

	/** Sets the viewport bounds as a fraction of the total render size. */
	setViewportBounds(left: number, top: number, width: number, height: number): void {
		// Update the viewport div.
		this._viewport.div.style.left = (left * 100) + '%';
		this._viewport.div.style.top = (top * 100) + '%';
		this._viewport.div.style.width = 'calc(' + (width * 100) + '% - 2px)';
		this._viewport.div.style.height = 'calc(' + (height * 100) + '% - 2px)';

		// Update the camera.
		const widestSize = 10;
		const viewportWidth = this._viewport.div.clientWidth;
		const viewportHeight = this._viewport.div.clientHeight;
		if (viewportWidth >= viewportHeight) {
			this._camera.setViewSize(new Birch.Vector2(widestSize, widestSize * viewportHeight / viewportWidth));
		}
		else {
			this._camera.setViewSize(new Birch.Vector2(widestSize * viewportWidth / viewportHeight, widestSize));
		}
	}

	/** Gets the viewport. */
	get viewport(): Birch.Viewport {
		return this._viewport;
	}

	/** Gets the camera. */
	get camera(): Camera {
		return this._camera;
	}

	private _index: number;
	private _app: ArenaSplodeApp;
	private _viewport: Birch.Viewport;
	private _camera: Camera;
	private _character: Character;
}
