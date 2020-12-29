import { ArenaSplodeApp } from 'app';
import { Birch } from 'birch';
import { Camera } from 'camera';
import { Character } from 'entities/character';
import { Entity } from 'entities/entity';

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
		this._character = new Character(app);
		app.addEntity(this._character);
		this._character.setPosition(new Birch.Vector2(1 + Math.random() * (app.level.size.x - 2), 1 + Math.random() * (app.level.size.y - 2)));

		// Create the camera.
		this._camera = new Camera(this._viewport.stage);
		this._camera.setEntityFocus(this._character);

		// Register the controller callbacks.
		this._buttonCallback = this._buttonCallback.bind(this);
		const controller = this._app.engine.input.getController(this._index)!;
		controller.addButtonCallback(this._buttonCallback);
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
			newVelocity.set(velocity.x + x, velocity.y - y);
			this._character.setVelocity(newVelocity);
			Birch.Vector2.pool.release(newVelocity);

			// Point the character in the right direction.
			const newAngle = Math.atan2(-y, x);
			this._character.setRotation(newAngle);
		}
	}

	/** Does the prerender for the viewport and camera. */
	preRender(): void {
		this._camera.preRender();
	}

	/** Destroys this. */
	destroy(): void {
		this._app.removeEntity(this._character);
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

	private _buttonCallback(_controllerIndex: number, buttonIndex: number, newValue: number): void {
		// Use item.
		if (buttonIndex === 0 && newValue === 1) {
			this._character.useHeld();
		}
		// Pickup or drop an item.
		else if (buttonIndex === 1 && newValue === 1) {
			// Dropping.
			if (this._character.holdingEntity !== undefined) {
				const heldItem = this._character.holdingEntity;
				// Set the item as not held.
				this._character.setHoldingEntity(undefined);
				heldItem.setHeldBy(undefined);
				// Do the toss physics.
				const newVelocity = Birch.Vector2.pool.get();
				newVelocity.rot(Birch.Vector2.UnitX, this._character.rotation);
				newVelocity.addMult(newVelocity, 5.0, this._character.velocity, 1);
				heldItem.setVelocity(newVelocity);
				Birch.Vector2.pool.release(newVelocity);
			}
			// Picking up.
			else {
				// Get the nearest entity intersecting with the character that can be picked up.
				let nearestIntersectingEntity: Entity | undefined = undefined;
				let nearestIntersectingDistance = Number.POSITIVE_INFINITY;
				for (const intersectingEntity of this._character.intersectingEntities) {
					// If it can be held and isn't currently held.
					if (intersectingEntity.canBeHeld && intersectingEntity.heldBy === undefined) {
						const distance = this._character.position.distance(intersectingEntity.position);
						if (distance < nearestIntersectingDistance) {
							nearestIntersectingDistance = distance;
							nearestIntersectingEntity = intersectingEntity;
						}
					}
				}
				// If there was an valid holdable entity, do it.
				if (nearestIntersectingEntity !== undefined) {
					this._character.setHoldingEntity(nearestIntersectingEntity);
					nearestIntersectingEntity.setHeldBy(this._character);
				}
			}
		}
	}

	private _index: number;
	private _app: ArenaSplodeApp;
	private _viewport: Birch.Viewport;
	private _camera: Camera;
	private _character: Character;
}
