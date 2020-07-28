import { Birch } from '../../birch/src/index';
import { MapComponent } from './map';
import { Player } from './player';

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
		this._addPlayer(1);
	}

	/** Destructs the app. */
	destroy(): void {
	}

	/** Gets the Birch engine. */
	get birch(): Birch.Engine {
		return this._birch;
	}

	/** Gets the world. */
	get world(): Birch.World {
		return this._world;
	}

	/** Gets the players. */
	get players(): Birch.OrderedMap<number, Player> {
		return this._players;
	}

	/** Initialize world. */
	private _initializeWorld(): void {
		this._world = this._birch.createWorld();
		const mapEntity = this._world.createEntity();
		this._map = mapEntity.createComponent(MapComponent);
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
		console.log(numPlayers, numColumns, numRows);
		let i = 0;
		for (const playerEntry of this._players) {
			const viewport = playerEntry.value.viewport;
			const row = Math.floor(i / numColumns);
			const col = i % numColumns;
			viewport.getDiv().style.left = (col / numColumns * 100) + '%';
			viewport.getDiv().style.top = (row / numRows * 100) + '%';
			viewport.getDiv().style.width = 'calc(' + (1 / numColumns * 100) + '% - 2px)';
			viewport.getDiv().style.height = 'calc(' + (1 / numRows * 100) + '% - 2px)';
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

	private _world!: Birch.World;

	private _map!: MapComponent;

	private _players: Birch.OrderedMap<number, Player> = new Birch.OrderedMap();
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

// function render(renderer: Birch.Renderer, mesh: Birch.Mesh): void {
// 	renderer.clear(Birch.Color.Black);
// 	mesh.render();
// 	requestAnimationFrame(render.bind(undefined, renderer, mesh));
// }

// window.addEventListener('load', () => {

// 	const shader = new Birch.Shader(renderer.gl, vertexShader, fragmentShader, new Birch.FastMap([
// 		['a_position', 0],
// 		['a_color', 1],
// 		['a_offset', 2]
// 	]));
// 	shader.activate();
// 	(window as any).shader = shader;
// 	const mesh = new Birch.Mesh(renderer.gl, 2, [
// 		[
// 			new Birch.Mesh.Component(0, 'float', 2, false)],
// 		[
// 			new Birch.Mesh.Component(1, 'float', 4, true),
// 			new Birch.Mesh.Component(2, 'float', 2, true)]]);
// 	mesh.setVertices(0, [
// 		0, 0,
// 		1, 0,
// 		0, 0.5,
// 	], false);
// 	mesh.setVertices(1, [
// 		1, 0, 0, 1, 0, 0,
// 		0, 1, 0, 1, 0.5, 0,
// 		0, 0, 1, 1, -0.5, 0], false);
// 	mesh.setIndices([0, 1, 0, 2, 1, 2], true);
// 	mesh.setNumInstances(3);

// 	render(renderer, mesh);
// });

// const vertexShader = `#version 300 es

// in vec2 a_position;
// in vec4 a_color;
// in vec2 a_offset;
// out vec4 v_color;

// void main() {
//   gl_Position = vec4(a_position + a_offset, 0.0, 1.0);
//   v_color = a_color;
// }`;

// const fragmentShader = `#version 300 es

// precision highp float;

// in vec4 v_color;
// out vec4 o_color;

// void main() {
//   o_color = v_color;
// }`;
