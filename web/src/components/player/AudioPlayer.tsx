//import { useState } from "react";
import Controls from "./Control";
import TrackInfo from "./TrackInfo";

export default function AudioPlayer() {
  //const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="bg-[#6200ee] fixed bottom-0 right-0 left-0 min-h-8 flex gap-9 flex-row justify-between items-center text-white p-[0.5rem_10px]">
      <TrackInfo />
      <div className="w-full flex flex-col items-center gap-1 m-auto flex-1">
        <Controls />
      </div>      
    </div>
  );
}
