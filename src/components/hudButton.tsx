import type { ComponentProps } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { hudButton } from "@/lib/hudStyles";
import { cn } from "@/lib/utils";

type HudButtonProps = {
	icon: string;
	/**
	 * Accessible name *and* tooltip: the dock is icon-only, so this is the only
	 * thing that names the control — for a screen reader and for a visitor who
	 * can't tell what the glyph means.
	 */
	label: string;
} & Omit<ComponentProps<"button">, "aria-label" | "title">;

/** A single control in the HUD dock. */
const HudButton = ({ icon, label, className, ...props }: HudButtonProps) => (
	<button
		type="button"
		aria-label={label}
		title={label}
		className={cn(hudButton, className)}
		{...props}>
		{/* No `color` prop: the icon inherits from the token so the dock has one
		    place to change its accent. */}
		<Icon icon={icon} width="26" height="26" />
	</button>
);

export default HudButton;
