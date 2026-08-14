export type VisitorType = "recruiter" | "developer" | "other";

export type VisitorMemory = {
	/** Completed visits, counted when someone actually reaches the board. */
	visits: number;
	/** ISO timestamp of the previous visit, for "you were here last week". */
	lastVisit: string;
	/** What they said they were last time, so the intro can pre-answer itself. */
	visitorType: VisitorType | null;
};

// Versioned in the name: if the shape ever changes, old keys are simply not
// found rather than needing a migration for a nicety like this.
const STORAGE_KEY = "ufy.visitor.v1";

const isVisitorType = (value: unknown): value is VisitorType =>
	value === "recruiter" || value === "developer" || value === "other";

/**
 * Storage access is wrapped throughout: Safari's private mode and a handful of
 * privacy settings make `localStorage` throw on read as well as on write, and a
 * returning-visitor greeting is never worth taking the site down for.
 */
export const readVisitor = (): VisitorMemory | null => {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null) return null;

		const record = parsed as Record<string, unknown>;
		const visits = typeof record.visits === "number" ? record.visits : 0;
		if (visits < 1) return null;

		return {
			visits,
			lastVisit:
				typeof record.lastVisit === "string" ? record.lastVisit : "",
			visitorType: isVisitorType(record.visitorType)
				? record.visitorType
				: null,
		};
	} catch {
		return null;
	}
};

/** Called once the visitor reaches the board — arriving is the visit. */
export const rememberVisit = (visitorType: VisitorType | null) => {
	try {
		const previous = readVisitor();
		const next: VisitorMemory = {
			visits: (previous?.visits ?? 0) + 1,
			lastVisit: new Date().toISOString(),
			visitorType: visitorType ?? previous?.visitorType ?? null,
		};
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// A visitor who cannot be remembered is just a first-time visitor.
	}
};

/**
 * Visits worth marking. Spaced so the thank-you keeps arriving for anyone who
 * keeps coming back, without turning up often enough to become the normal state.
 *
 * Each is phrased differently on purpose: the paragraph above these already ends
 * on "thank you for coming back", and four variations on the same sentence would
 * read as a form letter rather than as someone meaning it.
 */
const MILESTONES: Record<number, string> = {
	3: "Three visits now — that you keep choosing to spend time here means a lot to me.",
	5: "Five visits. Thank you, genuinely, for coming back this often.",
	10: "Ten visits. I'm grateful for every single one of them.",
	25: "Twenty-five visits. I don't take one of them for granted. Thank you.",
};

/**
 * The message for this visit, if it lands on a milestone.
 *
 * Takes the number of the visit now beginning — stored `visits` counts the ones
 * already finished, so someone with 2 behind them is arriving for their 3rd.
 */
export const milestoneFor = (visitNumber: number): string | null =>
	MILESTONES[visitNumber] ?? null;

/**
 * "yesterday", "last week" — vague on purpose. Telling someone the exact minute
 * they last opened a portfolio is a strange thing to know about them.
 */
export const describeLastVisit = (iso: string): string | null => {
	if (!iso) return null;
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return null;

	const days = Math.floor((Date.now() - then) / 86_400_000);
	if (days <= 0) return "earlier today";
	if (days === 1) return "yesterday";
	if (days < 7) return `${days} days ago`;
	if (days < 14) return "last week";
	if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
	return "a while back";
};
