import { Birch } from 'birch';
import { PlayerComponent } from './player_component';

export class HoldableComponent extends Birch.World.Component {
	heldBy: PlayerComponent | undefined;
}
