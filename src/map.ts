import * as Birch from '../../birch/src/index';
import { Tile } from './tile';

export class Map {
	size: Birch.Vector2 = new Birch.Vector2();
	tiles: Tile[][] = [];

	constructor(size: Birch.Vector2) {
		for (let y = 0; y < size.y; y++) {
			this.tiles.push([]);
			for (let x = 0; x < size.x; x++) {
				const tile = new Tile();
				if (Math.random() >= 0.8) {
					tile.type = Tile.Type.Wall;
				}
				this.tiles[y].push(new Tile());
			}
		}
	}
}

export namespace Map {
}
