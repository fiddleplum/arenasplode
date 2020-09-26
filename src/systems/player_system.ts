import { Birch } from 'birch';
import { PhysicsComponent } from '../components/physics_component';
import { SpriteComponent } from '../components/sprite_component';
import { PlayerComponent } from '../components/player_component';
import { MapComponent } from '../components/map_component';
import { Frame2DComponent } from '../components/frame_2d_component';

/** The system in charge of adding and removing players. */
export class PlayerSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);

		// Add the callbacks for when controllers are connected or disconnected.
		this.world.engine.input.setControllerConnectedCallback((index: number, connected: boolean) => {
			if (connected) {
				this._addPlayer(index);
			}
			else {
				this._removePlayer(index);
			}
		});

		// When the window is resized, adjust the viewports.
		this._adjustViewports = this._adjustViewports.bind(this);
		window.addEventListener('resize', this._adjustViewports);
	}

	/** Destroys the player system. */
	destroy(): void {
		window.removeEventListener('resize', this._adjustViewports);
		super.destroy();
	}

	/** Gets the current list of players. */
	get players(): Set<number> {
		return this._players;
	}

	/** Add a player. */
	private _addPlayer(index: number): void {
		const engine = this.world.engine;

		// Create the viewport.
		const viewport = engine.viewports.create('viewport ' + index);
		const div = viewport.div;
		div.style.left = '0';
		div.style.top = '0';
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.border = '1px solid white';
		viewport.setClearColor(new Birch.Color(0, 0, 0, 1));
		viewport.stage.scene = this.world.scene;

		// Create the camera.
		const camera = this.world.entities.create('camera ' + index);
		const cameraCamera = camera.components.create(Birch.World.CameraComponent);
		cameraCamera.setNear(0.01);
		cameraCamera.setFar(1000);
		const cameraFrame = camera.components.create(Birch.World.FrameComponent, 'frame');
		cameraFrame.setPosition(new Birch.Vector3(0, 0, 8.00));

		// Attach the camera to the viewport.
		viewport.setCamera(camera);

		// Create the character entity.
		const character = this.world.entities.create('character ' + index);

		// Create the character sprite component.
		const characterSprite = character.components.create(SpriteComponent, 'sprite');
		characterSprite.url = 'assets/sprites/characters/bob.png';

		// Create the character frame component.
		const characterFrame = character.components.create(Frame2DComponent, 'frame');
		// Put the character at a random place in the map.
		const map = character.world.entities.get('map')?.get(MapComponent) as MapComponent;
		characterFrame.setPosition(new Birch.Vector2(1 + Math.random() * (map.size.x - 2), 1 + Math.random() * (map.size.y - 2)));
		characterFrame.setLevel(0.1);

		// Create the character player component.
		const player = character.components.create(PlayerComponent, 'player');
		player.setIndex(index);

		// Create the character physic component.
		character.components.create(PhysicsComponent, 'physics');

		// Add the player to the list of players.
		this._players.add(index);

		// Adjust the viewports to fit the new player.
		this._adjustViewports();
	}

	/** Remove a player. */
	private _removePlayer(index: number): void {
		if (this._players.has(index)) {
			const world = this.world;
			world.entities.destroy('character ' + index);
			world.entities.destroy('camera ' + index);
			world.engine.viewports.destroy('viewport ' + index);
			this._players.delete(index);
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
		const viewports = this.world.engine.viewports;
		let i = 0;
		for (const index of this._players) {
			const viewport = viewports.get('viewport ' + index);
			if (viewport === undefined) {
				return;
			}
			const row = Math.floor(i / bestCols);
			const col = i % bestCols;
			viewport.div.style.left = (col / bestCols * 100) + '%';
			viewport.div.style.top = (row / bestRows * 100) + '%';
			viewport.div.style.width = 'calc(' + (1 / bestCols * 100) + '% - 2px)';
			viewport.div.style.height = 'calc(' + (1 / bestRows * 100) + '% - 2px)';
			i++;
		}
	}

	private _players: Set<number> = new Set();
}
