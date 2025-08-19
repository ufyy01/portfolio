import { useState, useRef, useEffect, useContext } from "react";
import { Button } from "./ui/button";
import { GameContext } from "@/context/gameContext";

const GRID_SIZE = 10;
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

const generateRandomLetter = () =>
	String.fromCharCode(65 + Math.floor(Math.random() * 26));

const createGrid = (WORDS: string[]): Cell[][] => {
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

	WORDS.forEach((word) => placeWord(word));

	// Fill remaining cells
	const finalGrid: Cell[][] = grid.map((row, rIdx) =>
		row.map((char, cIdx) => ({
			letter: char === emptyChar ? generateRandomLetter() : char,
			row: rIdx,
			col: cIdx,
			found: false,
		}))
	);

	return finalGrid;
};

// Fills in any skipped cells between the last selected cell and the current hover/touch cell
// Only supports straight lines (same row or same column)
function extendPathStraight(
	prev: [number, number][],
	targetRow: number,
	targetCol: number
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

	const ACTIVE_WORDS =
		visitorType === "recruiter"
			? HIDDEN_WORDS_RECRUITER
			: visitorType === "developer"
			? HIDDEN_WORDS
			: HIDDEN_WORDS_OTHER;

	const [grid, setGrid] = useState<Cell[][]>(() => createGrid(ACTIVE_WORDS));
	const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
	const [foundWords, setFoundWords] = useState<string[]>([]);
	const [isMouseDown, setIsMouseDown] = useState(false);

	const [timeLeft, setTimeLeft] = useState(80);
	const [gameOver, setGameOver] = useState(false);
	const gridRef = useRef<HTMLDivElement | null>(null);

	const resetGame = () => {
		setGrid(createGrid(ACTIVE_WORDS));
		setSelectedPath([]);
		setFoundWords([]);
		setTimeLeft(80);
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

		const word = selectedPath
			.map(([r, c]) => grid[r][c].letter)
			.join("")
			.toLowerCase();

		if (ACTIVE_WORDS.includes(word) && !foundWords.includes(word)) {
			setFoundWords([...foundWords, word]);
			// Mark each selected cell as found
			setGrid((prevGrid) =>
				prevGrid.map((row) =>
					row.map((cell) =>
						selectedPath.some(([r, c]) => r === cell.row && c === cell.col)
							? { ...cell, found: true }
							: cell
					)
				)
			);
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
		if (foundWords.length === ACTIVE_WORDS.length) {
			setGameOver(true);
		}
	}, [foundWords, ACTIVE_WORDS.length]);

	const allFound = foundWords.length === ACTIVE_WORDS.length;

	return (
		<div className="fixed inset-0 z-[2000] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="z-[2500]">
				<div className="w-full max-w-3xl flex items-center justify-between px-4 my-5 flex-wrap">
					<h2 className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
						Word Shuffle
					</h2>
					<div className="flex items-center gap-3">
						<span
							className={`px-3 py-1 rounded-md text-white ${
								timeLeft <= 15
									? "bg-red-500"
									: timeLeft <= 60
									? "bg-yellow-500"
									: "bg-emerald-600"
							}`}>
							⏱ {timeLeft}
						</span>
						<span className="px-3 py-1 rounded-md bg-slate-800 text-white">
							Found: {foundWords.length}/{ACTIVE_WORDS.length}
						</span>
						<span className="px-3 py-1 rounded-md bg-slate-700 text-white">
							Left: {ACTIVE_WORDS.length - foundWords.length}
						</span>
						<button
							onClick={resetGame}
							className="px-3 py-1 rounded-md bg-[#fc045c] text-white hover:bg-slate-700 transition">
							Restart
						</button>
					</div>
				</div>
				<div>
					<h3 className="text-2xl font-fraunces text-white font-semibold mb-2">
						Find the hidden words!
					</h3>
					<p className="text-lg text-white mb-4">
						Click and hold, then drag across adjacent letters
						(up/down/left/right). Release to submit the word.
					</p>

					<div
						ref={gridRef}
						className="relative z-50 grid gap-2 bg-white p-4 rounded shadow-md touch-none overscroll-contain select-none aspect-square w-full max-w-[min(90vmin,700px)]"
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
									([r, c]) => r === cell.row && c === cell.col
								);
								const isFound = cell.found;
								return (
									<div
										key={`${cell.row}-${cell.col}`}
										className={`w-full aspect-square flex items-center justify-center text-xl font-bold rounded cursor-pointer select-none border 
        ${
					isFound
						? "bg-green-300 text-white"
						: isSelected
						? "bg-blue-200"
						: "bg-white"
				} 
        ${!isFound ? "hover:bg-blue-50" : ""}`}
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
							})
						)}
					</div>
				</div>
			</div>

			{gameOver && (
				<div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl">
						<div className="text-5xl mb-2">{allFound ? "🎉" : "⏰"}</div>
						<h3 className="text-2xl font-semibold mb-2 font-fraunces italic text-orange-400">
							{allFound ? "You solved it!" : "Time's up!"}
						</h3>
						<p className="text-slate-600 mb-6">
							{allFound
								? `Amazing work — You found all the words!`
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

export default WordShuffle;
