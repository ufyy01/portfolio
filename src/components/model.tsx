const Model = () => {
	return (
		<>
			<mesh position={[-3.5, 0.5, 3.8]}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color="pink" />
			</mesh>
		</>
	);
};

export default Model;
