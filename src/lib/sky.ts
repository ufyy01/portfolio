import { useMemo } from "react";

/**
 * The sky (and the clouds in it) is tinted by the visitor's local time.
 * Everything that paints sky, clouds or stars reads its colours from here so
 * the intro screen and the game scene always agree.
 */
export type SkyPhase = "sunrise" | "day" | "dusk" | "night";

export interface SkyTheme {
	phase: SkyPhase;
	isNight: boolean;
	/** Tailwind classes for the sky backdrop. */
	sky: string;
	/** Tailwind filter classes applied to cloud images. */
	cloudTint: string;
	/** Flat colour for devices that shouldn't be asked to paint a gradient. */
	fallback: string;
	/** Sun / moon glow colour, for radial-gradient backgrounds. */
	glow: string;
}

const SKY_THEMES: Record<SkyPhase, Omit<SkyTheme, "phase" | "isNight">> = {
	sunrise: {
		sky: "bg-gradient-to-b from-orange-200 to-blue-300",
		cloudTint: "filter brightness-75 contrast-110",
		fallback: "#fed7aa", // orange-200
		glow: "rgba(255,214,170,0.75)",
	},
	day: {
		sky: "bg-blue-300",
		cloudTint: "filter brightness-90 contrast-105",
		fallback: "#93c5fd", // blue-300
		glow: "rgba(255,255,255,0.7)",
	},
	dusk: {
		sky: "bg-gradient-to-b from-pink-300 to-blue-600",
		cloudTint: "filter brightness-70 contrast-110 saturate-75",
		fallback: "#93c5fd", // sunset mid blend base
		glow: "rgba(255,175,205,0.7)",
	},
	night: {
		sky: "bg-gradient-to-b from-blue-400 to-gray-900",
		cloudTint: "filter brightness-60 contrast-125 saturate-50",
		fallback: "#1f2937", // gray-800
		glow: "rgba(203,213,255,0.35)",
	},
};

export function getSkyPhase(hour = new Date().getHours()): SkyPhase {
	if (hour >= 6 && hour < 9) return "sunrise";
	if (hour >= 9 && hour < 17) return "day";
	if (hour >= 17 && hour < 19) return "dusk";
	return "night";
}

export function getSkyTheme(hour?: number): SkyTheme {
	const phase = getSkyPhase(hour);
	return { phase, isNight: phase === "night", ...SKY_THEMES[phase] };
}

/** Resolved once per mount, so the sky doesn't shift while someone is playing. */
export function useSkyTheme(): SkyTheme {
	return useMemo(() => getSkyTheme(), []);
}

/** Older Androids struggle with blur, gradients and many animated layers. */
export function isLowEndAndroid(): boolean {
	if (typeof navigator === "undefined") return false;
	const match = navigator.userAgent.match(/Android\s(\d+)/i);
	if (!match) return false;
	const major = parseInt(match[1], 10);
	return Number.isFinite(major) && major <= 7;
}

export function useIsLowEndAndroid(): boolean {
	return useMemo(isLowEndAndroid, []);
}

export interface Star {
	top: number;
	left: number;
	size: number;
	delay: number;
	opacity: number;
}

export function createStars(count: number): Star[] {
	return Array.from({ length: count }, () => ({
		top: Math.random() * 100,
		left: Math.random() * 100,
		size: Math.random() < 0.8 ? 2 : 3,
		delay: Math.random() * 3,
		opacity: 0.6 + Math.random() * 0.4,
	}));
}
