import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";

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

function buildInitialGrid(): Grid {
	return SOLUTION.map((row, r) =>
		row.map((letter, c) => ({
			value: MASK[r][c] ? letter : "",
			fixed: MASK[r][c],
		}))
	);
}

function isLetter(value: string): boolean {
	return LETTERS.includes(value as (typeof LETTERS)[number]);
}

function deepCloneGrid(g: Grid): Grid {
	return g.map((row) => row.map((cell) => ({ ...cell })));
}

type FlipCardProps = {
	setGame: React.Dispatch<React.SetStateAction<string | null>>;
};

const Sudoku: React.FC<FlipCardProps> = ({ setGame }) => {
	const [grid, setGrid] = useState<Grid>(() => buildInitialGrid());
	const [timeLeft, setTimeLeft] = useState<number>(START_TIME);
	const [started, setStarted] = useState<boolean>(false);
	const [paused, setPaused] = useState<boolean>(false);
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
		if (!started || paused) return;
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
	}, [started, paused]);

	// Stop timer when game over
	useEffect(() => {
		if (gameOver && timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, [gameOver]);

	function resetGame() {
		setGrid(buildInitialGrid());
		setTimeLeft(START_TIME);
		setStarted(false);
		setPaused(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}

	function handleChange(r: number, c: number, raw: string) {
		if (gameOver) return;
		if (grid[r][c].fixed) return;
		const v = raw.toUpperCase().trim();
		const val = v.slice(0, 1); // single char only

		const next = deepCloneGrid(grid);
		if (isLetter(val)) {
			next[r][c].value = val;
		} else if (val === "") {
			next[r][c].value = "";
		} else {
			// ignore invalid entries
			return;
		}
		if (!started) setStarted(true);
		setGrid(next);
	}

	// Optional: highlight conflicts (row/col/box)
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

	return (
		<div className="w-full flex flex-col items-center gap-6 py-6">
			{/* HUD */}
			<div className="w-full max-w-3xl flex items-center justify-between px-4 gap-4">
				<h2 className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400 text-nowrap">
					Alphabet Sudoku
				</h2>
				<div className="flex items-center gap-3 flex-wrap">
					<span
						className={`px-3 py-1 rounded-md text-white ${
							timeLeft <= 15
								? "bg-red-500"
								: timeLeft <= 60
								? "bg-yellow-500"
								: "bg-emerald-600"
						}`}>
						⏱ {formatTime(timeLeft)}
					</span>

					<button
						onClick={resetGame}
						className="px-3 py-1 rounded-md bg-[#fc045c] text-white hover:bg-slate-700 transition">
						Restart
					</button>
				</div>
			</div>

			{/* Board */}
			<div className="grid grid-cols-9 grid-rows-9 select-none">
				{grid.map((row, r) => (
					<React.Fragment key={r}>
						{row.map((cell, c) => {
							const thickRight = (c + 1) % 3 === 0 && c !== 8;
							const thickBottom = (r + 1) % 3 === 0 && r !== 8;
							const conflict = hasConflict(r, c, cell.value);
							return (
								<div
									key={`${r}-${c}`}
									className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border border-slate-300 ${
										thickRight ? "border-r-2 border-r-slate-700" : ""
									} ${thickBottom ? "border-b-2 border-b-slate-700" : ""} ${
										cell.fixed ? "bg-slate-100" : "bg-white"
									}`}>
									<input
										inputMode="text"
										maxLength={1}
										value={cell.value}
										disabled={cell.fixed || paused || gameOver}
										onChange={(e) => handleChange(r, c, e.target.value)}
										className={`w-full h-full text-center uppercase font-semibold outline-none caret-transparent bg-transparent ${
											conflict ? "text-red-600" : "text-slate-900"
										}`}
									/>
								</div>
							);
						})}
					</React.Fragment>
				))}
			</div>

			{/* Game Over Overlay */}
			{gameOver && (
				<div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl">
						<div className="text-5xl mb-2">{solved ? "🎉" : "⏰"}</div>
						<h3 className="text-2xl font-semibold mb-2 font-fraunces italic text-orange-400">
							{solved ? "You solved it!" : "Time's up!"}
						</h3>
						<p className="text-slate-600 mb-6">
							{solved
								? `Amazing work — finished with ${formatTime(timeLeft)} left.`
								: "Try again and beat the clock."}
						</p>
						<Button
							size="lg"
							onClick={resetGame}
							className="px-4 py-2 rounded-md bg-[#fc045c] font-fraunces italic text-lg text-white hover:bg-slate-700 transition">
							Play Again
						</Button>
						<Button
							size="lg"
							onClick={() => setGame(null)}
							className="px-4 py-2 rounded-md bg-orange-400 font-fraunces italic text-lg text-white hover:bg-slate-700 transition ms-2">
							Back to Games
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Sudoku;
