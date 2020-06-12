export class Tile {
	type: Tile.Type = Tile.Type.Floor;
}

export namespace Tile {
	export enum Type {
		Floor,
		Wall
	}
}
