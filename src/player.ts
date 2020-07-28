import { Birch } from '../../birch/src/index';
import { App } from './app';

export class Player {
	app: App;

	index: number;

	viewport: Birch.Viewport;

	constructor(app: App, index: number) {
		this.app = app;
		this.index = index;

		// Create the viewport.
		this.viewport = this.app.birch.createViewport();
		const div = this.viewport.getDiv();
		div.style.left = '0';
		div.style.top = '0';
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.border = '1px solid white';
		this.viewport.setClearColor(new Birch.Color(0, 0, 0, 1));
		this.viewport.getStage().scene = this.app.world.scene;
	}

	destroy(): void {
		this.app.birch.destroyViewport(this.viewport);
	}
}
