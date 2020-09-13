import { Birch } from '../../birch/src/index';
import { MapComponent } from './components/map_component';
import { Player } from './player';
import { PlayerControlSystem } from './systems/player_control_system';
import { CameraCenteringSystem } from './systems/camera_centering_system';
import { PhysicsComponent } from './components/physics_component';
import { PhysicsSystem } from './systems/physics_system';
import { ItemSystem } from './systems/item_system';

export class App {
	/** Constructs the app. */
	constructor() {
		this._birch = new Birch.Engine(document.querySelector('div') as HTMLDivElement);
		this._initializeWorld();
		this._birch.input.setControllerConnectedCallback((index: number, connected: boolean) => {
			if (connected) {
				this._addPlayer(index);
			}
			else {
				this._removePlayer(index);
			}
		});
		window.addEventListener('resize', () => {
			this._adjustViewports();
		});
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

	/** Gets the players. */
	get players(): Birch.FastMap<number, Player> {
		return this._players;
	}

	/** Initialize world. */
	private _initializeWorld(): void {
		// Create the world and systems.
		this._world = this._birch.worlds.create('main');
		this._world.systems.create(Birch.World.FrameModelSystem, 'frameModel');
		this._world.systems.create(PlayerControlSystem, 'playerControl');
		this._world.systems.create(PhysicsSystem, 'physics');
		this._world.systems.create(CameraCenteringSystem, 'cameraCentering');
		this._world.systems.create(ItemSystem, 'itemSystem');

		// Create the map.
		const mapEntity = this._world.entities.create('map');
		this._map = mapEntity.components.create(MapComponent, 'map');
		mapEntity.components.create(Birch.World.FrameComponent, 'frame');

		// Add the items.
		const itemSystem = this._world.systems.getFirstOfType(ItemSystem) as ItemSystem;
		itemSystem.initializeItems();
	}

	/** Add a player. */
	private _addPlayer(index: number): void {
		const player = new Player(this, index);
		this._players.set(index, player);
		this._adjustViewports();
	}

	/** Remove a player. */
	private _removePlayer(index: number): void {
		const player = this._players.get(index);
		if (player !== undefined) {
			player.destroy();
			this._players.remove(index);
		}
	}

	/** Make the viewports the optimal proportions. */
	private _adjustViewports(): void {
		const numPlayers = this._players.size;
		const div = document.querySelector('div') as HTMLDivElement;
		// Cycle through every arrangement of views and find the most "square" arrangement.
		let bestCols = 1;
		let bestScore = 0;
		for (let cols = 1; cols <= numPlayers; cols++) {
			const rows = Math.ceil(numPlayers / cols);
			let score = 1;
			let aspectOfEachView = (div.clientWidth / cols) / (div.clientHeight / rows);
			// Favor horizontal views.
			if (aspectOfEachView > 1) {
				score *= 1.5;
			}
			// Favor square views.
			if (aspectOfEachView > 1) {
				aspectOfEachView = 1 / aspectOfEachView;
			}
			score *= aspectOfEachView;
			// Favor views with no empty spaces.
			if (numPlayers % cols === 0) {
				score *= 1.5;
			}
			// If this score is the best, record the best score and columns.
			if (score >= bestScore || cols === 1) {
				bestCols = cols;
				bestScore = score;
			}
		}
		// Adjust the viewports to work with the best number of columns.
		const bestRows = Math.ceil(numPlayers / bestCols);
		let i = 0;
		for (const playerEntry of this._players) {
			const viewport = playerEntry.value.viewport;
			const row = Math.floor(i / bestCols);
			const col = i % bestCols;
			viewport.div.style.left = (col / bestCols * 100) + '%';
			viewport.div.style.top = (row / bestRows * 100) + '%';
			viewport.div.style.width = 'calc(' + (1 / bestCols * 100) + '% - 2px)';
			viewport.div.style.height = 'calc(' + (1 / bestRows * 100) + '% - 2px)';
			i++;
		}
	}

	private _birch: Birch.Engine;

	private _world!: Birch.World.World;

	private _map!: MapComponent;

	private _players: Birch.FastMap<number, Player> = new Birch.FastMap();
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
