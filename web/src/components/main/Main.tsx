import { Navigate, Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header, { type HeaderConfig } from "./Header";
import AudioPlayer from "../player/AudioPlayer";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { authService } from "@/modules/auth/authSevice";

const BASE_HEADER: HeaderConfig = {
  title: "Minha Biblioteca",
  enableBackButton: false,
};

export default function Main() {
  // const navigate = useNavigate();
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Music App",
  });

  //const { user } = store.getState().auth || {};
  const { user } = useSelector((state: any) => state.auth);
  const outletContext = useMemo(() => {
    return {
      setHeaderConfig, // full replace if you want
      setHeaderPartial: (patch: Partial<HeaderConfig>) =>
        setHeaderConfig((prev) => ({ ...prev, ...patch })),
      resetHeader: () => setHeaderConfig(BASE_HEADER),
    };
  }, []);
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
          <Outlet context={outletContext} />
        ) : (
          <Navigate to="/login" />
        )}
      </div>
      <AudioPlayer />
    </>
  );
}
