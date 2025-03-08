import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import useSound from "use-sound";

type LunaProps = {
  position?: [number, number, number];
};

// Define Luna character
const Luna: React.FC<LunaProps> = ({ position = [0, 0, 0] }) => {
  const lunaRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState(0);

  // Movement mechanics
  const SPEED = 3;
  const ROTATION_SPEED = 2;
  const [isMoving, setIsMoving] = useState(false);
  const [isDigging, setIsDigging] = useState(false);
  const animation = useRef({ legRotation: 0, tailWag: 0, digProgress: 0 });

  // Sound effects
  const [playPawSteps, { stop: stopPawSteps }] = useSound(
    "/sounds/paw_steps.mp3",
    {
      volume: 0.5,
      loop: true,
      interrupt: true,
    }
  );

  const [playDigging] = useSound("/sounds/digging.mp3", {
    volume: 0.7,
  });

  // Set up keyboard controls
  const [, getKeys] = useKeyboardControls();

  // Set up keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && !isDigging) {
        setIsDigging(true);
        animation.current.digProgress = 0;
        playDigging(); // Play digging sound when spacebar is pressed
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDigging, playDigging]);

  // Play/stop walking sounds based on movement state
  useEffect(() => {
    if (isMoving) {
      playPawSteps();
    } else {
      stopPawSteps();
    }

    // Cleanup function to stop sounds when component unmounts
    return () => {
      stopPawSteps();
    };
  }, [isMoving, playPawSteps, stopPawSteps]);

  // Animation loop
  useFrame((_, delta) => {
    if (!lunaRef.current) return;

    // Get keyboard input
    const { forward, backward, left, right } = getKeys();

    // Reset movement flag
    let moving = false;

    // Calculate forward direction based on rotation
    const forwardDir = new THREE.Vector3(
      Math.sin(rotation),
      0,
      Math.cos(rotation)
    );

    // Reset velocity
    const newVelocity = new THREE.Vector3();

    // Apply movement based on keys
    if (forward) {
      newVelocity.add(forwardDir);
      moving = true;
    }
    if (backward) {
      newVelocity.sub(forwardDir);
      moving = true;
    }
    if (left) {
      setRotation(rotation + ROTATION_SPEED * delta);
    }
    if (right) {
      setRotation(rotation - ROTATION_SPEED * delta);
    }

    // Normalize and apply speed
    if (newVelocity.length() > 0) {
      newVelocity.normalize().multiplyScalar(SPEED * delta);
    }

    // Update position if not digging
    if (!isDigging) {
      lunaRef.current.position.add(newVelocity);

      // Enforce boundaries (fence)
      const FENCE_SIZE = 11;
      lunaRef.current.position.x = THREE.MathUtils.clamp(
        lunaRef.current.position.x,
        -FENCE_SIZE,
        FENCE_SIZE
      );
      lunaRef.current.position.z = THREE.MathUtils.clamp(
        lunaRef.current.position.z,
        -FENCE_SIZE,
        FENCE_SIZE
      );
    }

    // Apply rotation
    lunaRef.current.rotation.y = rotation;

    // Animate legs if moving
    setIsMoving(moving);
    if (moving && !isDigging) {
      animation.current.legRotation += delta * 10;
    }

    // Animate tail
    animation.current.tailWag += delta * 5;

    // Animate digging
    if (isDigging) {
      animation.current.digProgress += delta;
      if (animation.current.digProgress > 2) {
        setIsDigging(false);
      }
    }
  });

  // Color palette for Luna based on the description
  const colors = {
    mainWhite: "#FFFFFF", // White for chest and legs
    bodyTan: "#D2B48C", // Tan/light brown for main body
    darkBrown: "#8B4513", // Darker brown for back and ears
    faceMask: "#A0522D", // Tan-brown face mask
    blackDetails: "#1A1A1A", // Black for nose and other details
    eyeColor: "#3D2314", // Deep brown eyes
  };

  return (
    <group ref={lunaRef} position={position as any} castShadow>
      {/* Main body - just the horizontal capsule for a more natural dog shape */}
      <mesh
        ref={bodyRef}
        position={[0, 0.65, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.32, 0.2, 16, 16]} />
        <meshStandardMaterial color={colors.bodyTan} />
      </mesh>

      {/* White chest/underbelly area */}
      <mesh position={[0, 0.55, 0.2]} rotation={[0.3, 0, 0]} castShadow>
        <sphereGeometry
          args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]}
        />
        <meshStandardMaterial color={colors.mainWhite} />
      </mesh>

      {/* Darker back pattern - flatter shape */}
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <sphereGeometry
          args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]}
        />
        <meshStandardMaterial color={colors.darkBrown} />
      </mesh>

      {/* Neck area - using a smaller, more targeted shape */}
      <mesh position={[0, 0.7, 0.35]} rotation={[0.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.2, 16, 8]} />
        <meshStandardMaterial color={colors.bodyTan} />
      </mesh>

      {/* White neck/chest blend */}
      <mesh position={[0, 0.65, 0.4]} rotation={[0.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.15, 16, 8]} />
        <meshStandardMaterial color={colors.mainWhite} />
      </mesh>

      {/* Head - slightly larger */}
      <mesh ref={headRef} position={[0, 1.05, 0.65]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={colors.faceMask} />

        {/* White mask on upper head */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry
            args={[0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]}
          />
          <meshStandardMaterial color={colors.mainWhite} />
        </mesh>

        {/* Longer Snout */}
        <mesh position={[0, -0.1, 0.25]} castShadow>
          <boxGeometry args={[0.25, 0.15, 0.35]} />
          <meshStandardMaterial color={colors.faceMask} />
        </mesh>

        {/* Black nose */}
        <mesh position={[0, -0.1, 0.45]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={colors.blackDetails} />
        </mesh>

        {/* Eyes - slightly expressive, deep brown */}
        <mesh position={[0.12, 0.1, 0.25]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={colors.eyeColor} />
        </mesh>
        <mesh position={[-0.12, 0.1, 0.25]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={colors.eyeColor} />
        </mesh>

        {/* Ears - medium-length, floppy with outward fold */}
        <mesh position={[0.22, 0.25, 0]} rotation={[0.2, 0.4, 0.4]} castShadow>
          <capsuleGeometry args={[0.1, 0.25, 4, 8]} />
          <meshStandardMaterial color={colors.darkBrown} />
        </mesh>
        <mesh
          position={[-0.22, 0.25, 0]}
          rotation={[0.2, -0.4, -0.4]}
          castShadow
        >
          <capsuleGeometry args={[0.1, 0.25, 4, 8]} />
          <meshStandardMaterial color={colors.darkBrown} />
        </mesh>
      </mesh>

      {/* Legs - white "sock" appearance */}
      {[
        // Front legs
        {
          pos: [0.25, 0.35, 0.35] as [number, number, number],
          rot: isMoving ? Math.sin(animation.current.legRotation) * 0.5 : 0,
          color: colors.mainWhite,
        },
        {
          pos: [-0.25, 0.35, 0.35] as [number, number, number],
          rot: isMoving
            ? Math.sin(animation.current.legRotation + Math.PI) * 0.5
            : 0,
          color: colors.mainWhite,
        },
        // Back legs
        {
          pos: [0.25, 0.35, -0.35] as [number, number, number],
          rot: isMoving
            ? Math.sin(animation.current.legRotation + Math.PI) * 0.5
            : 0,
          color: colors.mainWhite,
        },
        {
          pos: [-0.25, 0.35, -0.35] as [number, number, number],
          rot: isMoving ? Math.sin(animation.current.legRotation) * 0.5 : 0,
          color: colors.mainWhite,
        },
      ].map((leg, i) => (
        <mesh
          key={`leg-${i}`}
          position={leg.pos}
          rotation={[leg.rot, 0, 0]}
          castShadow
        >
          <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
          <meshStandardMaterial color={leg.color} />
          {/* Paws */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color={colors.faceMask} />
          </mesh>
        </mesh>
      ))}

      {/* Bushy tail - slightly curved */}
      <group position={[0, 0.7, -0.45]} rotation={[0.3, 0, 0]}>
        <mesh
          position={[0, 0, 0]}
          rotation={[0.2 + Math.sin(animation.current.tailWag) * 0.15, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial color={colors.bodyTan} />
        </mesh>
        {/* Fluffy tip */}
        <mesh
          position={[0, -0.3, -0.1]}
          rotation={[0.4 + Math.sin(animation.current.tailWag) * 0.2, 0, 0]}
          castShadow
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={colors.mainWhite} />
        </mesh>
      </group>

      {/* Digging animation */}
      {isDigging && (
        <group position={[0, 0, 1]}>
          <mesh position={[0, 0, 0]} receiveShadow>
            <cylinderGeometry
              args={[0.5, 0.5, animation.current.digProgress * 0.2, 16]}
            />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Luna;
