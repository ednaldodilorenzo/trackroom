import { Navigate, Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header, { type HeaderConfig } from "./Header";
import AudioPlayer from "../player/AudioPlayer";
import { useState } from "react";
import { store } from "../../store";
import { useNavigate } from "react-router-dom";
import { authService } from "@/modules/auth/authSevice";

export default function Main() {
  const navigate = useNavigate();
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Music App",
  });

  const { user } = store.getState().auth || {};

  const logout = () => {
    authService.logout().then(() => {
      console.log("Executou no logut");
      navigate("/login");
    });
  };

  return (
    <>
      <Header {...headerConfig} logout={logout} />
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
