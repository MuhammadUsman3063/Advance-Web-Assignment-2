"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Environment ,} from "@react-three/drei";
import { useRef } from "react";

const AnimatedShape = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    // Scale 2.8 kiya hai taa ke screen pe acha fit ho
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.8}>
      <MeshDistortMaterial
        color="#06b6d4" 
        attach="material"
        distort={0.4} 
        speed={1.5} 
        roughness={0.1} 
        metalness={0.5} // Thoda soft metallic look
        clearcoat={1} // Glass jaisi shine ke liye
      />
    </Sphere>
  );
};

export default function ThreeBackground() {
  return (
    <Canvas className="w-full h-full" camera={{ position: [0, 0, 5] }}>
      {/* City hata kar 'studio' kar diya taa ke background clean medical feel de */}
      <Environment preset="studio" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <AnimatedShape />
    </Canvas>
  );
}