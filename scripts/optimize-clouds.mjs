/**
 * Prepares the cloud art for the browser to choose from.
 *
 * The clouds are drawn at a share of the viewport — `w-[100%] xl:w-[50%]` in the
 * intro, narrower elsewhere — so a 412px phone needs about 720px of image and a
 * 1350px desktop about 675px. Without a ladder to pick from, both were handed
 * the full-width master.
 *
 * Two jobs, deliberately not the same command:
 *
 *   node scripts/optimize-clouds.mjs                # ladder — runs on every build
 *   node scripts/optimize-clouds.mjs --cap-masters  # capping — by hand, rarely
 *
 * The ladder is generated output. It is gitignored, it is rebuilt from the
 * masters whenever they change, and nothing else in the repo depends on it
 * existing beforehand.
 *
 * Capping rewrites the tracked art in place, so it is kept off the build path:
 * a build that quietly re-encodes committed files would hand you a dirty tree
 * every time, and each pass would be another lossy generation. Run it by hand
 * when new art lands, and commit the result.
 */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const SOURCE = "public/images";

// 1280 covers the widest slot at 1x, a 430px phone at 3x, and a 1512px laptop
// at 2x. These are soft, tinted, constantly moving clouds with no fine detail —
// the resample is not something an eye can find, and the alpha channel is what
// actually has to survive it.
const MAX_EDGE = 1280;

// The rungs a browser picks between. 768 is the one that matters most: it is
// what both a 412px phone at 1.75x and a 1350px desktop at 1x land on.
// Kept in step with CLOUD_WIDTHS in src/lib/cloudArt.ts.
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

const FILES = [
	...[1, 2, 3, 4, 5, 6, 7].map((n) => `cloud${n}.webp`),
	// Not a sky cloud but the same story: a square master behind a panel that is
	// 600px at its widest, and the heaviest single image in the project.
	"cloudPop.webp",
];

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

const write = (to, buf) => {
	mkdirSync(dirname(to), { recursive: true });
	writeFileSync(to, buf);
};

/** Whether `path` exists and has not been outrun by the master it came from. */
const upToDate = (path, masterMs) => {
	try {
		return statSync(path).mtimeMs >= masterMs;
	} catch {
		return false;
	}
};

async function capMasters() {
	console.log("\ncapping masters\n");
	let before = 0;
	let after = 0;

	for (const name of FILES) {
		const path = join(SOURCE, name);
		const input = readFileSync(path);
		const meta = await sharp(input).metadata();
		before += input.length;

		if (meta.width <= MAX_EDGE && meta.height <= MAX_EDGE) {
			after += input.length;
			console.log(`  ${name.padEnd(15)} ${meta.width}px — already at the cap`);
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
			after += input.length;
			console.log(
				`  ${name.padEnd(15)} ${meta.width}px ${kb(input.length).padStart(6)}` +
					`   kept — re-encode would be ${kb(output.length)}`,
			);
			continue;
		}

		write(path, output);
		after += output.length;
		console.log(
			`  ${name.padEnd(15)} ${meta.width}px ${kb(input.length).padStart(6)}` +
				`  ->  ${MAX_EDGE}px ${kb(output.length).padStart(6)}   -${(saving * 100).toFixed(0)}%`,
		);
	}

	console.log(`\n  masters ${kb(before)} -> ${kb(after)}\n`);
}

async function buildLadder() {
	let built = 0;
	let skipped = 0;

	for (const name of FILES) {
		const stem = name.replace(/\.webp$/, "");
		const from = join(SOURCE, name);
		const masterMs = statSync(from).mtimeMs;

		// Only read and decode the master if some rung actually needs rebuilding —
		// on a warm tree that makes the whole pass a handful of stat calls.
		const stale = LADDER.filter(
			(width) => !upToDate(join(SOURCE, `${stem}-${width}.webp`), masterMs),
		);
		if (stale.length === 0) {
			skipped += LADDER.length;
			continue;
		}

		const master = readFileSync(from);
		const meta = await sharp(master).metadata();
		skipped += LADDER.length - stale.length;

		for (const width of stale) {
			// At the master's own width there is nothing to resample, and re-encoding
			// would only spend a second lossy generation to arrive back where it
			// started. Copy it instead.
			const output =
				width >= meta.width
					? master
					: await sharp(master).resize({ width, withoutEnlargement: true }).webp(WEBP).toBuffer();

			write(join(SOURCE, `${stem}-${width}.webp`), output);
			built += 1;
		}
	}

	if (built === 0) {
		console.log(`cloud ladder: ${skipped} rungs already current`);
	} else {
		console.log(`cloud ladder: built ${built} rung(s), ${skipped} already current`);
	}
}

if (process.argv.includes("--cap-masters")) await capMasters();

await buildLadder();
