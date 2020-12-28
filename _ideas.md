# Collision Response

p0 = initial position
v0 = initial velocity
dt = frame time

For i = 0; i < 2; i++:
	If i == 0:
		v = v0

	p1 = p0 + v * dt

	Find the earliest collision U time (from 0 to 1, p0 to p1) and collision point pU and normal N.
		No collision just means U is 1 and pU is p1.

	If U == 0:
		break

	Move the entity to pU.

	If U < 1 and i < 2:
		v = v0 + N * (v0 dot N) // v is perpendicular to N in the general direction of v.
		p0 = pU. // The next iteration starts where this one ends.
		dt = dt * (1 - U) // The remaining time left.

	Else:
		break

# Original Arenasplode Game Loop

object->update: Update game logic. (updates velocities)

Procress inputs

	Do chain wand springs, only modify velocities.

Call onTouchEntity and onTouchTile functions
	They only modify velocities.

doPhysics: Apply friction and update positions.

Collide with other entities.
	if solid, bounce off each other

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

