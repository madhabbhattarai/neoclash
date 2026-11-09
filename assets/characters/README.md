# Character art and sprite pipeline

## Current art status

Two user-provided, permissively licensed pixel-art packs are integrated: `FREE_Samurai 2D Pixel Art v1.2` and `FREE_Knight 2D Pixel Art v1.2`. Their original license text is preserved at `source\samurai\License.txt` and `source\knight\License.txt`. Both licenses permit using and modifying the art in a game; neither requires a credit. The four fighters use Samurai or Knight spritesheets, with palette tints for alternate roster slots, so there are currently **two distinct source character silhouettes, not four original AI-generated designs**.

The Samurai pack has native idle, run, attack, and hurt sheets. The Knight pack has native idle, walk, run, jump-start/transition/fall, three attack, block, hurt, and death sheets. Missing motions intentionally reuse the closest available frames; each fighter's JSON records `nativeStates` and `missingNativeAnimations`. For example, Samurai's kick and special currently reuse its supplied attack sheet, and its knockout uses the last hurt frame. Do not treat reused frames as finished dedicated animations.

This is a verified first rendering migration stage, **not final art-quality sign-off**. It does not include new AI-generated reference art, unique polished designs for all four characters, custom illustrated arena layers, or dedicated animation art for every weapon and combat effect.

## Renderer and preserved gameplay

Phaser 3.90 renders the character sprite layer with WebGL when available. It loads the original PNG sprite sheets at their measured native frame dimensions (Samurai 96×96; Knight 112×96), plus JSON animation/timing/anchor metadata. The existing Canvas 2D loop remains responsible for combat, hitboxes, projectiles, weapons, arenas, shields, and impact effects, with the old vector-character renderer retained as a fallback if Phaser or a sprite sheet cannot load.

Both original archive licenses are included beside their PNG sheets under `source\`. The loader maps missing native motions to explicitly-listed existing sheets and tints each fighter, while the metadata records the actual pack and frame anchor. Pixel frames are not resampled or cropped at runtime. The asset status is shown in Settings.

## Rebuild and validate supplied sprite metadata

From the workspace root:

```powershell
node tools\build_sprite_atlas.js
node tools\build_sprite_atlas.js --bundle-only
```

The builder checks each source PNG's signature, frame dimensions/counts, frame references, output atlas dimensions, animation ranges, and anchors. It produces each fighter's JSON and the browser bundle at `metadata\animations.js`. The SVG files in `atlases\` and reference images ending in `-placeholder.svg` are still temporary Canvas fallback art.

## Aligning original transparent AI-generated frames

1. Generate original, transparent full-body PNG frames with consistent costume, camera, scale, lighting and pose direction. Name them `fighter_state_01.png`, such as `shadow_idle_01.png`.
2. Open `tools\align_sprite_frames.html` in a browser and select the fighter and all 40 frames: idle 3, walk 4, run 4, jump 2, jumpFall 2, land 1, crouch 1, punch 3, kick 3, special 3, block 2, draw 2, weapon 3, hit 2, knockout 2, victory 3.
3. Use **Validate and build preview**. It checks sequence names/counts, duplicate/missing frames, PNG decode, image size, visible alpha bounds, and transparency. It trims transparent padding and preserves aspect ratio, fits the visible body to 100px tall, centers at `x=64`, and aligns feet to `y=108` in 128×128 cells.
4. Review the atlas and all pose sequences. Download the PNG atlas and JSON to the matching `assets\characters\atlases` and `assets\characters\metadata` paths.
5. Run `node tools\build_sprite_atlas.js --bundle-only` and reload the game. A technically valid alignment does not by itself establish consistent character design or professional art quality.

## Weapon and arena art still outstanding

The current weapon artwork and combat effects are procedurally drawn on Canvas, not supplied weapon sprite atlases. Arenas are still the existing procedural Canvas scenes, not layered illustrated background art. There are no imported arena layers or parallax camera rigs in this stage. These remain follow-up art/rendering work rather than being represented as finished deliverables.
