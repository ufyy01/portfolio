import React, { useEffect, useMemo, useRef, useState } from "react";
import GameShell, {
	GameOverCard,
	gameBoardSquare,
	gameChip,
} from "./gameShell";

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

// 18 pairs land on a 6 x 6 board — square, so it fits the stage whole.
const COLUMNS = 6;

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
	const matchedPairs = useMemo(
		() => deck.filter((c) => c.matched).length / 2,
		[deck],
	);
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
			prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)),
		);
	}
	function hideCards(a: string, b: string) {
		setDeck((prev) =>
			prev.map((c) =>
				c.id === a || c.id === b ? { ...c, flipped: false } : c,
			),
		);
	}
	function matchCards(a: string, b: string) {
		setDeck((prev) =>
			prev.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)),
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
		<GameShell
			title="Flip Match"
			hint="Turn two cards over. Find every pair before the clock runs out."
			onRestart={resetGame}
			onBack={() => setGame(null)}
			status={
				<>
					<span
						className={`${gameChip} ${
							timeLeft <= 10
								? "bg-red-500"
								: timeLeft <= 25
									? "bg-yellow-500"
									: "bg-emerald-600"
						}`}>
						⏱ {timeLeft}s
					</span>
					<span className={`${gameChip} bg-slate-700`}>
						Pairs: {matchedPairs}/{ICONS.length}
					</span>
				</>
			}
			overlay={
				gameOver ? (
					<GameOverCard
						won={allMatched}
						message={
							allMatched
								? `Amazing! You finished with ${timeLeft}s left.`
								: `You matched ${matchedPairs} of ${ICONS.length} pairs — try again and beat the clock.`
						}
						onRestart={resetGame}
						onBack={() => setGame(null)}
					/>
				) : null
			}>
			<div
				className={`${gameBoardSquare} grid gap-[1.5%]`}
				style={{
					gridTemplateColumns: `repeat(${COLUMNS}, minmax(0,1fr))`,
					gridTemplateRows: `repeat(${(ICONS.length * 2) / COLUMNS}, minmax(0,1fr))`,
				}}>
				{deck.map((card) => {
					const showFace = card.flipped || card.matched;
					return (
						<button
							key={card.id}
							type="button"
							disabled={locked || card.matched}
							onClick={() => handlePick(card)}
							aria-label={showFace ? card.icon : "Hidden card"}
							className={`relative select-none rounded-lg [perspective:1000px] ${
								card.matched ? "pointer-events-none" : ""
							}`}>
							{/* Fade cover when matched */}
							<div
								className={`absolute inset-0 rounded-lg transition-opacity duration-500 ${
									card.matched ? "opacity-0" : "opacity-100"
								}`}>
								{/* Card inner */}
								<div
									className={`h-full w-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d] ${
										showFace ? "[transform:rotateY(180deg)]" : ""
									} ${
										// subtle wiggle/scale when selected/open
										showFace && !card.matched
											? "scale-105 hover:scale-110"
											: "hover:scale-105"
									}`}>
									{/* Back */}
									<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-pink-600 to-blue-300 shadow-md backface-hidden" />
									{/* Front */}
									<div className="absolute inset-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[clamp(1rem,9cqmin,2.5rem)] leading-none shadow-sm backface-hidden [transform:rotateY(180deg)]">
										<span>{card.icon}</span>
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>
		</GameShell>
	);
};

export default FlipCard;
