import { useMemo } from "react";
import { createStars } from "@/lib/sky";

/** The twinkling night sky, shared by the intro screen and the game scene. */
const StarField = ({ count = 120 }: { count?: number }) => {
	const stars = useMemo(() => createStars(count), [count]);

	return (
		<div className="pointer-events-none absolute inset-0 z-[0] overflow-hidden">
			{stars.map((s, i) => (
				<div
					key={i}
					className="absolute rounded-full bg-white animate-pulse"
					style={{
						top: `${s.top}%`,
						left: `${s.left}%`,
						width: `${s.size}px`,
						height: `${s.size}px`,
						opacity: s.opacity,
						animationDuration: "2.2s",
						animationDelay: `${s.delay}s`,
					}}
				/>
			))}
		</div>
	);
};

export default StarField;
