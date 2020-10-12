# Original Arenasplode Game Loop

object->update: Update game logic. (updates velocities)
	Do chain wand springs.

doPhysics: Apply friction and update positions.

Collide with other entities.
	if solid, bounce off each other
	call onTouch functions

Collide with map.
	call onOverTile functions
	move away from walls

prerender: Move held objects to characters.
	chain and character (holding) have prerender updates

# Ideas

Add mass, momentum, and angular momentum.

Double size makes you 4x heavy.

Drunk mode only changes angular momentum, not orientation.

# States

Drunk Mode - Camera rotates in a wobble manner. Never over 30 degrees, and smoothly.

Fixed Mode - The camera gets "stuck" and fixed at the position when the mode started.

Tilted Mode - The camera bends downward and gives perspective to the scene.

