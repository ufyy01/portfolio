/**
 * The cloud art is drawn at a share of the viewport, never at its own size, so
 * the right file to send depends entirely on the screen asking. A 412px phone
 * needs about 720px of image; a 1350px desktop, where the clouds drop to half
 * width, needs about 675px. Both used to be handed the full-width master.
 *
 * `scripts/optimize-clouds.mjs` writes a rung per width beside each master;
 * these helpers describe them to the browser, which does the choosing.
 */

/** Kept in step with LADDER in scripts/optimize-clouds.mjs. */
const CLOUD_WIDTHS = [384, 512, 768, 1024, 1280];

/** `/images/cloud6.webp` -> `/images/cloud6-384.webp 384w, …` */
export function cloudSrcSet(src: string) {
	const stem = src.replace(/\.webp$/, "");
	return CLOUD_WIDTHS.map((w) => `${stem}-${w}.webp ${w}w`).join(", ");
}

/**
 * The intro's drifting clouds: `w-[100%] xl:w-[50%]`.
 *
 * These mirror Tailwind's breakpoints, and they are a promise about layout
 * rather than a hint — get one wrong and the browser confidently picks the
 * wrong rung, so they have to be edited alongside the className.
 */
export const SKY_CLOUD_SIZES = "(min-width: 1280px) 50vw, 100vw";

/** The single cloud crossing the intro: `w-[60%] md:w-[35%] 2xl:w-[25%]`. */
export const DRIFTING_CLOUD_SIZES =
	"(min-width: 1536px) 25vw, (min-width: 768px) 35vw, 60vw";

/** The board's background clouds: `w-[60%] xl:w-[30%]`. */
export const BOARD_CLOUD_SIZES = "(min-width: 1280px) 30vw, 60vw";
