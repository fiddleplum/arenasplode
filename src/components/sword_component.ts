import { Birch } from 'birch';
import { PlayerComponent } from './player_component';

export class SwordComponent extends Birch.World.Component {
	heldBy: PlayerComponent | undefined;
	swinging: boolean = false;
}
