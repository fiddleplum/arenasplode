import { Birch } from 'birch';
import { PhysicsComponent } from 'components/physics_component';
import { SpriteComponent } from 'components/sprite_component';
import { PlayerComponent } from 'components/player_component';
import { MapComponent } from 'map';
import { Frame2DComponent } from 'components/frame_2d_component';
import { TypeComponent } from 'components/type_component';

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

		// Create the sprite component.
		const characterSprite = character.components.create(SpriteComponent, 'sprite');
		characterSprite.url = 'assets/sprites/characters/bob.png';

		// Create the type component.
		const type = character.components.create(TypeComponent, 'type');
		type.type = TypeComponent.Character;

		// Create the frame component.
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


	private _players: Set<number> = new Set();
}
