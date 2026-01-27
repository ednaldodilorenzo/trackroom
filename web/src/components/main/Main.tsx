import { Navigate, Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header, { type HeaderConfig } from "./Header";
import AudioPlayer from "../player/AudioPlayer";
import { useState } from "react";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { authService } from "@/modules/auth/authSevice";

export default function Main() {
  // const navigate = useNavigate();
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Music App",
  });

  //const { user } = store.getState().auth || {};
  const { user } = useSelector((state: any) => state.auth);  

  // const logout = () => {
  //   authService.logout().then(() => {
  //     navigate("/login");
  //   });
  // };

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
