import { App } from 'elm-app';
import { Birch } from 'birch';
import { Level } from 'level';
import { Player } from 'player';
import { Entity } from 'entities/entity';
import { Entities } from 'entities';

export class ArenaSplodeApp extends App {
	/** Destructs the app. */
	destroy(): void {
		for (const entity of this._entities) {
			entity.destroy();
		}
		if (this._level !== undefined) {
			this._level.destroy();
		}
		window.removeEventListener('resize', this._adjustViewports);
		if (this._engine !== undefined) {
			this._engine.destroy();
		}
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

	/** Gets the player. */
	getPlayer(index: number): Player | undefined {
		return this._players.getIndex(index);
	}

	/** Adds an entity so that it will update. */
	addEntity(entity: Entity): void {
		this._entities.add(entity);
	}

	/** Removes an entity so that it will stop updating. */
	removeAndDestroyEntity(entity: Entity): void {
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
		for (const entity of this._entities) {
			for (const otherEntity of entity.intersectingEntities) {
				entity.onTouch(otherEntity);
			}
		}

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

	private async _onStart(): Promise<void> {
		// Change up the UI.
		this.removeElement(this.element('start', HTMLDivElement));
		this.element('title', HTMLDivElement).innerHTML = `<img src="assets/sprites/title.png"></img>`;

		// Create the engine and scene.
		this._engine = new Birch.Engine(document.querySelector('.birch') as HTMLDivElement);
		this._scene = this._engine.renderer.scenes.create();

		// Load the resources.
		await this._loadResources();

		// Create the map.
		this._level = new Level(this._engine, this._scene);

		// Create the initial items.
		for (let i = 0; i < this._level.size.x * this._level.size.y / 30; i++) {
			Entities.createRandomItem(this);
		}

		// Add resize callback. Adjusts the viewport.
		this._adjustViewports = this._adjustViewports.bind(this);
		window.addEventListener('resize', this._adjustViewports);

		// Add the update callback.
		this._engine.addUpdateCallback(this._update.bind(this));

		this.setHtml(this.element('message', HTMLDivElement), `<span>Waiting for Players...</span>`);

		// Add the callback for when controllers are connected or disconnected.
		this._engine.input.setControllerConnectedCallback((index: number, connected: boolean) => {
			if (connected) {
				// If the 'Waiting for player' message is there, turn it off.
				if (this.hasElement('message')) {
					this.removeElement(this.element('message', HTMLDivElement));
				}
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
	}

	/** Load all of the resources. */
	private _loadResources(): Promise<void[]> {
		// Setup the default load functions.
		this._engine.sounds.setDefaultLoadFunction((sound: Birch.Sound, name: string) => {
			return sound.setUrl(`assets/sounds/${name}.ogg`);
		});
		this._engine.renderer.textures.setDefaultLoadFunction((texture: Birch.Render.Texture, name: string) => {
			return texture.setSource(`assets/sprites/${name}.png`);
		});

		const promises: Promise<void>[] = [];
		promises.push(this._engine.renderer.textures.load(`tiles`));
		promises.concat(Entities.loadEntityResources(this._engine));
		for (let i = 0; i < 4; i++) {
			promises.push(this._engine.sounds.load(`announcer${i}`));
		}
		promises.push(this._engine.sounds.load(`announcerScore`));
		promises.push(this._engine.sounds.load(`announcerSuper`));
		promises.push(this._engine.sounds.load(`announcerWeapon`));
		return Promise.all(promises);
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

	private _engine!: Birch.Engine;

	private _scene!: Birch.Render.Scene;

	private _level!: Level;

	private _players: Birch.FastOrderedSet<Player> = new Birch.FastOrderedSet();

	private _entities: Birch.FastOrderedSet<Entity> = new Birch.FastOrderedSet();
}

ArenaSplodeApp.html = /* html */`
	<div id="title" class="title"></div>	
	<div class='birch'></div>
	<div id="message" class="message"><span>Loading...</span></div>
	<div id="start" class="start">
		<img src="assets/sprites/title.png"></img>
		<button onclick="{$_onStart$}">Start</button>
	</div>
	`;

ArenaSplodeApp.css = /* css */`
	html, body {
		width: 100%;
		height: 100vh;
		background: black;
		color: white;
		display: grid;
		grid-template-rows: 3rem 1fr;
		grid-template-areas: "header" "main";
	}
	.title {
		grid-area: header;
		text-align: center;
	}
	.title img {
		line-height: 3rem;
		height: 2.5rem;
		margin: .25rem 0;
	}
	.birch {
		grid-area: main;
	}
	.start, .message {
		grid-area: main;
		width: 100%;
		height: calc(100% - 2rem);
		background: black;
		z-index: 1;
		text-align: center;
	}
	.message span {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		transform: translate(-50%, -50%);
		font-size: 8vw;
		color: white;
	}
	.start {
		display: grid;
		grid-template-rows: 1fr 1fr;
	}
	.start img {
		margin: auto;
		width: 50%;
		height: auto;
	}
	.start button {
		margin: auto;
		width: 25rem;
		font-size: 5rem;
		color: white;
		background: darkgreen;
		border: 4px solid white;
		border-radius: 6rem;
	}
	.viewports {
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.viewports > div {
		border: 1px solid white;
	}
	.character-selection {
		position: absolute;
		top: 50%;
		left: 50%;
		height: 66px;
		transform: translate(-50%, -50%);
		overflow: hidden;
	}
	.character {
		border: 1px solid transparent;
	}
	.character.selected { 
		border: 1px solid white;
	}
	.healthbar {
		margin: 0.5rem;
		width: calc(100% - 1rem);
		height: 2rem;
		border: 1px solid white;
	}
	.healthbar .health {
		background: green;
		height: calc(2rem - 2px);
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
