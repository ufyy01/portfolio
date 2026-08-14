import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import StarField from "./starField";
import { useSkyTheme } from "@/lib/sky";
import { usePrefersReducedMotion } from "@/lib/useMoble";

const MultipleClouds = () => {
	const cloudContainerRef = useRef<HTMLDivElement>(null);
	const sky = useSkyTheme();
	const reducedMotion = usePrefersReducedMotion();
	const images = [
		"/images/cloud1.webp",
		"/images/cloud2.webp",
		"/images/cloud3.webp",
		"/images/cloud4.webp",
		"/images/cloud5.webp",
		"/images/cloud6.webp",
		"/images/cloud7.webp",
		"/images/cloud4.webp",
		"/images/cloud1.webp",
	];

	useLayoutEffect(() => {
		if (!cloudContainerRef.current) return;

		const ctx = gsap.context(() => {
			const cloudElements = gsap.utils.toArray<HTMLElement>(
				".cloud-img",
				cloudContainerRef.current
			);

			// Centring lives on the transform GSAP owns, not on a `translate(-50%, -50%)`
			// in the markup. The moment `x` is animated GSAP reads the current transform
			// off a computed matrix, and these images are only as tall as their content:
			// before one decodes that matrix resolves against a zero-height box, the
			// vertical half-offset is baked away as 0, and the cloud jumps when it loads.
			gsap.set(cloudElements, { xPercent: -50, yPercent: -50 });

			if (reducedMotion) return;

			cloudElements.forEach((el, i) => {
				gsap.to(el, {
					x: "+=30",
					duration: 20 + i * 2,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				});
			});
		}, cloudContainerRef);

		return () => ctx.revert();
	}, [reducedMotion]);

	return (
		<div
			ref={cloudContainerRef}
			className="absolute inset-0 pointer-events-none -z-10">
			{sky.isNight && <StarField />}
			<div className="relative w-full h-full">
				{images.map((src, index) => (
					<img
						key={index}
						src={src}
						alt={`Cloud ${index + 1}`}
						className={`absolute w-[60%] xl:w-[30%] cloud-img ${sky.cloudTint}`}
						style={{
							top: `${(index % 3) * 30 + 5}%`,
							left: `${(index % 4) * 25 + 5}%`,
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default MultipleClouds;
