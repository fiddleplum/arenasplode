import * as Birch from '../../birch/src/index';

export class App {
	private _game: Birch.Game;

	constructor() {
		this._game = new Birch.Game(document.querySelector('canvas') as HTMLCanvasElement);
	}
}

declare global {
	interface Window {
		app: App;
	}
}

window.addEventListener('load', () => {
	window.app = new App();
});
