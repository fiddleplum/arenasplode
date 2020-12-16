import { App } from 'elm-app';
import { Birch } from 'birch';
import { Map } from 'map';
import { Player } from 'player';
// import { PlayerControlSystem } from 'systems/player_control_system';
// import { CameraCenteringSystem } from 'systems/camera_centering_system';
// import { PhysicsSystem } from 'systems/physics_system';
// import { ItemSystem } from 'systems/item_system';
// import { PrerenderSystem } from 'systems/prerender_system';
// import { PlayerSystem } from 'systems/player_system';
// import { Frame2DSpriteSystem } from 'systems/frame_2d_sprite_system';
// import { OverlapSystem } from 'systems/overlap_system';

export class ArenaSplodeApp extends App {
	/** Constructs the app. */
	constructor() {
		super();

		// Create the engine and scene.
		this._engine = new Birch.Engine(document.querySelector('div') as HTMLDivElement);
		this._scene = this._engine.renderer.scenes.create();

		// Create the map.
		this._map = new Map(this._engine, this._scene);

		// Add resize callback. Adjusts the viewport.
		this._adjustViewports = this._adjustViewports.bind(this);
		window.addEventListener('resize', this._adjustViewports);

		// Add the callback for when controllers are connected or disconnected.
		this._engine.input.setControllerConnectedCallback((index: number, connected: boolean) => {
			if (connected) {
				// Clean out any old player if it's still there.
				if (this._players[index] !== undefined) {
					this._players[index].destroy();
				}
				// Add new player.
				this._players[index] = new Player(index, this);
			}
			else {
				if (this._players[index] !== undefined) {
					this._players[index].destroy();
					this._players.splice(index, 1);
				}
			}
			this._adjustViewports();
		});

		// Add the update callback.
		this._engine.addUpdateCallback(this._update.bind(this));
	}

	/** Destructs the app. */
	destroy(): void {
		window.removeEventListener('resize', this._adjustViewports);
		this._engine.destroy();
	}

	/** Gets the Birch engine. */
	get engine(): Birch.Engine {
		return this._engine;
	}

	get scene(): Birch.Render.Scene {
		return this._scene;
	}

	/** Updates the game. */
	private _update(deltaTime: number): void {
	}

	/** Make the viewports the optimal proportions. */
	private _adjustViewports(): void {
		const numPlayers = this._players.length;
		const div = document.querySelector('div') as HTMLDivElement;
		// Cycle through every arrangement of views and find the most "square" arrangement.
		let bestCols = 1;
		let bestScore = 0;
		for (let cols = 1; cols <= numPlayers; cols++) {
			const rows = Math.ceil(numPlayers / cols);
			let score = 1;
			const aspectOfEachView = (div.clientWidth / cols) / (div.clientHeight / rows);
			// Favor 16/9 aspect ratio views.
			score /= Math.abs(aspectOfEachView - 4 / 3);
			// Favor views with no empty spaces. (Extra 0.01 is there to avoid very similar results that cause flickers because of floating-point imprecision.)
			if (numPlayers % cols === 0) {
				score *= 2.01;
			}
			// If this score is the best, record the best score and columns.
			if (score >= bestScore || cols === 1) {
				bestCols = cols;
				bestScore = score;
			}
		}
		const bestRows = Math.ceil(numPlayers / bestCols);

		// Adjust the viewports to work with the best number of columns and rows.
		let i = 0;
		for (const player of this._players) {
			if (player === undefined) {
				return;
			}
			const row = Math.floor(i / bestCols);
			const col = i % bestCols;
			player.setViewportBounds(col / bestCols, row / bestRows, 1 / bestCols, 1 / bestRows);
			i++;
		}
	}

	private _engine: Birch.Engine;

	private _scene: Birch.Render.Scene;

	private _map: Map;

	private _players: Player[] = [];
}

ArenaSplodeApp.html = /* html */`
	<div class='birch'></div>
	<!-- <div id="menu">
		<div id="title">

		</div>	
	</div> -->
	`;

ArenaSplodeApp.css = /* css */`
	html, body, .ArenaSplodeApp {
		width: 100%;
		height: 100%;
	}
	body > .birch {
		width: 100%;
		height: 100%;
	}
	`;

ArenaSplodeApp.setAppClass();
ArenaSplodeApp.register();
