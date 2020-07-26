import { Birch } from '../../birch/src/index';
import { Tile } from './tile';

export class Map extends Birch.Component {
	constructor(entity: Birch.Entity) {
		super(entity);

		this._model = this.engine.renderer.createModel();
	}

	destroy(): void {
		this.engine.renderer.destroyModel(this._model);
	}

	set size(size: Birch.Vector2) {
		this._size.copy(size);
		this._tiles = [];
		for (let y = 0; y < this._size.y; y++) {
			this._tiles.push([]);
			for (let x = 0; x < this._size.x; x++) {
				const tile = new Tile();
				if (Math.random() >= 0.8) {
					tile.type = Tile.Type.Wall;
				}
				this._tiles[y].push(new Tile());
			}
		}

		/*
		How to update the map model when the map changes. Ordered in decreasing coupling.
		* It has a model and updates the model directly.
		* It checks the entity for a model component, and if it has it, updates the model directly.
		* It sends an event out and a MapModel system updates the model component.
		* The MapModelSystem polls for changes to the model.

		If the MapModelSystem wants to know what part of the map has changed,
		  the event that is sent out needs to include coordinate information.
		*/
	}

	private _size: Birch.Vector2 = new Birch.Vector2();
	private _tiles: Tile[][] = [];
	private _model: Birch.Render.Model;
}
