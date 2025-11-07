import { Outlet } from "react-router-dom";
import "./Main.css";
import "./Header";
import Header from "./Header";

export default function Main() {
  return (
    <>
      <Header />
      <div className="main-page">
        <Outlet />
      </div>
    </>
  );
}
