import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import Backyard from "./components/Backyard";
import Luna from "./components/Luna";
import KeyboardControls from "./components/KeyboardControls";
import { useState, useEffect } from "react";

function App() {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState("");

  // Gamepad connection detection
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      setGamepadConnected(true);
      setGamepadName(e.gamepad.id);
    };

    const handleGamepadDisconnected = () => {
      setGamepadConnected(false);
      setGamepadName("");
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Check if gamepad is already connected
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          setGamepadConnected(true);
          setGamepadName(gamepads[i]?.id || "Unknown Controller");
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
        <Canvas
          shadows
          camera={{
            position: [0, 3, 10], // Initial camera position, will be controlled by Luna component
            fov: 60,
            near: 0.1,
            far: 1000,
          }}
        >
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

          {/* Luna character with camera control */}
          <Luna position={[0, 0, 0]} controlCamera={true} />
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

          {gamepadConnected && (
            <div className="gamepad-info">
              <p>
                <strong>Controller Connected:</strong> {gamepadName}
              </p>
              <p>Left Stick - Move Luna (inverted)</p>
              <p>Right Stick - Look around</p>
              <p>A Button - Dig for bones</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
