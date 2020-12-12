import { Birch } from 'birch';
import { SwordComponent } from 'components/sword_component';

// A class that handles all held weapons and how they act.
export class PrerenderSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		this.monitorComponentTypes([SwordComponent]);
	}

	/** Process any events. */
	processEvent(component: Birch.World.Component, event: symbol): void {
		if (component instanceof SwordComponent) {
			if (event === Birch.World.Entity.ComponentCreated) {
				this._players.add(component);
			}
			else if (event === Birch.World.Entity.ComponentWillBeDestroyed) {
				this._players.remove(component);
			}
		}
	}

	update() {
	}
}
