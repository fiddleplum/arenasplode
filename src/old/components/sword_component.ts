import { Birch } from 'birch';

export class SwordComponent extends Birch.World.Component {
	// Is the sword being swung?
	swinging: boolean = false;

	// A number between 0 and 1 for swinging, 0 being to the right of the character and 1 being to the left of the character.
	swingLerp: number = 0;

	// The current direction of the swinging.
	swingDir: number = -1;
}
