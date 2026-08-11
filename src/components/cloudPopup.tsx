import { GameContext } from "@/context/gameContext";
import { Button } from "./ui/button";
import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/useMoble";
import { getPopupMessage, type PopupAction } from "@/lib/popupMessages";
import { useOverflowHint } from "@/lib/useOverflowHint";

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

const PANEL_ART = "/images/cloudPop.png";

// Remembered across popups so only the very first one waits on the image
let panelArtReady = false;

const ACTION_ICONS: Record<PopupAction["kind"], string> = {
	ready: "streamline-pixel:entertainment-events-hobbies-board-game-dice",
	open: "ep:info-filled",
	dismiss: "mdi:check",
};

const CloudPopup = () => {
	const isMobile = useIsMobile();
	const reducedMotion = usePrefersReducedMotion();

	const gameContext = useContext(GameContext);

	const visitorType = gameContext?.visitorType;
	const boardName = gameContext?.boardName || "default";
	const grantedMotionPermission = gameContext?.grantedMotionPermission ?? false;
	const setGrantedMotionPermission = gameContext?.setGrantedMotionPermission;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const setShowMore = gameContext?.setShowMore;

	const popupRef = useRef<HTMLDivElement>(null);
	const dismissingRef = useRef(false);

	const [artReady, setArtReady] = useState(panelArtReady);

	// Drawn once per appearance, so a random line can't change while it's being read
	const [seed] = useState(() => Math.random());

	const message = useMemo(
		() =>
			getPopupMessage({
				boardName,
				visitorType,
				isMobile,
				motionGranted: grantedMotionPermission,
				seed,
			}),
		[boardName, visitorType, isMobile, grantedMotionPermission, seed]
	);

	const titleId = `cloud-popup-${boardName}`;

	const { ref: bodyRef, hasMore } = useOverflowHint<HTMLDivElement>(
		message?.html
	);

	useLayoutEffect(() => {
		const panel = popupRef.current;
		const ctx = gsap.context(() => {
			const animateIn = () => {
				if (!popupRef.current) return;
				if (reducedMotion) {
					gsap.set(popupRef.current, { xPercent: 0, autoAlpha: 1 });
					return;
				}
				gsap.fromTo(
					popupRef.current,
					{ xPercent: 100, autoAlpha: 0, force3D: true },
					{
						xPercent: 0,
						autoAlpha: 1,
						duration: 0.7,
						ease: "back.out(1.1)",
						force3D: true,
					}
				);
			};

			if (panelArtReady) {
				animateIn();
				return;
			}

			// Wait for the cloud art the first time, so it can't pop in mid-slide
			const img = new Image();
			img.src = PANEL_ART;
			const ready = () => {
				panelArtReady = true;
				setArtReady(true);
				animateIn();
			};
			if (img.complete) {
				ready();
			} else {
				img.onload = ready;
				// Even if it fails, proceed so the UI isn't blocked
				img.onerror = ready;
			}
		}, popupRef);

		return () => {
			// Kill the dismiss tween too — it outlives the context that owns the entrance
			if (panel) gsap.killTweensOf(panel);
			ctx.revert();
		};
	}, [reducedMotion]);

	/** The only way this popup closes — animation, state and re-entrancy in one place. */
	const dismiss = useCallback(
		(then?: () => void) => {
			if (dismissingRef.current) return;
			dismissingRef.current = true;

			const done = () => {
				setShowCloudPopup?.(false);
				then?.();
			};

			if (!popupRef.current || reducedMotion) {
				done();
				return;
			}

			gsap.to(popupRef.current, {
				xPercent: 100,
				autoAlpha: 0,
				duration: 0.45,
				ease: "power2.in",
				onComplete: done,
			});
		},
		[reducedMotion, setShowCloudPopup]
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") dismiss();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [dismiss]);

	/**
	 * Purely informational popups bow out on their own. Anything offering a way
	 * to see more waits for a real choice — and the welcome popup must wait too,
	 * since its button is what requests motion permission.
	 */
	const autoDismisses = !!message?.actions.every(
		(action) => action.kind === "dismiss"
	);

	// Long copy needs longer on screen than "I love K-Pop", so the delay is read
	// off the word count rather than being one flat number for every board.
	const readingMs = useMemo(() => {
		if (!message) return 0;
		const words = message.html
			.replace(/<[^>]+>/g, " ")
			.trim()
			.split(/\s+/).length;
		// ~185wpm, plus a beat to notice the popup arrived at all.
		return Math.min(20000, 4000 + words * 320);
	}, [message]);

	// Once someone engages, the popup is theirs to close — a timer that fires
	// mid-sentence is worse than one that never fires.
	const [readerEngaged, setReaderEngaged] = useState(false);
	const engage = useCallback(() => setReaderEngaged(true), []);

	useEffect(() => {
		if (!autoDismisses || readerEngaged) return;
		const timer = setTimeout(dismiss, readingMs);
		return () => clearTimeout(timer);
	}, [autoDismisses, readerEngaged, readingMs, dismiss]);

	const handleGesturePermission = async () => {
		try {
			const DME = (
				window as unknown as {
					DeviceMotionEvent?: DeviceMotionEventWithPermission;
				}
			).DeviceMotionEvent;
			const DOE = (
				window as unknown as {
					DeviceOrientationEvent?: DeviceOrientationEventWithPermission;
				}
			).DeviceOrientationEvent;

			let granted = grantedMotionPermission;

			// Prefer feature detection over isMobile. iOS Safari exposes requestPermission on these constructors.
			if (typeof DME?.requestPermission === "function") {
				const res = await DME.requestPermission();
				granted = res === "granted" || granted;
			}
			if (typeof DOE?.requestPermission === "function") {
				const res2 = await DOE.requestPermission();
				granted = res2 === "granted" || granted;
			}

			// Fallback: if neither permission API exists, assume allowed
			if (
				typeof DME?.requestPermission !== "function" &&
				typeof DOE?.requestPermission !== "function"
			) {
				granted = true;
			}

			setGrantedMotionPermission?.(granted);
			return granted;
		} catch (err) {
			console.error("Error requesting motion/orientation permission:", err);
			setGrantedMotionPermission?.(false);
			return false;
		}
	};

	const runAction = async (action: PopupAction) => {
		if (action.kind === "ready") {
			await handleGesturePermission();
			dismiss();
			return;
		}
		if (action.kind === "open") {
			dismiss(() => setShowMore?.(true));
			return;
		}
		dismiss();
	};

	if (!message) return null;

	return (
		<div
			ref={popupRef}
			role="dialog"
			aria-labelledby={titleId}
			style={{ visibility: artReady ? "visible" : "hidden" }}
			// pointerMove rather than pointerEnter: the panel slides in from the
			// right and can pass under a resting cursor, which isn't engagement.
			onPointerMove={engage}
			onPointerDown={engage}
			onFocusCapture={engage}
			className="fixed bottom-0 right-0 z-[2000] w-full will-change-transform transform-gpu lg:w-9/12 xl:w-6/12">
			<div className="relative flex w-full items-center justify-center rounded-lg bg-[url('/images/cloudPop.png')] bg-cover bg-top bg-no-repeat py-10 text-lg">
				<div className="relative mx-auto mt-10 w-9/12 md:mt-20">
					<button
						type="button"
						onClick={() => dismiss()}
						aria-label="Close"
						className="absolute -top-1 right-0 rounded-full p-1 text-orange-400/70 transition-colors hover:bg-orange-100 hover:text-orange-500">
						<Icon icon="mdi:close" width="22" height="22" />
					</button>

					<h2
						id={titleId}
						className="pt-2 pr-8 text-center font-fraunces text-3xl italic text-orange-400 md:text-4xl">
						{message.title}
					</h2>

					<div className="relative">
						<div
							ref={bodyRef}
							// Scrolling the copy is the clearest "I'm still reading" there is,
							// and it's the only one a touch device gives us.
							onScroll={engage}
							className="no-scrollbar mt-3 max-h-[38vh] overflow-y-auto text-center text-lg text-[#fc045c] md:text-xl [&_p+p]:mt-2"
							dangerouslySetInnerHTML={{ __html: message.html }}
						/>
						{hasMore && (
							<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-0.5">
								<Icon
									icon="mdi:chevron-down"
									width="24"
									height="24"
									className="animate-bounce rounded-full bg-white/90 text-orange-400 shadow-sm"
								/>
							</div>
						)}
					</div>

					<div className="my-5 flex flex-wrap justify-center gap-3">
						{message.actions.map((action, index) => {
							const primary = index === 0;
							return (
								<Button
									key={action.kind}
									size="lg"
									type="button"
									onClick={() => runAction(action)}
									className={`relative z-[200] rounded-full transition-transform hover:-translate-y-0.5 ${
										primary
											? "bg-orange-400 text-white hover:bg-orange-400"
											: "border border-orange-300 bg-white text-orange-400 hover:bg-white"
									}`}>
									<Icon
										icon={ACTION_ICONS[action.kind]}
										width="28"
										height="28"
										color={primary ? "white" : "oklch(75% 0.183 55.934)"}
										className="mr-1 h-7 w-7"
									/>
									<span className="font-fraunces text-xl italic md:text-2xl">
										{action.label}
									</span>
								</Button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CloudPopup;
