import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { PlayerComponent } from 'components/player_component';
import { SwordComponent } from 'components/sword_component';

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
		// Handle players holding things.
		for (const player of this._players) {
			if (player.holding !== undefined) {
				// Put the held entity at the right location relative to the player entity.
				const frame = player.entity.get(Frame2DComponent)!;
				const heldFrame = player.holding.get(Frame2DComponent)!;
				const newPosition = Birch.Vector2.temp0;
				let newRotation = 0;
				// Do sword swinging.
				const swordComponent = player.holding.get(SwordComponent);
				if (swordComponent !== undefined) {
					newPosition.set(1.2, 0);
					const angle = Math.PI / 2 * (swordComponent.swingLerp - 0.5);
					newPosition.rot(newPosition, angle);
					newRotation = angle;
					swordComponent.swingLerp = Birch.Num.clamp01(swordComponent.swingLerp + swordComponent.swingDir * 0.2);
				}
				else {
					newPosition.set(0.9, 0);
					newRotation = 0;
				}
				newPosition.mult(newPosition, frame.radius);
				newPosition.rot(newPosition, frame.rotation);
				newPosition.add(frame.position, newPosition);
				newRotation += frame.rotation;
				heldFrame.setPosition(newPosition);
				heldFrame.setRotation(newRotation);
			}
		}
	}

	private _players: Birch.FastOrderedSet<PlayerComponent> = new Birch.FastOrderedSet();
}
