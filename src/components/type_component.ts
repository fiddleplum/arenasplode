import { Birch } from 'birch';

// The type of the entity.
export class TypeComponent extends Birch.World.Component {
	type: symbol = TypeComponent.Nothing;

	static Nothing = Symbol();
	static Character = Symbol();
	static Sword = Symbol();
	static RocketLauncher = Symbol();
	static Explosion = Symbol();
	static ChainWand = Symbol();
	static Chain = Symbol();
}
