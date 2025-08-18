import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const MovementLogic = () => {
	return (
		<>
			<p className="text-lg font-fraunces text-white">
				This snippet maps board positions to 3D coordinates and names, then
				handles the player’s movement each frame. The model smoothly walks
				toward its target, snaps when close enough to trigger arrival logic, and
				keeps the camera smoothly following along.
			</p>
			<SyntaxHighlighter language="javascript" style={vscDarkPlus}>
				{`// Map board positions to 3D coordinates and names
  function meshPosition(boardPosition: number) {
  switch (boardPosition) {
    case 0:  return { position: { x: -3.5, y: 0.1, z: 3.5 },  name: "start" };
    case 4:  return { position: { x: 3,    y: 0.1, z: 1 },    name: "skills" };
    case 5:  return { position: { x: 3,    y: 0.1, z: -1 },   name: "projects" };
    case 8:  return { position: { x: -1,   y: 0.1, z: -3 },   name: "contact" };
    case 11: return { position: { x: -3.5, y: 0.1, z: 1.5 },  name: "resume" };
    case 12: return { position: { x: -3.5, y: 0.1, z: 3.5 },  name: "gameOver" };
    default: return { position: { x: -3.5, y: 0.1, z: 3.5 },  name: "default" };
  }
}`}
			</SyntaxHighlighter>

			<SyntaxHighlighter language="javascript" style={vscDarkPlus}>
				{`const walkSpeed = 1.2;
const arrivalThreshold = 0.05;

useFrame((_, delta) => {
  if (!meshRef.current) return;

  const current = meshRef.current.position;
  const distance = current.distanceTo(targetPos.current);

  // If close enough, snap to tile and trigger arrival logic
  if (distance <= arrivalThreshold) {
    current.copy(targetPos.current);
    triggerArrival(boardPositionRef.current as number);
    return;
  }

  // Otherwise, move smoothly towards target
  const direction = targetPos.current.clone().sub(current).normalize();
  const moveDist = walkSpeed * delta;

  if (moveDist < distance) {
    current.add(direction.multiplyScalar(moveDist));
  } else {
    current.copy(targetPos.current);
  }

  smoothFollow(); // keep camera locked on
});`}
			</SyntaxHighlighter>
		</>
	);
};

export default MovementLogic;
