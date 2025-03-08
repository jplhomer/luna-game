import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

// Random position for trees and bushes
const randomPosition = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Tree component
const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Tree leaves */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

// Bush component
const Bush = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#32CD32" />
    </mesh>
  );
};

// Fence post component
const FencePost = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.1, 1, 0.1]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  );
};

// Main Backyard component
const Backyard = () => {
  // Create random trees
  const trees = Array.from({ length: 8 }, (_, i) => (
    <Tree
      key={`tree-${i}`}
      position={[randomPosition(-10, 10), 0, randomPosition(-10, 10)]}
    />
  ));

  // Create random bushes
  const bushes = Array.from({ length: 12 }, (_, i) => (
    <Bush
      key={`bush-${i}`}
      position={[randomPosition(-10, 10), 0.25, randomPosition(-10, 10)]}
    />
  ));

  // Create fence around the yard
  const fenceSize = 12;
  const fencePosts = [];

  // Create fence posts for both x and z sides
  for (let i = -fenceSize; i <= fenceSize; i += 1) {
    // Add posts along x-axis
    fencePosts.push(
      <FencePost key={`fence-x-pos-${i}`} position={[i, 0.5, fenceSize]} />,
      <FencePost key={`fence-x-neg-${i}`} position={[i, 0.5, -fenceSize]} />
    );

    // Add posts along z-axis
    fencePosts.push(
      <FencePost key={`fence-z-pos-${i}`} position={[fenceSize, 0.5, i]} />,
      <FencePost key={`fence-z-neg-${i}`} position={[-fenceSize, 0.5, i]} />
    );
  }

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          color="#4caf50"
          roughness={0.8}
          metalness={0}
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={15}
          depthScale={1}
          minDepthThreshold={0.85}
          maxDepthThreshold={1}
          depthToBlurRatioBias={0.2}
        />
      </mesh>

      {/* Trees */}
      {trees}

      {/* Bushes */}
      {bushes}

      {/* Fence */}
      {fencePosts}
    </group>
  );
};

export default Backyard;
