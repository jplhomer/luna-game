import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import Backyard from "./components/Backyard";
import Luna from "./components/Luna";
import KeyboardControls from "./components/KeyboardControls";
import { useState, useEffect } from "react";

function App() {
  const [gamepadConnected, setGamepadConnected] = useState(false);

  // Gamepad connection detection
  useEffect(() => {
    const handleGamepadConnected = (_e: GamepadEvent) => {
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = () => {
      setGamepadConnected(false);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Check if gamepad is already connected
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          setGamepadConnected(true);
          break;
        }
      }
    }

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
    };
  }, []);

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

          {gamepadConnected && (
            <div className="gamepad-info">
              <p>
                <strong>Controller Connected</strong>
              </p>
              <p>Left Stick - Move Luna (inverted)</p>
              <p>Right Stick - Control camera</p>
              <p>A Button - Dig for bones</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
