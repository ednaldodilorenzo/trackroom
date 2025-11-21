import { Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header, { type HeaderConfig } from "./Header";
import AudioPlayer from "../player/AudioPlayer";
import { useState } from "react";

export default function Main() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Music App",
  });

  return (
    <>
      <Header {...headerConfig} />
      <div className="main-page">
        <Outlet context={{ setHeaderConfig }} />
      </div>
      <AudioPlayer />
    </>
  );
}
