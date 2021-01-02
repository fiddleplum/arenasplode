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

		// Register the controller callbacks.
		this._buttonCallback = this._buttonCallback.bind(this);
		const controller = this._app.engine.input.getController(this._index)!;
		controller.addButtonCallback(this._buttonCallback);

		// Show the character selection screen.
		let html = '<div class="character-selection">';
		for (let i = 0; i < Player._characterSpriteList.length; i++) {
			const sprite = Player._characterSpriteList[i];
			html += `<img class="character${i === 0 ? ' selected' : ''}" data-sprite="${sprite}" src="assets/sprites/characters/${sprite}.png"></img>`;
		}
		html += '</div>';
		const div = this._viewport.div;
		div.innerHTML = html;
		const divChild = div.firstElementChild as HTMLDivElement;
		divChild.style.marginLeft = Math.floor(66 * (-.5 + divChild.children.length / 2)) + 'px';
	}

	private _chooseCharacter(name: string): void {
		// Attach the scene to the viewport.
		this._viewport.stage.scene = this._app.scene;

		// Create the character.
		this._character = new Character(this._app, name);
		this._app.addEntity(this._character);
		this._character.setPosition(new Birch.Vector2(1 + Math.random() * (this._app.level.size.x - 2), 1 + Math.random() * (this._app.level.size.y - 2)));

		// Create the camera.
		this._camera = new Camera(this._viewport.stage);
		this._camera.setEntityFocus(this._character);
		this._updateCameraViewSize();
	}

	updateControls(): void {
		const controller = this._app.engine.input.getController(this._index);
		// If for some reason the controller isn't there, do nothing.
		if (controller === undefined) {
			return;
		}
		if (this._character !== undefined) {
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
		else { // No character, so we're at character selection.
			// Handle moving.
			const x = controller.axis(0);
			const div = this._viewport.div.firstElementChild as HTMLDivElement;
			if (div.children.length > 0) {
				let selectedImg = div.querySelector('.selected') as HTMLImageElement;
				if (x < -axisThreshold || axisThreshold < x) {
					let lastTimeSelected = 0;
					lastTimeSelected = Number.parseInt(selectedImg.dataset.lastTimeSelected!);
					const now = Date.now();
					if (Number.isNaN(lastTimeSelected) || now - lastTimeSelected > 250) {
						selectedImg.classList.remove('selected');
						if (x > 0) {
							if (selectedImg.nextElementSibling === null) {
								selectedImg = div.firstElementChild as HTMLImageElement;
							}
							else {
								selectedImg = selectedImg.nextElementSibling as HTMLImageElement;
							}
						}
						else {
							if (selectedImg.previousElementSibling === null) {
								selectedImg = div.lastElementChild as HTMLImageElement;
							}
							else {
								selectedImg = selectedImg.previousElementSibling as HTMLImageElement;
							}
						}
						selectedImg.classList.add('selected');
						selectedImg.dataset.lastTimeSelected = '' + now;
						let i = 0;
						while (selectedImg.previousElementSibling !== null) {
							selectedImg = selectedImg.previousElementSibling as HTMLImageElement;
							i += 1;
						}
						div.style.marginLeft = Math.floor(66 * (-i - 0.5 + div.children.length / 2)) + 'px';
					}
				}
			}
		}
	}

	/** Does the prerender for the viewport and camera. */
	preRender(): void {
		// Character hasn't been chosen yet.
		if (this._camera === undefined) {
			return;
		}
		this._camera.preRender();
	}

	/** Destroys this. */
	destroy(): void {
		if (this._character !== undefined) {
			this._app.removeEntity(this._character);
			this._character.destroy();
		}
		this._app.engine.viewports.destroy(this._viewport);
	}

	/** Sets the viewport bounds as a fraction of the total render size. */
	setViewportBounds(left: number, top: number, width: number, height: number): void {
		// Update the viewport div.
		this._viewport.div.style.left = (left * 100) + '%';
		this._viewport.div.style.top = (top * 100) + '%';
		this._viewport.div.style.width = 'calc(' + (width * 100) + '% - 2px)';
		this._viewport.div.style.height = 'calc(' + (height * 100) + '% - 2px)';
		this._updateCameraViewSize();
	}

	/** Gets the viewport. */
	get viewport(): Birch.Viewport {
		return this._viewport;
	}

	/** Gets the camera. */
	get camera(): Camera | undefined {
		return this._camera;
	}

	/** Updates the camera's view size. */
	private _updateCameraViewSize(): void {
		if (this._camera !== undefined) {
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
	}

	private _buttonCallback(_controllerIndex: number, buttonIndex: number, newValue: number): void {
		if (this._character !== undefined) {
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
		else {
			if (buttonIndex === 0 && newValue === 1) {
				const selectedImg = this._viewport.div.firstElementChild!.querySelector('.selected') as (HTMLImageElement | null);
				if (selectedImg !== null) {
					const sprite = selectedImg.dataset.sprite!;
					this._viewport.div.innerHTML = '';
					this._chooseCharacter(sprite);
				}
			}
		}
	}

	static setupCharacterSpriteList(): Promise<void> {
		return fetch('assets/sprites/characters/list.txt').then((response) => response.text()).then((text) => {
			const sprites = text.split('\n');
			for (const sprite of sprites) {
				if (sprite !== '') {
					this._characterSpriteList.push(sprite);
				}
			}
		});
	}

	private static _characterSpriteList: string[] = [];

	private _index: number;
	private _app: ArenaSplodeApp;
	private _viewport: Birch.Viewport;
	private _camera: Camera | undefined;
	private _character: Character | undefined;
}
