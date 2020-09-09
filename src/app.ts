import { Birch } from '../../birch/src/index';
import { MapComponent } from './components/map_component';
import { Player } from './player';
import { PlayerControlSystem } from './systems/player_control_system';

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
		// this._addPlayer(0);
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

		const mapEntity = this._world.entities.create('map');
		this._map = mapEntity.components.create(MapComponent, 'map');
		const frame = mapEntity.components.create(Birch.World.FrameComponent, 'frame');
		frame.position = new Birch.Vector3(0, 0, 0);
	}

	/** Add a player. */
	private _addPlayer(index: number): void {
		const player = new Player(this, index);
		this._players.set(index, player);

		// Adjust the viewports for all players.
		const numPlayers = this._players.size;
		const div = document.querySelector('div') as HTMLDivElement;
		let numColumns = Math.ceil(div.clientWidth / div.clientHeight * Math.sqrt(numPlayers));
		if (numColumns > numPlayers) {
			numColumns = numPlayers;
		}
		const numRows = Math.ceil(numPlayers / numColumns);
		let i = 0;
		for (const playerEntry of this._players) {
			const viewport = playerEntry.value.viewport;
			const row = Math.floor(i / numColumns);
			const col = i % numColumns;
			viewport.div.style.left = (col / numColumns * 100) + '%';
			viewport.div.style.top = (row / numRows * 100) + '%';
			viewport.div.style.width = 'calc(' + (1 / numColumns * 100) + '% - 2px)';
			viewport.div.style.height = 'calc(' + (1 / numRows * 100) + '% - 2px)';
			i++;
		}
	}

	/** Remove a player. */
	private _removePlayer(index: number): void {
		const player = this._players.get(index);
		if (player !== undefined) {
			player.destroy();
			this._players.remove(index);
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
