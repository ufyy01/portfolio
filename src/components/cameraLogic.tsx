import CodeBlock from "./codeBlock";

const CameraLogic = () => {
	return (
		<>
			<p className="text-lg font-fraunces text-white">
				This function ensures the camera smoothly follows the model while
				maintaining the current zoom level and orientation. It calculates the
				model’s center, keeps the camera at the same relative distance, and
				interpolates the movement for smoothness.
			</p>
			<CodeBlock>
				{`const smoothFollow = () => {
        if (!camera || !meshRef.current) return;
          // Smoothly follow the model while preserving current zoom and orientation
          const modelCenter = meshRef.current.position
            .clone()
            .add(new THREE.Vector3(0, 0.5, 0));
          const currentPos = camera.position.clone();
          const offset = currentPos.sub(modelCenter);
          const distance = offset.length();
          const dir = offset.normalize();
          const desiredPos = modelCenter.clone().add(dir.multiplyScalar(distance));
          camera.position.lerp(desiredPos, 0.1);
          camera.updateProjectionMatrix();
          camera.lookAt(modelCenter);
        };`}
			</CodeBlock>
		</>
	);
};

export default CameraLogic;
