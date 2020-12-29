import { App } from 'elm-app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Player } from 'player';
import { Entity } from 'entities/entity';
import { Items } from 'items';
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
		this._level = new Level(this._engine, this._scene);

		// Create the initial items.
		for (let i = 0; i < this._level.size.x * this._level.size.y / 30; i++) {
			Items.createRandomItem(this);
		}

		// Add resize callback. Adjusts the viewport.
		this._adjustViewports = this._adjustViewports.bind(this);
		window.addEventListener('resize', this._adjustViewports);

		// Add the callback for when controllers are connected or disconnected.
		this._engine.input.setControllerConnectedCallback((index: number, connected: boolean) => {
			if (connected) {
				console.log(`Player ${index + 1} connected.`);
				const oldPlayer = this._players.getIndex(index);
				// Clean out any old player if it's still there.
				if (oldPlayer !== undefined) {
					oldPlayer.destroy();
				}
				// Add new player.
				this._players.add(new Player(index, this));
			}
			else {
				console.log(`Player ${index + 1} disconnected.`);
				const player = this._players.getIndex(index);
				if (player !== undefined) {
					player.destroy();
					this._players.remove(player);
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

	/** Gets the scene. */
	get scene(): Birch.Render.Scene {
		return this._scene;
	}

	/** Gets the level. */
	get level(): Level {
		return this._level;
	}

	/** Adds an entity so that it will update. */
	addEntity(entity: Entity): void {
		this._entities.add(entity);
	}

	/** Removes an entity so that it will stop updating. */
	removeEntity(entity: Entity): void {
		if (this._entities.remove(entity)) {
			entity.destroy();
		}
	}

	/** Updates the game. */
	private _update(deltaTime: number): void {
		// Do the update for every player.
		for (const player of this._players) {
			player.updateControls();
		}

		// Do the update for every entity.
		for (const entity of this._entities) {
			entity.update(deltaTime);
		}

		// Do physics iteration for every entity.
		for (const entity of this._entities) {
			entity.doPhysics(deltaTime);
		}

		// Get the entity-entity intersections.
		const diff = Birch.Vector2.pool.get();
		for (const entity1 of this._entities) {
			for (const entity2 of this._entities) {
				if (entity1 === entity2) {
					continue;
				}
				diff.sub(entity1.position, entity2.position);
				const radii = entity1.radius + entity2.radius;
				if (diff.dot(diff) < radii * radii) { // Intersecting
					if (!entity1.intersectingEntities.has(entity2)) {
						entity1.intersectingEntities.add(entity2);
						entity2.intersectingEntities.add(entity1);
					}
				}
				else {
					if (entity1.intersectingEntities.has(entity2)) {
						entity1.intersectingEntities.remove(entity2);
						entity2.intersectingEntities.remove(entity1);
					}
				}
			}
		}
		Birch.Vector2.pool.release(diff);

		// Handle entity-map collisions.
		for (const entity of this._entities) {
			this._level.handleOverlappingTiles(entity);
		}

		// Do the pre-render for every entity.
		for (const entity of this._entities) {
			entity.preRender();
		}

		// Do the player viewport/camera pre-render.
		for (const player of this._players) {
			player.preRender();
		}
	}

	/** Make the viewports the optimal proportions. */
	private _adjustViewports(): void {
		const numPlayers = this._players.size();
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

	private _level: Level;

	private _players: Birch.FastOrderedSet<Player> = new Birch.FastOrderedSet();

	private _entities: Birch.FastOrderedSet<Entity> = new Birch.FastOrderedSet();
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

// Typing to ensure TypeScript is happy with the app global.
declare global {
	interface Window {
		Birch: typeof Birch;
	}
}
window.Birch = Birch;
