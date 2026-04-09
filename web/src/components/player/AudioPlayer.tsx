//import { useState } from "react";
import Controls from "./Control";
import { ProgressBar } from "./ProgressBar";
import TrackInfo from "./TrackInfo";


export default function AudioPlayer() {
  //const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="bg-[#6200ee] max-h-[74px] min-h-16 flex gap-9 justify-between items-center text-white p-[0.5rem_10px]">
      <TrackInfo />
      <div className="w-full flex flex-col items-center gap-1 m-auto flex-1">
        <Controls />
        <ProgressBar />
      </div>
    </div>
  );
}
