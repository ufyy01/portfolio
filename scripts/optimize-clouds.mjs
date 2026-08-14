/**
 * Prepares the cloud art for the browser to choose from.
 *
 * Two passes:
 *
 *  1. Cap the masters. They were authored at 2048² and never drawn wider than
 *     1280 CSS pixels, so anything above that is pixels no screen can use.
 *  2. Emit a responsive ladder beside each one. The clouds are drawn at a share
 *     of the viewport — `w-[100%] xl:w-[50%]` in the intro, narrower elsewhere —
 *     so a 412px phone needs about 720px of image and a 1350px desktop about
 *     675px. Without a ladder both were handed the full-width file.
 *
 * Safe to re-run: pass 1 leaves anything already at or below the cap alone, and
 * pass 2 is a pure function of the master.
 *
 *   npm run optimize:images
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const SOURCE = "public/images";

// 1280 covers the widest slot at 1x, a 430px phone at 3x, and a 1512px laptop
// at 2x. These are soft, tinted, constantly moving clouds with no fine detail —
// the resample is not something an eye can find, and the alpha channel is what
// actually has to survive it.
const MAX_EDGE = 1280;

// The rungs a browser picks between. 768 is the one that matters most: it is
// what both a 412px phone at 1.75x and a 1350px desktop at 1x land on.
const LADDER = [384, 512, 768, 1024, 1280];

// These files are almost entirely alpha channel — colour quality barely moves
// the byte count, `alphaQuality` moves all of it. Below about 85 the soft
// interiors posterize into flat blotches and the feathered edges pick up
// speckle, both plainly visible against the sky; at 85 the result is not
// distinguishable from the source even at 3x. So that is the floor.
const WEBP = { quality: 80, effort: 6, alphaQuality: 85 };

// Some of this art was already encoded with far more aggressive alpha
// compression than the floor above, and re-encoding it *grows* the file. Those
// masters are left exactly as they are — the point is fewer bytes, and a
// rewrite that adds them is just a lossy generation for nothing. The ladder is
// still built from them, and the ladder is what visitors actually download.
const MIN_SAVING = 0.05;

const SKY_CLOUDS = [1, 2, 3, 4, 5, 6, 7].map((n) => `cloud${n}.webp`);
// Not a sky cloud but the same story: a square master behind a panel that is
// 600px at its widest, and the heaviest single image in the project.
const FILES = [...SKY_CLOUDS, "cloudPop.webp"];

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
const write = (to, buf) => {
	mkdirSync(dirname(to), { recursive: true });
	writeFileSync(to, buf);
};

console.log("\n1. masters\n");

let masterBefore = 0;
let masterAfter = 0;

for (const name of FILES) {
	const path = join(SOURCE, name);
	const input = readFileSync(path);
	const meta = await sharp(input).metadata();
	masterBefore += input.length;

	if (meta.width <= MAX_EDGE && meta.height <= MAX_EDGE) {
		masterAfter += input.length;
		console.log(`   ${name.padEnd(15)} ${meta.width}px — already at the cap`);
		continue;
	}

	const output = await sharp(input)
		// `fit: inside` so a non-square master keeps its aspect ratio, and
		// withoutEnlargement so this can never upscale something.
		.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
		.webp(WEBP)
		.toBuffer();

	const saving = 1 - output.length / input.length;
	if (saving < MIN_SAVING) {
		masterAfter += input.length;
		console.log(
			`   ${name.padEnd(15)} ${meta.width}px ${kb(input.length).padStart(6)}` +
				`   kept — re-encode would be ${kb(output.length)}`,
		);
		continue;
	}

	write(path, output);
	masterAfter += output.length;
	console.log(
		`   ${name.padEnd(15)} ${meta.width}px ${kb(input.length).padStart(6)}` +
			`  ->  ${MAX_EDGE}px ${kb(output.length).padStart(6)}   -${(saving * 100).toFixed(0)}%`,
	);
}

console.log(`\n   masters ${kb(masterBefore)} -> ${kb(masterAfter)}`);
console.log("\n2. responsive ladder\n");

let rungTotal = 0;

for (const name of FILES) {
	const stem = name.replace(/\.webp$/, "");
	const master = readFileSync(join(SOURCE, name));
	const meta = await sharp(master).metadata();
	const line = [];

	for (const width of LADDER) {
		const to = join(SOURCE, `${stem}-${width}.webp`);

		// At the master's own width there is nothing to resample, and re-encoding
		// would only spend a second lossy generation to arrive back where it
		// started. Copy it instead.
		const output =
			width >= meta.width
				? master
				: await sharp(master).resize({ width, withoutEnlargement: true }).webp(WEBP).toBuffer();

		write(to, output);
		rungTotal += output.length;
		line.push(`${width}:${kb(output.length)}`);
	}

	console.log(`   ${stem.padEnd(12)} ${meta.width}px master   ${line.join("  ")}`);
}

console.log(`\n   ladder adds ${kb(rungTotal)} to the repo; a visitor downloads one rung per cloud.\n`);
