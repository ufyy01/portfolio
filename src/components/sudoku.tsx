import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Delete } from "lucide-react";
import GameShell, {
	GameOverCard,
	gameBoardSquare,
	gameChip,
} from "./gameShell";

// Alphabet Sudoku uses A–I instead of 1–9
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

type Cell = {
	value: string; // "" for empty or one of LETTERS
	fixed: boolean; // true if pre-filled and not editable
};

type Grid = Cell[][]; // 9 x 9

// A valid solved numeric sudoku converted to letters (1->A, …, 9->I)
const SOLUTION: string[][] = [
	["A", "B", "C", "D", "E", "F", "G", "H", "I"],
	["D", "E", "F", "G", "H", "I", "A", "B", "C"],
	["G", "H", "I", "A", "B", "C", "D", "E", "F"],
	["B", "C", "A", "E", "F", "D", "H", "I", "G"],
	["E", "F", "D", "H", "I", "G", "B", "C", "A"],
	["H", "I", "G", "B", "C", "A", "E", "F", "D"],
	["C", "A", "B", "F", "D", "E", "I", "G", "H"],
	["F", "D", "E", "I", "G", "H", "C", "A", "B"],
	["I", "G", "H", "C", "A", "B", "F", "D", "E"],
];

// Mask for puzzle: true = keep fixed; false = empty cell
// (Medium-ish difficulty)
const MASK: boolean[][] = [
	[true, false, true, false, true, false, true, false, true],
	[false, true, false, true, false, true, false, true, false],
	[true, false, false, true, false, true, false, false, true],
	[false, true, true, false, false, false, true, true, false],
	[true, false, false, false, true, false, false, false, true],
	[false, true, true, false, false, false, true, true, false],
	[true, false, false, true, false, true, false, false, true],
	[false, true, false, true, false, true, false, true, false],
	[true, false, true, false, true, false, true, false, true],
];

const START_TIME = 300; // seconds (5 minutes)

type Position = { r: number; c: number };

function buildInitialGrid(): Grid {
	return SOLUTION.map((row, r) =>
		row.map((letter, c) => ({
			value: MASK[r][c] ? letter : "",
			fixed: MASK[r][c],
		})),
	);
}

function deepCloneGrid(g: Grid): Grid {
	return g.map((row) => row.map((cell) => ({ ...cell })));
}

/** First editable cell at or after (r, c), scanning left-to-right, top-to-bottom. */
function firstOpenCell(grid: Grid): Position | null {
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) if (!grid[r][c].fixed) return { r, c };
	}
	return null;
}

type SudokuProps = {
	setGame: React.Dispatch<React.SetStateAction<string | null>>;
};

const Sudoku: React.FC<SudokuProps> = ({ setGame }) => {
	const [grid, setGrid] = useState<Grid>(() => buildInitialGrid());
	const [selected, setSelected] = useState<Position | null>(() =>
		firstOpenCell(buildInitialGrid()),
	);
	const [timeLeft, setTimeLeft] = useState<number>(START_TIME);
	const [started, setStarted] = useState<boolean>(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const solved = useMemo(() => {
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				if (grid[r][c].value !== SOLUTION[r][c]) return false;
			}
		}
		return true;
	}, [grid]);

	const gameOver = timeLeft <= 0 || solved;

	// Start & tick timer
	useEffect(() => {
		if (!started) return;
		if (timerRef.current) return;
		timerRef.current = setInterval(() => {
			setTimeLeft((t) => (t > 0 ? t - 1 : 0));
		}, 1000);
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [started]);

	// Stop timer when game over
	useEffect(() => {
		if (gameOver && timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, [gameOver]);

	function resetGame() {
		const fresh = buildInitialGrid();
		setGrid(fresh);
		setSelected(firstOpenCell(fresh));
		setTimeLeft(START_TIME);
		setStarted(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}

	/**
	 * Letters land through the pad or a hardware keyboard — never through a text
	 * input. On a phone, focusing 81 inputs meant the on-screen keyboard covering
	 * the half of the board you were trying to fill.
	 */
	const writeLetter = useCallback(
		(letter: string) => {
			if (gameOver || !selected) return;
			const { r, c } = selected;
			if (grid[r][c].fixed) return;

			const next = deepCloneGrid(grid);
			next[r][c].value = letter;
			setGrid(next);
			if (letter && !started) setStarted(true);
		},
		[gameOver, selected, grid, started],
	);

	/** Arrow keys skip the pre-filled cells, since those can never be typed into. */
	const moveSelection = useCallback(
		(dr: number, dc: number) => {
			setSelected((prev) => {
				if (!prev) return prev;
				let { r, c } = prev;
				for (let step = 0; step < 9; step++) {
					r = (r + dr + 9) % 9;
					c = (c + dc + 9) % 9;
					if (!grid[r][c].fixed) return { r, c };
				}
				return prev;
			});
		},
		[grid],
	);

	/**
	 * Listening on the window rather than the board: the letter pad steals focus
	 * every time it's tapped, so a handler bound to the grid would go quiet the
	 * moment someone mixed the pad with the keyboard.
	 */
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			const key = event.key;

			if (/^[a-iA-I]$/.test(key)) {
				event.preventDefault();
				writeLetter(key.toUpperCase());
				return;
			}
			if (key === "Backspace" || key === "Delete") {
				event.preventDefault();
				writeLetter("");
				return;
			}
			const moves: Record<string, [number, number]> = {
				ArrowUp: [-1, 0],
				ArrowDown: [1, 0],
				ArrowLeft: [0, -1],
				ArrowRight: [0, 1],
			};
			if (moves[key]) {
				event.preventDefault();
				moveSelection(...moves[key]);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [writeLetter, moveSelection]);

	// Highlight conflicts (row/col/box)
	function hasConflict(r: number, c: number, val: string): boolean {
		if (!val) return false;
		// row
		for (let i = 0; i < 9; i++)
			if (i !== c && grid[r][i].value === val) return true;
		// col
		for (let i = 0; i < 9; i++)
			if (i !== r && grid[i][c].value === val) return true;
		// box
		const br = Math.floor(r / 3) * 3;
		const bc = Math.floor(c / 3) * 3;
		for (let rr = br; rr < br + 3; rr++) {
			for (let cc = bc; cc < bc + 3; cc++) {
				if ((rr !== r || cc !== c) && grid[rr][cc].value === val) return true;
			}
		}
		return false;
	}

	function formatTime(secs: number) {
		const m = Math.floor(secs / 60)
			.toString()
			.padStart(2, "0");
		const s = (secs % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	}

	const padDisabled = gameOver || !selected;

	return (
		<GameShell
			title="Alphabet Sudoku"
			hint="Tap a square, then pick a letter."
			onRestart={resetGame}
			onBack={() => setGame(null)}
			status={
				<span
					className={`${gameChip} ${
						timeLeft <= 15
							? "bg-red-500"
							: timeLeft <= 60
								? "bg-yellow-500"
								: "bg-emerald-600"
					}`}>
					⏱ {formatTime(timeLeft)}
				</span>
			}
			footer={
				<div className="mx-auto grid w-fit grid-cols-5 gap-1.5 md:grid-cols-10">
					{LETTERS.map((letter) => (
						<button
							key={letter}
							type="button"
							disabled={padDisabled}
							onClick={() => writeLetter(letter)}
							className="h-10 w-10 rounded-lg border border-[#fc045c]/20 bg-white text-lg font-semibold text-slate-800 shadow-sm transition hover:bg-[#fc045c] hover:text-white active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-800">
							{letter}
						</button>
					))}
					<button
						type="button"
						disabled={padDisabled}
						onClick={() => writeLetter("")}
						aria-label="Clear square"
						title="Clear square"
						className="grid h-10 w-10 place-items-center rounded-lg border border-orange-700/20 bg-white text-orange-700 shadow-sm transition hover:bg-orange-50 active:scale-95 disabled:opacity-40">
						<Delete size={20} />
					</button>
				</div>
			}
			overlay={
				gameOver ? (
					<GameOverCard
						won={solved}
						message={
							solved
								? `Amazing work — finished with ${formatTime(timeLeft)} left.`
								: "Try again and beat the clock."
						}
						onRestart={resetGame}
						onBack={() => setGame(null)}
					/>
				) : null
			}>
			<div
				className={`${gameBoardSquare} grid grid-cols-9 grid-rows-9 select-none overflow-hidden rounded-lg border-2 border-slate-700 bg-white shadow-md`}>
				{grid.map((row, r) =>
					row.map((cell, c) => {
						const thickRight = (c + 1) % 3 === 0 && c !== 8;
						const thickBottom = (r + 1) % 3 === 0 && r !== 8;
						const conflict = hasConflict(r, c, cell.value);
						const isSelected = selected?.r === r && selected?.c === c;
						// Everything sharing a line with the selected square, so the
						// letter you're about to place has visible context.
						const inScope =
							!!selected &&
							(selected.r === r ||
								selected.c === c ||
								(Math.floor(selected.r / 3) === Math.floor(r / 3) &&
									Math.floor(selected.c / 3) === Math.floor(c / 3)));

						return (
							<button
								key={`${r}-${c}`}
								type="button"
								disabled={cell.fixed || gameOver}
								onClick={() => setSelected({ r, c })}
								className={`flex items-center justify-center border border-slate-300 font-semibold leading-none text-[clamp(0.7rem,6cqmin,1.75rem)] ${
									thickRight ? "border-r-2 border-r-slate-700" : ""
								} ${thickBottom ? "border-b-2 border-b-slate-700" : ""} ${
									isSelected
										? "bg-[#fc045c]/15 ring-2 ring-inset ring-[#fc045c]"
										: inScope
											? "bg-[#fc045c]/5"
											: cell.fixed
												? "bg-slate-100"
												: "bg-white"
								} ${
									conflict
										? "text-red-600"
										: cell.fixed
											? "text-slate-500"
											: "text-slate-900"
								} disabled:cursor-default`}>
								{cell.value}
							</button>
						);
					}),
				)}
			</div>
		</GameShell>
	);
};

export default Sudoku;
