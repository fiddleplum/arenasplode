import { Birch } from 'birch';
import { MapComponent } from 'components/map_component';
import { PlayerControlSystem } from 'systems/player_control_system';
import { CameraCenteringSystem } from 'systems/camera_centering_system';
import { PhysicsSystem } from 'systems/physics_system';
import { ItemSystem } from 'systems/item_system';
import { PrerenderSystem } from 'systems/prerender_system';
import { PlayerSystem } from 'systems/player_system';
import { Frame2DSpriteSystem } from 'systems/frame_2d_sprite_system';
import { CollisionSystem } from 'systems/collision_system';

export class App {
	/** Constructs the app. */
	constructor() {
		this._birch = new Birch.Engine(document.querySelector('div') as HTMLDivElement);
		this._initializeWorld();
	}

	/** Destructs the app. */
	destroy(): void {
	}

	/** Gets the Birch engine. */
	get birch(): Birch.Engine {
		return this._birch;
	}

	/** Gets the world. */
	get world(): Birch.World.World {
		return this._world;
	}

	/** Initialize world. */
	private _initializeWorld(): void {
		// Create the world and systems.
		this._world = this._birch.worlds.create('main');
		this._world.systems.create(Frame2DSpriteSystem, 'frame2DSprite');
		this._world.systems.create(PlayerSystem, 'player');
		this._world.systems.create(PlayerControlSystem, 'playerControl');
		this._world.systems.create(ItemSystem, 'itemSystem');
		this._world.systems.create(PhysicsSystem, 'physics');
		this._world.systems.create(CollisionSystem, 'collision');
		this._world.systems.create(PrerenderSystem, 'prerender');
		this._world.systems.create(CameraCenteringSystem, 'cameraCentering');

		// Create the map.
		const mapEntity = this._world.entities.create('map');
		mapEntity.components.create(MapComponent, 'map');

		// Add the items.
		const itemSystem = this._world.systems.getFirstOfType(ItemSystem) as ItemSystem;
		itemSystem.initializeItems();
	}

	private _birch: Birch.Engine;

	private _world!: Birch.World.World;
}

declare global {
	interface Window {
		app: App;
		Birch: typeof Birch;
	}
}

window.addEventListener('load', () => {
	window.app = new App();
	window.Birch = Birch;
});
