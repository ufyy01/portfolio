import { useState, useRef, useEffect } from "react";

const GRID_SIZE = 6;
const HIDDEN_WORDS = ["code", "love", "post", "soft"];

type Cell = {
	letter: string;
	row: number;
	col: number;
	found: boolean;
};

const generateRandomLetter = () =>
	String.fromCharCode(65 + Math.floor(Math.random() * 26));

const createGrid = (): Cell[][] => {
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

	HIDDEN_WORDS.forEach((word) => placeWord(word));

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

const areAdjacent = (a: [number, number], b: [number, number]) => {
	const [r1, c1] = a;
	const [r2, c2] = b;
	// Only allow moves one cell up, down, left, or right (no diagonals)
	return (
		(Math.abs(r1 - r2) === 1 && c1 === c2) ||
		(Math.abs(c1 - c2) === 1 && r1 === r2)
	);
};

const WordShuffle = () => {
	const [grid, setGrid] = useState<Cell[][]>(createGrid);
	const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
	const [foundWords, setFoundWords] = useState<string[]>([]);
	useEffect(() => {
		if (selectedPath.length > 0) {
			const letters = selectedPath.map(([r, c]) => grid[r][c].letter);
			console.log("Selected letters:", letters);
		}
	}, [selectedPath, grid]);
	const [timeLeft, setTimeLeft] = useState(60);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const gridRef = useRef<HTMLDivElement | null>(null);

	const resetGame = () => {
		setGrid(createGrid());
		setSelectedPath([]);
		setFoundWords([]);
		setTimeLeft(60);
		setScore(0);
		setGameOver(false);
	};

	useEffect(() => {
		if (timeLeft <= 0) {
			setGameOver(true);
			return;
		}
		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft]);

	const handleMouseDown = (row: number, col: number) => {
		if (gameOver) return;
		setSelectedPath([[row, col]]);
	};

	const handleMouseEnter = (row: number, col: number) => {
		if (gameOver) return;
		setSelectedPath((prev) => {
			if (!prev.some(([r, c]) => r === row && c === col)) {
				return [...prev, [row, col]];
			}
			return prev;
		});
	};

	const handleMouseUp = () => {
		if (gameOver) return;

		const word = selectedPath
			.map(([r, c]) => grid[r][c].letter)
			.join("")
			.toLowerCase();

		if (HIDDEN_WORDS.includes(word) && !foundWords.includes(word)) {
			setFoundWords([...foundWords, word]);
			setScore((prev) => prev + 10);
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

	return (
		<div className="flex flex-col items-center justify-center  p-6">
			<div className="flex gap-6 mb-4 text-lg font-medium">
				<span>⏱ Time: {timeLeft}s</span>
				<span>⭐ Score: {score}</span>
			</div>
			<h3 className="text-2xl font-semibold mb-4">Find the hidden words!</h3>
			<div
				ref={gridRef}
				className="grid grid-cols-6 gap-2 bg-white p-4 rounded shadow-md"
				// onMouseLeave={() => setSelectedPath([])}
				onMouseUp={handleMouseUp}
				onTouchEnd={handleMouseUp}
				onTouchMove={(e) => {
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

					const last = selectedPath[selectedPath.length - 1];
					if (
						row >= 0 &&
						row < GRID_SIZE &&
						col >= 0 &&
						col < GRID_SIZE &&
						!selectedPath.some(([r, c]) => r === row && c === col) &&
						areAdjacent(last, [row, col])
					) {
						setSelectedPath((prev) => [...prev, [row, col]]);
					}
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
								className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded cursor-pointer select-none border 
        ${
					isFound
						? "bg-green-300 text-white"
						: isSelected
						? "bg-blue-200"
						: "bg-white"
				} 
        ${!isFound ? "hover:bg-blue-50" : ""}`}
								onMouseDown={() => handleMouseDown(cell.row, cell.col)}
								onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
								onTouchStart={() => handleMouseDown(cell.row, cell.col)}>
								{cell.letter}
							</div>
						);
					})
				)}
			</div>

			{gameOver && (
				<>
					<p className="mt-4 text-red-500 font-semibold">
						⏳ Time's up! Final Score: {score}
					</p>
					<button
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
						onClick={resetGame}>
						🔁 Play Again
					</button>
				</>
			)}

			<div className="mt-6 text-center">
				<p className="font-semibold text-lg mb-2">Found Words:</p>
				<ul className="space-y-1 text-gray-700">
					{foundWords.map((word) => (
						<li key={word}>{word}</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default WordShuffle;
