# Neon Clash

Neon Clash is a browser-based, local two-player arcade fighting game. Choose
fighters, build independent weapon loadouts, and battle across four arenas.
The project is a playable prototype: combat and arenas use a Canvas game loop,
while Phaser renders the licensed fighter sprite sheets when they load.

## Features

- Local versus, arcade, and training modes
- Four selectable fighters and four arenas
- Best-of-three rounds with a 60-second round timer
- Walking, running, jumping, crouching, punches, kicks, special moves, and
  directional magical shields
- Independent per-player weapon loadouts, switching, ammunition, projectiles,
  and optional reloading
- Pistol, shotgun, energy blaster, missile launcher, grenade, and permanent
  unlimited Bare Hands
- Keyboard and touchscreen controls
- Responsive menus, combat HUD, hit effects, and configurable sound/screen shake
- Vite development server and production build; compatible with static hosting
  such as Vercel

## Run locally

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- A modern browser; Phaser uses WebGL when available and falls back to Canvas

### Install and start

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Phaser 3.90 and the interface fonts are
loaded from external CDNs, so an internet connection is needed for those
resources.

### Build and preview

```sh
npm run build
npm run preview
```

The production site is written to `dist/`. Vite copies the dynamically loaded
`assets/` directory into the build output.

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Move | `A` / `D` | `←` / `→` |
| Run | `Shift` + direction | `Shift` + direction |
| Jump / crouch | `W` / `S` | `↑` / `↓` |
| Punch / kick | `Q` / `E` | Numpad `1` / `2` |
| Heavy punch / kick | `Shift` + `Q` / `E` | Numpad `6` / `7` |
| Fire equipped weapon | `R` | Numpad `3` |
| Fighter special | `T` | Numpad `5` |
| Magical shield | `F` | Numpad `4` |
| Previous / next weapon | `Z` / `C` | `-` / `+` |
| Reload | `X` | Numpad `0` |
| Pause | `Esc` | `Esc` |

Reloading is disabled by default and can be enabled in Settings. Touch controls
are available on the game screen.

## Project layout

```text
.
├── assets/
│   ├── characters/
│   │   ├── metadata/       # Fighter animation and source-sheet metadata
│   │   ├── source/         # Original licensed Samurai and Knight sprite sheets
│   │   ├── atlases/        # Generated placeholder/fallback atlases
│   │   └── references/     # Generated reference placeholders
│   └── weapons/
│       └── spritesheets/   # Supplied gun sprite strips used in-game
├── tools/
│   ├── align_sprite_frames.html
│   └── build_sprite_atlas.js
├── index.html              # Menus, Canvas gameplay, input, and combat logic
├── vite.config.mjs         # Copies runtime-loaded assets into dist/
├── package.json
└── package-lock.json
```

## Sprite asset workflow

Character sheet dimensions, animation mappings, and licenses are documented in
[`assets/characters/README.md`](assets/characters/README.md). Weapon sprite
sheet contents and missing weapon-art details are in
[`assets/weapons/README.md`](assets/weapons/README.md).

To validate and regenerate the character metadata bundle:

```sh
node tools/build_sprite_atlas.js
node tools/build_sprite_atlas.js --bundle-only
```

The frame-alignment helper is available at
[`tools/align_sprite_frames.html`](tools/align_sprite_frames.html). Review its
output and the generated metadata before replacing any existing artwork.

## Deployment

For Vercel, import the repository and use the Vite defaults:

- **Build command:** `npm run build`
- **Output directory:** `dist`

No separate Vercel configuration is required for this static Vite project.

## Art and project status

This is an actively developed game prototype, not a finished production art
pack. The four roster entries currently share two licensed source silhouettes
(Samurai and Knight), with palette treatments for alternate fighters. Where a
source pack lacks a motion, the closest available frames may be reused. The
arenas and many combat effects are drawn procedurally; the supplied weapon pack
does not contain dedicated missile-launcher, grenade, or projectile artwork.
The character asset guide records these limitations in more detail.

Only the license files supplied with the character packs are included; consult
those files before redistributing or reusing the artwork independently of the
game.
