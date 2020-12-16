import { Birch } from 'birch';
import { Frame2DComponent } from 'components/frame_2d_component';
import { HoldableComponent } from 'components/holdable_component';
import { MapComponent } from 'map';
import { PhysicsComponent } from 'components/physics_component';
import { SpriteComponent } from 'components/sprite_component';
import { SwordComponent } from 'components/sword_component';
import { TypeComponent } from 'components/type_component';

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
		for (let i = 0; i < numItems; i++) {
			// Choose the item type.
			const itemTypeIndex = Math.floor(Math.random() * this._itemTypes.length);
			this.createItem(this._itemTypes[itemTypeIndex]);
		}
	}

	createItem(type: string): void {
		const map = this.world.entities.get('map')!.get(MapComponent) as MapComponent;
		const itemEntity = this.world.entities.create(type + this.world.entities.numItems());

		// Create the frame.
		const frame = itemEntity.components.create(Frame2DComponent, 'frame');
		frame.setPosition(new Birch.Vector2(1 + Math.random() * (map.size.x - 2), 1 + Math.random() * (map.size.y - 2)));
		frame.setLevel(0.1);

		// Create the physics.
		itemEntity.components.create(PhysicsComponent, 'physics');
		this._items.push(itemEntity);

		// Create sprite.
		const characterSprite = itemEntity.components.create(SpriteComponent, 'sprite');
		characterSprite.url = 'assets/sprites/items/' + type + '.png';

		if (type === 'sword') {
			// Create the holdable.
			itemEntity.components.create(HoldableComponent, 'holdable');

			// Create the sword component.
			itemEntity.components.create(SwordComponent, 'sword');

			// Create the type component.
			const type = itemEntity.components.create(TypeComponent, 'type');
			type.type = TypeComponent.Sword;
		}
		else {
			// Create the type component.
			const type = itemEntity.components.create(TypeComponent, 'type');
			type.type = TypeComponent.Nothing;
		}
	}

	private _items: Birch.World.Entity[] = [];

	private _itemTypes = ['sword', 'super-damage', 'cake', 'pow', 'big-gun', 'chain-gun'];
}
