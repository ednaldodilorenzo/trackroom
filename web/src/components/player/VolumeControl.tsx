import { useState } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeOff } from "react-icons/io";

export function VolumeControl() {
  const [volume, setVolume] = useState<number>(60);
  const [muted, setMuted] = useState<boolean>(false);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setMuted((prev) => !prev)}>
        {muted || volume < 5 ? (
          <IoMdVolumeOff size={25} />
        ) : volume < 40 ? (
          <IoMdVolumeLow size={25} />
        ) : (
          <IoMdVolumeHigh size={25} />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        className="volumn"
        onChange={handleVolumeChange}
      />
    </div>
  );
}
