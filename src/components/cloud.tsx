import { fadeOnBeforeCompile } from "@/lib/fadeMaterial";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type CloudProps = {
	sceneOpacity: React.RefObject<number>;
	[key: string]: unknown;
};

export function Cloud({ sceneOpacity, ...props }: CloudProps) {
	const { nodes } = useGLTF("./models/clouds.gltf");

	const materialRef = useRef<THREE.MeshStandardMaterial>(null);

	useFrame(() => {
		if (materialRef.current) {
			materialRef.current.opacity = sceneOpacity.current;
		}
	});

	return (
		<group {...props} dispose={null}>
			<mesh geometry={(nodes.Mball001 as THREE.Mesh).geometry}>
				<meshStandardMaterial
					ref={materialRef}
					onBeforeCompile={fadeOnBeforeCompile}
					envMapIntensity={2}
					transparent
				/>
			</mesh>
		</group>
	);
}

useGLTF.preload("./models/clouds.gltf");
