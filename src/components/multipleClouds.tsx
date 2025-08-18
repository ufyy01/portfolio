import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
const MultipleClouds = ({ cloudTint = "" }: { cloudTint?: string }) => {
	const cloudContainerRef = useRef<HTMLDivElement>(null);
	const images = [
		"/images/cloud1.png",
		"/images/cloud2.png",
		"/images/cloud3.png",
		"/images/cloud4.png",
		"/images/cloud5.png",
		"/images/cloud6.png",
		"/images/cloud7.png",
		"/images/cloud4.png",
		"/images/cloud1.png",
	];

	useEffect(() => {
		if (!cloudContainerRef.current) return;

		const cloudElements = cloudContainerRef.current.querySelectorAll("img");

		cloudElements.forEach((el, i) => {
			gsap.to(el, {
				x: "+=30",
				duration: 20 + i * 2,
				ease: "sine.inOut",
				yoyo: true,
				repeat: -1,
			});
		});
	}, []);

	const isNight = useMemo(() => {
		const hour = new Date().getHours();
		return !(hour >= 6 && hour < 19);
	}, []);

	const stars = useMemo(
		() =>
			Array.from({ length: 120 }, () => ({
				top: Math.random() * 100,
				left: Math.random() * 100,
				size: Math.random() < 0.8 ? 2 : 3,
				delay: Math.random() * 3,
				opacity: 0.6 + Math.random() * 0.4,
			})),
		[]
	);

	return (
		<div
			ref={cloudContainerRef}
			className="absolute inset-0 pointer-events-none -z-10">
			{isNight && (
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
			)}
			<div className="relative w-full h-full">
				{images.map((src, index) => (
					<img
						key={index}
						src={src}
						alt={`Cloud ${index + 1}`}
						className={`absolute w-[60%] xl:w-[30%] cloud-img ${cloudTint}`}
						style={{
							top: `${(index % 3) * 30 + 5}%`,
							left: `${(index % 4) * 25 + 5}%`,
							transform: "translate(-50%, -50%)",
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default MultipleClouds;
