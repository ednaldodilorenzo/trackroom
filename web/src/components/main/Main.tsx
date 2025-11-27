import { Navigate, Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header, { type HeaderConfig } from "./Header";
import AudioPlayer from "../player/AudioPlayer";
import { useState } from "react";
import { store } from "../../store";

export default function Main() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Music App",
  });

  const { user } = store.getState().auth || {};
  console.log(user);
  

  return (
    <>
      <Header {...headerConfig} />
      <div className="main-page">
        {user ? (
          <Outlet context={{ setHeaderConfig }} />
        ) : (
          <Navigate to="/login" />
        )}
      </div>
      <AudioPlayer />
    </>
  );
}
