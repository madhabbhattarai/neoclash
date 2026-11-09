"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const frameWidth = 128;
const frameHeight = 128;
const columns = 7;
const anchor = { x: 64, y: 108 };
const frameStates = [
  ["idle", 3], ["walk", 4], ["run", 4], ["jump", 2], ["jumpFall", 2], ["land", 1],
  ["crouch", 1], ["punch", 3], ["kick", 3], ["special", 3], ["block", 2], ["draw", 2],
  ["weapon", 3], ["hit", 2], ["knockout", 2], ["victory", 3]
];
const fighters = [
  { id: "shadow", colors: ["#172534", "#53e7dd", "#d9ffff"], mask: "hood", hair: "none", armor: "ninja", sourcePack: "samurai", tint: "#b3dce9" },
  { id: "blaze", colors: ["#351b25", "#ff674f", "#ffc365"], mask: "open", hair: "flame", armor: "striker", sourcePack: "knight", tint: "#f7b19c" },
  { id: "thunder", colors: ["#282416", "#f2c34e", "#fff0a0"], mask: "visor", hair: "none", armor: "heavy", sourcePack: "knight", tint: "#f1d682" },
  { id: "phantom", colors: ["#241b37", "#ae81ff", "#e2ceff"], mask: "hood", hair: "none", armor: "shade", sourcePack: "samurai", tint: "#c5a6ed" }
];
const sourcePacks = {
  samurai: {
    frameWidth: 96, frameHeight: 96, spriteScale: 2.25, anchor: { x: 48, y: 80 },
    attribution: "FREE Samurai 2D Pixel Art v1.2; included license permits use and modification in games.",
    nativeStates: ["idle", "run", "punch", "hit"],
    sheets: {
      idle: ["IDLE.png", 10], run: ["RUN.png", 16],
      attack: ["ATTACK 1.png", 7], hurt: ["HURT.png", 4]
    },
    animations: {
      idle: ["idle", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
      walk: ["run", [0, 3, 6, 9, 12, 15]],
      run: ["run", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
      jump: ["run", [1, 4, 7, 10, 13, 15]], jumpFall: ["run", [1, 3, 5, 7, 9, 11, 13, 15]], land: ["idle", [0]],
      crouch: ["idle", [0]], punch: ["attack", [0, 1, 2, 3, 4, 5, 6]],
      kick: ["attack", [0, 1, 3, 5, 6]], special: ["attack", [0, 1, 2, 3, 4, 5, 6]],
      block: ["idle", [0]], draw: ["idle", [0, 1]], weapon: ["attack", [0, 1, 2, 3, 4, 5, 6]],
      hit: ["hurt", [0, 1, 2, 3]], knockout: ["hurt", [3]], victory: ["idle", [0, 1, 2]]
    },
    missingNativeAnimations: ["kick", "special", "block", "draw", "weapon", "knockout", "victory", "jump", "land", "crouch"]
  },
  knight: {
    frameWidth: 112, frameHeight: 96, spriteScale: 2.25, anchor: { x: 56, y: 83 },
    attribution: "FREE Knight 2D Pixel Art v1.2; included license permits use and modification in games.",
    nativeStates: ["idle", "walk", "run", "jump", "land", "punch", "kick", "special", "block", "hit", "knockout"],
    sheets: {
      idle: ["IDLE.png", 14], walk: ["WALK.png", 8], run: ["RUN.png", 8],
      jumpStart: ["JUMP-START.png", 3], jumpTransition: ["JUMP-TRANSITION.png", 3],
      jumpFall: ["JUMP-FALL.png", 3], punch: ["ATTACK 1.png", 8],
      kick: ["ATTACK 2.png", 9], special: ["ATTACK 3.png", 11],
      block: ["BLOCK.png", 6], hurt: ["HURT.png", 8], death: ["DEATH.png", 15]
    },
    animations: {
      idle: ["idle", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
      walk: ["walk", [0, 1, 2, 3, 4, 5, 6, 7]], run: ["run", [0, 1, 2, 3, 4, 5, 6, 7]],
      jump: ["jumpStart", [0, 1, 2]], jumpFall: ["jumpFall", [0, 1, 2]], land: ["jumpTransition", [0, 1, 2]],
      crouch: ["block", [0]], punch: ["punch", [0, 1, 2, 3, 4, 5, 6, 7]],
      kick: ["kick", [0, 1, 2, 3, 4, 5, 6, 7, 8]],
      special: ["special", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
      block: ["block", [0, 1, 2, 3, 4, 5]], draw: ["block", [0, 1]],
      weapon: ["punch", [0, 1, 2, 3, 4, 5, 6, 7]], hit: ["hurt", [0, 1, 2, 3, 4, 5, 6, 7]],
      knockout: ["death", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
      victory: ["idle", [0, 1, 2]]
    },
    missingNativeAnimations: ["draw", "weapon", "crouch", "victory"]
  }
};

function esc(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
  })[character]);
}

function addLicensedSprites(metadata, fighter) {
  const pack = sourcePacks[fighter.sourcePack];
  if (!pack) return;
  const textures = {};
  for (const [name, [filename, frameCount]] of Object.entries(pack.sheets)) {
    const relativePath = `../source/${fighter.sourcePack}/Sprites/${filename}`;
    const filePath = path.resolve(path.dirname(path.join(root, "assets", "characters", "metadata", "index.json")), relativePath);
    if (!fs.existsSync(filePath)) throw new Error(`Missing licensed sprite sheet: ${filePath}`);
    const header = fs.readFileSync(filePath);
    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    if (header.toString("hex", 0, 8) !== "89504e470d0a1a0a" ||
        height !== pack.frameHeight || width !== pack.frameWidth * frameCount) {
      throw new Error(`Incorrect ${pack.frameWidth}x${pack.frameHeight} frame layout in ${filePath}; expected ${frameCount} frames.`);
    }
    const key = `pack-${fighter.sourcePack}-${name}`;
    textures[key] = { path: relativePath, frameWidth: pack.frameWidth, frameHeight: pack.frameHeight, frameCount };
  }
  for (const [state, [sheet, frames]] of Object.entries(pack.animations)) {
    const animation = metadata.animations[state];
    if (!animation || frames.length < 1 || frames.some(frame => frame < 0 || frame >= pack.sheets[sheet][1])) {
      throw new Error(`Invalid source animation mapping: ${fighter.sourcePack}/${state}`);
    }
    animation.texture = `pack-${fighter.sourcePack}-${sheet}`;
    animation.frames = frames;
  }
  metadata.assetStatus = `LICENSED USER-PROVIDED PIXEL ART · ${fighter.sourcePack.toUpperCase()} PACK`;
  metadata.assetAttribution = pack.attribution;
  metadata.sourcePack = fighter.sourcePack;
  metadata.sourceLicense = `../source/${fighter.sourcePack}/License.txt`;
  metadata.sourceReference = `../source/${fighter.sourcePack}/Sprites/IDLE.png`;
  metadata.textures = textures;
  metadata.anchor = pack.anchor;
  metadata.origin = { x: pack.anchor.x / pack.frameWidth, y: pack.anchor.y / pack.frameHeight };
  metadata.spriteScale = pack.spriteScale;
  metadata.tint = fighter.tint;
  metadata.nativeStates = pack.nativeStates;
  metadata.missingNativeAnimations = pack.missingNativeAnimations;
}

function writeBundleFromMetadata() {
  const bundle = {};
  const metadataDir = path.join(root, "assets", "characters", "metadata");
  const expectedStates = new Map(frameStates);
  for (const fighter of fighters) {
    const metadataPath = path.join(metadataDir, `${fighter.id}.json`);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    if (metadata.fighter !== fighter.id || metadata.frameWidth !== frameWidth || metadata.frameHeight !== frameHeight) {
      throw new Error(`Metadata identity or frame dimensions are invalid: ${metadataPath}`);
    }
    if (!metadata.anchor || metadata.anchor.x < 0 || metadata.anchor.x > frameWidth || metadata.anchor.y < 0 || metadata.anchor.y > frameHeight) {
      throw new Error(`Anchor is outside its frame: ${metadataPath}`);
    }
    let nextFrame = 0;
    for (const [state, expectedCount] of expectedStates) {
      const animation = metadata.animations?.[state];
      if (!animation || animation.start !== nextFrame || animation.count !== expectedCount || animation.end !== nextFrame + expectedCount - 1) {
        throw new Error(`Animation frames are missing, duplicated, or out of order (${fighter.id}/${state}).`);
      }
      nextFrame = animation.end + 1;
    }
    if (nextFrame !== metadata.frameCount || metadata.columns * metadata.rows < metadata.frameCount) {
      throw new Error(`Atlas frame layout is incomplete: ${metadataPath}`);
    }
    const atlasPath = path.resolve(path.dirname(metadataPath), metadata.atlas || "");
    if (!metadata.atlas || !fs.existsSync(atlasPath)) throw new Error(`Atlas file is missing: ${atlasPath}`);
    const data = fs.readFileSync(atlasPath);
    const dimensions = atlasPath.toLowerCase().endsWith(".png")
      ? { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
      : (() => {
        const svg = data.toString("utf8").slice(0, 500);
        const match = svg.match(/<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
        return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
      })();
    if (!dimensions || dimensions.width !== metadata.columns * frameWidth || dimensions.height !== metadata.rows * frameHeight) {
      throw new Error(`Atlas dimensions do not match its frame metadata: ${atlasPath}`);
    }
    for (const [key, texture] of Object.entries(metadata.textures || {})) {
      const sourcePath = path.resolve(path.dirname(metadataPath), texture.path);
      if (!fs.existsSync(sourcePath)) throw new Error(`Sprite texture is missing: ${sourcePath}`);
      const data = fs.readFileSync(sourcePath);
      if (data.toString("hex", 0, 8) !== "89504e470d0a1a0a" ||
          data.readUInt32BE(16) !== texture.frameWidth * texture.frameCount ||
          data.readUInt32BE(20) !== texture.frameHeight) {
        throw new Error(`Sprite texture dimensions are invalid: ${sourcePath}`);
      }
      for (const [state, animation] of Object.entries(metadata.animations)) {
        if (animation.texture === key &&
            (!Array.isArray(animation.frames) || animation.frames.some(frame => frame < 0 || frame >= texture.frameCount))) {
          throw new Error(`Animation frame escapes source sheet (${fighter.id}/${state}).`);
        }
      }
    }
    bundle[fighter.id] = metadata;
  }
  fs.writeFileSync(path.join(metadataDir, "animations.js"), `window.NEON_CLASH_ATLAS_METADATA=${JSON.stringify(bundle)};\n`);
  console.log(`Bundled and validated ${fighters.length} fighter metadata files.`);
}

function fighterMarkup(fighter, state, phase, index) {
  const [ink, primary, highlight] = fighter.colors;
  const moving = ["walk", "run"].includes(state);
  const jumping = state === "jump" || state === "land";
  const crouching = state === "crouch";
  const kicking = state === "kick";
  const punching = state === "punch" || state === "weapon";
  const guarding = state === "block";
  const defeated = state === "knockout";
  const celebrating = state === "victory";
  const casting = state === "special";
  const lean = kicking ? "rotate(-11 64 77)" : punching ? "rotate(6 64 77)" : defeated ? "rotate(78 64 107)" : "";
  const bounce = state === "idle" ? [0, -1.5, 0][phase] : jumping ? -5 + phase * 3 : moving ? (phase % 2 ? -1 : 1) : 0;
  const legA = moving ? (phase % 2 ? 12 : -8) : kicking ? 28 : 0;
  const legB = moving ? -legA : kicking ? -8 : 0;
  const armA = casting ? -24 : guarding ? -27 : punching ? [5, 23, 12][phase] : moving ? (phase % 2 ? 8 : -8) : -8;
  const armB = guarding ? -8 : moving ? -armA : 16;
  const weapon = state === "weapon" || state === "draw";
  const head = fighter.mask === "hood"
    ? `<path d="M43 40 Q39 14 64 13 Q90 15 86 43 L80 56 L47 54 Z" fill="${ink}" stroke="${highlight}" stroke-opacity=".48" stroke-width="2"/><path d="M46 39 Q64 31 83 39 L80 47 Q64 43 48 48 Z" fill="${primary}"/><path d="M62 39h18" stroke="${highlight}" stroke-width="3" stroke-linecap="round"/>`
    : fighter.mask === "visor"
      ? `<path d="M45 31 Q64 18 83 31 L80 48 Q64 59 48 48 Z" fill="${ink}" stroke="${highlight}" stroke-width="2"/><path d="M49 35h29l-4 8H50Z" fill="${primary}" opacity=".95"/>`
      : `<ellipse cx="64" cy="39" rx="18" ry="21" fill="#dba88e"/><path d="M46 37 Q45 16 65 17 Q83 18 83 36 L79 31 Q65 25 48 34Z" fill="${ink}"/><path d="M65 39h12" stroke="${primary}" stroke-width="3"/>`;
  const hair = fighter.hair === "flame"
    ? `<path d="M49 25 Q42 13 52 4 Q55 18 61 12 Q61 4 70 0 Q68 16 80 10 L79 28Z" fill="${highlight}" stroke="${primary}" stroke-width="2"/>`
    : fighter.id === "phantom"
      ? `<path d="M50 23 Q64 11 80 23 L93 40 L80 36 L84 50 L64 44 L45 50 L48 37 L36 42Z" fill="${ink}" stroke="${primary}" stroke-width="2"/>`
      : "";
  const scarf = ["shadow", "phantom"].includes(fighter.id)
    ? `<path d="M49 58 Q27 54 18 68 Q35 65 43 78 L53 67Z" fill="${primary}" opacity=".9"/><path d="M47 61 Q31 60 23 67" stroke="${highlight}" stroke-width="2" opacity=".8"/>`
    : "";
  const armor = fighter.armor === "heavy"
    ? `<path d="M43 57 L51 50 L77 50 L86 60 L82 84 L64 91 L45 83Z" fill="${ink}" stroke="${highlight}" stroke-width="2"/><path d="M48 61 L64 56 L80 62 L77 78 L64 84 L50 78Z" fill="${primary}"/><path d="M51 67h26M64 59v22" stroke="${highlight}" stroke-width="2" opacity=".85"/>`
    : `<path d="M48 56 L56 51 L73 51 L81 58 L78 83 L64 89 L49 82Z" fill="${ink}" stroke="${primary}" stroke-width="2"/><path d="M52 59 L64 55 L77 60 L75 78 L64 84 L53 78Z" fill="${primary}"/><path d="M55 68h18" stroke="${highlight}" stroke-width="3" stroke-linecap="round"/>`;
  const armFront = punching
    ? `<path d="M74 61 Q91 55 102 59 L112 59" stroke="${ink}" stroke-width="15" stroke-linecap="round"/><path d="M74 61 Q91 55 102 59 L112 59" stroke="${primary}" stroke-width="9" stroke-linecap="round"/><path d="M109 54l8 5-7 7-7-5Z" fill="${highlight}"/>`
    : guarding
      ? `<path d="M75 61 Q88 47 91 39" stroke="${ink}" stroke-width="15" stroke-linecap="round"/><path d="M75 61 Q88 47 91 39" stroke="${primary}" stroke-width="9" stroke-linecap="round"/><path d="M54 62 L51 48" stroke="${ink}" stroke-width="14" stroke-linecap="round"/><path d="M54 62 L51 48" stroke="${primary}" stroke-width="8" stroke-linecap="round"/>`
      : `<path d="M75 62 Q86 70 91 78" stroke="${ink}" stroke-width="14" stroke-linecap="round"/><path d="M75 62 Q86 70 91 78" stroke="${primary}" stroke-width="8" stroke-linecap="round"/>`;
  const weaponArt = weapon
    ? `<path d="M92 54 L111 34" stroke="${ink}" stroke-width="8" stroke-linecap="round"/><path d="M93 53 L112 32" stroke="${highlight}" stroke-width="3" stroke-linecap="round"/><path d="M89 51l7 7" stroke="${primary}" stroke-width="4"/>`
    : "";
  const energy = fighter.id === "thunder"
    ? `<path d="M47 55l-5 11 6 3-5 10 12-14-6-2 5-8M79 55l6 10-5 3 6 10-13-13 6-3-5-7" fill="${highlight}" opacity=".8"/>`
    : "";
  const defeat = defeated ? `opacity="${phase === 0 ? .9 : .72}"` : "";
  return `<g transform="translate(0 ${bounce})" ${defeat}>
    <ellipse cx="65" cy="111" rx="29" ry="6" fill="#050812" opacity=".35"/>
    ${scarf}
    <g transform="${lean}">
      <path d="M51 81 Q41 91 ${42 + legA} 105 L${49 + legA} 107 L61 88 M70 84 Q84 93 ${77 + legB} 106 L${86 + legB} 108 L77 82" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M51 82 Q43 92 ${45 + legA} 103 M70 84 Q81 94 ${79 + legB} 103" fill="none" stroke="${primary}" stroke-width="7" stroke-linecap="round"/>
      <path d="M39 106h14m23 0h15" stroke="${highlight}" stroke-width="4" stroke-linecap="round"/>
      ${armor}
      <path d="M52 60 Q42 55 39 64 L${34 + armA} ${72 + armA / 2}" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round"/>
      <path d="M52 60 Q42 55 39 64 L${34 + armA} ${72 + armA / 2}" fill="none" stroke="${primary}" stroke-width="7" stroke-linecap="round"/>
      ${armFront}
      ${weaponArt}
      <path d="M52 51 Q64 46 76 52" fill="none" stroke="${highlight}" stroke-width="2" opacity=".8"/>
      ${head}${hair}${energy}
    </g>
    ${state === "hit" ? `<path d="M39 33l-7-7m50 6 8-8M38 43H27" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ""}
    ${celebrating ? `<path d="M52 56L40 35m34 21 13-21" stroke="${primary}" stroke-width="10" stroke-linecap="round"/><path d="M39 32l-4-7m49 7 4-7" stroke="${highlight}" stroke-width="4"/>` : ""}
    ${casting ? `<path d="M34 59 Q42 37 64 37 Q87 39 94 59 M39 57 Q48 68 64 69 Q81 67 89 56" fill="none" stroke="${highlight}" stroke-width="3" opacity=".8"/><path d="M63 28l4 9-7 6 9 2" fill="none" stroke="${primary}" stroke-width="3"/>` : ""}
  </g>`;
}

function build() {
  const totalFrames = frameStates.reduce((total, [, count]) => total + count, 0);
  const rows = Math.ceil(totalFrames / columns);
  const frameList = [];
  let index = 0;
  for (const [state, count] of frameStates) {
    const start = index;
    for (let phase = 0; phase < count; phase++, index++) {
      frameList.push({ index, state, phase });
    }
    frameList.start = frameList.start || {};
    frameList.start[state] = { start, end: index - 1, count };
  }

  const outDir = path.join(root, "assets", "characters");
  fs.mkdirSync(path.join(outDir, "atlases"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "metadata"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "references"), { recursive: true });
  const results = [];
  const bundle = {};

  for (const fighter of fighters) {
    const cells = frameList.map(frame => {
      const x = frame.index % columns * frameWidth;
      const y = Math.floor(frame.index / columns) * frameHeight;
      return `<g transform="translate(${x} ${y})"><title>${esc(fighter.id)} · ${frame.state} ${frame.phase + 1} · TEMPORARY VECTOR PLACEHOLDER</title><rect width="${frameWidth}" height="${frameHeight}" fill="none"/>${fighterMarkup(fighter, frame.state, frame.phase, frame.index)}</g>`;
    }).join("\n");
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${columns * frameWidth}" height="${rows * frameHeight}" viewBox="0 0 ${columns * frameWidth} ${rows * frameHeight}" role="img" aria-label="Temporary vector placeholder sprite atlas for ${fighter.id}">\n${cells}\n</svg>\n`;
    const atlasPath = path.join(outDir, "atlases", `${fighter.id}-placeholder.svg`);
    fs.writeFileSync(atlasPath, svg);

    const animations = Object.fromEntries(frameList.start && Object.entries(frameList.start) || []);
    const metadata = {
      assetStatus: "TEMPORARY VECTOR PLACEHOLDER — replace with original AI-generated reference art and aligned transparent frames before final art sign-off.",
      fighter: fighter.id,
      sourceReference: `../references/${fighter.id}-placeholder.svg`,
      atlas: `../atlases/${fighter.id}-placeholder.svg`,
      frameWidth,
      frameHeight,
      columns,
      rows,
      frameCount: totalFrames,
      anchor,
      animations,
      attackTiming: {
        punch: { activeFrame: 1, recoveryFrame: 2 },
        kick: { activeFrame: 1, recoveryFrame: 2 },
        weapon: { activeFrame: 1, recoveryFrame: 2 }
      }
    };
    addLicensedSprites(metadata, fighter);
    const metadataPath = path.join(outDir, "metadata", `${fighter.id}.json`);
    fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    bundle[fighter.id] = metadata;
    fs.writeFileSync(path.join(outDir, "references", `${fighter.id}-placeholder.svg`),
      `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 ${frameWidth} ${frameHeight}" aria-label="Temporary vector placeholder reference for ${fighter.id}">${fighterMarkup(fighter, "idle", 1, 0)}</svg>\n`);

    const validation = {
      dimensionsValid: columns * frameWidth <= 4096 && rows * frameHeight <= 4096,
      frameCountValid: frameList.length === totalFrames,
      anchorValid: anchor.x >= 0 && anchor.x <= frameWidth && anchor.y >= 0 && anchor.y <= frameHeight,
      animationRangesValid: Object.values(metadata.animations).every(range =>
        range.start >= 0 && range.end < totalFrames && range.count === range.end - range.start + 1)
    };
    if (Object.values(validation).some(valid => !valid)) {
      throw new Error(`Sprite atlas validation failed for ${fighter.id}: ${JSON.stringify(validation)}`);
    }
    results.push({ fighter: fighter.id, atlas: path.relative(root, atlasPath), frameCount: totalFrames, validation });
  }
  fs.writeFileSync(path.join(outDir, "metadata", "animations.js"),
    `window.NEON_CLASH_ATLAS_METADATA=${JSON.stringify(bundle)};\n`);
  console.log(JSON.stringify({ frameSize: `${frameWidth}x${frameHeight}`, anchor, results }, null, 2));
}

if (process.argv.includes("--bundle-only")) writeBundleFromMetadata();
else build();
