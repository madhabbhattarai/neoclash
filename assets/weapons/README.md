# Weapon sprites

The three supplied `gun10.png`, `gun20.png`, and `gun30.png` sheets are used
directly by Phaser. Each is a row of ten 32×32 pixel weapon frames. The game
chooses and stores a compatible frame independently for each player's weapon
inventory, then renders it with the character's aiming arm.

The pack contains firearm sprites, but no dedicated missile launcher, grenade,
or projectile art. Missile weapons use a compatible long-gun sprite; grenades
retain the game's existing hand-held drawing and projectile effects. Bullets,
shots, missiles, and grenades continue to use the combat system's existing
velocity, collision, ammunition, and impact behavior.
