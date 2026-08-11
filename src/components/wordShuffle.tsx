import { useState, useRef, useEffect, useContext } from "react";
import { GameContext } from "@/context/gameContext";
import { drawerSheet } from "@/lib/drawerStyles";
import GameShell, {
	GameOverCard,
	gameBoardSquare,
	gameChip,
} from "./gameShell";

const GRID_SIZE = 10;
/**
 * A round hides a handful of words rather than the whole pool: the grid only has
 * room for so many, and the counter used to count up to a total that could never
 * be reached, so "found them all" never fired.
 */
const WORDS_PER_ROUND = 8;
const ROUND_TIME = 90;

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

type Cell = {
	letter: string;
	row: number;
	col: number;
	found: boolean;
};

type Round = {
	grid: Cell[][];
	/** The words actually placed in this grid — the ones worth hunting for. */
	words: string[];
};

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

const createRound = (pool: string[]): Round => {
	const emptyChar = "";
	const grid: string[][] = Array(GRID_SIZE)
		.fill(null)
		.map(() => Array(GRID_SIZE).fill(emptyChar));

	const directions = [
		[0, 1], // right
		[1, 0], // down
	];

	const placeWord = (word: string): boolean => {
		const direction = directions[Math.floor(Math.random() * directions.length)];
		const [dx, dy] = direction;

		for (let attempt = 0; attempt < 100; attempt++) {
			const startRow = Math.floor(Math.random() * GRID_SIZE);
			const startCol = Math.floor(Math.random() * GRID_SIZE);

			const endRow = startRow + dx * (word.length - 1);
			const endCol = startCol + dy * (word.length - 1);

			if (
				endRow >= GRID_SIZE ||
				endCol >= GRID_SIZE ||
				endRow < 0 ||
				endCol < 0
			)
				continue;

			let fits = true;
			for (let i = 0; i < word.length; i++) {
				const r = startRow + i * dx;
				const c = startCol + i * dy;
				if (grid[r][c] !== emptyChar && grid[r][c] !== word[i].toUpperCase()) {
					fits = false;
					break;
				}
			}
			if (!fits) continue;

			for (let i = 0; i < word.length; i++) {
				const r = startRow + i * dx;
				const c = startCol + i * dy;
				grid[r][c] = word[i].toUpperCase();
			}
			return true;
		}
		return false;
	};

	const words: string[] = [];
	for (const word of shuffled(pool)) {
		if (words.length >= WORDS_PER_ROUND) break;
		if (word.length <= GRID_SIZE && placeWord(word)) words.push(word);
	}

	// Fill remaining cells
	const finalGrid: Cell[][] = grid.map((row, rIdx) =>
		row.map((char, cIdx) => ({
			letter: char === emptyChar ? generateRandomLetter() : char,
			row: rIdx,
			col: cIdx,
			found: false,
		})),
	);

	return { grid: finalGrid, words };
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
	const [foundWords, setFoundWords] = useState<string[]>([]);
	const [isMouseDown, setIsMouseDown] = useState(false);

	const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
	const [gameOver, setGameOver] = useState(false);
	const gridRef = useRef<HTMLDivElement | null>(null);

	const { grid, words } = round;

	const resetGame = () => {
		setRound(createRound(pool));
		setSelectedPath([]);
		setFoundWords([]);
		setTimeLeft(ROUND_TIME);
		setGameOver(false);
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

		const letters = selectedPath.map(([r, c]) => grid[r][c].letter).join("");
		// Dragging right-to-left or bottom-to-top spells the word backwards; that's
		// still the word, so both readings count.
		const candidates = [
			letters.toLowerCase(),
			[...letters].reverse().join("").toLowerCase(),
		];
		const match = candidates.find(
			(word) => words.includes(word) && !foundWords.includes(word),
		);

		if (match) {
			setFoundWords([...foundWords, match]);
			// Mark each selected cell as found
			setRound((prev) => ({
				...prev,
				grid: prev.grid.map((row) =>
					row.map((cell) =>
						selectedPath.some(([r, c]) => r === cell.row && c === cell.col)
							? { ...cell, found: true }
							: cell,
					),
				),
			}));
		}

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

	useEffect(() => {
		if (words.length > 0 && foundWords.length === words.length) {
			setGameOver(true);
		}
	}, [foundWords, words]);

	const allFound = words.length > 0 && foundWords.length === words.length;

	return (
		// Its own panel rather than the drawer's: the grid needs raw pointer events,
		// and vaul reads those as a drag on the sheet.
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm">
			<div
				className={`${drawerSheet} flex h-full max-h-[92svh] w-full max-w-3xl flex-col p-4`}>
				<GameShell
					title="Word Shuffle"
					hint="Hold and drag across letters, then release."
					onRestart={resetGame}
					onBack={() => setGame(null)}
					status={
						<>
							<span
								className={`${gameChip} ${
									timeLeft <= 15
										? "bg-red-500"
										: timeLeft <= 45
											? "bg-yellow-500"
											: "bg-emerald-600"
								}`}>
								⏱ {timeLeft}s
							</span>
							<span className={`${gameChip} bg-slate-700`}>
								Found: {foundWords.length}/{words.length}
							</span>
						</>
					}
					footer={
						<div className="flex flex-wrap items-center justify-center gap-1.5">
							{words.map((word) => {
								const found = foundWords.includes(word);
								return (
									<span
										key={word}
										className={`rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-wide transition ${
											found
												? "border-emerald-600/30 bg-emerald-100 text-emerald-700 line-through"
												: "border-[#fc045c]/20 bg-white text-slate-700"
										}`}>
										{word}
									</span>
								);
							})}
						</div>
					}
					overlay={
						gameOver ? (
							<GameOverCard
								won={allFound}
								message={
									allFound
										? `Amazing work — all ${words.length} words with ${timeLeft}s to spare!`
										: `You found ${foundWords.length} of ${words.length}. Try again and beat the clock.`
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
						{grid.map((row) =>
							row.map((cell) => {
								const isSelected = selectedPath.some(
									([r, c]) => r === cell.row && c === cell.col,
								);
								return (
									<div
										key={`${cell.row}-${cell.col}`}
										className={`flex cursor-pointer select-none items-center justify-center rounded border font-bold leading-none text-[clamp(0.65rem,5cqmin,1.5rem)] ${
											cell.found
												? "border-emerald-600/30 bg-emerald-300 text-white"
												: isSelected
													? "border-blue-300 bg-blue-200"
													: "border-slate-200 bg-white hover:bg-blue-50"
										}`}
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleMouseDown(cell.row, cell.col);
										}}
										onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
										onTouchStart={() => handleMouseDown(cell.row, cell.col)}>
										{cell.letter}
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
