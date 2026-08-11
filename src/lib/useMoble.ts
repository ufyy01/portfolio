import { useEffect, useMemo, useState } from "react";

const checkMobile = () => {
	if (typeof window === "undefined") return false;

	const userAgent = navigator.userAgent || navigator.vendor;
	const isTouch = "ontouchstart" in window;
	const isSmallScreen = window.innerWidth <= 768;

	const mobileMatch =
		/android|iphone|ipad|iPod|opera mini|iemobile|wpdesktop/i.test(userAgent);

	return mobileMatch && isTouch && isSmallScreen;
};

export const useIsMobile = () => {
	// Resolved on the first render so copy like "Tap"/"Click" doesn't flip after mount
	const [isMobile, setIsMobile] = useState(checkMobile);

	useEffect(() => {
		const update = () => setIsMobile(checkMobile());

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return isMobile;
};

/** Honour the OS "reduce motion" setting before running any decorative animation. */
export const usePrefersReducedMotion = () =>
	useMemo(() => {
		if (typeof window === "undefined" || !window.matchMedia) return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}, []);
