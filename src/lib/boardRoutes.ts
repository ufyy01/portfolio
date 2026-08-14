/**
 * The tiles worth linking to directly.
 *
 * The board is the whole site, which meant the whole site lived at "/" — so a
 * link in a job application dropped a recruiter at the intro, and the resume was
 * several dice rolls away. These give each section an address that lands the
 * character on its tile, with the game still running underneath.
 *
 * `position` is the tile index from `meshPosition` in model.tsx, and `boardName`
 * is the name that tile reports — the layout sets both, so the character starts
 * standing there and the panel is already open.
 */

export type BoardRoute = {
	/** Path without a leading slash, as react-router wants it. */
	path: string;
	/** Short name, for the returning visitor's jump menu. */
	label: string;
	position: number;
	boardName: string;
	title: string;
	description: string;
};

export const BOARD_ROUTES: BoardRoute[] = [
	{
		path: "resume",
		label: "Resume",
		position: 11,
		boardName: "resume",
		title: "Resume | Ufuoma Ohwo, Software Developer",
		description:
			"The full resume of Ufuoma Ohwo, a software developer building interactive, joyful web experiences.",
	},
	{
		path: "projects",
		label: "Projects",
		position: 5,
		boardName: "projects",
		title: "Projects | Ufuoma Ohwo, Software Developer",
		description:
			"Selected projects by Ufuoma Ohwo — what they do, how they were built, and what they are built with.",
	},
	{
		path: "skills",
		label: "Skills",
		position: 4,
		boardName: "skills",
		title: "Skills | Ufuoma Ohwo, Software Developer",
		description:
			"The languages, frameworks and tools Ufuoma Ohwo works with day to day.",
	},
	{
		path: "contact",
		label: "Contact",
		position: 8,
		boardName: "contact",
		title: "Contact | Ufuoma Ohwo, Software Developer",
		description: "Get in touch with Ufuoma Ohwo, software developer.",
	},
	{
		path: "games",
		label: "Games",
		position: 10,
		boardName: "controller",
		title: "Games | Ufuoma Ohwo, Software Developer",
		description:
			"Three small games hidden in a portfolio: Flip the Card, Word Shuffle and Alphabet Sudoku.",
	},
];

/** The route for a pathname, ignoring case and any trailing slash. */
export const routeForPath = (pathname: string): BoardRoute | undefined => {
	const path = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
	if (!path) return undefined;
	return BOARD_ROUTES.find((route) => route.path === path);
};
