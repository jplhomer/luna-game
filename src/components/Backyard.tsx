import { MeshReflectorMaterial } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Random position for trees and bushes
const randomPosition = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Create a heightmap function for the terrain
const getHeightAt = (x: number, z: number): number => {
  // Create gentle hills with multiple sine/cosine waves
  return (
    0.3 * Math.sin(x * 0.2) * Math.cos(z * 0.3) +
    0.2 * Math.cos(x * 0.3) * Math.sin(z * 0.2)
  );
};

// Tree component with variations
const Tree = ({
  position,
  scale = 1,
  type = "pine",
}: {
  position: [number, number, number];
  scale?: number;
  type?: "pine" | "oak";
}) => {
  const colorVariation = Math.random() * 0.2;

  // Fixed color values with proper formatting
  const trunkColor = `rgb(${Math.floor(
    100 + colorVariation * 50
  )}, ${Math.floor(60 + colorVariation * 20)}, ${Math.floor(20)})`;
  const pineColor = `rgb(${Math.floor(20)}, ${Math.floor(
    100 + colorVariation * 40
  )}, ${Math.floor(20)})`;
  const pineColor2 = `rgb(${Math.floor(30)}, ${Math.floor(
    110 + colorVariation * 40
  )}, ${Math.floor(30)})`;
  const pineColor3 = `rgb(${Math.floor(40)}, ${Math.floor(
    120 + colorVariation * 40
  )}, ${Math.floor(40)})`;

  const oakTrunkColor = `rgb(${Math.floor(
    90 + colorVariation * 40
  )}, ${Math.floor(60 + colorVariation * 20)}, ${Math.floor(30)})`;
  const oakLeafColor = `rgb(${Math.floor(
    60 + colorVariation * 20
  )}, ${Math.floor(100 + colorVariation * 40)}, ${Math.floor(30)})`;
  const oakLeafColor2 = `rgb(${Math.floor(
    50 + colorVariation * 20
  )}, ${Math.floor(110 + colorVariation * 40)}, ${Math.floor(20)})`;
  const oakLeafColor3 = `rgb(${Math.floor(
    55 + colorVariation * 20
  )}, ${Math.floor(105 + colorVariation * 40)}, ${Math.floor(25)})`;

  if (type === "pine") {
    return (
      <group position={position} scale={scale}>
        {/* Tree trunk */}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
          <meshStandardMaterial color={trunkColor} />
        </mesh>
        {/* Tree leaves - layered cones for pine trees */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[1, 2, 8]} />
          <meshStandardMaterial color={pineColor} />
        </mesh>
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[0.8, 1.5, 8]} />
          <meshStandardMaterial color={pineColor2} />
        </mesh>
        <mesh position={[0, 3.8, 0]} castShadow>
          <coneGeometry args={[0.6, 1.2, 8]} />
          <meshStandardMaterial color={pineColor3} />
        </mesh>
      </group>
    );
  } else {
    // Oak tree with a more round foliage
    return (
      <group position={position} scale={scale}>
        {/* Tree trunk */}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.35, 2.2, 8]} />
          <meshStandardMaterial color={oakTrunkColor} />
        </mesh>
        {/* Tree leaves - round for oak trees */}
        <mesh position={[0, 3, 0]} castShadow>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial color={oakLeafColor} />
        </mesh>
        <mesh position={[0.8, 2.5, 0.3]} castShadow>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshStandardMaterial color={oakLeafColor2} />
        </mesh>
        <mesh position={[-0.7, 2.7, -0.4]} castShadow>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshStandardMaterial color={oakLeafColor3} />
        </mesh>
      </group>
    );
  }
};

// Bush component with variations
const Bush = ({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) => {
  const colorVariation = Math.random() * 0.2;

  // Fixed color values with proper formatting
  const bushColor = `rgb(${Math.floor(30 + colorVariation * 30)}, ${Math.floor(
    120 + colorVariation * 40
  )}, ${Math.floor(30 + colorVariation * 30)})`;
  const bushColor2 = `rgb(${Math.floor(40 + colorVariation * 30)}, ${Math.floor(
    110 + colorVariation * 40
  )}, ${Math.floor(40 + colorVariation * 30)})`;
  const bushColor3 = `rgb(${Math.floor(35 + colorVariation * 30)}, ${Math.floor(
    115 + colorVariation * 40
  )}, ${Math.floor(35 + colorVariation * 30)})`;

  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={bushColor} />
      </mesh>
      {/* Add some variation to bushes with additional smaller spheres */}
      <mesh position={[0.3, 0.1, 0.2]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={bushColor2} />
      </mesh>
      <mesh position={[-0.25, 0.15, -0.2]} castShadow>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={bushColor3} />
      </mesh>
    </group>
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

// Horizontal fence beam component
const FenceBeam = ({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) => {
  // Calculate the midpoint between start and end
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  // Calculate the distance between points
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
      Math.pow(end[1] - start[1], 2) +
      Math.pow(end[2] - start[2], 2)
  );

  // Calculate the rotation angle to align from start to end
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);

  return (
    <mesh position={midpoint} rotation={[0, angle, 0]} castShadow>
      <boxGeometry args={[0.05, 0.1, distance]} />
      <meshStandardMaterial color="#A0522D" />
    </mesh>
  );
};

// Rock component
const Rock = ({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) => {
  const colorVariation = Math.random() * 0.1;
  const rockColor = `rgb(${Math.floor(130 + colorVariation * 40)}, ${Math.floor(
    130 + colorVariation * 40
  )}, ${Math.floor(130 + colorVariation * 40)})`;

  return (
    <group
      position={position}
      scale={scale}
      rotation={[
        randomPosition(0, Math.PI),
        randomPosition(0, Math.PI),
        randomPosition(0, Math.PI),
      ]}
    >
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={rockColor} roughness={0.8} />
      </mesh>
    </group>
  );
};

// Flower component
const Flower = ({ position }: { position: [number, number, number] }) => {
  // Random flower color - using fixed HSL format
  const hue = Math.floor(Math.random() * 360);
  const flowerColor = `hsl(${hue}, 70%, 60%)`;

  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {/* Flower head */}
      <group position={[0, 0.4, 0]}>
        {/* Petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={`petal-${i}`}
            position={[
              0.12 * Math.cos((i * Math.PI) / 3),
              0,
              0.12 * Math.sin((i * Math.PI) / 3),
            ]}
            castShadow
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={flowerColor} />
          </mesh>
        ))}

        {/* Center */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFC107" />
        </mesh>
      </group>
    </group>
  );
};

// Distant mountain component
const Mountain = ({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: [number, number, number];
}) => {
  // Add slight color variation to mountains
  const colorVariation = Math.random() * 0.2;
  const mountainColor = `rgb(${Math.floor(
    75 + colorVariation * 20
  )}, ${Math.floor(111 + colorVariation * 15)}, ${Math.floor(
    68 + colorVariation * 10
  )})`;

  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color={mountainColor} />
    </mesh>
  );
};

// Main Backyard component
const Backyard = () => {
  const terrainRef = useRef<THREE.Mesh>(null);
  const YARD_SIZE = 50; // Larger world
  const FENCE_SIZE = 20; // Fence boundary

  // Set up and update terrain vertices for hills - simplified approach
  useEffect(() => {
    if (terrainRef.current) {
      const terrain = terrainRef.current;
      const geometry = terrain.geometry as THREE.PlaneGeometry;

      // Update vertex positions to create hills
      const posAttribute = geometry.getAttribute("position");

      // Apply height modification more carefully
      try {
        for (let i = 0; i < posAttribute.count; i++) {
          const x = posAttribute.getX(i);
          const z = posAttribute.getZ(i);

          // Gentler hills with simpler math
          const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;

          // Set the Y position
          posAttribute.setY(i, y);
        }

        // Update the geometry
        posAttribute.needsUpdate = true;
        geometry.computeVertexNormals();

        console.log("Hills created successfully");
      } catch (err) {
        console.error("Error creating hills:", err);
      }
    }
  }, []);

  // Populate yard with elements
  // Create trees inside the fence
  const innerTrees = Array.from({ length: 12 }, (_, i) => {
    const x = randomPosition(-FENCE_SIZE * 0.8, FENCE_SIZE * 0.8);
    const z = randomPosition(-FENCE_SIZE * 0.8, FENCE_SIZE * 0.8);
    const y = getHeightAt(x, z);
    return (
      <Tree
        key={`inner-tree-${i}`}
        position={[x, y, z]}
        scale={0.7 + Math.random() * 0.5}
        type={Math.random() > 0.5 ? "pine" : "oak"}
      />
    );
  });

  // Create bushes inside the fence
  const innerBushes = Array.from({ length: 20 }, (_, i) => {
    const x = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const z = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const y = getHeightAt(x, z);
    return (
      <Bush
        key={`inner-bush-${i}`}
        position={[x, y, z]}
        scale={0.6 + Math.random() * 0.8}
      />
    );
  });

  // Create rocks inside the fence
  const rocks = Array.from({ length: 15 }, (_, i) => {
    const x = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const z = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const y = getHeightAt(x, z);
    return (
      <Rock
        key={`rock-${i}`}
        position={[x, y, z]}
        scale={0.4 + Math.random() * 1.0}
      />
    );
  });

  // Create flowers inside the fence
  const flowers = Array.from({ length: 30 }, (_, i) => {
    const x = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const z = randomPosition(-FENCE_SIZE * 0.9, FENCE_SIZE * 0.9);
    const y = getHeightAt(x, z);
    return <Flower key={`flower-${i}`} position={[x, y, z]} />;
  });

  // Create trees outside the fence (more dense)
  const outerTrees = Array.from({ length: 80 }, (_, i) => {
    // Generate positions outside the fence but within the world bounds
    let x, z;
    const edgeDistance = 5; // Distance from fence

    // Decide which region to place the tree (outside fence, inside world)
    const side = Math.floor(Math.random() * 4);

    if (side === 0) {
      // North
      x = randomPosition(-YARD_SIZE, YARD_SIZE);
      z = randomPosition(FENCE_SIZE + edgeDistance, YARD_SIZE);
    } else if (side === 1) {
      // South
      x = randomPosition(-YARD_SIZE, YARD_SIZE);
      z = randomPosition(-YARD_SIZE, -FENCE_SIZE - edgeDistance);
    } else if (side === 2) {
      // East
      x = randomPosition(FENCE_SIZE + edgeDistance, YARD_SIZE);
      z = randomPosition(-YARD_SIZE, YARD_SIZE);
    } else {
      // West
      x = randomPosition(-YARD_SIZE, -FENCE_SIZE - edgeDistance);
      z = randomPosition(-YARD_SIZE, YARD_SIZE);
    }

    const y = getHeightAt(x, z);
    const distance = Math.sqrt(x * x + z * z);
    const scale = 0.8 + Math.random() * 1.5; // Larger trees outside

    // Use distance for scaling (trees further away look larger)
    const fadeScale = 1 - (distance / YARD_SIZE) * 0.3;

    return (
      <Tree
        key={`outer-tree-${i}`}
        position={[x, y, z]}
        scale={scale * fadeScale}
        type={Math.random() > 0.4 ? "pine" : "oak"}
      />
    );
  });

  // Create distant mountains
  const mountains = Array.from({ length: 20 }, (_, i) => {
    const theta = (i / 20) * Math.PI * 2; // Distribute evenly in a circle
    const radius = YARD_SIZE * 0.9;

    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    // Vary the mountain sizes
    const mScale = 5 + Math.random() * 10;
    const mHeight = 10 + Math.random() * 15;

    return (
      <Mountain
        key={`mountain-${i}`}
        position={[x, 0, z]}
        scale={[mScale, mHeight, mScale]}
      />
    );
  });

  // Create fence posts with horizontal beams
  const fenceElements = [];

  // Create fence posts for both x and z sides
  for (let i = -FENCE_SIZE; i <= FENCE_SIZE; i += 1) {
    // Add posts along x-axis (north/south sides)
    const northPost = [i, 0.5 + getHeightAt(i, FENCE_SIZE), FENCE_SIZE] as [
      number,
      number,
      number
    ];
    const southPost = [i, 0.5 + getHeightAt(i, -FENCE_SIZE), -FENCE_SIZE] as [
      number,
      number,
      number
    ];

    fenceElements.push(
      <FencePost key={`fence-x-pos-${i}`} position={northPost} />,
      <FencePost key={`fence-x-neg-${i}`} position={southPost} />
    );

    // Add horizontal beams (except at the final post)
    if (i < FENCE_SIZE) {
      const nextNorthPost = [
        i + 1,
        0.5 + getHeightAt(i + 1, FENCE_SIZE),
        FENCE_SIZE,
      ] as [number, number, number];
      const nextSouthPost = [
        i + 1,
        0.5 + getHeightAt(i + 1, -FENCE_SIZE),
        -FENCE_SIZE,
      ] as [number, number, number];

      // Add two horizontal beams at different heights
      fenceElements.push(
        <FenceBeam
          key={`fence-beam-north-lower-${i}`}
          start={[northPost[0], northPost[1] - 0.25, northPost[2]]}
          end={[nextNorthPost[0], nextNorthPost[1] - 0.25, nextNorthPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-north-upper-${i}`}
          start={[northPost[0], northPost[1] + 0.25, northPost[2]]}
          end={[nextNorthPost[0], nextNorthPost[1] + 0.25, nextNorthPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-south-lower-${i}`}
          start={[southPost[0], southPost[1] - 0.25, southPost[2]]}
          end={[nextSouthPost[0], nextSouthPost[1] - 0.25, nextSouthPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-south-upper-${i}`}
          start={[southPost[0], southPost[1] + 0.25, southPost[2]]}
          end={[nextSouthPost[0], nextSouthPost[1] + 0.25, nextSouthPost[2]]}
        />
      );
    }

    // Add posts along z-axis (east/west sides)
    const eastPost = [FENCE_SIZE, 0.5 + getHeightAt(FENCE_SIZE, i), i] as [
      number,
      number,
      number
    ];
    const westPost = [-FENCE_SIZE, 0.5 + getHeightAt(-FENCE_SIZE, i), i] as [
      number,
      number,
      number
    ];

    fenceElements.push(
      <FencePost key={`fence-z-pos-${i}`} position={eastPost} />,
      <FencePost key={`fence-z-neg-${i}`} position={westPost} />
    );

    // Add horizontal beams (except at the final post)
    if (i < FENCE_SIZE) {
      const nextEastPost = [
        FENCE_SIZE,
        0.5 + getHeightAt(FENCE_SIZE, i + 1),
        i + 1,
      ] as [number, number, number];
      const nextWestPost = [
        -FENCE_SIZE,
        0.5 + getHeightAt(-FENCE_SIZE, i + 1),
        i + 1,
      ] as [number, number, number];

      // Add two horizontal beams at different heights
      fenceElements.push(
        <FenceBeam
          key={`fence-beam-east-lower-${i}`}
          start={[eastPost[0], eastPost[1] - 0.25, eastPost[2]]}
          end={[nextEastPost[0], nextEastPost[1] - 0.25, nextEastPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-east-upper-${i}`}
          start={[eastPost[0], eastPost[1] + 0.25, eastPost[2]]}
          end={[nextEastPost[0], nextEastPost[1] + 0.25, nextEastPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-west-lower-${i}`}
          start={[westPost[0], westPost[1] - 0.25, westPost[2]]}
          end={[nextWestPost[0], nextWestPost[1] - 0.25, nextWestPost[2]]}
        />,
        <FenceBeam
          key={`fence-beam-west-upper-${i}`}
          start={[westPost[0], westPost[1] + 0.25, westPost[2]]}
          end={[nextWestPost[0], nextWestPost[1] + 0.25, nextWestPost[2]]}
        />
      );
    }
  }

  return (
    <group>
      {/* Ground with hills - simplified implementation */}
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[YARD_SIZE * 2, YARD_SIZE * 2, 64, 64]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Simple flat ground backup in case the terrain has issues */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[YARD_SIZE * 2, YARD_SIZE * 2]} />
        <meshStandardMaterial color="#4caf50" roughness={0.9} />
      </mesh>

      {/* Distant mountains */}
      {mountains}

      {/* Outer forest */}
      {outerTrees}

      {/* Inner trees */}
      {innerTrees}

      {/* Bushes */}
      {innerBushes}

      {/* Rocks */}
      {rocks}

      {/* Flowers */}
      {flowers}

      {/* Fence with posts and beams */}
      {fenceElements}
    </group>
  );
};

export default Backyard;
