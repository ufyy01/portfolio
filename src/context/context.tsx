import { useState } from "react";
import { GameContext } from "./gameContext";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const [diceFace, setDiceFace] = useState<number | null>(null);
	const [boardPosition, setBoardPosition] = useState<number | 0>(0);
	const [boardName, setBoardName] = useState<string | null>(null);

	return (
		<GameContext.Provider
			value={{
				diceFace,
				setDiceFace,
				boardPosition,
				setBoardPosition,
				boardName,
				setBoardName,
			}}>
			{children}
		</GameContext.Provider>
	);
};
