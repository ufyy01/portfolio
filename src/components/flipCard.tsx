import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";

// Simple emoji icons for pairs (no external deps)
const ICONS = [
	"🍎",
	"🍌",
	"🍇",
	"🍓",
	"🍍",
	"🥝",
	"🍑",
	"🍉",
	"💻",
	"🖥️",
	"🖱️",
	"⌨️",
	"📱",
	"🖨️",
	"🕹️",
	"💾",
	"🧮",
	"🔌",
];

// Card shape
type Card = {
	id: string;
	icon: string;
	flipped: boolean;
	matched: boolean;
};

function makeDeck(): Card[] {
	// Duplicate and shuffle
	const base: Card[] = ICONS.flatMap((icon, i) => [
		{ id: `${icon}-${i}-a`, icon, flipped: false, matched: false },
		{ id: `${icon}-${i}-b`, icon, flipped: false, matched: false },
	]);
	// Fisher–Yates
	for (let i = base.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[base[i], base[j]] = [base[j], base[i]];
	}
	return base;
}

const TOTAL_TIME = 60; // seconds

type FlipCardProps = {
	setGame: React.Dispatch<React.SetStateAction<string | null>>;
};

const FlipCard: React.FC<FlipCardProps> = ({ setGame }) => {
	const [deck, setDeck] = useState<Card[]>(() => makeDeck());
	const [firstPick, setFirstPick] = useState<string | null>(null);
	const [secondPick, setSecondPick] = useState<string | null>(null);
	const [locked, setLocked] = useState(false);
	const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
	const [started, setStarted] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const allMatched = useMemo(() => deck.every((c) => c.matched), [deck]);
	const gameOver = timeLeft <= 0 || allMatched;

	// Start / tick timer
	useEffect(() => {
		if (!started) return;
		if (timerRef.current) return; // prevent double interval
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
		setDeck(makeDeck());
		setFirstPick(null);
		setSecondPick(null);
		setLocked(false);
		setTimeLeft(TOTAL_TIME);
		setStarted(false);
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}

	function revealCard(cardId: string) {
		setDeck((prev) =>
			prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c))
		);
	}
	function hideCards(a: string, b: string) {
		setDeck((prev) =>
			prev.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false } : c))
		);
	}
	function matchCards(a: string, b: string) {
		setDeck((prev) =>
			prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c))
		);
	}

	const handlePick = (card: Card) => {
		if (locked || gameOver) return;
		if (card.flipped || card.matched) return;
		if (!started) setStarted(true);

		revealCard(card.id);

		if (!firstPick) {
			setFirstPick(card.id);
			return;
		}
		if (!secondPick) {
			setSecondPick(card.id);
			setLocked(true);
			const first = deck.find((c) => c.id === firstPick)!;
			const second = card;

			const isMatch = first.icon === second.icon && first.id !== second.id;

			// Let the flip animation play a bit before resolving
			setTimeout(() => {
				if (isMatch) {
					// Fade out via matched flag; keep flipped true for smoother fade
					matchCards(first.id, second.id);
				} else {
					// Flip back if not match
					hideCards(first.id, second.id);
				}
				setFirstPick(null);
				setSecondPick(null);
				setLocked(false);
			}, 650);
		}
	};

	return (
		<div className="w-full flex flex-col items-center justify-start gap-6 py-6">
			{/* Header / HUD */}
			<div className="w-full max-w-4xl flex items-center justify-between px-4">
				<h2 className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
					Flip Match
				</h2>
				<div className="flex items-center gap-3">
					<Button
						size="lg"
						className={`px-3 py-1 rounded-md text-white ${
							timeLeft <= 10
								? "bg-red-500"
								: timeLeft <= 25
								? "bg-yellow-500"
								: "bg-emerald-600"
						}`}>
						⏱ {timeLeft}s
					</Button>
					<Button
						size="lg"
						onClick={resetGame}
						className="px-3 py-1 rounded-md bg-[#fc045c] text-white hover:bg-slate-700 transition">
						Restart
					</Button>
				</div>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-4 sm:grid-cols-6 gap-4 w-full max-w-4xl px-4">
				{deck.map((card) => {
					const showFace = card.flipped || card.matched;
					return (
						<button
							key={card.id}
							type="button"
							disabled={locked || card.matched}
							onClick={() => handlePick(card)}
							className={`relative aspect-square select-none [perspective:1000px] rounded-lg ${
								card.matched ? "pointer-events-none" : ""
							}`}>
							{/* Fade cover when matched */}
							<div
								className={`absolute inset-0 rounded-lg transition-opacity duration-500 ${
									card.matched ? "opacity-0" : "opacity-100"
								}`}>
								{/* Card inner */}
								<div
									className={`w-full h-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d] ${
										showFace ? "[transform:rotateY(180deg)]" : ""
									} ${
										// subtle wiggle/scale when selected/open
										showFace && !card.matched
											? "scale-105 hover:scale-110"
											: "hover:scale-105"
									}`}>
									{/* Back */}
									<div className="absolute inset-0 backface-hidden rounded-lg bg-gradient-to-br from-pink-600 to-blue-300 shadow-md flex items-center justify-center text-white text-3xl font-bold" />
									{/* Front */}
									<div className="absolute inset-0 rounded-lg bg-white flex items-center justify-center text-4xl [transform:rotateY(180deg)] backface-hidden border border-slate-200 shadow-sm">
										<span>{card.icon}</span>
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{/* Game Over Overlay */}
			{gameOver && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-xl p-6 w-full max-w-md text-center shadow-xl">
						<div className="text-5xl mb-2">{allMatched ? "🎉" : "⏰"}</div>
						<h3 className="text-2xl font-semibold mb-2 font-fraunces italic text-orange-400">
							{allMatched ? "You matched them all!" : "Time's up!"}
						</h3>
						<p className="text-slate-600 mb-6">
							{allMatched
								? `Amazing! You finished with ${timeLeft}s left.`
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

export default FlipCard;
