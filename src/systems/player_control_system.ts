import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { HoldableComponent } from 'components/holdable_component';
import { PhysicsComponent } from 'components/physics_component';
import { PlayerComponent } from 'components/player_component';
import { CollisionSystem } from './collision_system';

export class PlayerControlSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		this._axisThreshold = 0.15;

		this.monitorComponentTypes([PlayerComponent, Frame2DComponent, PhysicsComponent]);

		this._onButtonChanged = this._onButtonChanged.bind(this);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		const entity = component.entity;
		if (event === Birch.World.Entity.ComponentCreated) {
			if (entity.has(Frame2DComponent) && entity.has(PlayerComponent) && entity.has(PhysicsComponent)) {
				const player = entity.get(PlayerComponent)!;

				if (!this._characters.has(player.index)) {
					const controller = this.world.engine.input.getController(player.index);
					if (controller !== undefined) {
						// Add the character to the list.
						this._characters.set(player.index, entity);

						// Subscribe to button events.
						controller.addButtonCallback(this._onButtonChanged);
					}
				}
			}
		}
		else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
			if (!entity.has(Frame2DComponent) || !entity.has(PlayerComponent) || !entity.has(PhysicsComponent)) {
				let player = entity.get(PlayerComponent);
				if (player === undefined) {
					player = component as PlayerComponent;
				}

				if (this._characters.has(player.index)) {
					this._characters.remove(player.index);

					// Unsubscribe to button events.
					const controller = this.world.engine.input.getController(player.index);
					if (controller !== undefined) {
						controller.removeButtonCallback(this._onButtonChanged);
					}
				}
			}
		}
	}

	/** Handles the controller inputs every frame. */
	update(): void {
		for (const entry of this._characters) {
			const playerIndex = entry.key;
			const character = entry.value;
			const controller = this.world.engine.input.getController(playerIndex);
			if (controller === undefined) {
				continue;
			}
			// Handle moving.
			let x = controller.axis(0);
			let y = controller.axis(1);
			if (Math.abs(x) < this._axisThreshold) {
				x = 0;
			}
			if (Math.abs(y) < this._axisThreshold) {
				y = 0;
			}
			if (x !== 0 || y !== 0) {
				const physics = character.get(PhysicsComponent)!;
				const frame = character.get(Frame2DComponent)!;
				const velocity = physics.velocity;
				const newVelocity = Birch.Vector2.temp0;
				newVelocity.set(velocity.x + x * .25, velocity.y - y * .25);
				physics.setVelocity(newVelocity);
				const newAngle = Math.atan2(-y, x);
				frame.setRotation(newAngle);
			}
		}
	}

	private _onButtonChanged(controllerIndex: number, buttonIndex: number, newValue: number): void {
		// Pickup and drop weapons.
		if (buttonIndex === 0 && newValue === 1) {
			// const player = character.get(PlayerComponent)!;
			// const physicsComponent = character.get(PhysicsComponent)!;
			const character = this._characters.get(controllerIndex);
			if (character === undefined) {
				return;
			}
			const playerComponent = character.get(PlayerComponent)!;
			const physicsComponent = character.get(PhysicsComponent)!;
			const frameComponent = character.get(Frame2DComponent)!;
			const collisionSystem = this.world.getSystem(CollisionSystem)!;

			// Get the nearest entity colliding with the character.
			const collidingEntities = collisionSystem.collidingEntities.get(character);
			if (collidingEntities === undefined) {
				return; // Nothing nearby, so return.
			}
			let nearestCollidingEntity: Birch.World.Entity | undefined = undefined;
			let nearestCollidingDistance = Number.POSITIVE_INFINITY;
			for (const collidingEntity of collidingEntities) {
				const entityFrame = collidingEntity.get(Frame2DComponent)!;
				const distance = entityFrame.position.distance(frameComponent.position);
				if (distance < nearestCollidingDistance) {
					nearestCollidingDistance = distance;
					nearestCollidingEntity = collidingEntity;
				}
			}
			if (nearestCollidingEntity !== undefined) {
				const holdableComponent = nearestCollidingEntity.get(HoldableComponent);
				// See if it's an holdable item and not held by someone else.
				if (holdableComponent !== undefined && holdableComponent.heldBy === undefined) {
					// If the character had a holdable item, toss it.
					if (playerComponent.holding !== undefined) {
						const heldItem = playerComponent.holding;
						playerComponent.setHolding(undefined);
						// Set the item as not held.
						const oldItemHoldable = heldItem.get(HoldableComponent)!;
						oldItemHoldable.heldBy = undefined;
						// Add the physics component and do the toss physics.
						const oldItemPhysics = heldItem.get(PhysicsComponent)!;
						const oldItemVelocity = Birch.Vector2.temp0;
						const forward = Birch.Vector2.temp1;
						forward.rot(Birch.Vector2.UnitX, frameComponent.rotation);
						oldItemVelocity.addMult(physicsComponent.velocity, 1, forward, 1);
						oldItemPhysics.setVelocity(oldItemVelocity);
						oldItemPhysics.boundEntities.remove(character);
					}
					playerComponent.setHolding(nearestCollidingEntity);
					holdableComponent.heldBy = playerComponent;
				}
				// See if it's a powerup.
				// const powerup = nearestCollidingEntity.get(PowerupComponent);
				// if (powerup !== undefined) {
				// }
			}
		}
	}

	private _axisThreshold: number;

	private _characters: Birch.FastMap<number, Birch.World.Entity> = new Birch.FastMap();
}
