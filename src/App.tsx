import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import Backyard from "./components/Backyard";
import Luna from "./components/Luna";
import KeyboardControls from "./components/KeyboardControls";

function App() {
  return (
    <>
      <KeyboardControls>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Sky background */}
          <Sky sunPosition={[100, 20, 100]} />

          {/* Game world */}
          <Backyard />

          {/* Luna character */}
          <Luna position={[0, 0, 0]} />

          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={3}
            maxDistance={15}
          />
        </Canvas>
      </KeyboardControls>
      <div className="game-ui">
        <h2>Luna's Bone Adventure</h2>
        <p>
          Help Luna, the fluffy Border Collie mix, find hidden bones in the
          backyard!
        </p>
        <div className="controls">
          <p>
            <strong>Controls:</strong>
          </p>
          <p>WASD / Arrow Keys - Move Luna</p>
          <p>Space - Dig for bones</p>
          <p>Mouse - Rotate camera</p>
          <p>Scroll - Zoom in/out</p>
        </div>
      </div>
    </>
  );
}

export default App;
