/**
 * Shared surface and type tokens for the board drawers.
 *
 * The drawers float over a bright sky. Anything translucent enough to let that
 * through leaves white text sitting on near-white, so every drawer sits on a
 * near-opaque frosted sheet and uses dark type instead. Accent colours are
 * picked for contrast on that sheet: the brand orange-400 only manages 2.3:1
 * against it, so headings use orange-700 (4.4:1) and the brand pink #fc045c is
 * kept for display-sized text only (3.4:1, which clears AA for large text).
 */

/**
 * The frosted sheet itself, without any sizing. Shared with the full-screen game
 * panel, which needs the same surface but not the drawer's width and chrome.
 */
export const drawerSheet =
	"rounded-lg border border-white/60 bg-[#f8ecf3]/90 shadow-xl backdrop-blur-2xl";

/** Drawer shell. Callers add their own height. */
export const drawerPanel = `${drawerSheet} z-[2000] flex w-screen flex-col overflow-hidden pb-5 after:hidden md:w-8/12`;

/** Display headings. */
export const drawerHeading = "font-fraunces italic text-orange-700";

/** Body copy on the sheet. */
export const drawerBody = "text-slate-700";

/** Raised content card sitting on the sheet. */
export const drawerCard =
	"rounded-2xl border border-[#fc045c]/10 bg-white shadow-lg";

/** Footer "Back to board" control. */
export const drawerCloseButton =
	"mx-auto border border-orange-700/20 bg-white text-orange-700 hover:bg-orange-50";
