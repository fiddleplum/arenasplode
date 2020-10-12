import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { PhysicsComponent } from 'components/physics_component';
import { PlayerComponent } from 'components/player_component';

// A class that handles all held weapons and how they act.
export class PrerenderSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		// this._playerQuery = new Birch.World.Query([PlayerComponent]);
		// this.queries.add(this._playerQuery);
		this.monitorComponentTypes([PlayerComponent]);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		if (component instanceof PlayerComponent) {
			if (event === Birch.World.Entity.ComponentCreated) {
				this._players.add(component);
			}
			else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
				this._players.remove(component);
			}
		}
	}

	update(): void {
		for (const player of this._players) {
			if (player.holding !== undefined) {
				const frame = player.entity.get(Frame2DComponent)!;
				const physics = player.entity.get(PhysicsComponent)!;
				// Put the held entity at the right location relative to the player entity.
				const heldPhysics = player.holding.get(PhysicsComponent)!;
				const heldFrame = player.holding.get(Frame2DComponent)!;
				heldPhysics.setVelocity(physics.velocity);
				const newPosition = Birch.Vector2.temp0;
				newPosition.mult(Birch.Vector2.UnitX, 0.45);
				newPosition.rot(newPosition, frame.rotation);
				newPosition.add(frame.position, newPosition);
				heldFrame.setPosition(newPosition);
				heldFrame.setRotation(frame.rotation);
			}
		}
	}

	// private _playerQuery: Birch.World.Query;

	private _players: Birch.FastOrderedSet<PlayerComponent> = new Birch.FastOrderedSet();
}
