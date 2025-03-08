import { KeyboardControls as DreiKeyboardControls } from "@react-three/drei";
import React from "react";

export enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
}

export default function KeyboardControls({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DreiKeyboardControls
      map={[
        { name: Controls.forward, keys: ["ArrowUp", "w", "W"] },
        { name: Controls.backward, keys: ["ArrowDown", "s", "S"] },
        { name: Controls.left, keys: ["ArrowLeft", "a", "A"] },
        { name: Controls.right, keys: ["ArrowRight", "d", "D"] },
        { name: Controls.jump, keys: [" "] }, // Space
      ]}
    >
      {children}
    </DreiKeyboardControls>
  );
}
