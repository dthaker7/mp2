import { useState } from "react";
import { isSoundOn, setSoundOn } from "../utils/sound";

function SoundToggle() {
  const [on, setOn] = useState(isSoundOn());

  function toggle() {
    const next = !on;
    setSoundOn(next);
    setOn(next);
  }

  return (
    <div className="sound-controls">
      <button className="sound-toggle" onClick={toggle} aria-pressed={on}>
        {on ? "🔊 Cries on" : "🔇 Cries off"}
      </button>
    </div>
  );
}

export default SoundToggle;