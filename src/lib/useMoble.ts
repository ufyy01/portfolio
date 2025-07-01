import { useEffect, useState } from "react";

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent || navigator.vendor;
			const isTouch = "ontouchstart" in window;
			const isSmallScreen = window.innerWidth <= 768;

			const mobileMatch =
				/android|iphone|ipad|iPod|opera mini|iemobile|wpdesktop/i.test(
					userAgent
				);

			setIsMobile(mobileMatch && isTouch && isSmallScreen);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return isMobile;
};
