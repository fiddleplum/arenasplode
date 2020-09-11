import { Birch } from '../../../birch/src/index';

export class PlayerControlSystem extends Birch.World.System {
	constructor(world: Birch.World.World) {
		super(world);
		this._axisThreshold = 0.15;
	}

	update(): void {
		for (const entry of window.app.players) {
			const playerIndex = entry.key;
			const player = entry.value;
			const controller = this.world.engine.input.getController(playerIndex);
			let x = controller.axis(0);
			let y = controller.axis(1);
			if (Math.abs(x) < this._axisThreshold) {
				x = 0;
			}
			if (Math.abs(y) < this._axisThreshold) {
				y = 0;
			}
			if (x !== 0 || y !== 0) {
				const characterFrame = player.character.components.getFirstOfType(Birch.World.FrameComponent);
				if (characterFrame !== undefined) {
					// This is not optimal. Redo the position getting and setting.
					const position = characterFrame.position;
					characterFrame.position = new Birch.Vector3(position.x + x, position.y - y, position.z);
					// const cameraFrame = player.camera.components.getFirstOfType(Birch.World.FrameComponent);
					// if (cameraFrame !== undefined) {
					// 	cameraFrame.position = new Birch.Vector3(characterFrame.position.x, characterFrame.position.y, cameraFrame.position.z);
					// }
				}
			}
		}
	}

	private _axisThreshold: number;
}
