import { Birch } from 'birch';
import { Frame2DComponent } from '../components/frame_2d_component';
import { MapComponent } from '../components/map_component';
import { PhysicsComponent } from '../components/physics_component';
import { SpriteComponent } from '../components/sprite_component';

/** This system keeps track of and handles all of the items. */
export class ItemSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
	}

	initializeItems(): void {
		// Clear out the existing items.
		while (this._items.length > 0) {
			const item = this._items.pop() as Birch.World.Entity;
			item.world.entities.destroy(item);
		}
		// Create items.
		const numItems = 10;
		const map = this.world.entities.get('map')?.get(MapComponent) as MapComponent;
		const mapSize = map.size;
		for (let i = 0; i < numItems; i++) {
			const itemEntity = this.world.entities.create();
			// Choose the item type.
			const itemTypeIndex = Math.floor(Math.random() * this._itemTypes.length);
			// Create the frame.
			const frame = itemEntity.components.create(Frame2DComponent, 'frame');
			frame.setPosition(new Birch.Vector2(1 + Math.random() * (mapSize.x - 2), 1 + Math.random() * (mapSize.y - 2)));
			frame.setLevel(0.1);
			// Create the physics.
			itemEntity.components.create(PhysicsComponent, 'physics');
			this._items.push(itemEntity);

			// Create sprite.
			const characterSprite = itemEntity.components.create(SpriteComponent, 'sprite');
			characterSprite.url = 'assets/sprites/items/' + this._itemTypes[itemTypeIndex].sprite + '.png';
		}
	}

	private _items: Birch.World.Entity[] = [];

	private _itemTypes = [
		{
			sprite: 'sword'
		},
		{
			sprite: 'super-damage'
		},
		{
			sprite: 'cake'
		},
		{
			sprite: 'pow'
		},
		{
			sprite: 'big-gun'
		},
		{
			sprite: 'chain-gun'
		}
	]
}
