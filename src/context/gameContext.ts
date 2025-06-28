import { createContext } from "react";

export const GameContext = createContext<{
	diceFace: number | null;
	setDiceFace: (face: number | null) => void;
	boardPosition: number | 0;
	setBoardPosition: (position: number | 0) => number | void;
	boardName: string | null;
	setBoardName: (name: string | null) => void;
} | null>(null);
