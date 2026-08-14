import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { GameContext } from "@/context/gameContext";
import { drawerSheet } from "@/lib/drawerStyles";
import GameShell, {
	GameOverCard,
	gameBoardSquare,
	gameChip,
} from "./gameShell";
import { sfx } from "@/lib/sfx";

const GRID_SIZE = 10;
/**
 * How many words are hidden at once — the working set, not the whole round. Find
 * one and it is replaced by the next word out of the pool, so the grid only ever
 * shows eight but a round is as long as the clock and as deep as the pool.
 */
const WORDS_PER_ROUND = 8;
// Same minute Flip the Card runs on. With words refilling as they are found the
// round no longer has a natural end, so the clock is the whole shape of it — and
// a long one just draws out a score that stopped climbing.
const ROUND_TIME = 60;
/**
 * Long enough for the found word to read as found and fade out of the list
 * before its replacement takes the slot. Matches the fade-out duration below.
 */
const REPLACE_DELAY = 600;

const HIDDEN_WORDS = [
	"node",
	"next",
	"repo",
	"auth",
	"json",
	"ajax",
	"java",
	"html",
	"sass",
	"less",
	"bash",
	"yarn",
	"http",
	"unix",
	"test",
	"mock",
	"jest",
	"expo",
	"drei",
	"gsap",
	"vite",
	"rest",
	"soap",
	"grpc",
	"yaml",
	"apis",
	"hook",
	"view",
	"page",
	"save",
];

const HIDDEN_WORDS_RECRUITER = [
	"loyal",
	"trust",
	"adapt",
	"skill",
	"team",
	"focus",
	"drive",
	"honest",
	"creative",
	"growth",
	"learn",
	"leader",
	"vision",
	"reliable",
	"dedicate",
	"detail",
	"ethic",
	"support",
	"respect",
	"mentor",
	"curious",
	"innovate",
	"commit",
	"energy",
	"humble",
	"patient",
	"clarity",
	"result",
	"depend",
	"talent",
];

const HIDDEN_WORDS_OTHER = [
	"home",
	"book",
	"food",
	"love",
	"play",
	"tree",
	"rain",
	"song",
	"cake",
	"bird",
	"fish",
	"road",
	"star",
	"game",
	"smile",
	"sun",
	"moon",
	"milk",
	"ball",
	"walk",
	"cat",
	"dog",
	"shoe",
	"cup",
	"bed",
	"phone",
	"car",
	"tv",
	"pen",
	"bag",
];

/** One word hidden in the grid, and exactly which cells it occupies. */
type Placement = {
	id: number;
	word: string;
	cells: [number, number][];
};

type Round = {
	letters: string[][];
	/** Hidden and still to be found. */
	active: Placement[];
	/** Found, still fading out of the list before its slot is refilled. */
	retiring: Placement[];
	/** Cells lit up as found, keyed "row,col". Cleared when the slot refills. */
	lit: string[];
	/** Every word this round has already used, so replacements never repeat. */
	used: string[];
	found: number;
	nextId: number;
};

const cellKey = (row: number, col: number) => `${row},${col}`;

const DIRECTIONS: [number, number][] = [
	[0, 1], // right
	[1, 0], // down
];

const generateRandomLetter = () =>
	String.fromCharCode(65 + Math.floor(Math.random() * 26));

const shuffled = <T,>(items: T[]): T[] => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

/**
 * The cells that are spoken for: every letter of every word still in play. A new
 * word may cross one only where it already agrees. Everything else — filler, and
 * the leftovers of words already found — is free to be written over.
 */
const lockedCells = (placements: Placement[], letters: string[][]) => {
	const locked = new Map<string, string>();
	for (const placement of placements) {
		for (const [row, col] of placement.cells) {
			locked.set(cellKey(row, col), letters[row][col]);
		}
	}
	return locked;
};

/**
 * Hide `word` somewhere it fits, writing it into `letters` (mutated — pass a
 * copy). Returns the cells it landed on, or null if there was no room for it.
 */
const hideWord = (
	letters: string[][],
	word: string,
	locked: Map<string, string>,
): [number, number][] | null => {
	const upper = word.toUpperCase();

	for (let attempt = 0; attempt < 200; attempt++) {
		const [dRow, dCol] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
		const startRow = Math.floor(Math.random() * GRID_SIZE);
		const startCol = Math.floor(Math.random() * GRID_SIZE);

		if (
			startRow + dRow * (upper.length - 1) >= GRID_SIZE ||
			startCol + dCol * (upper.length - 1) >= GRID_SIZE
		)
			continue;

		const cells: [number, number][] = [];
		let fits = true;
		for (let i = 0; i < upper.length; i++) {
			const row = startRow + i * dRow;
			const col = startCol + i * dCol;
			const taken = locked.get(cellKey(row, col));
			if (taken !== undefined && taken !== upper[i]) {
				fits = false;
				break;
			}
			cells.push([row, col]);
		}
		if (!fits) continue;

		cells.forEach(([row, col], i) => {
			letters[row][col] = upper[i];
		});
		return cells;
	}
	return null;
};

const createRound = (pool: string[]): Round => {
	const letters: string[][] = Array.from({ length: GRID_SIZE }, () =>
		Array.from({ length: GRID_SIZE }, () => ""),
	);

	const active: Placement[] = [];
	const used: string[] = [];
	let nextId = 0;

	for (const word of shuffled(pool)) {
		if (active.length >= WORDS_PER_ROUND) break;
		if (word.length > GRID_SIZE) continue;
		const cells = hideWord(letters, word, lockedCells(active, letters));
		if (cells) {
			active.push({ id: nextId++, word, cells });
			used.push(word);
		}
	}

	for (let row = 0; row < GRID_SIZE; row++) {
		for (let col = 0; col < GRID_SIZE; col++) {
			if (letters[row][col] === "") letters[row][col] = generateRandomLetter();
		}
	}

	return { letters, active, retiring: [], lit: [], used, found: 0, nextId };
};

// Fills in any skipped cells between the last selected cell and the current hover/touch cell
// Only supports straight lines (same row or same column)
function extendPathStraight(
	prev: [number, number][],
	targetRow: number,
	targetCol: number,
) {
	if (prev.length === 0) return prev;
	const [lr, lc] = prev[prev.length - 1];

	// Must remain straight (no diagonals)
	if (lr !== targetRow && lc !== targetCol) return prev;

	const next = [...prev];

	if (lr === targetRow && lc !== targetCol) {
		const dir = targetCol > lc ? 1 : -1;
		for (let c = lc + dir; c !== targetCol + dir; c += dir) {
			const step: [number, number] = [lr, c];
			if (!next.some(([r, cc]) => r === step[0] && cc === step[1]))
				next.push(step);
		}
	} else if (lc === targetCol && lr !== targetRow) {
		const dir = targetRow > lr ? 1 : -1;
		for (let r = lr + dir; r !== targetRow + dir; r += dir) {
			const step: [number, number] = [r, lc];
			if (!next.some(([rr, c]) => rr === step[0] && c === step[1]))
				next.push(step);
		}
	}
	return next;
}

type WordShuffleProps = {
	setGame: React.Dispatch<React.SetStateAction<string | null>>;
};

const WordShuffle = ({ setGame }: WordShuffleProps) => {
	const gameContext = useContext(GameContext);
	const visitorType = gameContext?.visitorType;

	const pool =
		visitorType === "recruiter"
			? HIDDEN_WORDS_RECRUITER
			: visitorType === "developer"
				? HIDDEN_WORDS
				: HIDDEN_WORDS_OTHER;

	const [round, setRound] = useState<Round>(() => createRound(pool));
	const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
	const [isMouseDown, setIsMouseDown] = useState(false);

	const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
	const [gameOver, setGameOver] = useState(false);
	const gridRef = useRef<HTMLDivElement | null>(null);
	/** Pending refills, so a restart or an unmount cannot land one afterwards. */
	const refillTimers = useRef<number[]>([]);

	const { letters, active, retiring, lit, found } = round;
	const litCells = useMemo(() => new Set(lit), [lit]);

	const clearRefills = () => {
		refillTimers.current.forEach(clearTimeout);
		refillTimers.current = [];
	};

	useEffect(() => clearRefills, []);

	const resetGame = () => {
		clearRefills();
		setRound(createRound(pool));
		setSelectedPath([]);
		setTimeLeft(ROUND_TIME);
		setGameOver(false);
	};

	/**
	 * Take the found word out of play, light its letters up, then — once it has
	 * had time to fade out of the list — scramble the cells it no longer needs and
	 * hide the next word from the pool in its place.
	 */
	const retire = (placement: Placement) => {
		sfx.play("found");
		setRound((prev) => ({
			...prev,
			active: prev.active.filter((p) => p.id !== placement.id),
			retiring: [...prev.retiring, placement],
			lit: [...prev.lit, ...placement.cells.map(([r, c]) => cellKey(r, c))],
			found: prev.found + 1,
		}));

		const timer = window.setTimeout(() => {
			setRound((prev) => {
				const freed = new Set(
					placement.cells.map(([r, c]) => cellKey(r, c)),
				);
				const base = {
					...prev,
					retiring: prev.retiring.filter((p) => p.id !== placement.id),
					lit: prev.lit.filter((key) => !freed.has(key)),
				};

				const next = pool.find(
					(word) => !prev.used.includes(word) && word.length <= GRID_SIZE,
				);
				if (!next) return base;

				const letters = prev.letters.map((row) => [...row]);
				const locked = lockedCells(prev.active, letters);

				// The word that just left would otherwise stay legible in the grid,
				// findable but no longer listed.
				for (const [row, col] of placement.cells) {
					if (!locked.has(cellKey(row, col)))
						letters[row][col] = generateRandomLetter();
				}

				const cells = hideWord(letters, next, locked);
				if (!cells) return base;

				const taken = new Set(cells.map(([r, c]) => cellKey(r, c)));
				return {
					...base,
					letters,
					lit: base.lit.filter((key) => !taken.has(key)),
					active: [...prev.active, { id: prev.nextId, word: next, cells }],
					nextId: prev.nextId + 1,
					used: [...prev.used, next],
				};
			});
		}, REPLACE_DELAY);

		refillTimers.current.push(timer);
	};

	useEffect(() => {
		if (gameOver) return;
		if (timeLeft <= 0) {
			setGameOver(true);
			return;
		}
		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft, gameOver]);

	const handleMouseDown = (row: number, col: number) => {
		if (gameOver) return;
		setIsMouseDown(true);
		setSelectedPath([[row, col]]);
	};

	const handleMouseEnter = (row: number, col: number) => {
		if (gameOver || !isMouseDown) return;
		setSelectedPath((prev) => {
			if (!prev.some(([r, c]) => r === row && c === col)) {
				return [...prev, [row, col]];
			}
			return prev;
		});
	};

	const handleMouseUp = () => {
		if (gameOver) return;
		setIsMouseDown(false);

		const spelled = selectedPath.map(([r, c]) => letters[r][c]).join("");
		// Dragging right-to-left or bottom-to-top spells the word backwards; that's
		// still the word, so both readings count.
		const candidates = [
			spelled.toLowerCase(),
			[...spelled].reverse().join("").toLowerCase(),
		];
		const match = active.find((placement) =>
			candidates.includes(placement.word),
		);

		if (match) retire(match);

		setSelectedPath([]);
	};

	useEffect(() => {
		if (!isMouseDown) return;
		const onUp = () => {
			setIsMouseDown(false);
			handleMouseUp();
		};
		window.addEventListener("mouseup", onUp);
		window.addEventListener("touchend", onUp);
		return () => {
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("touchend", onUp);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMouseDown]);

	// The clock is the usual finish. Running the pool dry is the rare one, and the
	// only way to actually clear the board.
	const cleared = active.length === 0 && retiring.length === 0 && found > 0;

	useEffect(() => {
		if (cleared) setGameOver(true);
	}, [cleared]);

	return (
		// Its own panel rather than the drawer's: the grid needs raw pointer events,
		// and vaul reads those as a drag on the sheet.
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm">
			<div
				className={`${drawerSheet} flex h-full max-h-[92svh] w-full max-w-3xl flex-col p-4`}>
				<GameShell
					title="Word Shuffle"
					hint="Hold and drag across letters, then release. Every word you find is replaced by a new one."
					onRestart={resetGame}
					onBack={() => setGame(null)}
					status={
						<>
							<span
								className={`${gameChip} ${
									// Last sixth, then the back half — kept as fractions of the
									// round so they still mean something if it is retuned.
									timeLeft <= ROUND_TIME / 6
										? "bg-red-500"
										: timeLeft <= ROUND_TIME / 2
											? "bg-yellow-500"
											: "bg-emerald-600"
								}`}>
								⏱ {timeLeft}s
							</span>
							<span className={`${gameChip} bg-slate-700`}>
								Found: {found}
							</span>
						</>
					}
					footer={
						<div className="flex flex-wrap items-center justify-center gap-1.5">
							{[...active, ...retiring]
								// By id, so a word holds its place in the list and replacements
								// arrive at the end instead of reshuffling the whole row.
								.sort((a, b) => a.id - b.id)
								.map((placement) => {
									const isRetiring = retiring.some(
										(p) => p.id === placement.id,
									);
									return (
										<span
											key={placement.id}
											className={`rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-wide ${
												isRetiring
													? "animate-out fade-out-0 zoom-out-95 fill-mode-forwards duration-500 border-emerald-600/30 bg-emerald-100 text-emerald-700 line-through"
													: "animate-in fade-in-0 zoom-in-95 duration-300 border-[#fc045c]/20 bg-white text-slate-700"
											}`}>
											{placement.word}
										</span>
									);
								})}
						</div>
					}
					overlay={
						gameOver ? (
							<GameOverCard
								won={cleared}
								message={
									cleared
										? `Amazing work — you cleared the whole pool with ${timeLeft}s to spare!`
										: `You found ${found} ${
												found === 1 ? "word" : "words"
											}. Try again and beat your score.`
								}
								onRestart={resetGame}
								onBack={() => setGame(null)}
							/>
						) : null
					}>
					<div
						ref={gridRef}
						className={`${gameBoardSquare} grid touch-none select-none gap-[1%] overscroll-contain rounded-lg bg-white p-[1%] shadow-md`}
						style={{
							gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0,1fr))`,
							gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0,1fr))`,
						}}
						onMouseLeave={() => setIsMouseDown(false)}
						onMouseUp={handleMouseUp}
						onMouseMove={(e) => {
							if (!gridRef.current || !isMouseDown) return;
							if (selectedPath.length === 0) return;

							const rect = gridRef.current.getBoundingClientRect();
							const cellWidth = rect.width / GRID_SIZE;
							const cellHeight = rect.height / GRID_SIZE;

							const x = e.clientX - rect.left;
							const y = e.clientY - rect.top;

							const col = Math.floor(x / cellWidth);
							const row = Math.floor(y / cellHeight);

							if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE)
								return;

							setSelectedPath((prev) => extendPathStraight(prev, row, col));
						}}
						onTouchStart={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onTouchEnd={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleMouseUp();
						}}
						onTouchMove={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (!gridRef.current) return;
							if (selectedPath.length === 0) return;

							const touch = e.touches[0];
							const rect = gridRef.current.getBoundingClientRect();
							const cellWidth = rect.width / GRID_SIZE;
							const cellHeight = rect.height / GRID_SIZE;

							const x = touch.clientX - rect.left;
							const y = touch.clientY - rect.top;

							const col = Math.floor(x / cellWidth);
							const row = Math.floor(y / cellHeight);

							if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE)
								return;

							setSelectedPath((prev) => extendPathStraight(prev, row, col));
						}}>
						{letters.map((row, rowIdx) =>
							row.map((letter, colIdx) => {
								const isSelected = selectedPath.some(
									([r, c]) => r === rowIdx && c === colIdx,
								);
								const isFound = litCells.has(cellKey(rowIdx, colIdx));
								return (
									<div
										key={`${rowIdx}-${colIdx}`}
										className={`flex cursor-pointer select-none items-center justify-center rounded border font-bold leading-none transition-colors text-[clamp(0.65rem,5cqmin,1.5rem)] ${
											isFound
												? "border-emerald-600/30 bg-emerald-300 text-white"
												: isSelected
													? "border-blue-300 bg-blue-200"
													: "border-slate-200 bg-white hover:bg-blue-50"
										}`}
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleMouseDown(rowIdx, colIdx);
										}}
										onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
										onTouchStart={() => handleMouseDown(rowIdx, colIdx)}>
										{letter}
									</div>
								);
							}),
						)}
					</div>
				</GameShell>
			</div>
		</div>
	);
};

export default WordShuffle;
