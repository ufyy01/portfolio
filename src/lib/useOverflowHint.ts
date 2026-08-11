import { useEffect, useState } from "react";

/**
 * Tracks whether a scroll container still has content below the fold, so callers
 * can show a "there's more" affordance only when it's actually true.
 *
 * The container is tracked through a callback ref rather than an object ref: the
 * drawers portal their content in a tick after they open, so an effect that read
 * `ref.current` on mount found nothing and never looked again. A ResizeObserver
 * covers the rest of the settling — fonts landing, images decoding, the drawer
 * finishing its slide.
 *
 * Pass `key` (the content being rendered, a loading flag, ...) to force a
 * re-measure when the contents change in a way that doesn't resize the box.
 */
export function useOverflowHint<T extends HTMLElement>(key?: unknown) {
	const [node, setNode] = useState<T | null>(null);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		if (!node) return;

		const update = () => {
			const overflow = node.scrollHeight - node.clientHeight;
			setHasMore(overflow > 12 && overflow - node.scrollTop > 24);
		};

		update();
		node.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);

		const observer = new ResizeObserver(update);
		observer.observe(node);
		if (node.firstElementChild) observer.observe(node.firstElementChild);

		return () => {
			node.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
			observer.disconnect();
		};
	}, [node, key]);

	return { ref: setNode, hasMore };
}
