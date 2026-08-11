/**
 * Shared surface tokens for the floating HUD dock — the sound toggle and the
 * menu trigger that sit over the board.
 *
 * The dock stays deliberately glassy: the sky reading through it is part of the
 * look, so unlike the drawers (see drawerStyles.ts, which thicken to a near
 * opaque sheet because they carry body copy) legibility here comes from a 1px
 * drop shadow holding the icon edges against a bright sky.
 *
 * Controls are tokens rather than per-call strings because the dock's two
 * buttons had drifted apart — different padding, different icon sizes, one
 * labelled and one not.
 */

/** The dock shell: one surface, one blur, one shadow for the whole cluster. */
export const hudPanel =
	"flex flex-col rounded-2xl border border-white/25 bg-white/30 p-1.5 shadow-lg backdrop-blur-lg";

/** Square icon control. 56px stays a comfortable touch target on phones. */
export const hudButton =
	"grid size-14 place-items-center rounded-xl text-[#fc045c] transition duration-200 hover:bg-white/45 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fc045c] [&_svg]:drop-shadow-[0_1px_1px_rgb(0_0_0/0.2)]";

/**
 * Hairline between stacked controls, drawn as a pseudo-element so it stops
 * short of the panel's rounded corners. `first:` keeps it off the top control,
 * so the dock looks right whether it holds one button or two — visitors typed
 * as "other" never get the menu.
 */
export const hudDivider =
	"relative before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-white/30 first:before:hidden";

/** Items in the list that drops below the dock. */
export const hudMenuItem =
	"h-auto justify-end rounded-xl border border-white/25 bg-white/30 px-4 py-3 text-right font-fraunces text-lg italic text-[#fc045c] shadow-lg backdrop-blur-lg transition duration-200 hover:bg-white/50";
