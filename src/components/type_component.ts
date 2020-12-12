import { Birch } from 'birch';

// The type of the entity.
export class TypeComponent extends Birch.World.Component {
	type: symbol = TypeComponent.Nothing;

	static Nothing = Symbol('Nothing');
	static Character = Symbol('Character');
	static Sword = Symbol('Sword');
	static RocketLauncher = Symbol('RocketLauncher');
	static Explosion = Symbol('Explosion');
	static ChainWand = Symbol('ChainWand');
	static Chain = Symbol('Chain');
}
